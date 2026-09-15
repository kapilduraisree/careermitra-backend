/**
 * Global error handler middleware
 * Catches errors thrown by controllers and returns consistent JSON responses
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.originalUrl}:`, err);

  // Validation errors (from express-validator)
  if (err.type === 'validation') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors,
    });
  }

  // PostgreSQL constraint errors
  if (err.code === '23505') {
    const detail = err.detail || 'Duplicate entry';
    return res.status(409).json({ success: false, message: detail });
  }

  if (err.code === '23503') {
    return res.status(400).json({ success: false, message: 'Referenced record does not exist' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  // Multer file size limit
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File too large' });
  }

  // Default
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ success: false, message });
};

/**
 * Async wrapper — eliminates try/catch boilerplate in controllers
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler };
