import jobModel from '../../models/job.model.js';
import projectModel from '../../models/project.model.js';
import contentModel from '../../models/content.model.js';
import novaService from '../../services/nova.service.js';

/** Handle brief generation job */
export default async function briefHandler(job) {
  jobModel.start(job.id);
  jobModel.appendLog(job.id, 'Starting brief generation');

  try {
    const project = projectModel.findById(job.projectId);
    if (!project) throw new Error('Project not found');

    const brief = await novaService.generateBrief(project);

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
