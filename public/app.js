// ============================================================================
// Dionysus Audiobook Cloud Player • Frontend Application
// Uses localStorage for positions/bookmarks/settings + IndexedDB for full MP3 offline storage
// ============================================================================

const LOCAL_STORAGE_KEY = 'dionysus_audiobook_state_v1';
const IDB_NAME = 'DionysusOfflineAudioDB';
const IDB_STORE = 'mp3_vault';
const CLOUD_RUN_API_BASE = 'https://dionysus-audiobooks-909525131314.asia-northeast1.run.app';
const GCS_PUBLIC_BASE = 'https://storage.googleapis.com/dionysus-audiobooks-vault';
const IS_STATIC_HOST =
  window.location.hostname.endsWith('github.io') ||
  window.location.hostname.endsWith('pages.dev') ||
  window.location.protocol === 'file:';
const API_BASE = IS_STATIC_HOST ? CLOUD_RUN_API_BASE : '';

// Application State
let catalogItems = [];
let serverStatus = {};
let activeFilter = 'all';
let activeAuthor = 'all';
let activeSort = 'index';
let activeCoverMode = 'hybrid';
let searchQuery = '';

// Smart Category Explorer State
let explorerMode = 'genre'; // 'genre' | 'theme' | 'author_spotlight' | 'region'
let activeCategoryFilter = null; // { type: 'categoryId' | 'theme' | 'author_group' | 'nobel' | 'region' | 'duration', value: string, label: string }

function getRelativeGeneratedCover(item) {
  return `./covers/${item.id}.svg`;
}

function getAudioStreamUrl(item, asDownload = false) {
  if (IS_STATIC_HOST && item.gcsUploaded) {
    return item.gcsPublicUrl || `${GCS_PUBLIC_BASE}/audiobooks/${encodeURIComponent(item.id)}.mp3`;
  }
  return `${API_BASE}/api/${asDownload ? 'download' : 'audio'}/${encodeURIComponent(item.id)}`;
}

function resolveCoverUrl(item) {
  const gen = getRelativeGeneratedCover(item);
  const orig =
    item.originalCoverUrl && !item.originalCoverUrl.startsWith('/covers/')
      ? item.originalCoverUrl
      : item.thumbnailUrl && !item.thumbnailUrl.startsWith('/covers/')
        ? item.thumbnailUrl
        : gen;
  if (activeCoverMode === 'generated') return gen;
  if (activeCoverMode === 'original') return orig;
  return orig || gen;
}

let currentBookId = null;
let currentBlobUrl = null;
let waitingForDownloadBookId = null;

// Offline IndexedDB metadata map: id -> { id, size, savedAt }
const offlineMetaMap = new Map();
const savingInProgressIds = new Set();

// Sleep Timer
let sleepTimerMode = '0';
let sleepDeadlineMs = 0;
let sleepInterval = null;

// Web Audio API (Voice Boost EQ)
let audioCtx = null;
let sourceNode = null;
let hpFilter = null;
let presenceFilter = null;
let compressorNode = null;
let boostGainNode = null;
let voiceBoostEnabled = false;

// Persisted User State in localStorage
let userState = loadUserState();

function loadUserState() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        lastActiveId: parsed.lastActiveId || 's5C7fP9ZxcY',
        playbackRate: Number(parsed.playbackRate || 1),
        voiceBoost: Boolean(parsed.voiceBoost),
        books: parsed.books || {}
      };
    }
  } catch (e) {
    console.warn('Failed to read localStorage:', e);
  }
  return {
    lastActiveId: 's5C7fP9ZxcY',
    playbackRate: 1,
    voiceBoost: false,
    books: {}
  };
}

function saveUserState() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userState));
  } catch (e) {
    console.warn('Failed to write localStorage:', e);
  }
}

function getBookState(id) {
  if (!userState.books[id]) {
    userState.books[id] = {
      position: 0,
      duration: 0,
      completed: false,
      updatedAt: 0,
      bookmarks: []
    };
  }
  return userState.books[id];
}

// ============================================================================
// IndexedDB Offline MP3 Vault
// ============================================================================

function openOfflineDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function refreshOfflineMetadata() {
  try {
    const db = await openOfflineDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.openCursor();
      offlineMetaMap.clear();
      req.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          const val = cursor.value;
          offlineMetaMap.set(val.id, {
            id: val.id,
            size: val.size || (val.blob ? val.blob.size : 0),
            savedAt: val.savedAt
          });
          cursor.continue();
        } else {
          updateOfflineCountersUI();
          resolve();
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB unavailable:', err);
  }
}

