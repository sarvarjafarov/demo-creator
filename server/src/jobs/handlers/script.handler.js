import jobModel from '../../models/job.model.js';
import projectModel from '../../models/project.model.js';
import contentModel from '../../models/content.model.js';
import novaService from '../../services/nova.service.js';

/** Handle script and narration generation job */
export default async function scriptHandler(job) {
  jobModel.start(job.id);
  jobModel.appendLog(job.id, 'Starting script generation');

  try {
    const project = projectModel.findById(job.projectId);
    if (!project) throw new Error('Project not found');

    const content = contentModel.findByProject(job.projectId);
    if (!content?.brief) throw new Error('Brief must be generated first');

    const brief = JSON.parse(content.brief);

    // Generate script
    jobModel.appendLog(job.id, 'Generating demo script');
    const script = await novaService.generateScript(project, brief);

    contentModel.upsert(job.projectId, {
      script: JSON.stringify(script),
    });

    projectModel.updateStatus(job.projectId, 'script_generated');
    jobModel.complete(job.id, script);
    jobModel.appendLog(job.id, 'Script generation completed');
  } catch (err) {
    jobModel.fail(job.id, err.message);
    projectModel.updateStatus(job.projectId, 'error');
    throw err;
  }
}
