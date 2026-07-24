/**
 * Wraps async route handlers to catch errors and
 * forward them to Express error-handling middleware.
 * Eliminates try/catch blocks in every controller.
 *
 * Usage:
 *   router.get('/users', asyncHandler(async (req, res) => { ... }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
