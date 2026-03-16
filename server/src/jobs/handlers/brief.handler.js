import jobModel from '../../models/job.model.js';
import projectModel from '../../models/project.model.js';
import contentModel from '../../models/content.model.js';
import assetModel from '../../models/asset.model.js';
import storageProvider from '../../providers/storage.provider.js';
import novaService from '../../services/nova.service.js';
import logger from '../../utils/logger.js';

/** Handle brief generation job - with multimodal screenshot analysis */
export default async function briefHandler(job) {
  jobModel.start(job.id);
  jobModel.appendLog(job.id, 'Starting brief generation');

  try {
    const project = projectModel.findById(job.projectId);
    if (!project) throw new Error('Project not found');

    // Load screenshot buffers for multimodal analysis
    const screenshots = assetModel.findByProject(job.projectId, 'screenshot');
    const screenshotBuffers = [];

    if (screenshots.length > 0) {
      jobModel.appendLog(job.id, `Loading ${screenshots.length} screenshots for visual analysis`);
      // Send up to 4 screenshots to keep within token limits
      const toAnalyze = screenshots.slice(0, 4);
      for (const ss of toAnalyze) {
        try {
          const { buffer } = await storageProvider.download(ss.s3Key);
          screenshotBuffers.push(buffer);
        } catch (err) {
          logger.warn(`Brief: failed to load screenshot ${ss.s3Key}: ${err.message}`);
        }
      }
      jobModel.appendLog(job.id, `Loaded ${screenshotBuffers.length} screenshots for Nova multimodal analysis`);
    }

    const brief = await novaService.generateBrief(project, screenshotBuffers);

    contentModel.upsert(job.projectId, {
      brief: JSON.stringify(brief),
    });

    projectModel.updateStatus(job.projectId, 'brief_generated');
    jobModel.complete(job.id, brief);
    jobModel.appendLog(job.id, 'Brief generation completed');
  } catch (err) {
    jobModel.fail(job.id, err.message);
    projectModel.updateStatus(job.projectId, 'error');
    throw err;
  }
}