async function getOfflineBlob(id) {
  try {
    const db = await openOfflineDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const req = tx.objectStore(IDB_STORE).get(id);
      req.onsuccess = () => resolve(req.result ? req.result.blob : null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

async function saveMp3ToOfflineVault(item) {
  if (!item || !item.localReady || savingInProgressIds.has(item.id)) return;
  savingInProgressIds.add(item.id);
  renderCatalog();
  updateActivePlayerOfflineButton();

  try {
    const resp = await fetch(getAudioStreamUrl(item, false));
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const blob = await resp.blob();
    const db = await openOfflineDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put({
        id: item.id,
        title: item.title,
        author: item.author,
        blob,
        size: blob.size,
        savedAt: new Date().toISOString()
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    offlineMetaMap.set(item.id, {
      id: item.id,
      size: blob.size,
      savedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Failed saving MP3 to IndexedDB:', err);
    alert(`Не удалось сохранить "${item.title}" в память браузера: ${err.message}`);
  } finally {
    savingInProgressIds.delete(item.id);
    updateOfflineCountersUI();
    renderCatalog();
    updateActivePlayerOfflineButton();
  }
}

async function removeMp3FromOfflineVault(id) {
  const db = await openOfflineDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  offlineMetaMap.delete(id);
  updateOfflineCountersUI();
  renderCatalog();
  updateActivePlayerOfflineButton();
}

async function clearEntireOfflineVault() {
  if (!confirm('Очистить все сохранённые MP3 аудиокниги из локальной памяти браузера (IndexedDB)? Закладки и прогресс чтения останутся.')) {
    return;
  }
  const db = await openOfflineDb();
  await new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  offlineMetaMap.clear();
  updateOfflineCountersUI();
  renderCatalog();
  updateActivePlayerOfflineButton();
}

function updateOfflineCountersUI() {
  let totalBytes = 0;
  for (const meta of offlineMetaMap.values()) {
    totalBytes += meta.size || 0;
  }
  const mb = (totalBytes / (1024 * 1024)).toFixed(1);
  const label = `${offlineMetaMap.size} книг (${mb} МБ)`;
  document.getElementById('headerOfflineCount').textContent = label;
  document.getElementById('modalOfflineStats').textContent = label;
  document.getElementById('countOffline').textContent = String(offlineMetaMap.size);
}

// ============================================================================
// Formatting Helpers
// ============================================================================

function formatTime(sec) {
  if (!sec || !isFinite(sec) || sec < 0) return '00:00';
  const s = Math.floor(sec);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatMegabytes(bytes) {
  if (!bytes) return '';
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

// ============================================================================
// DOM Elements
// ============================================================================

const audioEl = document.getElementById('audioElement');
const seekSlider = document.getElementById('seekSlider');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const currentTimeLabel = document.getElementById('currentTimeLabel');
const remainingTimeLabel = document.getElementById('remainingTimeLabel');
const durationTimeLabel = document.getElementById('durationTimeLabel');
const bookmarkTimePreview = document.getElementById('bookmarkTimePreview');

// ============================================================================
// Web Audio API Voice Clarity / Audiobook EQ
// ============================================================================

function ensureAudioGraph() {
  if (audioCtx) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  audioCtx = new AudioContextClass();
  sourceNode = audioCtx.createMediaElementSource(audioEl);

  hpFilter = audioCtx.createBiquadFilter();
  hpFilter.type = 'highpass';
  hpFilter.frequency.value = 105;

  presenceFilter = audioCtx.createBiquadFilter();
  presenceFilter.type = 'peaking';
  presenceFilter.frequency.value = 2800;
  presenceFilter.Q.value = 1.1;
  presenceFilter.gain.value = 4.5;

  compressorNode = audioCtx.createDynamicsCompressor();
  compressorNode.threshold.value = -24;
  compressorNode.knee.value = 18;
  compressorNode.ratio.value = 3.5;
  compressorNode.attack.value = 0.005;
  compressorNode.release.value = 0.2;

  boostGainNode = audioCtx.createGain();
  boostGainNode.gain.value = 1.25;

  reconnectAudioGraph();
}

function reconnectAudioGraph() {
  if (!audioCtx || !sourceNode) return;
  try {
    sourceNode.disconnect();
    hpFilter.disconnect();
    presenceFilter.disconnect();
    compressorNode.disconnect();
    boostGainNode.disconnect();
  } catch {}

  if (voiceBoostEnabled) {
    sourceNode.connect(hpFilter);
    hpFilter.connect(presenceFilter);
    presenceFilter.connect(compressorNode);
    compressorNode.connect(boostGainNode);
    boostGainNode.connect(audioCtx.destination);
  } else {
    sourceNode.connect(audioCtx.destination);
  }
}

function updateVoiceBoostUI() {
  const btn = document.getElementById('voiceBoostToggleBtn');
  if (voiceBoostEnabled) {
    btn.classList.add('active');
  } else {
    btn.classList.remove('active');
  }
}

// ============================================================================
// Active Player Logic
// ============================================================================

async function selectAndLoadBook(id, autoPlay = false) {
  const item = catalogItems.find((i) => i.id === id);
  if (!item) return;

  currentBookId = item.id;
  userState.lastActiveId = item.id;
  saveUserState();

  const bState = getBookState(item.id);

  // Update Sidebar Metadata
  const coverImgEl = document.getElementById('playerCoverImg');
  const genFallback = getRelativeGeneratedCover(item);
  coverImgEl.onerror = () => {
    coverImgEl.onerror = null;
    coverImgEl.src = genFallback;
  };
  coverImgEl.src = resolveCoverUrl(item);
  document.getElementById('playerTrackIndex').textContent = `#${item.index}`;
  document.getElementById('playerBookTitle').textContent = item.title;
  document.getElementById('playerBookAuthor').textContent = item.author;
  document.getElementById('playerBookGenre').textContent = item.genre || 'Классическая проза';
  document.getElementById('playerOriginalTitle').textContent = item.originalTitle || '';
  document.getElementById('playerBookDescription').textContent =
    item.descriptionRu || item.description || '';
  document.getElementById('directMp3DownloadLink').href = getAudioStreamUrl(item, true);

  const markBtn = document.getElementById('markCompletedBtn');
  markBtn.textContent = bState.completed ? '✓ Прослушано (Снять отметку)' : '✓ Отметить прослушанной';

  updateActivePlayerOfflineButton();
  renderBookmarksList();
  renderTimelineBookmarkPins();
  renderCatalog();

  // Cleanup previous Blob URL
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = null;
  }

  // Check if stored in browser IndexedDB first
  const offlineBlob = await getOfflineBlob(item.id);
  const badgeEl = document.getElementById('playbackSourceBadge');

  if (offlineBlob) {
    currentBlobUrl = URL.createObjectURL(offlineBlob);
    audioEl.src = currentBlobUrl;
    badgeEl.textContent = '💾 Память браузера (Offline)';
  } else if (item.localReady) {
    audioEl.src = getAudioStreamUrl(item, false);
    badgeEl.textContent = item.gcsUploaded ? '☁️ Сервер MP3 + Google Cloud S3' : '⚡ Сервер MP3 (HQ 320k)';
  } else {
    audioEl.removeAttribute('src');
    audioEl.load();
    badgeEl.textContent = '⏳ В очереди на скачивание...';
    updateTimelineLabels(bState.position || 0, item.duration || bState.duration || 0);

    if (autoPlay) {
      waitingForDownloadBookId = item.id;
      badgeEl.textContent = '⏬ Приоритетное скачивание #1...';
      await controlQueue('prioritize', item.id);
    }
    return;
  }

  audioEl.playbackRate = userState.playbackRate || 1;

  audioEl.onloadedmetadata = () => {
    const dur = audioEl.duration || item.duration || 0;
    if (dur > 0) {
      bState.duration = dur;
      item.duration = dur;
      saveUserState();
    }
    if (bState.position > 2 && bState.position < dur - 5) {
      audioEl.currentTime = bState.position;
    }
    updateTimelineLabels(audioEl.currentTime, dur);
    renderTimelineBookmarkPins();
    if (autoPlay) {
      playCurrentAudio();
    }
  };
}

function playCurrentAudio() {
  if (!audioEl.src) {
    if (currentBookId) selectAndLoadBook(currentBookId, true);
    return;
  }
  if (voiceBoostEnabled) {
    ensureAudioGraph();
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }
  audioEl.playbackRate = userState.playbackRate || 1;
  audioEl.play().catch((err) => console.warn('Playback blocked:', err));
}

function updateActivePlayerOfflineButton() {
  const btn = document.getElementById('toggleOfflineCurrentBtn');
  const label = document.getElementById('offlineCurrentBtnLabel');
  if (!currentBookId) return;

  const isSaved = offlineMetaMap.has(currentBookId);
  const isSaving = savingInProgressIds.has(currentBookId);

  if (isSaving) {
    btn.classList.remove('active');
    label.textContent = '⏳ Сохранение в браузер...';
  } else if (isSaved) {
    btn.classList.add('active');
    label.textContent = '✓ В памяти браузера (Удалить)';
  } else {
    btn.classList.remove('active');
    label.textContent = '💾 Сохранить в браузер';
  }
}

function updateTimelineLabels(cur, dur) {
  currentTimeLabel.textContent = formatTime(cur);
  bookmarkTimePreview.textContent = formatTime(cur);
  durationTimeLabel.textContent = formatTime(dur);

  if (dur > 0) {
    const pct = Math.min(100, Math.round((cur / dur) * 100));
    const rem = Math.max(0, dur - cur);
    remainingTimeLabel.textContent = `-${formatTime(rem)} (${pct}%)`;
    seekSlider.value = String(Math.round((cur / dur) * 1000));
  } else {
    remainingTimeLabel.textContent = '0%';
    seekSlider.value = '0';
  }
}

// Audio Element Events
audioEl.addEventListener('play', () => {
  playIcon.classList.add('hidden');
  pauseIcon.classList.remove('hidden');
  renderCatalog();
});

audioEl.addEventListener('pause', () => {
  playIcon.classList.remove('hidden');
  pauseIcon.classList.add('hidden');
  saveCurrentPlaybackPosition();
  renderCatalog();
});

let lastSavedSec = -1;
audioEl.addEventListener('timeupdate', () => {
  const cur = audioEl.currentTime || 0;
  const dur = audioEl.duration || 0;
  updateTimelineLabels(cur, dur);

  if (Math.abs(cur - lastSavedSec) >= 2) {
    lastSavedSec = cur;
    saveCurrentPlaybackPosition();
    updateCountersBar();
  }
});

audioEl.addEventListener('ended', () => {
  if (currentBookId) {
    const bState = getBookState(currentBookId);
    bState.completed = true;
    bState.position = 0;
    saveUserState();
    updateCountersBar();
    renderCatalog();
  }

  if (sleepTimerMode === 'end_of_track') {
    setSleepTimer('0');
    return;
  }

  // Auto-advance to next ready book
  playAdjacentBook(1);
});

function saveCurrentPlaybackPosition() {
  if (!currentBookId || !audioEl.src) return;
  const bState = getBookState(currentBookId);
  const cur = audioEl.currentTime || 0;
  const dur = audioEl.duration || bState.duration || 0;
  if (cur > 0) {
    bState.position = cur;
    if (dur > 0) bState.duration = dur;
    bState.updatedAt = Date.now();
    if (dur > 0 && cur / dur > 0.96) {
      bState.completed = true;
    }
    saveUserState();
  }
}

function playAdjacentBook(direction = 1) {
  if (!catalogItems.length) return;
  const idx = catalogItems.findIndex((i) => i.id === currentBookId);
  if (idx === -1) return;
  const nextIdx = (idx + direction + catalogItems.length) % catalogItems.length;
  selectAndLoadBook(catalogItems[nextIdx].id, true);
}

// ============================================================================
// Bookmarks & Notes (localStorage)
// ============================================================================

function renderBookmarksList() {
  const container = document.getElementById('bookmarksList');
  const countEl = document.getElementById('currentBookmarkCount');
  if (!currentBookId) {
    container.innerHTML = '<div class="empty-hint">Выберите аудиокнигу</div>';
    countEl.textContent = '0';
    return;
  }

  const bState = getBookState(currentBookId);
  const bookmarks = (bState.bookmarks || []).slice().sort((a, b) => a.time - b.time);
  countEl.textContent = String(bookmarks.length);

  if (!bookmarks.length) {
    container.innerHTML =
      '<div class="empty-hint">Нет закладок для этой аудиокниги. Нажмите «+ Закладка», чтобы сохранить момент в localStorage.</div>';
    return;
  }

  container.innerHTML = bookmarks
    .map(
      (bm) => `
      <div class="bookmark-item">
        <button class="bookmark-jump-btn" data-jump-time="${bm.time}">
          <span class="bookmark-time-chip">${formatTime(bm.time)}</span>
          <span>${escapeHtml(bm.note || 'Закладка без заметки')}</span>
        </button>
        <button class="icon-btn" data-del-bm="${bm.id}" title="Удалить закладку">✕</button>
      </div>
    `
    )
    .join('');

  container.querySelectorAll('[data-jump-time]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const t = Number(btn.getAttribute('data-jump-time'));
      if (audioEl.src) {
        audioEl.currentTime = t;
        playCurrentAudio();
      }
    });
  });

  container.querySelectorAll('[data-del-bm]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const bmId = btn.getAttribute('data-del-bm');
      bState.bookmarks = (bState.bookmarks || []).filter((x) => x.id !== bmId);
      saveUserState();
      renderBookmarksList();
      renderTimelineBookmarkPins();
      updateCountersBar();
    });
  });
}

function renderTimelineBookmarkPins() {
  const container = document.getElementById('timelineBookmarkPins');
  if (!currentBookId) {
    container.innerHTML = '';
    return;
  }
  const bState = getBookState(currentBookId);
  const item = catalogItems.find((i) => i.id === currentBookId);
  const dur = audioEl.duration || (item && item.duration) || bState.duration || 0;
  if (!dur || !bState.bookmarks || !bState.bookmarks.length) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = bState.bookmarks
    .map((bm) => {
      const pct = Math.min(99.5, Math.max(0.5, (bm.time / dur) * 100));
      return `<div class="bookmark-pin" style="left: ${pct}%" title="${formatTime(bm.time)} — ${escapeHtml(bm.note || '')}"></div>`;
    })
    .join('');
}

// ============================================================================
// Sleep Timer
// ============================================================================

function setSleepTimer(mode) {
  sleepTimerMode = mode;
  document.getElementById('sleepTimerSelect').value = mode;
  const label = document.getElementById('sleepCountdownLabel');

  if (sleepInterval) {
    clearInterval(sleepInterval);
    sleepInterval = null;
  }

  if (mode === '0') {
    label.textContent = '';
    return;
  }

  if (mode === 'end_of_track') {
    label.textContent = 'До конца';
    return;
  }

  const minutes = Number(mode);
  sleepDeadlineMs = Date.now() + minutes * 60 * 1000;

  const tick = () => {
    const remSec = Math.max(0, Math.ceil((sleepDeadlineMs - Date.now()) / 1000));
    label.textContent = formatTime(remSec);
    if (remSec <= 0) {
      audioEl.pause();
      setSleepTimer('0');
    }
  };
  tick();
  sleepInterval = setInterval(tick, 1000);
}

// ============================================================================
// Catalog Filtering, Sorting & Rendering
// ============================================================================

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function populateAuthorsDropdown() {
  const select = document.getElementById('authorFilterSelect');
  const counts = new Map();
  for (const item of catalogItems) {
    counts.set(item.author, (counts.get(item.author) || 0) + 1);
  }
  const sortedAuthors = Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0], 'ru'));

  select.innerHTML =
    `<option value="all">Все авторы (${sortedAuthors.length})</option>` +
    sortedAuthors
      .map(
        ([author, count]) =>
          `<option value="${escapeHtml(author)}" ${activeAuthor === author ? 'selected' : ''}>${escapeHtml(
            author
          )} (${count})</option>`
      )
      .join('');
}

