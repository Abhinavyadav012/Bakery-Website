const User = require('../models/User');
const { ApiError, ApiResponse, asyncHandler } = require('../utils');
const { validateSignup, validateLogin } = require('../validators');
const { generateToken, generateRefreshToken, JWT_SECRET } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

/**
 * @desc    Register new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, phone, password, confirmPassword, agreeTerms } = req.body;

    // Validate input
    const validation = validateSignup({ firstName, lastName, email, phone, password, confirmPassword, agreeTerms });
    if (!validation.isValid) {
        throw ApiError.badRequest('Validation failed', validation.errors);
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
        throw ApiError.conflict('An account with this email already exists');
    }

    // Create user
    const user = await User.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : '',
        password
    });

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    const userJSON = user.toPublicJSON();

    // Set session for backward compatibility
    if (req.session) {
        req.session.user = userJSON;
    }

    res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to Perfect Bakery!',
        data: {
            user: userJSON,
            token,
            refreshToken
        }
    });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { email, password, remember } = req.body;

    // Validate input
    const validation = validateLogin({ email, password });
    if (!validation.isValid) {
        throw ApiError.badRequest('Validation failed', validation.errors);
    }

    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
        throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if account is locked
    if (user.isLocked) {
        throw ApiError.unauthorized('Account is temporarily locked. Please try again later.');
    }

    // Check if user has password (not OAuth only)
    if (!user.password) {
        throw ApiError.unauthorized('This account uses social login. Please sign in with Google or Facebook.');
    }

    // Verify password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
        await user.incLoginAttempts();
        throw ApiError.unauthorized('Invalid email or password');
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    const userJSON = user.toPublicJSON();

    // Set session for backward compatibility
    if (req.session) {
        req.session.user = userJSON;
        if (remember) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        }
    }

    res.json({
        success: true,
        message: 'Login successful!',
        data: {
            user: userJSON,
            token,
            refreshToken
        }
    });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = asyncHandler(async (req, res) => {
    if (req.session) {
        req.session.destroy();
    }

    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw ApiError.badRequest('Refresh token is required');
    }

    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user || !user.isActive) {
            throw ApiError.unauthorized('Invalid refresh token');
        }

        const newToken = generateToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                token: newToken,
                refreshToken: newRefreshToken
            }
        });
    } catch (error) {
        throw ApiError.unauthorized('Invalid or expired refresh token');
    }
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id || req.user.id);
    
    if (!user) {
        throw ApiError.notFound('User not found');
    }

    res.json({
        success: true,
        data: user.toPublicJSON()
    });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
    const { firstName, lastName, phone, avatar, address, preferences } = req.body;
    
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
        throw ApiError.notFound('User not found');
    }

    // Update fields
    if (firstName) user.firstName = firstName.trim();
    if (lastName !== undefined) user.lastName = lastName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (avatar) user.avatar = avatar;
    if (address) {
        user.address = { ...user.address.toObject(), ...address };
    }
    if (preferences) {
        user.preferences = { ...user.preferences.toObject(), ...preferences };
    }

    await user.save();

    res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user.toPublicJSON()
    });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw ApiError.badRequest('Current password and new password are required');
    }

    if (newPassword !== confirmPassword) {
        throw ApiError.badRequest('New passwords do not match');
    }

    if (newPassword.length < 6) {
        throw ApiError.badRequest('New password must be at least 6 characters');
    }

    const user = await User.findById(req.user._id || req.user.id).select('+password');
    if (!user) {
        throw ApiError.notFound('User not found');
    }

    if (!user.password) {
        throw ApiError.badRequest('Cannot change password for social login accounts');
    }

    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
        throw ApiError.unauthorized('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    res.json({
        success: true,
        message: 'Password changed successfully'
    });
});

/**
 * @desc    Add user address
 * @route   POST /api/auth/addresses
 * @access  Private
 */
const addAddress = asyncHandler(async (req, res) => {
    const { label, street, city, state, pincode, country, isDefault } = req.body;

    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
        throw ApiError.notFound('User not found');
    }

    // If setting as default, unset other defaults
    if (isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push({ label, street, city, state, pincode, country, isDefault });
    await user.save();

    res.status(201).json({
        success: true,
        message: 'Address added successfully',
        data: user.addresses
    });
});

/**
 * @desc    Delete user address
 * @route   DELETE /api/auth/addresses/:addressId
 * @access  Private
 */
const deleteAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) {
        throw ApiError.notFound('User not found');
    }

    user.addresses = user.addresses.filter(
        addr => addr._id.toString() !== req.params.addressId
    );
    await user.save();

    res.json({
        success: true,
        message: 'Address deleted successfully',
        data: user.addresses
    });
});

/**
 * @desc    Mock Google OAuth login (for development)
 * @route   POST /api/auth/mock-google
 * @access  Public
 */
const mockGoogleLogin = asyncHandler(async (req, res) => {
    const { name, email, picture } = req.body;

    if (!email) {
        throw ApiError.badRequest('Email is required');
    }

    let user = await User.findByEmail(email);

    if (!user) {
        const [firstName, ...lastNameParts] = (name || 'User').split(' ');
        user = await User.create({
            firstName,
            lastName: lastNameParts.join(' '),
            email: email.toLowerCase(),
            profilePicture: picture,
            oauth: { google: email },
            isEmailVerified: true
        });
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    const userJSON = user.toPublicJSON();

    if (req.session) {
        req.session.user = userJSON;
    }

    res.json({
        success: true,
        message: 'Google login successful!',
        data: {
            user: userJSON,
            token,
            refreshToken
        }
    });
});

module.exports = {
    signup,
    login,
    logout,
    refreshAccessToken,
    getMe,
    updateProfile,
    changePassword,
    addAddress,
    deleteAddress,
    mockGoogleLogin
};
