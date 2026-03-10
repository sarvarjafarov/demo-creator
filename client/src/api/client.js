const API_BASE = '/api';

/**
 * Lightweight API client for the Demo Creator backend.
 * All methods return parsed JSON or throw on error.
 */
async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  };

  // Don't set Content-Type for FormData (browser sets multipart boundary)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const res = await fetch(url, config);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data?.error?.message || `Request failed: ${res.status}`;
    throw new Error(message);
  }

  return data;
}

const api = {
  // Health
  health: () => request('/health'),

  // Projects
  createProject: (payload) =>
    request('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getProject: (id) => request(`/projects/${id}`),

  listProjects: () => request('/projects'),

  // Uploads
  uploadVoice: (projectId, file) => {
    const form = new FormData();
    form.append('voice', file);
    return request(`/projects/${projectId}/upload-voice`, {
      method: 'POST',
      body: form,
    });
  },

  uploadAssets: (projectId, files) => {
    const form = new FormData();
    files.forEach((file) => form.append('assets', file));
    return request(`/projects/${projectId}/upload-assets`, {
      method: 'POST',
      body: form,
    });
  },

  // Auto-capture screenshots from product URL
  captureScreenshots: (projectId) =>
    request(`/projects/${projectId}/capture`, { method: 'POST' }),

  // Generation
  generateBrief: (projectId) =>
    request(`/projects/${projectId}/generate-brief`, { method: 'POST' }),

  generateScript: (projectId) =>
    request(`/projects/${projectId}/generate-script`, { method: 'POST' }),

  generateStoryboard: (projectId) =>
    request(`/projects/${projectId}/generate-storyboard`, { method: 'POST' }),

  generateVideo: (projectId) =>
    request(`/projects/${projectId}/generate-video`, { method: 'POST' }),

  // Status & Results
  getStatus: (projectId) => request(`/projects/${projectId}/status`),

  getResult: (projectId) => request(`/projects/${projectId}/result`),
};

export default api;