function updateCountersBar() {
  const readyCount = catalogItems.filter((i) => i.localReady || offlineMetaMap.has(i.id)).length;
  let inProgressCount = 0;
  let bookmarkedCount = 0;
  let completedCount = 0;

  for (const item of catalogItems) {
    const st = userState.books[item.id];
    if (!st) continue;
    if (st.completed) completedCount++;
    else if (st.position > 5) inProgressCount++;
    if (st.bookmarks && st.bookmarks.length > 0) bookmarkedCount++;
  }

  document.getElementById('countAll').textContent = String(catalogItems.length);
  document.getElementById('countReady').textContent = String(readyCount);
  document.getElementById('countInProgress').textContent = String(inProgressCount);
  document.getElementById('countBookmarked').textContent = String(bookmarkedCount);
  document.getElementById('countCompleted').textContent = String(completedCount);
}

function matchesSmartCategory(item, catFilter) {
  if (!catFilter) return true;
  const { type, value } = catFilter;
  if (type === 'categoryId') return item.categoryId === value;
  if (type === 'theme') return Array.isArray(item.themes) && item.themes.includes(value);
  if (type === 'nobel') return Boolean(item.isNobelLaureate);
  if (type === 'region') return item.region === value;
  if (type === 'author_group') {
    const authors = value.split('|');
    return authors.includes(item.author);
  }
  if (type === 'duration') {
    const dur = item.duration || (userState.books[item.id] && userState.books[item.id].duration) || 1200;
    if (value === 'short') return dur < 900;
    if (value === 'medium') return dur >= 900 && dur <= 2100;
    if (value === 'long') return dur > 2100;
  }
  return true;
}

