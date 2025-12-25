const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { USER_ROLES, TOKEN_EXPIRY } = require('../utils/constants');

const JWT_SECRET = process.env.JWT_SECRET || 'perfect-bakery-jwt-secret-key-2024';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '-refresh';

/**
 * Generate JWT Access Token
 * @param {string} userId - User's MongoDB ObjectId
 * @returns {string} JWT token
 */
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: TOKEN_EXPIRY.ACCESS
    });
};

/**
 * Generate JWT Refresh Token
 * @param {string} userId - User's MongoDB ObjectId
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, REFRESH_SECRET, {
        expiresIn: TOKEN_EXPIRY.REFRESH
    });
};

/**
 * Verify JWT Token
 * @param {string} token - JWT token to verify
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

/**
 * Verify Refresh Token
 * @param {string} token - Refresh token to verify
 * @returns {object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
    return jwt.verify(token, REFRESH_SECRET);
};

/**
 * Extract token from request
 * Checks Authorization header, cookies, and query params
 */
const extractToken = (req) => {
    // Check Authorization header (Bearer token)
    if (req.headers.authorization?.startsWith('Bearer')) {
        return req.headers.authorization.split(' ')[1];
    }
    // Check cookies
    if (req.cookies?.token) {
        return req.cookies.token;
    }
    // Check query params (for special cases like email verification)
    if (req.query?.token) {
        return req.query.token;
    }
    return null;
};

/**
 * Protect routes - Require authentication
 * Attaches user to request object
 */
const protect = async (req, res, next) => {
    try {
        const token = extractToken(req);

        // Also check session for backward compatibility
        if (!token && req.session?.user) {
            req.user = req.session.user;
            return next();
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, please login'
            });
        }

        // Verify token
        const decoded = verifyToken(token);
        
        // Get user from database (exclude password)
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error('Auth middleware error:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired',
                code: 'TOKEN_EXPIRED'
            });
        }

        res.status(401).json({
            success: false,
            message: 'Not authorized'
        });
    }
};

/**
 * Admin only middleware
 * Must be used after protect middleware
 */
const admin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized'
        });
    }

    // Check for admin role or special admin email
    const isAdmin = req.user.role === USER_ROLES.ADMIN || 
                   req.user.email === 'admin@perfectbakery.com';

    if (!isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }

    next();
};

/**
 * Manager or Admin middleware
 * Must be used after protect middleware
 */
const managerOrAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized'
        });
    }

    const hasAccess = [USER_ROLES.ADMIN, USER_ROLES.MANAGER].includes(req.user.role);

    if (!hasAccess) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Manager or Admin privileges required.'
        });
    }

    next();
};

/**
 * Optional authentication
 * Attaches user to request if token is valid, but doesn't require authentication
 */
const optionalAuth = async (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token && req.session?.user) {
            req.user = req.session.user;
            return next();
        }

        if (token) {
            const decoded = verifyToken(token);
            req.user = await User.findById(decoded.id).select('-password');
        }
    } catch (error) {
        // Silently fail - user just won't be attached
        req.user = null;
    }
    
    next();
};

/**
 * Check resource ownership
 * Factory function that creates middleware to check if user owns a resource
 */
const ownerOrAdmin = (getResourceOwnerId) => async (req, res, next) => {
    try {
        const ownerId = await getResourceOwnerId(req);
        const userId = req.user._id?.toString() || req.user.id;
        const isOwner = ownerId?.toString() === userId;
        const isAdmin = req.user.role === USER_ROLES.ADMIN;

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You do not have permission.'
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Rate limiting state (simple in-memory implementation)
 * For production, use Redis or similar
 */
const rateLimitStore = new Map();

/**
 * Simple rate limiter middleware factory
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 */
const rateLimit = (maxRequests = 100, windowMs = 60000) => (req, res, next) => {
    const key = req.ip + ':' + req.path;
    const now = Date.now();
    
    if (!rateLimitStore.has(key)) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        return next();
    }

    const record = rateLimitStore.get(key);
    
    if (now > record.resetTime) {
        rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
        return next();
    }

    if (record.count >= maxRequests) {
        return res.status(429).json({
            success: false,
            message: 'Too many requests. Please try again later.',
            retryAfter: Math.ceil((record.resetTime - now) / 1000)
        });
    }

    record.count++;
    next();
};

module.exports = { 
    protect, 
    admin, 
    managerOrAdmin,
    optionalAuth, 
    ownerOrAdmin,
    rateLimit,
    generateToken, 
    generateRefreshToken,
    verifyToken,
    verifyRefreshToken,
    extractToken,
    JWT_SECRET,
    REFRESH_SECRET
};
