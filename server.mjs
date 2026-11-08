import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { Storage } from '@google-cloud/storage';
import { STORIES_DB, classifyStoryCategories, inferStoryMeta } from './scripts/enrich_stories.mjs';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3456);
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID || 'beast-trader-live';
const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'dionysus-audiobooks-vault';
const GCS_LOCATION = process.env.GCS_LOCATION || 'US';
const PLAYLIST_ID = 'PLLXLVXoZH7sne1R2RGcJSqwk5PM_yOrdy';
const PLAYLIST_URL = `https://www.youtube.com/playlist?list=${PLAYLIST_ID}`;

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const AUDIO_DIR = process.env.AUDIO_DIR || path.join(DATA_DIR, 'audio');
const PUBLIC_DIR = path.join(__dirname, 'public');
const PLAYLIST_RAW_PATH = path.join(DATA_DIR, 'playlist_raw.json');
const CATALOG_PATH = path.join(DATA_DIR, 'catalog.json');

const YTDLP_BIN =
  process.env.YTDLP_BIN ||
  (fs.existsSync(path.join(__dirname, '.venv', 'bin', 'yt-dlp'))
    ? path.join(__dirname, '.venv', 'bin', 'yt-dlp')
    : 'yt-dlp');
const FFMPEG_BIN =
  process.env.FFMPEG_BIN ||
  (fs.existsSync('/opt/homebrew/bin/ffmpeg') ? '/opt/homebrew/bin/ffmpeg' : '/usr/bin/ffmpeg');
const NODE_BIN = process.env.NODE_BIN || process.execPath;
const GCLOUD_BIN =
  process.env.GCLOUD_BIN ||
  (fs.existsSync('/opt/homebrew/bin/gcloud') ? '/opt/homebrew/bin/gcloud' : 'gcloud');

// Initialize Google Cloud Storage SDK client
const gcsClient = new Storage({ projectId: GCP_PROJECT_ID });

// State
let catalog = {
  playlistId: PLAYLIST_ID,
  playlistUrl: PLAYLIST_URL,
  title: 'Чтение | Аудиокниги',
  uploader: 'Dionysus',
  gcpProject: GCP_PROJECT_ID,
  gcsBucket: GCS_BUCKET_NAME,
  gcsEndpoint: `https://storage.googleapis.com/${GCS_BUCKET_NAME}`,
  s3InteroperabilityEndpoint: 'https://storage.googleapis.com',
  updatedAt: new Date().toISOString(),
  items: []
};

let queueState = {
  running: true,
  paused: process.env.AUTO_DOWNLOAD_PAUSED === 'true', // Download all sequentially one by one and upload to GCS S3
  currentId: null,
  currentTitle: null,
  stage: 'idle', // 'on_demand' | 'idle' | 'downloading' | 'converting' | 'uploading_gcs' | 'paused'
  progressPercent: 0,
  speed: '',
  eta: '',
  completedLocalCount: 0,
  completedGcsCount: 0,
  totalCount: 0,
  priorityIds: [],
  bucketExists: false,
  bucketLastChecked: null,
  bucketError: null,
  recentLogs: []
};

const sseClients = new Set();

function addLog(message, level = 'info') {
  const entry = {
    time: new Date().toISOString(),
    level,
    message
  };
  queueState.recentLogs.unshift(entry);
  if (queueState.recentLogs.length > 60) {
    queueState.recentLogs.length = 60;
  }
  console.log(`[${level.toUpperCase()}] ${message}`);
  broadcastEvent('log', entry);
}

function broadcastEvent(type, payload) {
  const msg = `event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(msg);
    } catch {
      sseClients.delete(res);
    }
  }
}

function broadcastStatus() {
  recalcCounts();
  broadcastEvent('status', getStatusSnapshot());
}

function recalcCounts() {
  queueState.totalCount = catalog.items.length;
  queueState.completedLocalCount = catalog.items.filter((i) => i.localReady).length;
  queueState.completedGcsCount = catalog.items.filter((i) => i.gcsUploaded).length;
}

function getStatusSnapshot() {
  recalcCounts();
  return {
    ...queueState,
    gcpProject: GCP_PROJECT_ID,
    gcsBucket: GCS_BUCKET_NAME,
    gcsEndpoint: `https://storage.googleapis.com/${GCS_BUCKET_NAME}`
  };
}

