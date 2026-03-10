/**
 * GET /api/health
 * Returns server health status and uptime.
 */
export function getHealth(req, res) {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: '1.0.0',
  });
}
