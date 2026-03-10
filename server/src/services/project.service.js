import projectModel from '../models/project.model.js';
import assetModel from '../models/asset.model.js';
import contentModel from '../models/content.model.js';
import jobModel from '../models/job.model.js';

const projectService = {
  /** Create a new project */
  create(data) {
    return projectModel.create(data);
  },

  /** Get project by ID with related data */
  getById(id) {
    const project = projectModel.findById(id);
    if (!project) return null;

    const assets = assetModel.findByProject(id);
    const content = contentModel.findByProject(id);
    const jobs = jobModel.findByProject(id);

    return { ...project, assets, content, jobs };
  },

  /** List all projects */
  list() {
    return projectModel.findAll();
  },

  /** Update project status */
  updateStatus(id, status) {
    return projectModel.updateStatus(id, status);
  },

  /** Get project status summary */
  getStatus(id) {
    const project = projectModel.findById(id);
    if (!project) return null;

    const jobs = jobModel.findByProject(id);
    const content = contentModel.findByProject(id);
    const assets = assetModel.findByProject(id);

    const steps = {
      project_created: true,
      assets_uploaded: assets.length > 0,
      voice_uploaded: assets.some((a) => a.type === 'voice'),
      brief_generated: !!content?.brief,
      script_generated: !!content?.script,
      storyboard_generated: !!content?.storyboard,
      narration_generated: !!content?.narration,
      subtitles_generated: !!content?.subtitles,
      scene_json_generated: !!content?.sceneJson,
      video_rendered: jobs.some((j) => j.type === 'video_render' && j.status === 'completed'),
    };

    const activeJob = jobs.find((j) => j.status === 'running');

    // Only report error from the latest job per type
    // so old failed jobs don't block retries
    const latestByType = {};
    for (const j of jobs) {
      latestByType[j.type] = j; // last wins (ordered by rowid)
    }
    const latestFailed = Object.values(latestByType).find((j) => j.status === 'failed');

    return {
      projectId: id,
      projectStatus: project.status,
      steps,
      activeJob: activeJob ? { id: activeJob.id, type: activeJob.type } : null,
      lastError: latestFailed?.errorMessage || null,
    };
  },

  /** Get final result metadata */
  getResult(id) {
    const project = projectModel.findById(id);
    if (!project) return null;

    const content = contentModel.findByProject(id);
    const videoJob = jobModel.findLatest(id, 'video_render');
    const assets = assetModel.findByProject(id);
    const videoAsset = assets.find((a) => a.type === 'final_video');

    return {
      projectId: id,
      productName: project.productName,
      status: project.status,
      content: content
        ? {
            brief: content.brief ? JSON.parse(content.brief) : null,
            script: content.script ? JSON.parse(content.script) : null,
            narration: content.narration ? JSON.parse(content.narration) : null,
          }
        : null,
      video: videoAsset
        ? { url: videoAsset.url, s3Key: videoAsset.s3Key }
        : null,
      videoJob: videoJob
        ? { status: videoJob.status, completedAt: videoJob.completedAt }
        : null,
    };
  },
};

export default projectService;