function parseTitleAndAuthor(rawTitle = '') {
  const cleaned = rawTitle.trim();
  const parts = cleaned.split(/\s+-\s+/);
  if (parts.length >= 2) {
    const author = parts[parts.length - 1].trim();
    const title = parts.slice(0, -1).join(' - ').trim();
    return { title, author };
  }
  return { title: cleaned || 'Без названия', author: 'Dionysus' };
}

async function ensureDirectories() {
  await fsp.mkdir(AUDIO_DIR, { recursive: true });
  await fsp.mkdir(PUBLIC_DIR, { recursive: true });
}

async function initCatalog() {
  await ensureDirectories();

  let existingById = new Map();
  if (fs.existsSync(CATALOG_PATH)) {
    try {
      const saved = JSON.parse(await fsp.readFile(CATALOG_PATH, 'utf8'));
      if (Array.isArray(saved.items)) {
        for (const item of saved.items) {
          existingById.set(item.id, item);
        }
      }
    } catch (err) {
      console.warn('Could not parse existing catalog.json:', err.message);
    }
  }

  const raw = JSON.parse(await fsp.readFile(PLAYLIST_RAW_PATH, 'utf8'));
  const seen = new Set();
  const privateIds = new Set();
  const items = [];

  for (const entry of raw.entries || []) {
    if (!entry || !entry.id) continue;
    if (!entry.title || entry.title === '[Private video]' || entry.title === '[Deleted video]') {
      privateIds.add(entry.id);
      continue;
    }
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);

    const prev = existingById.get(entry.id) || {};
    const { title, author } = parseTitleAndAuthor(entry.title);
    const storyMeta = inferStoryMeta({ id: entry.id, title, author });
    const mp3Path = path.join(AUDIO_DIR, `${entry.id}.mp3`);
    const infoPath = path.join(AUDIO_DIR, `${entry.id}.info.json`);

    let localReady = Boolean(prev.localReady || prev.gcsUploaded);
    let fileSizeBytes = prev.fileSizeBytes || 0;
    if (fs.existsSync(mp3Path)) {
      try {
        const st = await fsp.stat(mp3Path);
        if (st.size > 10240) {
          localReady = true;
          fileSizeBytes = st.size;
        }
      } catch {}
    }

    let duration = prev.duration || entry.duration || null;
    let uploadDate = prev.uploadDate || null;

    if (fs.existsSync(infoPath)) {
      try {
        const info = JSON.parse(await fsp.readFile(infoPath, 'utf8'));
        duration = info.duration || duration;
        uploadDate = info.upload_date || uploadDate;
      } catch {}
    }

    const generatedCoverUrl = prev.generatedCoverUrl || `/covers/${entry.id}.svg`;
    const youtubeThumbnailUrl = `https://i.ytimg.com/vi/${entry.id}/hqdefault.jpg`;
    const originalCoverUrl =
      prev.originalCoverUrl && !prev.originalCoverUrl.startsWith('/covers/')
        ? prev.originalCoverUrl
        : youtubeThumbnailUrl;
    const descriptionRu =
      storyMeta.descriptionRu ||
      prev.descriptionRu ||
      prev.description ||
      `Литературный рассказ «${title}» (${author}) в исполнении Евгения Стаховского.`;

    const classification = classifyStoryCategories(
      { title, author, genre: storyMeta.genre || prev.genre, descriptionRu },
      storyMeta
    );

    items.push({
      index: items.length + 1,
      id: entry.id,
      rawTitle: entry.title,
      title,
      author,
      originalTitle: storyMeta.originalTitle || prev.originalTitle || '',
      genre: storyMeta.genre || prev.genre || 'Классическая проза',
      categoryId: classification.categoryId,
      categoryName: classification.categoryName,
      themes: classification.themes,
      region: classification.region,
      isNobelLaureate: classification.isNobelLaureate,
      narrator: prev.narrator || 'Евгений Стаховский',
      descriptionRu,
      description: descriptionRu,
      youtubeUrl: `https://www.youtube.com/watch?v=${entry.id}`,
      thumbnailUrl: prev.thumbnailUrl || originalCoverUrl,
      highResThumbnail: prev.highResThumbnail || originalCoverUrl,
      originalCoverUrl,
      generatedCoverUrl,
      youtubeThumbnailUrl,
      duration,
      uploadDate,
      localReady,
      fileSizeBytes,
      audioQuality: 'MP3 VBR Best (q=0 / ~256-320kbps)',
      localAudioUrl: `/api/audio/${entry.id}`,
      downloadUrl: `/api/download/${entry.id}`,
      gcsObjectKey: `audiobooks/${entry.id}.mp3`,
      gcsUri: `gs://${GCS_BUCKET_NAME}/audiobooks/${entry.id}.mp3`,
      gcsPublicUrl: `https://storage.googleapis.com/${GCS_BUCKET_NAME}/audiobooks/${entry.id}.mp3`,
      gcsUploaded: Boolean(prev.gcsUploaded),
      gcsUploadedAt: prev.gcsUploadedAt || null,
      downloadedAt: prev.downloadedAt || (localReady ? new Date().toISOString() : null),
      error: null
    });
  }

  catalog.title = raw.title || catalog.title;
  catalog.uploader = raw.uploader || catalog.uploader;
  catalog.playlistTotalSlots = (raw.entries || []).length;
  catalog.publicPlayableCount = items.length;
  catalog.privateVideosCount = privateIds.size;
  catalog.items = items;
  await saveCatalog();
  recalcCounts();
  addLog(
    `Loaded full playlist catalog: ${items.length} public audiobooks (${privateIds.size} private/hidden on YouTube, ${queueState.completedLocalCount} MP3s downloaded locally).`
  );
}

