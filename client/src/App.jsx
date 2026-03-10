import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateProjectPage from './pages/CreateProjectPage';
import UploadPage from './pages/UploadPage';
import ProgressPage from './pages/ProgressPage';
import ResultPage from './pages/ResultPage';
import ProjectsPage from './pages/ProjectsPage';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-brand-600">
            Demo Creator
          </a>
          <span className="text-xs text-gray-400 font-medium">
            Powered by Amazon Nova
          </span>
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

      <footer className="border-t border-gray-200 bg-white py-4">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-400">
          Demo Creator &mdash; Amazon Nova AI Challenge 2026
        </div>
      </footer>
    </div>
  );
}