function renderCategoriesExplorer() {
  const row = document.getElementById('categoryCardsRow');
  const resetBtn = document.getElementById('resetAllCategoriesBtn');
  if (!row) return;

  resetBtn.classList.toggle('hidden', !activeCategoryFilter && activeAuthor === 'all');

  let cards = [];

  if (explorerMode === 'genre') {
    const defs = [
      {
        id: 'mystic_horror',
        icon: '👻',
        title: 'Мистика, Хоррор и Готика',
        sub: 'Эдгар По, Стивен Кинг, Кортасар, Саки, Розмари Тимперли'
      },
      {
        id: 'scifi',
        icon: '🚀',
        title: 'Научная фантастика и Космос',
        sub: 'Желязны, Брэдбери, Мартинсон «Аниара», Комацу, Бене'
      },
      {
        id: 'parable_magic',
        icon: '⏳',
        title: 'Магический реализм и Притчи',
        sub: 'Борхес, Кафка, Мураками, Беккет, Акутагава, Агнон'
      },
      {
        id: 'drama',
        icon: '🎭',
        title: 'Психологическая драма и Классика',
        sub: 'Томас Манн, Хемингуэй, Цвейг, Моэм, Айтматов, Кавабата'
      },
      {
        id: 'irony_city',
        icon: '☕',
        title: 'Ирония, Юмор и Городская проза',
        sub: 'Сергей Довлатов, Симон Кармиггелт, Сароян, Пратчетт, Толстая'
      },
      {
        id: 'noir_crime',
        icon: '🕵️',
        title: 'Нуар, Детектив и Криминал',
        sub: 'Рэймонд Чандлер, Стэнли Эллин, Хал Эллсон, Эндрю Бенедикт'
      }
    ];
    cards = defs.map((d) => ({
      type: 'categoryId',
      value: d.id,
      title: `${d.icon} ${d.title}`,
      sub: d.sub,
      count: catalogItems.filter((i) => i.categoryId === d.id).length
    }));
  } else if (explorerMode === 'theme') {
    const themeDefs = [
      { value: 'Тайна и сверхъестественное', icon: '🕯️', sub: 'Призраки, проклятия, вещие сны и потусторонние силы' },
      { value: 'Одиночество и город', icon: '🏙️', sub: 'Ночные улицы, отели, кафе и отчуждение в мегаполисе' },
      { value: 'Любовь и отношения', icon: '💔', sub: 'Страсть, ревность, верность и хрупкость человеческих чувств' },
      { value: 'Космос и иные миры', icon: '🌌', sub: 'Далёкие планеты, звездолёты, пришельцы и будущее' },
      { value: 'Память и детство', icon: '🕰️', sub: 'Взросление, первая любовь и эхо ушедших лет' },
      { value: 'Преступление и расплата', icon: '⚖️', sub: 'Роковые сделки, детективные интриги и возмездие' },
      { value: 'Война и испытания', icon: '🔥', sub: 'Фронтовая память, выживание и проверка духа' },
      { value: 'Тонкая ирония и сатира', icon: '😊', sub: 'Улыбка сквозь печаль, парадоксы и абсурд бытия' },
      { value: 'Судьба и выбор', icon: '🧭', sub: 'Переломные моменты жизни и поиск собственного пути' }
    ];
    cards = themeDefs.map((t) => ({
      type: 'theme',
      value: t.value,
      title: `${t.icon} ${t.value}`,
      sub: t.sub,
      count: catalogItems.filter((i) => Array.isArray(i.themes) && i.themes.includes(t.value)).length
    }));
  } else if (explorerMode === 'author_spotlight') {
    const spotlights = [
      {
        type: 'nobel',
        value: 'nobel',
        title: '🏆 Нобелевские лауреаты',
        sub: 'Манн, Хемингуэй, Кавабата, Беккет, Лагерлёф, Унсет, Мартинсон, Юнсон, Льюис, Агнон, Монтале'
      },
      {
        type: 'author_group',
        value: 'Стивен Кинг',
        title: '👑 Стивен Кинг',
        sub: 'Полная подборка из 14 рассказов («Прыгающий», «Корпорация "Бросайте курить"», «Дюна» и др.)'
      },
      {
        type: 'author_group',
        value: 'Симон Кармиггелт',
        title: '☕ Симон Кармиггелт',
        sub: '7 лирических и ироничных амстердамских миниатюр из цикла Kronkels'
      },
      {
        type: 'author_group',
        value: 'Рэй Брэдбери',
        title: '🍂 Рэй Брэдбери',
        sub: '6 рассказов: «Чёртово колесо», «Озеро», «День смерти», «Берег на закате» и др.'
      },
      {
        type: 'author_group',
        value: 'Роджер Желязны',
        title: '⚡ Роджер Желязны',
        sub: '4 фантастических шедевра: «Синий конь», «Машина-дьявол», «Ленты Титана», «Коррида»'
      },
      {
        type: 'author_group',
        value: 'Сергей Довлатов|Татьяна Толстая|Чингиз Айтматов|Фазиль Искандер|Юрий Казаков|Юрий Яковлев',
        title: '🖋️ Довлатов, Айтматов, Толстая, Казаков',
        sub: 'Шедевры отечественной прозы XX века о памяти, совести и любви'
      },
      {
        type: 'author_group',
        value: 'Харуки Мураками|Ясунари Кавабата|Рюноскэ Акутагава|Юкио Мисима|Сакё Комацу|Ясутаки Цуцуи|Синъити Хоси',
        title: '🇯🇵 Мастера Японии',
        sub: 'Мураками, Кавабата, Акутагава, Мисима, Комацу, Цуцуи, Хоси'
      },
      {
        type: 'author_group',
        value: 'Хорхе Луис Борхес|Хулио Кортасар|Франц Кафка|Эдгар Аллан По',
        title: '🕯️ Борхес, Кортасар, Кафка, По',
        sub: 'Классики лабиринтов разума, готики и мистического реализма'
      }
    ];
    cards = spotlights.map((s) => ({
      ...s,
      count: catalogItems.filter((i) => matchesSmartCategory(i, s)).length
    }));
  } else if (explorerMode === 'region') {
    const regDefs = [
      { type: 'region', value: 'США', title: '🇺🇸 Американская проза', sub: 'Кинг, Брэдбери, По, Хемингуэй, Желязны, Андерсон, Чандлер, Сароян' },
      { type: 'region', value: 'Европа и Британия', title: '🇪🇺 Европа и Британия', sub: 'Кафка, Манн, Цвейг, Беккет, Моэм, Кармиггелт, Пратчетт, Саки' },
      { type: 'region', value: 'Япония и Азия', title: '🇯🇵 Япония и Восток', sub: 'Мураками, Кавабата, Акутагава, Мисима, Комацу, Ху Цянь, Агнон' },
      { type: 'region', value: 'Русская и советская проза', title: '🏛️ Русская литература', sub: 'Довлатов, Айтматов, Казаков, Толстая, Искандер, Яковлев' },
      { type: 'region', value: 'Скандинавия', title: '❄️ Скандинавский Север', sub: 'Туве Янссон, Лагерлёф, Унсет, Мартинсон, Юнсон, Маннеркорпи' },
      { type: 'region', value: 'Латинская Америка', title: '🌎 Латинская Америка', sub: 'Хорхе Луис Борхес и Хулио Кортасар' },
      { type: 'duration', value: 'short', title: '⚡ Короткие (до 15 мин)', sub: 'Лаконичные новеллы и притчи для быстрого чтения' },
      { type: 'duration', value: 'long', title: '📖 Большие повести (35+ мин)', sub: 'Глубокое погружение и масштабные истории' }
    ];
    cards = regDefs.map((r) => ({
      ...r,
      count: catalogItems.filter((i) => matchesSmartCategory(i, r)).length
    }));
  }

  row.innerHTML = cards
    .map((c) => {
      const isActive =
        activeCategoryFilter && activeCategoryFilter.type === c.type && activeCategoryFilter.value === c.value;
      return `
        <button class="category-tile ${isActive ? 'active' : ''}" data-cat-type="${escapeHtml(
          c.type
        )}" data-cat-val="${escapeHtml(c.value)}">
          <div class="category-tile-top">
            <span class="category-tile-title">${escapeHtml(c.title)}</span>
            <span class="category-tile-count">${c.count}</span>
          </div>
          <div class="category-tile-sub">${escapeHtml(c.sub)}</div>
        </button>
      `;
    })
    .join('');

  row.querySelectorAll('.category-tile').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-cat-type');
      const value = btn.getAttribute('data-cat-val');
      if (activeCategoryFilter && activeCategoryFilter.type === type && activeCategoryFilter.value === value) {
        activeCategoryFilter = null;
      } else {
        activeCategoryFilter = { type, value };
      }
      renderCategoriesExplorer();
      renderCatalog();
    });
  });
}