let saveLock = false;
async function saveCatalog() {
  catalog.updatedAt = new Date().toISOString();
  if (saveLock) return;
  saveLock = true;
  try {
    const jsonStr = JSON.stringify(catalog, null, 2);
    await fsp.writeFile(CATALOG_PATH, jsonStr, 'utf8');
    await fsp.writeFile(path.join(PUBLIC_DIR, 'catalog.json'), jsonStr, 'utf8');
  } finally {
    saveLock = false;
  }
}

const USE_GCS_SDK_DIRECT = Boolean(process.env.K_SERVICE || process.env.GOOGLE_APPLICATION_CREDENTIALS);

// Check if GCS bucket exists and sync uploaded audiobooks inventory
async function checkGcsBucket() {
  queueState.bucketLastChecked = new Date().toISOString();
  if (USE_GCS_SDK_DIRECT) {
    try {
      const bucket = gcsClient.bucket(GCS_BUCKET_NAME);
      const [exists] = await bucket.exists();
      queueState.bucketExists = Boolean(exists);
      queueState.bucketError = null;
      if (queueState.bucketExists) {
        try {
          const [files] = await bucket.getFiles({ prefix: 'audiobooks/' });
          const gcsMap = new Map();
          for (const f of files) {
            const m = f.name.match(/^audiobooks\/([^/]+)\.mp3$/);
            if (m) {
              gcsMap.set(m[1], Number(f.metadata?.size || 0));
            }
          }
          let updatedCount = 0;
          for (const item of catalog.items) {
            if (gcsMap.has(item.id)) {
              const sz = gcsMap.get(item.id);
              if (!item.gcsUploaded || !item.localReady) updatedCount++;
              item.gcsUploaded = true;
              item.localReady = true;
              if (sz > 10240 && !item.fileSizeBytes) item.fileSizeBytes = sz;
            }
          }
          if (updatedCount > 0) {
            await saveCatalog();
            recalcCounts();
          }
        } catch (listErr) {
          console.warn('Could not list GCS bucket objects:', listErr.message);
        }
      }
      return queueState.bucketExists;
    } catch {}
  }

  // Local environment: use gcloud CLI directly (avoids 169.254.169.254 metadata timeout)
  try {
    await execFileAsync(GCLOUD_BIN, [
      'storage',
      'buckets',
      'describe',
      `gs://${GCS_BUCKET_NAME}`,
      `--project=${GCP_PROJECT_ID}`,
      '--format=json',
      '--quiet'
    ]);
    queueState.bucketExists = true;
    queueState.bucketError = null;
    return true;
  } catch (cliErr) {
    const msg = (cliErr.stderr || cliErr.message || '').toString();
    if (msg.includes('404') || msg.includes('not found')) {
      queueState.bucketExists = false;
      queueState.bucketError = `Bucket gs://${GCS_BUCKET_NAME} not created yet (awaiting confirmation).`;
    } else {
      queueState.bucketExists = false;
      queueState.bucketError = msg.slice(0, 200);
    }
    return false;
  }
}

