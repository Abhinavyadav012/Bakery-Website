const ApiError = require('../utils/ApiError');

/**
 * Custom application error class (extends ApiError for compatibility)
 */
class AppError extends ApiError {
    constructor(message, statusCode) {
        super(statusCode, message);
    }
}

/**
 * 404 Not Found handler
 * Catches requests to undefined routes
 */
const notFound = (req, res, next) => {
    const error = ApiError.notFound(`Route not found - ${req.originalUrl}`);
    next(error);
};

/**
 * Global error handler middleware
 * Handles all errors and returns consistent response format
 */
const errorHandler = (err, req, res, next) => {
    // Log error in development
    if (process.env.NODE_ENV !== 'production') {
        console.error('❌ Error:', {
            message: err.message,
            stack: err.stack,
            statusCode: err.statusCode
        });
    }

    // Default values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let errors = err.errors || [];

    // Handle specific error types
    
    // Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0];
        message = field 
            ? `A record with this ${field} already exists`
            : 'Duplicate field value';
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const validationErrors = Object.values(err.errors).map(e => ({
            field: e.path,
            message: e.message
        }));
        message = 'Validation failed';
        errors = validationErrors;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token. Please login again.';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Session expired. Please login again.';
    }

    // Multer file upload errors
    if (err.name === 'MulterError') {
        statusCode = 400;
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'File too large';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            message = 'Too many files';
        } else {
            message = err.message;
        }
    }

    // Syntax error in JSON body
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        statusCode = 400;
        message = 'Invalid JSON in request body';
    }

    // Send response
    const response = {
        success: false,
        message,
        ...(errors.length > 0 && { errors }),
        ...(process.env.NODE_ENV !== 'production' && { 
            stack: err.stack,
            error: err.name
        }),
        timestamp: new Date().toISOString()
    };

    res.status(statusCode).json(response);
};

/**
 * Async handler wrapper to eliminate try-catch boilerplate
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Request validation middleware factory
 * @param {Function} validator - Validation function that returns { isValid, errors }
 */
const validate = (validator) => (req, res, next) => {
    const { isValid, errors } = validator(req.body);
    if (!isValid) {
        return next(ApiError.badRequest('Validation failed', errors));
    }
    next();
};

module.exports = {
    AppError,
    ApiError,
    notFound,
    errorHandler,
    asyncHandler,
    validate
};
