import logger from '../utils/logger.js';

/**
 * Global error handling middleware.
 * Catches all unhandled errors and returns a consistent JSON response.
 */
export function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message = err.expose ? err.message : 'Internal server error';

  logger.error(`${req.method} ${req.path} -> ${status}: ${err.message}`, {
    stack: err.stack,
  });

  res.status(status).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}

/**
 * 404 handler for unmatched routes.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: { message: `Not found: ${req.method} ${req.path}` },
  });
}