// Upload a single file to Google Cloud Storage
async function uploadToGcs(
  localFilePath,
  destinationKey,
  contentType = 'audio/mpeg',
  cacheControl = 'public, max-age=31536000'
) {
  const bucketReady = queueState.bucketExists || (await checkGcsBucket());
  if (!bucketReady) {
    return { uploaded: false, reason: 'bucket_not_created' };
  }

  if (USE_GCS_SDK_DIRECT) {
    try {
      await gcsClient.bucket(GCS_BUCKET_NAME).upload(localFilePath, {
        destination: destinationKey,
        metadata: {
          contentType,
          cacheControl
        }
      });
      return { uploaded: true, method: 'sdk' };
    } catch {}
  }

  await execFileAsync(GCLOUD_BIN, [
    'storage',
    'cp',
    localFilePath,
    `gs://${GCS_BUCKET_NAME}/${destinationKey}`,
    `--content-type=${contentType}`,
    `--cache-control=${cacheControl}`,
    `--project=${GCP_PROJECT_ID}`,
    '--quiet'
  ]);
  return { uploaded: true, method: 'gcloud_cli' };
}

// Sync catalog.json metadata to GCS bucket as well
async function syncCatalogToGcs() {
  if (!queueState.bucketExists) return;
  try {
    await uploadToGcs(CATALOG_PATH, 'catalog/catalog.json', 'application/json', 'no-cache, max-age=0');
  } catch (err) {
    console.warn('Could not sync catalog.json to GCS:', err.message);
  }
}

// Provision GCS bucket on explicit user action from UI
async function provisionGcsBucket() {
  addLog(`Provisioning Google Cloud Storage bucket gs://${GCS_BUCKET_NAME} in project ${GCP_PROJECT_ID}...`);
  const encFile = path.join(__dirname, 'gcs', 'encryption_enforcement.json');
  const lifecycleFile = path.join(__dirname, 'gcs', 'lifecycle.json');
  const corsFile = path.join(__dirname, 'gcs', 'cors.json');

  await execFileAsync(GCLOUD_BIN, [
    'storage',
    'buckets',
    'create',
    `gs://${GCS_BUCKET_NAME}`,
    `--project=${GCP_PROJECT_ID}`,
    `--location=${GCS_LOCATION}`,
    '--default-storage-class=STANDARD',
    '--uniform-bucket-level-access',
    '--public-access-prevention',
    '--soft-delete-duration=7d',
    `--encryption-enforcement-file=${encFile}`,
    `--lifecycle-file=${lifecycleFile}`,
    '--quiet'
  ]);

  await execFileAsync(GCLOUD_BIN, [
    'storage',
    'buckets',
    'update',
    `gs://${GCS_BUCKET_NAME}`,
    `--project=${GCP_PROJECT_ID}`,
    `--cors-file=${corsFile}`,
    '--update-labels=app=dionysus-audiobooks,storage-tier=standard',
    '--quiet'
  ]);

  queueState.bucketExists = true;
  queueState.bucketError = null;
  addLog(`Bucket gs://${GCS_BUCKET_NAME} created and configured with UBLA, Soft Delete (7d), CSEK restriction, and CORS.`);
  broadcastStatus();
}

