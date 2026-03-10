import projectService from '../services/project.service.js';

/** POST /api/projects - Create a new project */
export async function createProject(req, res, next) {
  try {
    const { productName, shortDescription } = req.body;

    if (!productName || !shortDescription) {
      return res.status(400).json({
        error: { message: 'productName and shortDescription are required' },
      });
    }

    const project = projectService.create(req.body);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
}

/** GET /api/projects/:id - Get project details */
export async function getProject(req, res, next) {
  try {
    const project = projectService.getById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: { message: 'Project not found' } });
    }
    res.json(project);
  } catch (err) {
    next(err);
  }
}

/** GET /api/projects - List all projects */
export async function listProjects(req, res, next) {
  try {
    const projects = projectService.list();
    res.json(projects);
  } catch (err) {
    next(err);
  }
}

/** GET /api/projects/:id/status - Get project status */
export async function getProjectStatus(req, res, next) {
  try {
    const status = projectService.getStatus(req.params.id);
    if (!status) {
      return res.status(404).json({ error: { message: 'Project not found' } });
    }
    res.json(status);
  } catch (err) {
    next(err);
  }
}

/** GET /api/projects/:id/result - Get project result */
export async function getProjectResult(req, res, next) {
  try {
    const result = projectService.getResult(req.params.id);
    if (!result) {
      return res.status(404).json({ error: { message: 'Project not found' } });
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
}
