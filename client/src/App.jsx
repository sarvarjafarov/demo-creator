import { Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateProjectPage from './pages/CreateProjectPage';
import UploadPage from './pages/UploadPage';
import ProgressPage from './pages/ProgressPage';
import ResultPage from './pages/ResultPage';
import ProjectsPage from './pages/ProjectsPage';

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className={`sticky top-0 z-50 backdrop-blur-lg border-b ${isHome ? 'bg-white/80 border-white/20' : 'bg-white/90 border-gray-200/60'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 flex items-center justify-center">
              <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">Demo Creator</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/projects" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Projects
            </Link>
            <Link to="/projects/new" className="text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg transition-colors">
              New Demo
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/new" element={<CreateProjectPage />} />
          <Route path="/projects/:id/upload" element={<UploadPage />} />
          <Route path="/projects/:id/progress" element={<ProgressPage />} />
          <Route path="/projects/:id/result" element={<ResultPage />} />
        </Routes>
      </main>

      <footer className="border-t border-gray-100 bg-white py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-sm text-gray-400">
            Demo Creator &mdash; Amazon Nova AI Challenge 2026
          </span>
          <div className="flex items-center gap-4 text-xs text-gray-300 font-medium">
            <span>Amazon Nova</span>
            <span className="w-1 h-1 rounded-full bg-gray-200" />
            <span>ElevenLabs</span>
            <span className="w-1 h-1 rounded-full bg-gray-200" />
            <span>FFmpeg</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
