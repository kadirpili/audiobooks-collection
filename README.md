# 🎧 Audiobooks Collection (`Чтение | Аудиокниги — Dionysus`)

An offline-first audiobook web player and Google Cloud Storage (`S3`) vault featuring **452 classic and modern literary short stories** read in Russian by **Evgeny Stakhovsky** (`Dionysus` collection).

## 🌐 Live Links

- **🚀 Open Web Player (GitHub Pages)**: **[https://kadirpili.github.io/audiobooks-collection/](https://kadirpili.github.io/audiobooks-collection/)**
- **☁️ Google Cloud Run Instance**: **[https://dionysus-audiobooks-909525131314.asia-northeast1.run.app](https://dionysus-audiobooks-909525131314.asia-northeast1.run.app)**
- **🗄️ Google Cloud Storage (`S3`) Catalog**: **[https://storage.googleapis.com/dionysus-audiobooks-vault/catalog/catalog.json](https://storage.googleapis.com/dionysus-audiobooks-vault/catalog/catalog.json)**

---

## ✨ Features

- **452 Curated Stories across 273 Authors** (including **43 Nobel Prize in Literature laureates**):
  - Russian plot descriptions (`descriptionRu`), literary genres, thematic tags, geographic regions, and custom illustrated SVG covers (`public/covers/*.svg`).
- **Smart Multi-Dimensional Category Explorer**:
  - **📚 Жанровые категории**: Мистика и Хоррор, Научная фантастика, Магический реализм и Притчи, Психологическая драма, Ирония и Городская проза, Нуар и Детектив.
  - **🕯️ Темы и сюжеты**: Космос и иные миры, Тайна и сверхъестественное, Одиночество и город, Любовь и отношения, Память и детство, Преступление и расплата, Война и испытания.
  - **✍️ Подборки по авторам и премиям**: Нобелевские лауреаты, Стивен Кинг, Рэй Брэдбери, Симон Кармиггелт, Роджер Желязны, Сергей Довлатов, Харуки Мураками, Хорхе Луис Борхес и др.
  - **🌍 Литературная география и длительность**: США, Европа и Британия, Япония и Восток, Русская литература, Скандинавия, Латинская Америка.
- **Full Audiobook Player Studio**:
  - **Offline Browser Vault (`IndexedDB`)**: Save full MP3 files directly inside your browser (`DionysusOfflineAudioDB`) for 100% offline listening.
  - **Automatic Progress & Bookmarks (`localStorage`)**: Remembers exact playback position, playback speed (`0.75x`–`2.0x`), completed status, and timestamped bookmarks with notes, plus JSON export/import.
  - **Web Audio API Voice Clarity EQ**: High-pass filter + 2.8 kHz presence boost + dynamic compression tailored for spoken-word narration.
  - **Sleep Timer**: 15, 30, 45, 60 minutes, or end of current story.