function getFilteredAndSortedItems() {
  const q = searchQuery.trim().toLowerCase();

  const filtered = catalogItems.filter((item) => {
    if (activeAuthor !== 'all' && item.author !== activeAuthor) return false;
    if (!matchesSmartCategory(item, activeCategoryFilter)) return false;
    if (
      q &&
      !item.title.toLowerCase().includes(q) &&
      !item.author.toLowerCase().includes(q) &&
      !(item.descriptionRu || '').toLowerCase().includes(q) &&
      !(item.genre || '').toLowerCase().includes(q) &&
      !(item.categoryName || '').toLowerCase().includes(q) &&
      !(item.originalTitle || '').toLowerCase().includes(q)
    ) {
      return false;
    }

    const st = userState.books[item.id] || {};
    const isOffline = offlineMetaMap.has(item.id);

    if (activeFilter === 'ready') return item.localReady || isOffline;
    if (activeFilter === 'offline') return isOffline;
    if (activeFilter === 'in_progress') return !st.completed && (st.position || 0) > 5;
    if (activeFilter === 'bookmarked') return st.bookmarks && st.bookmarks.length > 0;
    if (activeFilter === 'completed') return Boolean(st.completed);
    return true;
  });

  filtered.sort((a, b) => {
    if (activeSort === 'ready_first') {
      const aReady = a.localReady || offlineMetaMap.has(a.id) ? 1 : 0;
      const bReady = b.localReady || offlineMetaMap.has(b.id) ? 1 : 0;
      if (bReady !== aReady) return bReady - aReady;
      return a.index - b.index;
    }
    if (activeSort === 'recent') {
      const aTime = (userState.books[a.id] && userState.books[a.id].updatedAt) || 0;
      const bTime = (userState.books[b.id] && userState.books[b.id].updatedAt) || 0;
      if (bTime !== aTime) return bTime - aTime;
      return a.index - b.index;
    }
    if (activeSort === 'author') {
      return a.author.localeCompare(b.author, 'ru') || a.index - b.index;
    }
    if (activeSort === 'title') {
      return a.title.localeCompare(b.title, 'ru');
    }
    if (activeSort === 'duration_desc') {
      return (b.duration || 0) - (a.duration || 0);
    }
    return a.index - b.index;
  });

  return filtered;
}

