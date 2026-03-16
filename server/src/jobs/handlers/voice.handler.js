import jobModel from '../../models/job.model.js';
import projectModel from '../../models/project.model.js';
import contentModel from '../../models/content.model.js';
import assetModel from '../../models/asset.model.js';
import elevenLabsService from '../../services/elevenlabs.service.js';

/** Handle voiceover generation job */
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

    // Generate voiceover via ElevenLabs
    jobModel.appendLog(job.id, 'Calling ElevenLabs TTS');
    const { s3Key, url } = await elevenLabsService.generateVoiceover(
      job.projectId,
      narrationText
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
