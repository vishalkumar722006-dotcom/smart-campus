const errorHandler = (err, req, res, next) => {
  let message = err.message || 'Server Error';
  let statusCode = err.statusCode || 500;

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = field === 'email' ? 'This email is already registered.' : `This ${field} is already taken.`;
    statusCode = 400;
  }
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors).map(e => e.message).join(', ');
    statusCode = 400;
  }
  if (err.name === 'CastError') {
    message = 'Resource not found.';
    statusCode = 404;
  }

  res.status(statusCode).json({ success: false, message });
};

module.exports = errorHandler;