// Download a single audiobook nicely using yt-dlp + ffmpeg
function downloadSingleAudiobook(item) {
  return new Promise((resolve, reject) => {
    const outTemplate = path.join(AUDIO_DIR, `${item.id}.%(ext)s`);
    const args = [
      '--js-runtimes',
      `node:${NODE_BIN}`,
      '--remote-components',
      'ejs:github',
      '--concurrent-fragments',
      '8',
      '--ffmpeg-location',
      FFMPEG_BIN,
      '--extract-audio',
      '--audio-format',
      'mp3',
      '--audio-quality',
      '0',
      '--write-info-json',
      '--no-playlist',
      '--newline',
      '--progress',
      '-o',
      outTemplate,
      item.youtubeUrl
    ];

    queueState.currentId = item.id;
    queueState.currentTitle = `${item.title} — ${item.author}`;
    queueState.stage = 'downloading';
    queueState.progressPercent = 0;
    queueState.speed = '';
    queueState.eta = '';
    broadcastStatus();

    const proc = spawn(YTDLP_BIN, args, { stdio: ['ignore', 'pipe', 'pipe'] });

    let stderrBuf = '';
    proc.stdout.on('data', (chunk) => {
      const lines = chunk.toString().split(/\r?\n/);
      for (const line of lines) {
        if (!line.trim()) continue;
        // Parse [download]  45.2% of   14.20MiB at    3.41MiB/s ETA 00:02
        const m = line.match(/\[download\]\s+(\d+(?:\.\d+)?)%\s+of\s+\S+\s+at\s+(\S+)\s+ETA\s+(\S+)/);
        if (m) {
          queueState.stage = 'downloading';
          queueState.progressPercent = Math.min(99, parseFloat(m[1]));
          queueState.speed = m[2];
          queueState.eta = m[3];
          broadcastStatus();
        } else if (line.includes('[ExtractAudio]')) {
          queueState.stage = 'converting';
          queueState.progressPercent = 99;
          queueState.speed = 'FFmpeg MP3 q=0';
          queueState.eta = '00:01';
          broadcastStatus();
        }
      }
    });

    proc.stderr.on('data', (chunk) => {
      stderrBuf += chunk.toString();
    });

    proc.on('close', async (code) => {
      const mp3Path = path.join(AUDIO_DIR, `${item.id}.mp3`);
      const infoPath = path.join(AUDIO_DIR, `${item.id}.info.json`);

      if (code === 0 && fs.existsSync(mp3Path)) {
        try {
          const st = await fsp.stat(mp3Path);
          item.localReady = true;
          item.fileSizeBytes = st.size;
          item.downloadedAt = new Date().toISOString();
          item.error = null;

          if (fs.existsSync(infoPath)) {
            try {
              const info = JSON.parse(await fsp.readFile(infoPath, 'utf8'));
              item.duration = info.duration || item.duration;
              item.uploadDate = info.upload_date || item.uploadDate;
            } catch {}
          }
          resolve();
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error(stderrBuf.trim() || `yt-dlp exited with code ${code}`));
      }
    });
  });
}

// Pick next item for sequential processing
function pickNextItem() {
  // Always process explicit user-requested items (on-demand priority queue) even when auto-download-all is paused
  while (queueState.priorityIds.length > 0) {
    const pid = queueState.priorityIds.shift();
    const found = catalog.items.find((i) => i.id === pid);
    if (found && (!found.localReady || (queueState.bucketExists && !found.gcsUploaded))) {
      return found;
    }
  }

  // If auto-download-all is paused (default), do NOT automatically download remaining items
  if (queueState.paused) {
    return null;
  }

  // When auto-download-all is explicitly enabled by user, download one by one
  const nextLocal = catalog.items.find((i) => !i.localReady && !i.error);
  if (nextLocal) return nextLocal;

  // If GCS bucket exists, upload any local items not yet synced to GCS
  if (queueState.bucketExists) {
    const nextGcs = catalog.items.find((i) => i.localReady && !i.gcsUploaded);
    if (nextGcs) return nextGcs;
  }

  return null;
}

