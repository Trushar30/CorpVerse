const ApiError = require('../utils/ApiError');
const config = require('../config');

/**
 * Global error-handling middleware.
 * Catches all errors (thrown or passed via next()) and
 * returns a consistent JSON error response.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // If it's not already an ApiError, wrap it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = ApiError.badRequest('Validation failed', errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue).join(', ');
    error = ApiError.conflict(`Duplicate value for: ${field}`);
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (err.name === 'CastError') {
    error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  // Clerk auth errors
  if (err.status === 401 || err.statusCode === 401) {
    error = ApiError.unauthorized(err.message || 'Authentication required');
  }

  const response = {
    success: false,
    message: error.message,
    ...(error.errors.length > 0 && { errors: error.errors }),
    ...(config.isDev && { stack: error.stack }),
  };

  // Log errors in development
  if (config.isDev) {
    console.error(`❌ [${error.statusCode}] ${error.message}`);
    if (error.stack && error.statusCode === 500) {
      console.error(error.stack);
    }
  }

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
