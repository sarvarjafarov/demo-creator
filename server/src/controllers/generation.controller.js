import projectModel from '../models/project.model.js';
import jobModel from '../models/job.model.js';
import jobQueue from '../jobs/queue.js';

/** POST /api/projects/:id/generate-brief */
export async function generateBrief(req, res, next) {
  try {
    const project = projectModel.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: { message: 'Project not found' } });
    }

    const job = jobModel.create(project.id, 'brief_generation');
    jobQueue.enqueue(job);

    res.status(202).json({ message: 'Brief generation started', jobId: job.id });
  } catch (err) {
    next(err);
  }
}

/** POST /api/projects/:id/generate-script */
export async function generateScript(req, res, next) {
  try {
    const project = projectModel.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: { message: 'Project not found' } });
    }

    const job = jobModel.create(project.id, 'script_generation');
    jobQueue.enqueue(job);

    res.status(202).json({ message: 'Script generation started', jobId: job.id });
  } catch (err) {
    next(err);
  }
}

/** POST /api/projects/:id/generate-storyboard */
export async function generateStoryboard(req, res, next) {
  try {
    const project = projectModel.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: { message: 'Project not found' } });
    }

    const job = jobModel.create(project.id, 'storyboard_generation');
    jobQueue.enqueue(job);

    res.status(202).json({ message: 'Storyboard generation started', jobId: job.id });
  } catch (err) {
    next(err);
  }
}

/** POST /api/projects/:id/generate-video */
export async function generateVideo(req, res, next) {
  try {
    const project = projectModel.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: { message: 'Project not found' } });
    }

    // First generate voiceover, then render video
    const voiceJob = jobModel.create(project.id, 'voice_generation');
    const videoJob = jobModel.create(project.id, 'video_render');

    // Chain: voice -> video (runs in background, not blocking the response)
    (async () => {
      await jobQueue.enqueueAndWait(voiceJob);
      // Whether voice succeeded or failed, proceed with video render
      await jobQueue.enqueueAndWait(videoJob);
    })();

    res.status(202).json({
      message: 'Video generation started',
      voiceJobId: voiceJob.id,
      videoJobId: videoJob.id,
    });
  } catch (err) {
    next(err);
  }
}
