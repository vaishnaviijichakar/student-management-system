const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Returns friendly messages and never leaks stack traces or connection details.
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'A student with this Student ID already exists' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid value supplied' });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body is not valid JSON' });
  }
  if (err.message && err.message.startsWith('Origin not allowed')) {
    return res.status(403).json({ success: false, message: 'This origin is not allowed to use the API' });
  }
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ success: false, message: 'The request could not be processed' });
  }

  console.error(err);
  res.status(500).json({ success: false, message: 'Something went wrong on the server' });
};

module.exports = { notFoundHandler, errorHandler };