// Batch-upload all locally ready MP3s that haven't been uploaded to GCS yet
async function batchUploadAllReadyToGcs() {
  const pendingGcs = catalog.items.filter(
    (i) => i.localReady && !i.gcsUploaded && fs.existsSync(path.join(AUDIO_DIR, `${i.id}.mp3`))
  );
  if (!pendingGcs.length) return;

  const bucketReady = queueState.bucketExists || (await checkGcsBucket());
  if (!bucketReady) return;

  queueState.currentId = pendingGcs[0].id;
  queueState.currentTitle = `Пакетная выгрузка ${pendingGcs.length} MP3 в Google Cloud Storage...`;
  queueState.stage = 'uploading_gcs';
  queueState.progressPercent = 99;
  queueState.speed = `Batch (${pendingGcs.length} files)`;
  broadcastStatus();

  addLog(`Starting batch upload of ${pendingGcs.length} local MP3 files to gs://${GCS_BUCKET_NAME}/audiobooks/...`);

  const CHUNK_SIZE = 30;
  for (let i = 0; i < pendingGcs.length; i += CHUNK_SIZE) {
    const chunk = pendingGcs.slice(i, i + CHUNK_SIZE);
    const filePaths = chunk.map((item) => path.join(AUDIO_DIR, `${item.id}.mp3`));
    await execFileAsync(GCLOUD_BIN, [
      'storage',
      'cp',
      ...filePaths,
      `gs://${GCS_BUCKET_NAME}/audiobooks/`,
      '--no-clobber',
      `--project=${GCP_PROJECT_ID}`,
      '--quiet'
    ]);
    const nowIso = new Date().toISOString();
    for (const item of chunk) {
      item.gcsUploaded = true;
      item.gcsUploadedAt = nowIso;
      broadcastEvent('item_updated', item);
    }
    await saveCatalog();
    broadcastStatus();
    addLog(`Batch uploaded ${Math.min(i + CHUNK_SIZE, pendingGcs.length)}/${pendingGcs.length} MP3s to Google Cloud S3.`);
  }

  await syncCatalogToGcs();
  addLog(`All ${pendingGcs.length} MP3s and catalog.json synced to gs://${GCS_BUCKET_NAME}!`);
}

// Sequential One-by-One Worker Loop (Phase 1: Download All Locally -> Phase 2: Batch Upload to GCS)
let workerActive = false;
async function runSequentialWorker() {
  if (workerActive) return;
  workerActive = true;

  await checkGcsBucket();
  broadcastStatus();

  while (queueState.running) {
    // Phase 1: Pick next un-downloaded local item first
    let item = null;
    while (queueState.priorityIds.length > 0) {
      const pid = queueState.priorityIds.shift();
      const found = catalog.items.find((i) => i.id === pid);
      if (found && !found.localReady) {
        item = found;
        break;
      }
    }

    if (!item && !queueState.paused) {
      item = catalog.items.find((i) => !i.localReady && !i.error) || null;
    }

    if (!item) {
      // All local downloads finished! Run Phase 2: Batch upload all ready local MP3s to GCS
      const hasPendingGcs =
        !queueState.paused &&
        queueState.bucketExists &&
        catalog.items.some((i) => i.localReady && !i.gcsUploaded);

      if (hasPendingGcs) {
        try {
          await batchUploadAllReadyToGcs();
        } catch (err) {
          addLog(`Batch GCS upload error: ${err.message}`, 'error');
        }
      }

      queueState.currentId = null;
      queueState.currentTitle = null;
      queueState.stage = queueState.paused ? 'on_demand' : 'idle';
      queueState.progressPercent = 0;
      queueState.speed = '';
      queueState.eta = '';
      broadcastStatus();
      await new Promise((r) => setTimeout(r, 1200));
      continue;
    }

    try {
      addLog(`Starting sequential download [${item.index}/${catalog.items.length}]: "${item.title}" — ${item.author}`);
      await downloadSingleAudiobook(item);
      addLog(
        `Downloaded MP3 [${item.index}/${catalog.items.length}]: "${item.title}" (${(
          item.fileSizeBytes /
          (1024 * 1024)
        ).toFixed(1)} MB)`
      );

      await saveCatalog();
      broadcastEvent('item_updated', item);
      broadcastStatus();
    } catch (err) {
      item.error = err.message.slice(0, 250);
      addLog(`Error processing "${item.title}": ${item.error}`, 'error');
      await saveCatalog();
      broadcastEvent('item_updated', item);
      broadcastStatus();
    }

    // Brief pause between downloads
    await new Promise((r) => setTimeout(r, 500));
  }

  workerActive = false;
}

