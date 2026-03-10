import app from './app.js';
import env from './config/env.js';
import logger from './utils/logger.js';
import { initDatabase } from './models/db.js';
import jobQueue from './jobs/queue.js';
import briefHandler from './jobs/handlers/brief.handler.js';
import scriptHandler from './jobs/handlers/script.handler.js';
import storyboardHandler from './jobs/handlers/storyboard.handler.js';
import voiceHandler from './jobs/handlers/voice.handler.js';
import videoHandler from './jobs/handlers/video.handler.js';

// Initialize database
initDatabase();

// Register job handlers
jobQueue.register('brief_generation', briefHandler);
jobQueue.register('script_generation', scriptHandler);
jobQueue.register('storyboard_generation', storyboardHandler);
jobQueue.register('voice_generation', voiceHandler);
jobQueue.register('video_render', videoHandler);

const server = app.listen(env.port, () => {
  logger.info(`Demo Creator API running on port ${env.port}`, {
    env: env.nodeEnv,
    url: env.appBaseUrl,
  });
});

// Graceful shutdown
function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled rejection', { error: err?.message, stack: err?.stack });
});