function renderCatalog() {
  updateCountersBar();
  const grid = document.getElementById('catalogGrid');
  const list = getFilteredAndSortedItems();

  if (!list.length) {
    grid.innerHTML = `<div class="empty-hint" style="grid-column: 1/-1; padding: 48px;">По вашему запросу ничего не найдено. Попробуйте сбросить фильтр.</div>`;
    return;
  }

  grid.innerHTML = list
    .map((item) => {
      const st = userState.books[item.id] || {};
      const isPlayingThis = currentBookId === item.id;
      const isOffline = offlineMetaMap.has(item.id);
      const isSaving = savingInProgressIds.has(item.id);
      const isDownloadingNow = serverStatus.currentId === item.id;
      const dur = item.duration || st.duration || 0;
      const pos = st.position || 0;
      const pct = st.completed ? 100 : dur > 0 ? Math.min(100, Math.round((pos / dur) * 100)) : 0;

      let storageBadge = `<span class="badge-storage queued">⏳ В очереди</span>`;
      if (isOffline) {
        storageBadge = `<span class="badge-storage offline">💾 В браузере</span>`;
      } else if (item.localReady) {
        storageBadge = item.gcsUploaded
          ? `<span class="badge-storage ready">☁️ GCS + MP3</span>`
          : `<span class="badge-storage ready">⚡ Готов MP3</span>`;
      } else if (isDownloadingNow) {
        storageBadge = `<span class="badge-storage ready">⏬ Качается ${Math.round(serverStatus.progressPercent || 0)}%</span>`;
      }

      const progressText = st.completed
        ? '✓ Прослушано'
        : pos > 5
          ? `Прослушано ${formatTime(pos)} (${pct}%)`
          : item.fileSizeBytes
            ? formatMegabytes(item.fileSizeBytes)
            : 'MP3 HQ';

      const playBtnText = isPlayingThis && !audioEl.paused
        ? '⏸ Пауза'
        : pos > 5 && !st.completed
          ? `▶ Продолжить (${formatTime(pos)})`
          : item.localReady || isOffline
            ? '▶ Слушать'
            : '⏬ Скачать MP3 и слушать';

      const coverSrc = resolveCoverUrl(item);
      const fallbackSvg = getRelativeGeneratedCover(item);
      const descText = item.descriptionRu || item.description || '';

      return `
        <article class="book-card ${isPlayingThis ? 'playing' : ''}" data-card-id="${item.id}">
          <div class="card-thumb-wrap" data-play-id="${item.id}">
            <img
              src="${escapeHtml(coverSrc)}"
              alt="${escapeHtml(item.title)}"
              class="card-thumb-img"
              loading="lazy"
              onerror="this.onerror=null;this.src='${escapeHtml(fallbackSvg)}';"
            />
            <div class="card-badges-top">
              <span class="badge-index">#${item.index}</span>
              ${storageBadge}
            </div>
            ${dur ? `<span class="card-duration-chip">${formatTime(dur)}</span>` : ''}
          </div>
          <div class="card-progress-bar">
            <div class="card-progress-fill" style="width: ${pct}%"></div>
          </div>
          <div class="card-body">
            <div class="card-submeta">
              <span class="card-genre-tag" data-filter-cat="${escapeHtml(item.categoryId || '')}" style="cursor:pointer" title="Фильтровать по жанровой категории">${escapeHtml(
                item.genre || 'Проза'
              )}</span>
              ${item.isNobelLaureate ? `<span class="nobel-badge" data-filter-nobel="1" style="cursor:pointer" title="Лауреат Нобелевской премии по литературе">🏆 Нобель</span>` : ''}
              <span class="card-orig-title" title="${escapeHtml(item.originalTitle || '')}">${escapeHtml(
                item.originalTitle || ''
              )}</span>
            </div>
            <h3 class="card-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</h3>
            <button class="card-author" data-filter-author="${escapeHtml(item.author)}">${escapeHtml(item.author)} <span style="color:var(--text-muted);font-weight:400;font-size:11px;">• ${escapeHtml(item.region || '')}</span></button>
            <p class="card-description" title="${escapeHtml(descText)}">${escapeHtml(descText)}</p>
            ${
              Array.isArray(item.themes) && item.themes.length
                ? `<div class="card-themes-row">
                    ${item.themes
                      .map(
                        (th) =>
                          `<button class="theme-chip-btn" data-filter-theme="${escapeHtml(th)}">#${escapeHtml(
                            th
                          )}</button>`
                      )
                      .join('')}
                  </div>`
                : ''
            }
            <div class="card-meta-row">
              <span>${progressText}</span>
              ${st.bookmarks && st.bookmarks.length ? `<span>🔖 ${st.bookmarks.length}</span>` : ''}
            </div>
            <div class="card-actions">
              <button class="card-btn-play" data-play-id="${item.id}">${playBtnText}</button>
              ${
                item.localReady || isOffline
                  ? `<button class="card-btn-icon ${isOffline ? 'saved' : ''}" data-offline-id="${item.id}" title="${
                      isOffline ? 'Удалить из памяти браузера' : 'Сохранить MP3 в память браузера (IndexedDB)'
                    }">
                      ${isSaving ? '⏳' : isOffline ? '✓💾' : '💾'}
                    </button>
                    <a class="card-btn-icon" href="${escapeHtml(getAudioStreamUrl(item, true))}" download title="Скачать MP3 файл на устройство">⬇</a>`
                  : `<button class="card-btn-icon" data-prio-id="${item.id}" title="Скачать только эту книгу в MP3 по запросу">⏬ MP3</button>`
              }
            </div>
          </div>
        </article>
      `;
    })
    .join('');

  // Bind events
  grid.querySelectorAll('[data-play-id]').forEach((el) => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-play-id');
      if (currentBookId === id && audioEl.src) {
        if (audioEl.paused) playCurrentAudio();
        else audioEl.pause();
      } else {
        selectAndLoadBook(id, true);
      }
    });
  });

  grid.querySelectorAll('[data-filter-author]').forEach((el) => {
    el.addEventListener('click', () => {
      activeAuthor = el.getAttribute('data-filter-author');
      document.getElementById('authorFilterSelect').value = activeAuthor;
      renderCategoriesExplorer();
      renderCatalog();
    });
  });

  grid.querySelectorAll('[data-filter-cat]').forEach((el) => {
    el.addEventListener('click', () => {
      const cid = el.getAttribute('data-filter-cat');
      if (!cid) return;
      explorerMode = 'genre';
      document.querySelectorAll('.explorer-mode-btn').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-exp-mode') === 'genre');
      });
      activeCategoryFilter = { type: 'categoryId', value: cid };
      renderCategoriesExplorer();
      renderCatalog();
    });
  });

  grid.querySelectorAll('[data-filter-theme]').forEach((el) => {
    el.addEventListener('click', () => {
      const th = el.getAttribute('data-filter-theme');
      if (!th) return;
      explorerMode = 'theme';
      document.querySelectorAll('.explorer-mode-btn').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-exp-mode') === 'theme');
      });
      activeCategoryFilter = { type: 'theme', value: th };
      renderCategoriesExplorer();
      renderCatalog();
    });
  });

  grid.querySelectorAll('[data-filter-nobel]').forEach((el) => {
    el.addEventListener('click', () => {
      explorerMode = 'author_spotlight';
      document.querySelectorAll('.explorer-mode-btn').forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-exp-mode') === 'author_spotlight');
      });
      activeCategoryFilter = { type: 'nobel', value: 'nobel' };
      renderCategoriesExplorer();
      renderCatalog();
    });
  });

  grid.querySelectorAll('[data-offline-id]').forEach((el) => {
    el.addEventListener('click', async () => {
      const id = el.getAttribute('data-offline-id');
      const item = catalogItems.find((i) => i.id === id);
      if (!item) return;
      if (offlineMetaMap.has(id)) {
        await removeMp3FromOfflineVault(id);
      } else {
        await saveMp3ToOfflineVault(item);
      }
    });
  });

  grid.querySelectorAll('[data-prio-id]').forEach((el) => {
    el.addEventListener('click', async () => {
      const id = el.getAttribute('data-prio-id');
      await controlQueue('prioritize', id);
    });
  });
}

// ============================================================================
// Server Status & SSE Live Queue Updates
// ============================================================================

