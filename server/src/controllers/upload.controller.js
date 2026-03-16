import projectModel from '../models/project.model.js';
import assetModel from '../models/asset.model.js';
import s3Provider from '../providers/storage.provider.js';
import captureService from '../services/capture.service.js';
import logger from '../utils/logger.js';

/** POST /api/projects/:id/upload-voice - Upload voice sample */
export async function uploadVoice(req, res, next) {
  try {
    const project = projectModel.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: { message: 'Project not found' } });
    }

    if (!req.file) {
      return res.status(400).json({ error: { message: 'No voice file uploaded' } });
    }

    const keyPrefix = `projects/${project.id}/voice`;
    const { s3Key, url } = await s3Provider.uploadFile(req.file, keyPrefix);

    const asset = assetModel.create({
      projectId: project.id,
      type: 'voice',
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      s3Key,
      url,
    });

    logger.info(`Voice sample uploaded for project ${project.id}`);
    res.status(201).json(asset);
  } catch (err) {
    next(err);
  }
}

/** POST /api/projects/:id/upload-assets - Upload screenshots and recordings */
export async function uploadAssets(req, res, next) {
  try {
    const project = projectModel.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: { message: 'Project not found' } });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: { message: 'No files uploaded' } });
    }

    const assets = [];
    for (const file of req.files) {
      const isVideo = file.mimetype.startsWith('video/');
      const type = isVideo ? 'screen_recording' : 'screenshot';
      const keyPrefix = `projects/${project.id}/${type}s`;

      const { s3Key, url } = await s3Provider.uploadFile(file, keyPrefix);

      const asset = assetModel.create({
        projectId: project.id,
        type,
        originalName: file.originalname,
        mimeType: file.mimetype,
        s3Key,
        url,
      });

      assets.push(asset);
    }

    logger.info(`${assets.length} asset(s) uploaded for project ${project.id}`);
    res.status(201).json(assets);
  } catch (err) {
    next(err);
  }
}

/** POST /api/projects/:id/capture - Auto-capture screenshots from product URL */
export async function captureFromUrl(req, res, next) {
  try {
    const project = projectModel.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: { message: 'Project not found' } });
    }

    if (!project.productUrl) {
      return res.status(400).json({ error: { message: 'Project has no product URL configured' } });
    }

    // If screenshots already exist for this project, return them instead of re-capturing
    const existing = assetModel.findByProject(project.id, 'screenshot');
    if (existing.length > 0) {
      logger.info(`Capture: returning ${existing.length} existing screenshots for project ${project.id}`);
      return res.status(200).json({ message: `Found ${existing.length} existing screenshots`, screenshots: existing });
    }

    logger.info(`Starting auto-capture for project ${project.id} from ${project.productUrl}`);
    const { screenshots } = await captureService.captureScreenshots(project.id, project.productUrl);

    res.status(201).json({ message: `Captured ${screenshots.length} screenshots`, screenshots });
  } catch (err) {
    next(err);
  }
}
