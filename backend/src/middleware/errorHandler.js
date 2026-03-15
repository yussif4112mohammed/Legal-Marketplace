/**
 * Global error handling middleware
 */
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, error: 'A record with this information already exists' });
  }

  if (err.name === 'ValidationError') {
    return res.status(422).json({ success: false, error: err.message, details: err.details });
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error'
    : err.message || 'Internal server error';

  res.status(statusCode).json({ success: false, error: message });
}

/**
 * 404 handler
 */
function notFound(req, res) {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
}

module.exports = { errorHandler, notFound };
