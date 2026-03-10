import { Router } from 'express';
import {
  generateBrief,
  generateScript,
  generateStoryboard,
  generateVideo,
} from '../controllers/generation.controller.js';

const router = Router();

router.post('/:id/generate-brief', generateBrief);
router.post('/:id/generate-script', generateScript);
router.post('/:id/generate-storyboard', generateStoryboard);
router.post('/:id/generate-video', generateVideo);

export default router;
