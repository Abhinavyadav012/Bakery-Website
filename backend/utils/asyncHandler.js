/**
 * Async handler wrapper to eliminate try-catch boilerplate
 * Automatically catches errors and passes them to error middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
