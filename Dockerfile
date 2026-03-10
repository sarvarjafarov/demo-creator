FROM node:20-slim

# Install FFmpeg with drawtext support, fonts, and Puppeteer/Chromium dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    fonts-dejavu-core \
    fonts-liberation \
    chromium \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use system Chromium instead of downloading its own
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Build client
COPY client/package*.json ./client/
RUN cd client && npm ci
COPY client/ ./client/
RUN cd client && npm run build

# Copy server source
COPY server/ ./server/

# Create temp and uploads directories
RUN mkdir -p server/temp uploads

# Set environment
ENV NODE_ENV=production
ENV PORT=3001
ENV CLIENT_BUILD_PATH=client/dist

EXPOSE 3001

CMD ["node", "server/src/server.js"]
