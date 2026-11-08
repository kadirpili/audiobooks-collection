FROM node:22-bookworm-slim

# Install Python 3, pip, ffmpeg, and curl for yt-dlp + MP3 VBR q=0 extraction
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    ffmpeg \
    ca-certificates \
    && pip3 install --no-cache-dir --break-system-packages -U yt-dlp \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY server.mjs ./
COPY scripts ./scripts
COPY public ./public
COPY gcs ./gcs
COPY data/catalog.json ./data/catalog.json
COPY data/playlist_raw.json ./data/playlist_raw.json

RUN mkdir -p /app/data/audio

ENV NODE_ENV=production
ENV PORT=8080
ENV GCP_PROJECT_ID=beast-trader-live
ENV GCS_BUCKET_NAME=dionysus-audiobooks-vault
ENV YTDLP_BIN=yt-dlp
ENV FFMPEG_BIN=/usr/bin/ffmpeg

EXPOSE 8080

CMD ["node", "server.mjs"]
