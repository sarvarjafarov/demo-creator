import jobModel from '../../models/job.model.js';
import projectModel from '../../models/project.model.js';
import contentModel from '../../models/content.model.js';
import assetModel from '../../models/asset.model.js';
import storageProvider from '../../providers/storage.provider.js';
import elevenLabsService from '../../services/elevenlabs.service.js';
import logger from '../../utils/logger.js';

/** Handle voiceover generation job — clones user's voice then generates TTS */
export default async function voiceHandler(job) {
  jobModel.start(job.id);
  jobModel.appendLog(job.id, 'Starting voiceover generation');

  try {
    const project = projectModel.findById(job.projectId);
    if (!project) throw new Error('Project not found');

    const content = contentModel.findByProject(job.projectId);
    if (!content?.narration) throw new Error('Narration must be generated first');

    const narration = JSON.parse(content.narration);
    const narrationText = narration.fullNarration;

    if (!narrationText) throw new Error('No narration text available');

    // Check if user uploaded a voice sample — clone it for personalized TTS
    const voiceAssets = assetModel.findByProject(job.projectId, 'voice');
    let voiceId = undefined;

    if (voiceAssets.length > 0) {
      try {
        jobModel.appendLog(job.id, 'Cloning user voice from uploaded sample');
        const { buffer } = await storageProvider.download(voiceAssets[0].s3Key);
        const cloneResult = await elevenLabsService.addVoiceClone(
          `demo-${project.productName || job.projectId}`.slice(0, 40),
          buffer
        );
        voiceId = cloneResult.voiceId;
        jobModel.appendLog(job.id, `Voice cloned successfully (ID: ${voiceId})`);
        logger.info(`Voice cloned for project ${job.projectId}: ${voiceId}`);
      } catch (cloneErr) {
        logger.warn(`Voice clone failed, using default voice: ${cloneErr.message}`);
        jobModel.appendLog(job.id, `Voice clone failed (${cloneErr.message}), using default voice`);
      }
    }

    // Generate voiceover via ElevenLabs (with cloned voice or default)
    jobModel.appendLog(job.id, 'Calling ElevenLabs TTS');
    const { s3Key, url } = await elevenLabsService.generateVoiceover(
      job.projectId,
      narrationText,
      voiceId ? { voiceId } : {}
    );

    // Save voiceover asset
    assetModel.create({
      projectId: job.projectId,
      type: 'voiceover',
      originalName: 'narration.mp3',
      mimeType: 'audio/mpeg',
      s3Key,
      url,
    });

    projectModel.updateStatus(job.projectId, 'voiceover_generated');
    jobModel.complete(job.id, { s3Key, url });
    jobModel.appendLog(job.id, 'Voiceover generation completed');
  } catch (err) {
    // Voiceover is optional — don't block the pipeline on failure
    jobModel.fail(job.id, err.message);
    jobModel.appendLog(job.id, `Voiceover skipped: ${err.message}`);
    // Do NOT set project status to 'error' — video can render without voiceover
  }
}