// Helper to parse JSON body
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
      if (body.length > 1e6) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Range'
  });
  res.end(JSON.stringify(data));
}

// Serve static files from public/
async function serveStatic(req, res, pathname) {
  const relPath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const safePath = path.normalize(relPath).replace(/^(\.\.(\/|\\|$))+/, '');
  const fullPath = path.join(PUBLIC_DIR, safePath);

  if (!fullPath.startsWith(PUBLIC_DIR) || !fs.existsSync(fullPath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const ext = path.extname(fullPath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';
  const content = await fsp.readFile(fullPath);
  res.writeHead(200, { 'Content-Type': contentType });
  res.end(content);
}

// Stream MP3 with HTTP Range support (206 Partial Content) for instant seeking
async function streamAudioFile(req, res, id, asAttachment = false) {
  const item = catalog.items.find((i) => i.id === id);
  if (!item) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Audiobook not found in catalog' }));
    return;
  }

  const mp3Path = path.join(AUDIO_DIR, `${item.id}.mp3`);
  if (!fs.existsSync(mp3Path)) {
    // If running on Cloud Run (ephemeral disk) and MP3 is already in Google Cloud Storage, stream/redirect from GCS
    if (queueState.bucketExists && item.gcsUploaded && item.gcsObjectKey) {
      try {
        const gcsFile = gcsClient.bucket(GCS_BUCKET_NAME).file(item.gcsObjectKey);
        const [exists] = await gcsFile.exists();
        if (exists) {
          const [meta] = await gcsFile.getMetadata();
          const total = Number(meta.size || item.fileSizeBytes || 0);
          const safeFilename = `${item.author} - ${item.title}.mp3`.replace(/[/\\?%*:|"<>]/g, '_');
          const disposition = asAttachment
            ? `attachment; filename="audiobook-${item.id}.mp3"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`
            : `inline; filename*=UTF-8''${encodeURIComponent(safeFilename)}`;
          const range = req.headers.range;
          if (range && total > 0) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
            const chunkSize = end - start + 1;
            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${total}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunkSize,
              'Content-Type': 'audio/mpeg',
              'Content-Disposition': disposition,
              'Access-Control-Allow-Origin': '*'
            });
            if (req.method === 'HEAD') return res.end();
            return gcsFile.createReadStream({ start, end }).pipe(res);
          }
          res.writeHead(200, {
            ...(total > 0 ? { 'Content-Length': total } : {}),
            'Accept-Ranges': 'bytes',
            'Content-Type': 'audio/mpeg',
            'Content-Disposition': disposition,
            'Access-Control-Allow-Origin': '*'
          });
          if (req.method === 'HEAD') return res.end();
          return gcsFile.createReadStream().pipe(res);
        }
      } catch (err) {
        addLog(`GCS stream fallback check failed for ${item.id}: ${err.message}`, 'warn');
      }
    }

    // Prioritize this item in the sequential downloader
    if (!queueState.priorityIds.includes(item.id)) {
      queueState.priorityIds.unshift(item.id);
      item.error = null;
      addLog(`Prioritized on-demand download for "${item.title}" — ${item.author}`);
      broadcastStatus();
    }
    res.writeHead(202, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        status: 'queued_priority',
        message: `"${item.title}" has been moved to the front of the sequential download queue.`
      })
    );
    return;
  }

  const stat = await fsp.stat(mp3Path);
  const total = stat.size;
  const safeFilename = `${item.author} - ${item.title}.mp3`.replace(/[/\\?%*:|"<>]/g, '_');
  const disposition = asAttachment
    ? `attachment; filename="audiobook-${item.id}.mp3"; filename*=UTF-8''${encodeURIComponent(safeFilename)}`
    : `inline; filename*=UTF-8''${encodeURIComponent(safeFilename)}`;

  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : total - 1;

    if (isNaN(start) || isNaN(end) || start >= total || end >= total) {
      res.writeHead(416, { 'Content-Range': `bytes */${total}` });
      res.end();
      return;
    }

    const chunkSize = end - start + 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': disposition,
      'Access-Control-Allow-Origin': '*'
    });
    if (req.method === 'HEAD') {
      res.end();
    } else {
      fs.createReadStream(mp3Path, { start, end }).pipe(res);
    }
  } else {
    res.writeHead(200, {
      'Content-Length': total,
      'Accept-Ranges': 'bytes',
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': disposition,
      'Access-Control-Allow-Origin': '*'
    });
    if (req.method === 'HEAD') {
      res.end();
    } else {
      fs.createReadStream(mp3Path).pipe(res);
    }
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Range'
      });
      return res.end();
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const { pathname } = url;

    if (req.method === 'GET' && pathname === '/api/catalog') {
      recalcCounts();
      return sendJson(res, 200, {
        ...catalog,
        status: getStatusSnapshot()
      });
    }

    if (req.method === 'GET' && pathname === '/api/status') {
      return sendJson(res, 200, getStatusSnapshot());
    }

    if (req.method === 'GET' && pathname === '/api/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });
      res.write(`event: status\ndata: ${JSON.stringify(getStatusSnapshot())}\n\n`);
      sseClients.add(res);
      req.on('close', () => sseClients.delete(res));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/queue/control') {
      const body = await readJsonBody(req);
      const { action, id } = body;

      if (action === 'pause') {
        queueState.paused = true;
        addLog('Режим по запросу: автоматическое скачивание всего плейлиста отключено.');
      } else if (action === 'resume') {
        queueState.paused = false;
        addLog('Включено последовательное авто-скачивание всех книг (1-за-1).');
      } else if (action === 'prioritize' && id) {
        const item = catalog.items.find((i) => i.id === id);
        if (item) {
          item.error = null;
          queueState.priorityIds = [id, ...queueState.priorityIds.filter((x) => x !== id)];
          addLog(`Запрошено скачивание MP3: «${item.title}» — ${item.author}`);
        }
      } else if (action === 'check_gcs') {
        await checkGcsBucket();
        addLog(
          queueState.bucketExists
            ? `Verified GCS bucket gs://${GCS_BUCKET_NAME} is active.`
            : `GCS bucket gs://${GCS_BUCKET_NAME} not yet created.`
        );
      } else if (action === 'provision_gcs') {
        await provisionGcsBucket();
      } else if (action === 'retry_errors') {
        for (const item of catalog.items) {
          if (item.error) item.error = null;
        }
        addLog('Cleared previous errors to retry failed items.');
      }

      broadcastStatus();
      return sendJson(res, 200, { ok: true, status: getStatusSnapshot() });
    }

    if ((req.method === 'GET' || req.method === 'HEAD') && pathname.startsWith('/api/audio/')) {
      const id = decodeURIComponent(pathname.replace('/api/audio/', ''));
      return await streamAudioFile(req, res, id, false);
    }

    if ((req.method === 'GET' || req.method === 'HEAD') && pathname.startsWith('/api/download/')) {
      const id = decodeURIComponent(pathname.replace('/api/download/', ''));
      return await streamAudioFile(req, res, id, true);
    }

    return await serveStatic(req, res, pathname);
  } catch (err) {
    console.error('Server error:', err);
    if (!res.headersSent) {
      sendJson(res, 500, { error: err.message });
    }
  }
});

await initCatalog();
server.listen(PORT, '0.0.0.0', () => {
  addLog(`Dionysus Audiobook Cloud Player running at http://0.0.0.0:${PORT}`);
  runSequentialWorker().catch((err) => console.error('Worker error:', err));
});
