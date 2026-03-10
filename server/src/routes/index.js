import { Router } from 'express';
import healthRoutes from './health.routes.js';
import projectRoutes from './project.routes.js';
import generationRoutes from './generation.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/projects', projectRoutes);
router.use('/projects', generationRoutes);

export default router;
