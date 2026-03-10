import composer from '../ffmpeg/composer.js';
import logger from '../utils/logger.js';

/**
 * Video service wraps the FFmpeg composer.
 * Provides a clean interface for the job handler.
 */
const videoService = {
  /**
   * Render the final demo video.
   * @param {object} params
   * @param {object} params.project - Project record
   * @param {object} params.sceneJson - Parsed scene JSON from Nova
   * @param {object} params.subtitles - Parsed subtitles from Nova
   * @param {Array} params.screenshots - Array of { buffer, ...asset }
   * @param {Buffer|null} params.voiceover - Voiceover audio buffer
   * @returns {Buffer} The rendered MP4 video buffer
   */
  async renderVideo(params) {
    logger.info(`VideoService: rendering video for project ${params.project.id}`);

    const videoBuffer = await composer.composeVideo(params);

    logger.info(`VideoService: render complete, ${(videoBuffer.length / 1024 / 1024).toFixed(1)}MB`);
    return videoBuffer;
  },
};

export default videoService;