function updateServerStatusUI(status) {
  serverStatus = status || {};
  const localCount = status.completedLocalCount || 0;
  const totalCount = status.totalCount || 99;
  const gcsCount = status.completedGcsCount || 0;

  document.getElementById('headerLocalCount').textContent = `${localCount} / ${totalCount} готово`;
  document.getElementById('modalLocalStats').textContent = `${localCount} / ${totalCount}`;
  document.getElementById('modalGcsCount').textContent = `${gcsCount} / ${totalCount}`;
  document.getElementById('modalGcpProject').textContent = status.gcpProject || 'beast-trader-live';
  document.getElementById('modalGcsBucket').textContent = `gs://${status.gcsBucket || 'dionysus-audiobooks-vault'}`;

  const gcsHeaderEl = document.getElementById('headerGcsStatus');
  const modalBucketStatusEl = document.getElementById('modalBucketStatusText');
  const provisionBtn = document.getElementById('provisionGcsBtn');

  if (status.bucketExists) {
    gcsHeaderEl.textContent = `${gcsCount}/${totalCount} в GCS S3`;
    modalBucketStatusEl.textContent = `✅ Бакет активен • Синхронизировано ${gcsCount} из ${totalCount} MP3`;
    provisionBtn.classList.add('hidden');
  } else {
    gcsHeaderEl.textContent = `Ожидает создания бакета`;
    modalBucketStatusEl.textContent = status.bucketError || 'Бакет ещё не создан. Нажмите кнопку ниже для создания.';
    provisionBtn.classList.remove('hidden');
  }

  // Banner
  const stageBadge = document.getElementById('queueStageBadge');
  const curTitleEl = document.getElementById('queueCurrentTitle');
  const fillEl = document.getElementById('queueProgressFill');
  const metricsEl = document.getElementById('queueMetricsMono');
  const pauseBtn = document.getElementById('toggleQueuePauseBtn');

  pauseBtn.textContent = status.paused ? '▶ Включить авто-очередь (1-за-1)' : '⏸ Отключить авто-очередь';
  document.getElementById('modalWorkerState').textContent = status.paused
    ? 'Режим по запросу (Авто-очередь выкл)'
    : status.stage || 'Активен';

  if (status.currentId) {
    const stageLabels = {
      downloading: 'СКАЧИВАНИЕ MP3',
      converting: 'КОНВЕРТАЦИЯ FFmpeg MP3 q=0',
      uploading_gcs: 'ВЫГРУЗКА В GOOGLE CLOUD S3'
    };
    stageBadge.textContent = stageLabels[status.stage] || 'ОБРАБОТКА';
    curTitleEl.textContent = status.currentTitle || status.currentId;
    const pct = Math.round(status.progressPercent || 0);
    fillEl.style.width = `${pct}%`;
    metricsEl.textContent = `${pct}% ${status.speed ? `• ${status.speed}` : ''} ${status.eta ? `• ETA ${status.eta}` : ''}`;
  } else if (status.paused) {
    stageBadge.textContent = 'РЕЖИМ ПО ЗАПРОСУ';
    curTitleEl.textContent = `Авто-скачивание всех книг отключено (${localCount} из ${totalCount} уже в MP3). Нажмите на любую книгу, чтобы скачать её по запросу.`;
    fillEl.style.width = `${Math.round((localCount / Math.max(1, totalCount)) * 100)}%`;
    metricsEl.textContent = `${localCount}/${totalCount} MP3`;
  } else if (localCount >= totalCount && totalCount > 0) {
    stageBadge.textContent = 'ЗАВЕРШЕНО ✓';
    curTitleEl.textContent = `Все ${totalCount} аудиокниг скачаны в максимальном качестве MP3!`;
    fillEl.style.width = '100%';
    metricsEl.textContent = '100%';
  } else {
    stageBadge.textContent = 'ОЖИДАНИЕ';
    curTitleEl.textContent = `Готово ${localCount} из ${totalCount} аудиокниг`;
  }

  if (Array.isArray(status.recentLogs)) {
    const logsEl = document.getElementById('workerLogsList');
    logsEl.innerHTML = status.recentLogs
      .map(
        (l) =>
          `<div class="log-line ${l.level === 'error' ? 'error' : ''}">[${new Date(
            l.time
          ).toLocaleTimeString()}] ${escapeHtml(l.message)}</div>`
      )
      .join('');
  }
}

async function controlQueue(action, id = null) {
  try {
    const resp = await fetch(`${API_BASE}/api/queue/control`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, id })
    });
    const data = await resp.json();
    if (data.status) updateServerStatusUI(data.status);
  } catch (err) {
    console.error('Queue control failed:', err);
  }
}

function connectSse() {
  try {
    const es = new EventSource(`${API_BASE}/api/events`);
    es.addEventListener('status', (e) => {
      try {
        updateServerStatusUI(JSON.parse(e.data));
      } catch {}
    });
    es.addEventListener('item_updated', (e) => {
      try {
        const updated = JSON.parse(e.data);
        const idx = catalogItems.findIndex((i) => i.id === updated.id);
        if (idx !== -1) {
          catalogItems[idx] = updated;
        }
        renderCatalog();
        if (waitingForDownloadBookId === updated.id && updated.localReady) {
          waitingForDownloadBookId = null;
          selectAndLoadBook(updated.id, true);
        } else if (currentBookId === updated.id && updated.localReady && !audioEl.src) {
          selectAndLoadBook(updated.id, false);
        }
      } catch {}
    });
  } catch (err) {
    console.warn('SSE unavailable on static host:', err);
  }
}

// ============================================================================
// UI Event Listeners & Initialization
// ============================================================================

