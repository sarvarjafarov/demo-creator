import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const STATUS_LABELS = {
  created: 'Created',
  brief_generated: 'Brief Ready',
  script_generated: 'Script Ready',
  storyboard_generated: 'Storyboard Ready',
  voiceover_generated: 'Voiceover Ready',
  rendering: 'Rendering...',
  completed: 'Completed',
  error: 'Error',
};

const STATUS_COLORS = {
  created: 'bg-gray-100 text-gray-600',
  completed: 'bg-green-100 text-green-700',
  error: 'bg-red-100 text-red-700',
  rendering: 'bg-yellow-100 text-yellow-700',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const data = await api.listProjects();
        setProjects(data);
      } catch {
        // Silently fail - empty list is fine
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link
          to="/projects/new"
          className="px-6 py-2 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors"
        >
          New Project
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : projects.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 mb-4">No projects yet.</p>
          <Link
            to="/projects/new"
            className="text-brand-600 font-medium hover:underline"
          >
            Create your first demo video
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => {
            const statusColor = STATUS_COLORS[p.status] || 'bg-blue-100 text-blue-700';
            const statusLabel = STATUS_LABELS[p.status] || p.status;

            // Determine which page to link to based on status
            let linkTo;
            if (p.status === 'completed') {
              linkTo = `/projects/${p.id}/result`;
            } else if (p.status === 'created') {
              linkTo = `/projects/${p.id}/upload`;
            } else if (p.status === 'error') {
              linkTo = `/projects/${p.id}/progress`;
            } else {
              linkTo = `/projects/${p.id}/progress`;
            }

            return (
              <Link
                key={p.id}
                to={linkTo}
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-brand-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {p.productName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {p.shortDescription}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor}`}>
                      {statusLabel}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
