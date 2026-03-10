import jobModel from '../../models/job.model.js';
import projectModel from '../../models/project.model.js';
import contentModel from '../../models/content.model.js';
import assetModel from '../../models/asset.model.js';
import novaService from '../../services/nova.service.js';

/** Handle storyboard, narration, subtitles, and scene JSON generation */
export default async function storyboardHandler(job) {
  jobModel.start(job.id);
  jobModel.appendLog(job.id, 'Starting storyboard generation');

  try {
    const project = projectModel.findById(job.projectId);
    if (!project) throw new Error('Project not found');

    const content = contentModel.findByProject(job.projectId);
    if (!content?.script) throw new Error('Script must be generated first');

    const script = JSON.parse(content.script);
    const brief = content.brief ? JSON.parse(content.brief) : null;
    const screenshots = assetModel.findByProject(job.projectId, 'screenshot');

    // Step 1: Storyboard
    jobModel.appendLog(job.id, 'Generating storyboard');
    const storyboard = await novaService.generateStoryboard(project, script, screenshots.length);

    // Step 2: Narration
    jobModel.appendLog(job.id, 'Generating narration');
    const narration = await novaService.generateNarration(project, script, storyboard);

    // Step 3: QA rewrite
    jobModel.appendLog(job.id, 'Running QA rewrite');
    const qa = await novaService.qaRewrite(brief, script, narration);
    const finalNarration = { ...narration, fullNarration: qa.polishedNarration || narration.fullNarration };

    // Step 4: Subtitles
    jobModel.appendLog(job.id, 'Generating subtitles');
    const subtitles = await novaService.generateSubtitles(finalNarration, storyboard);

    // Step 5: Scene JSON
    jobModel.appendLog(job.id, 'Generating scene JSON');
    const sceneJson = await novaService.generateSceneJson(project, storyboard, finalNarration, screenshots.length);

    // Save all content
    contentModel.upsert(job.projectId, {
      storyboard: JSON.stringify(storyboard),
      narration: JSON.stringify(finalNarration),
      subtitles: JSON.stringify(subtitles),
      sceneJson: JSON.stringify(sceneJson),
      qaVersion: JSON.stringify(qa),
    });

    projectModel.updateStatus(job.projectId, 'storyboard_generated');
    jobModel.complete(job.id, { storyboard, sceneJson });
    jobModel.appendLog(job.id, 'Storyboard pipeline completed');
  } catch (err) {
    jobModel.fail(job.id, err.message);
    projectModel.updateStatus(job.projectId, 'error');
    throw err;
  }
}
