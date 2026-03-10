import jobModel from '../../models/job.model.js';
import projectModel from '../../models/project.model.js';
import contentModel from '../../models/content.model.js';
import assetModel from '../../models/asset.model.js';
import s3Provider from '../../providers/storage.provider.js';
import videoService from '../../services/video.service.js';
import logger from '../../utils/logger.js';

/** Handle video rendering job */
export default async function videoHandler(job) {
  jobModel.start(job.id);
  jobModel.appendLog(job.id, 'Starting video render');

  try {
    const project = projectModel.findById(job.projectId);
    if (!project) throw new Error('Project not found');

    const content = contentModel.findByProject(job.projectId);
    if (!content?.sceneJson) throw new Error('Scene JSON must be generated first');

    const sceneJson = JSON.parse(content.sceneJson);
    const subtitles = content.subtitles ? JSON.parse(content.subtitles) : null;
    const screenshots = assetModel.findByProject(job.projectId, 'screenshot');
    const voiceover = assetModel.findByProject(job.projectId, 'voiceover');

    // Download screenshots from S3 to temp
    jobModel.appendLog(job.id, 'Downloading assets from S3');
    const screenshotBuffers = [];
    for (const ss of screenshots) {
      const { buffer } = await s3Provider.download(ss.s3Key);
      screenshotBuffers.push({ ...ss, buffer });
    }

    let voiceoverBuffer = null;
    if (voiceover.length > 0) {
      const { buffer } = await s3Provider.download(voiceover[0].s3Key);
      voiceoverBuffer = buffer;
    }

    // Render video
    jobModel.appendLog(job.id, 'Rendering video with FFmpeg');
    projectModel.updateStatus(job.projectId, 'rendering');

    const videoBuffer = await videoService.renderVideo({
      project,
      sceneJson,
      subtitles,
      screenshots: screenshotBuffers,
      voiceover: voiceoverBuffer,
    });

    // Upload final video to S3
    jobModel.appendLog(job.id, 'Uploading final video to S3');
    const s3Key = `projects/${job.projectId}/output/demo-video.mp4`;
    await s3Provider.upload(s3Key, videoBuffer, 'video/mp4');
    const url = await s3Provider.getSignedUrl(s3Key);

    // Save final video asset
    assetModel.create({
      projectId: job.projectId,
      type: 'final_video',
      originalName: 'demo-video.mp4',
      mimeType: 'video/mp4',
      s3Key,
      url,
    });

    projectModel.updateStatus(job.projectId, 'completed');
    jobModel.complete(job.id, { s3Key, url });
    jobModel.appendLog(job.id, 'Video render completed');

    logger.info(`Video render complete for project ${job.projectId}`);
  } catch (err) {
    jobModel.fail(job.id, err.message);
    projectModel.updateStatus(job.projectId, 'error');
    throw err;
  }
}
