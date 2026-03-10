import { Router } from 'express';
import { createProject, getProject, listProjects, getProjectStatus, getProjectResult } from '../controllers/project.controller.js';
import { uploadVoice as uploadVoiceHandler, uploadAssets as uploadAssetsHandler, captureFromUrl } from '../controllers/upload.controller.js';
import { uploadVoice, uploadAssets } from '../middleware/upload.middleware.js';

const router = Router();

// Project CRUD
router.post('/', createProject);
router.get('/', listProjects);
router.get('/:id', getProject);
router.get('/:id/status', getProjectStatus);
router.get('/:id/result', getProjectResult);

// File uploads
router.post('/:id/upload-voice', uploadVoice, uploadVoiceHandler);
router.post('/:id/upload-assets', uploadAssets, uploadAssetsHandler);

// Auto-capture screenshots from product URL
router.post('/:id/capture', captureFromUrl);

export default router;
