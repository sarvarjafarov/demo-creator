import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

/**
 * Hook to fetch and manage a project by ID.
 * Auto-fetches on mount and provides a refresh function.
 */
export default function useProject(projectId) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!projectId) return;
    try {
      setError(null);
      const data = await api.getProject(projectId);
      setProject(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { project, loading, error, refresh: fetch };
}
