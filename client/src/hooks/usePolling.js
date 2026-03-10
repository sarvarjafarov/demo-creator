import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook for polling an async function at a regular interval.
 * Stops polling when the shouldStop predicate returns true.
 *
 * @param {Function} fetchFn - Async function to call each interval
 * @param {number} intervalMs - Polling interval in milliseconds
 * @param {Function} shouldStop - Predicate that receives fetch result; return true to stop
 * @param {boolean} enabled - Whether polling is active
 */
export default function usePolling(fetchFn, intervalMs = 2000, shouldStop = () => false, enabled = true) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setPolling(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (!enabled) return;

    setPolling(true);

    async function poll() {
      try {
        const result = await fetchFn();
        if (!mountedRef.current) return;
        setData(result);
        setError(null);

        if (shouldStop(result)) {
          stop();
        }
      } catch (err) {
        if (!mountedRef.current) return;
        setError(err.message);
      }
    }

    // Initial fetch
    poll();

    // Set interval
    timerRef.current = setInterval(poll, intervalMs);

    return () => {
      mountedRef.current = false;
      stop();
    };
  }, [fetchFn, intervalMs, shouldStop, enabled, stop]);

  return { data, error, polling, stop };
}