function bindUIEvents() {
  // Search
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    clearSearchBtn.classList.toggle('hidden', !searchQuery);
    renderCatalog();
  });
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.classList.add('hidden');
    renderCatalog();
  });

  // Filter Tabs
  document.querySelectorAll('.filter-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.getAttribute('data-filter');
      renderCatalog();
    });
  });

  // Smart Category Explorer Mode Tabs
  document.querySelectorAll('.explorer-mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.explorer-mode-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      explorerMode = btn.getAttribute('data-exp-mode');
      renderCategoriesExplorer();
    });
  });

  document.getElementById('resetAllCategoriesBtn').addEventListener('click', () => {
    activeCategoryFilter = null;
    activeAuthor = 'all';
    document.getElementById('authorFilterSelect').value = 'all';
    renderCategoriesExplorer();
    renderCatalog();
  });

  // Author, Sort & Cover Mode selects
  document.getElementById('coverModeSelect').addEventListener('change', (e) => {
    activeCoverMode = e.target.value;
    renderCatalog();
    if (currentBookId) {
      const item = catalogItems.find((i) => i.id === currentBookId);
      if (item) document.getElementById('playerCoverImg').src = resolveCoverUrl(item);
    }
  });
  document.getElementById('authorFilterSelect').addEventListener('change', (e) => {
    activeAuthor = e.target.value;
    renderCatalog();
  });
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    activeSort = e.target.value;
    renderCatalog();
  });

  // Player controls
  playPauseBtn.addEventListener('click', () => {
    if (!audioEl.src) {
      if (currentBookId) selectAndLoadBook(currentBookId, true);
      return;
    }
    if (audioEl.paused) playCurrentAudio();
    else audioEl.pause();
  });

  document.getElementById('skipBack15Btn').addEventListener('click', () => {
    if (audioEl.src) audioEl.currentTime = Math.max(0, audioEl.currentTime - 15);
  });
  document.getElementById('skipBack30Btn').addEventListener('click', () => {
    if (audioEl.src) audioEl.currentTime = Math.max(0, audioEl.currentTime - 30);
  });
  document.getElementById('skipFwd15Btn').addEventListener('click', () => {
    if (audioEl.src) audioEl.currentTime = Math.min(audioEl.duration || Infinity, audioEl.currentTime + 15);
  });
  document.getElementById('skipFwd30Btn').addEventListener('click', () => {
    if (audioEl.src) audioEl.currentTime = Math.min(audioEl.duration || Infinity, audioEl.currentTime + 30);
  });
  document.getElementById('prevTrackBtn').addEventListener('click', () => playAdjacentBook(-1));
  document.getElementById('nextTrackBtn').addEventListener('click', () => playAdjacentBook(1));

  seekSlider.addEventListener('input', () => {
    const dur = audioEl.duration || 0;
    if (dur > 0) {
      const target = (Number(seekSlider.value) / 1000) * dur;
      audioEl.currentTime = target;
      updateTimelineLabels(target, dur);
    }
  });

  // Playback Speed
  const speedSelect = document.getElementById('speedSelect');
  speedSelect.value = String(userState.playbackRate || 1);
  speedSelect.addEventListener('change', () => {
    const rate = Number(speedSelect.value);
    userState.playbackRate = rate;
    audioEl.playbackRate = rate;
    saveUserState();
  });

  // Sleep Timer
  document.getElementById('sleepTimerSelect').addEventListener('change', (e) => {
    setSleepTimer(e.target.value);
  });

  // Voice Boost EQ
  voiceBoostEnabled = Boolean(userState.voiceBoost);
  updateVoiceBoostUI();
  document.getElementById('voiceBoostToggleBtn').addEventListener('click', () => {
    voiceBoostEnabled = !voiceBoostEnabled;
    userState.voiceBoost = voiceBoostEnabled;
    saveUserState();
    ensureAudioGraph();
    reconnectAudioGraph();
    updateVoiceBoostUI();
  });

  // Save current book to browser IndexedDB
  document.getElementById('toggleOfflineCurrentBtn').addEventListener('click', async () => {
    if (!currentBookId) return;
    const item = catalogItems.find((i) => i.id === currentBookId);
    if (!item) return;
    if (offlineMetaMap.has(currentBookId)) {
      await removeMp3FromOfflineVault(currentBookId);
    } else {
      await saveMp3ToOfflineVault(item);
    }
  });

  // Mark Completed
  document.getElementById('markCompletedBtn').addEventListener('click', () => {
    if (!currentBookId) return;
    const bState = getBookState(currentBookId);
    bState.completed = !bState.completed;
    saveUserState();
    document.getElementById('markCompletedBtn').textContent = bState.completed
      ? '✓ Прослушано (Снять отметку)'
      : '✓ Отметить прослушанной';
    renderCatalog();
  });

  // Filter by active book's author
  document.getElementById('playerBookAuthor').addEventListener('click', () => {
    const item = catalogItems.find((i) => i.id === currentBookId);
    if (!item) return;
    activeAuthor = item.author;
    document.getElementById('authorFilterSelect').value = activeAuthor;
    renderCatalog();
  });

  // Bookmarks Form
  document.getElementById('addBookmarkForm').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentBookId) return;
    const noteInput = document.getElementById('bookmarkNoteInput');
    const bState = getBookState(currentBookId);
    const curTime = audioEl.currentTime || bState.position || 0;
    bState.bookmarks = bState.bookmarks || [];
    bState.bookmarks.push({
      id: `bm_${Date.now()}`,
      time: Math.floor(curTime),
      note: noteInput.value.trim() || `Момент на ${formatTime(curTime)}`,
      createdAt: new Date().toISOString()
    });
    noteInput.value = '';
    saveUserState();
    renderBookmarksList();
    renderTimelineBookmarkPins();
    renderCatalog();
  });

  // Export & Import localStorage JSON
  document.getElementById('exportProgressBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(userState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dionysus-audiobooks-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('importProgressInput').addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      if (imported && typeof imported.books === 'object') {
        userState = imported;
        saveUserState();
        renderBookmarksList();
        renderTimelineBookmarkPins();
        renderCatalog();
        alert('Прогресс чтения и закладки успешно импортированы!');
      }
    } catch (err) {
      alert(`Ошибка чтения файла: ${err.message}`);
    }
  });

  // Queue Pause / Resume
  document.getElementById('toggleQueuePauseBtn').addEventListener('click', () => {
    controlQueue(serverStatus.paused ? 'resume' : 'pause');
  });

  // Batch save all ready MP3s into browser IndexedDB
  document.getElementById('saveAllReadyOfflineBtn').addEventListener('click', async () => {
    const readyItems = catalogItems.filter((i) => i.localReady && !offlineMetaMap.has(i.id));
    if (!readyItems.length) {
      alert('Все скачанные на сервер MP3 уже сохранены в локальной памяти браузера (IndexedDB)!');
      return;
    }
    for (const item of readyItems) {
      await saveMp3ToOfflineVault(item);
    }
  });

  // Cloud & Queue Modal
  const modal = document.getElementById('cloudQueueModal');
  const openModal = () => modal.classList.remove('hidden');
  const closeModal = () => modal.classList.add('hidden');

  document.getElementById('openQueueDrawerBtn').addEventListener('click', openModal);
  document.getElementById('openCloudDrawerBtn').addEventListener('click', openModal);
  document.getElementById('openOfflineModalBtn').addEventListener('click', openModal);
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.getElementById('provisionGcsBtn').addEventListener('click', () => controlQueue('provision_gcs'));
  document.getElementById('recheckGcsBtn').addEventListener('click', () => controlQueue('check_gcs'));
  document.getElementById('retryFailedBtn').addEventListener('click', () => controlQueue('retry_errors'));
  document.getElementById('clearOfflineVaultBtn').addEventListener('click', clearEntireOfflineVault);

  // Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
    if (e.code === 'Space') {
      e.preventDefault();
      playPauseBtn.click();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      if (audioEl.src) audioEl.currentTime = Math.max(0, audioEl.currentTime - 15);
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      if (audioEl.src) audioEl.currentTime = Math.min(audioEl.duration || Infinity, audioEl.currentTime + 15);
    }
  });
}

async function initApp() {
  bindUIEvents();
  await refreshOfflineMetadata();

  let data = null;
  if (IS_STATIC_HOST) {
    try {
      const gcsCatalogResp = await fetch(`${GCS_PUBLIC_BASE}/catalog/catalog.json?t=${Date.now()}`);
      if (gcsCatalogResp.ok) data = await gcsCatalogResp.json();
    } catch {}
  }

  if (!data && IS_STATIC_HOST) {
    try {
      const staticResp = await fetch('./catalog.json');
      if (staticResp.ok) data = await staticResp.json();
    } catch {}
  }

  if (!data) {
    try {
      const resp = await fetch(`${API_BASE}/api/catalog`);
      if (resp.ok) data = await resp.json();
    } catch {}
  }

  if (!data) {
    try {
      const fallbackResp = await fetch('./catalog.json');
      if (fallbackResp.ok) data = await fallbackResp.json();
    } catch {}
  }

  if (!data) {
    const gcsResp = await fetch(`${GCS_PUBLIC_BASE}/catalog/catalog.json`);
    data = await gcsResp.json();
  }

  catalogItems = data.items || [];
  const defaultStatus = data.status || {
    paused: true,
    stage: 'on_demand',
    completedLocalCount: catalogItems.filter((i) => i.localReady || i.gcsUploaded).length,
    completedGcsCount: catalogItems.filter((i) => i.gcsUploaded).length,
    totalCount: catalogItems.length,
    bucketExists: true,
    gcpProject: 'beast-trader-live',
    gcsBucket: 'dionysus-audiobooks-vault'
  };
  updateServerStatusUI(defaultStatus);
  populateAuthorsDropdown();
  renderCategoriesExplorer();
  renderCatalog();

  const initialId = userState.lastActiveId || (catalogItems[0] && catalogItems[0].id);
  if (initialId) {
    await selectAndLoadBook(initialId, false);
  }

  connectSse();
}

initApp().catch((err) => console.error('Failed to initialize app:', err));
