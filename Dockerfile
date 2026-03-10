FROM node:20-slim

# Install FFmpeg
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg && rm -rf /var/lib/apt/lists/*

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

# Set environment
ENV NODE_ENV=production
ENV PORT=3001
ENV CLIENT_BUILD_PATH=client/dist

EXPOSE 3001

CMD ["node", "server/src/server.js"]
