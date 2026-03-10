import assetModel from '../models/asset.model.js';
import contentModel from '../models/content.model.js';
import s3Provider from '../providers/storage.provider.js';
import logger from '../utils/logger.js';

/**
 * Scene service bridges AI-generated scene JSON with the video pipeline.
 * Resolves asset references, downloads files, and prepares render-ready data.
 */
const sceneService = {
  /**
   * Build a render-ready scene plan by resolving all asset references
   * in the scene JSON to actual screenshot buffers.
   *
   * @param {string} projectId
   * @returns {{ sceneJson, subtitles, screenshots: Array<{buffer, ...asset}>, voiceover: Buffer|null }}
   */
  async buildRenderPlan(projectId) {
    const content = contentModel.findByProject(projectId);
    if (!content?.sceneJson) throw new Error('Scene JSON not generated yet');

    const sceneJson = JSON.parse(content.sceneJson);
    const subtitles = content.subtitles ? JSON.parse(content.subtitles) : null;

    // Fetch screenshot assets
    const screenshotAssets = assetModel.findByProject(projectId, 'screenshot');
    const screenshots = [];
    for (const asset of screenshotAssets) {
      try {
        const { buffer } = await s3Provider.download(asset.s3Key);
        screenshots.push({ ...asset, buffer });
      } catch (err) {
        logger.warn(`Failed to download screenshot ${asset.s3Key}: ${err.message}`);
      }
    }

    // Fetch voiceover if available
    const voiceoverAssets = assetModel.findByProject(projectId, 'voiceover');
    let voiceover = null;
    if (voiceoverAssets.length > 0) {
      try {
        const { buffer } = await s3Provider.download(voiceoverAssets[0].s3Key);
        voiceover = buffer;
      } catch (err) {
        logger.warn(`Failed to download voiceover: ${err.message}`);
      }
    }

    logger.info(`Scene plan built: ${sceneJson.scenes?.length || 0} scenes, ${screenshots.length} screenshots, voiceover: ${!!voiceover}`);

    return { sceneJson, subtitles, screenshots, voiceover };
  },

  /**
   * Validate that a scene JSON has the required structure for rendering.
   * Returns an array of validation errors (empty = valid).
   */
  validateSceneJson(sceneJson) {
    const errors = [];

    if (!sceneJson.scenes || !Array.isArray(sceneJson.scenes)) {
      errors.push('Missing or invalid "scenes" array');
      return errors;
    }

    if (sceneJson.scenes.length === 0) {
      errors.push('Scene list is empty');
      return errors;
    }

    let totalDuration = 0;
    for (const scene of sceneJson.scenes) {
      if (!scene.sceneNumber) errors.push(`Scene missing sceneNumber`);
      if (!scene.sceneType) errors.push(`Scene ${scene.sceneNumber}: missing sceneType`);
      if (!scene.durationSeconds || scene.durationSeconds <= 0) {
        errors.push(`Scene ${scene.sceneNumber}: invalid duration`);
      }
      totalDuration += scene.durationSeconds || 0;
    }

    // Check first and last scene types
    const first = sceneJson.scenes[0];
    const last = sceneJson.scenes[sceneJson.scenes.length - 1];
    if (first.sceneType !== 'title_card') {
      errors.push('First scene should be type "title_card"');
    }
    if (last.sceneType !== 'cta_card') {
      errors.push('Last scene should be type "cta_card"');
    }

    return errors;
  },
};

export default sceneService;
