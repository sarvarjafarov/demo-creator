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
  completed: 'bg-green-50 text-green-700 border border-green-200',
  error: 'bg-red-50 text-red-700 border border-red-200',
  rendering: 'bg-amber-50 text-amber-700 border border-amber-200',
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
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your demo videos</p>
        </div>
        <Link to="/projects/new" className="btn-primary px-6 py-2.5 text-sm">
          New Project
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <svg className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-400">Loading projects...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-100 mb-5">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">No projects yet</p>
          <Link to="/projects/new" className="text-brand-600 font-semibold hover:text-brand-700 transition-colors">
            Create your first demo video
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => {
            const statusColor = STATUS_COLORS[p.status] || 'bg-brand-50 text-brand-700 border border-brand-200';
            const statusLabel = STATUS_LABELS[p.status] || p.status;

            let linkTo;
            if (p.status === 'completed') {
              linkTo = `/projects/${p.id}/result`;
            } else if (p.status === 'created') {
              linkTo = `/projects/${p.id}/upload`;
            } else {
              linkTo = `/projects/${p.id}/progress`;
            }

            return (
              <Link
                key={p.id}
                to={linkTo}
                className="block card p-5 card-hover group"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">
                      {p.productName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 truncate">
                      {p.shortDescription}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-6">
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor}`}>
                      {statusLabel}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                    <svg className="w-4 h-4 text-gray-300 group-hover:text-brand-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
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
