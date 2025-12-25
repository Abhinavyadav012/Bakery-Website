const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect, generateToken, generateRefreshToken } = require('../middleware/authMiddleware');

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, email, phone, password, confirmPassword, agreeTerms } = req.body;

        // Validation
        const errors = {};

        if (!firstName || firstName.trim().length < 2) {
            errors.firstName = 'First name must be at least 2 characters';
        }

        if (!lastName || lastName.trim().length < 2) {
            errors.lastName = 'Last name must be at least 2 characters';
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!password || password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }

        if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        if (!agreeTerms) {
            errors.agreeTerms = 'You must agree to the Terms of Service';
        }

        // Check if email already exists
        if (email && await User.findByEmail(email)) {
            errors.email = 'An account with this email already exists';
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors
            });
        }

        // Create user
        const newUser = await User.create({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            phone: phone ? phone.trim() : '',
            password: password
        });

        // Generate JWT tokens
        const token = generateToken(newUser._id);
        const refreshToken = generateRefreshToken(newUser._id);
        const userJSON = newUser.toPublicJSON();

        // Also set session for backward compatibility
        req.session.user = userJSON;

        res.status(201).json({
            success: true,
            message: 'Account created successfully! Welcome to Perfect Bakery!',
            user: userJSON,
            token,
            refreshToken,
            redirect: '/'
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred. Please try again.'
        });
    }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password, remember } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        if (!user.password) {
            return res.status(401).json({
                success: false,
                message: 'This account uses social login. Please sign in with Google or Facebook.'
            });
        }

        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT tokens
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        const userJSON = user.toPublicJSON();

        // Also set session for backward compatibility
        req.session.user = userJSON;
        if (remember) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        }

        res.json({
            success: true,
            message: 'Login successful!',
            user: userJSON,
            token,
            refreshToken,
            redirect: '/'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred. Please try again.'
        });
    }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
router.post('/logout', (req, res) => {
    req.logout?.((err) => {});
    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destroy error:', err);
            }
        });
    }
    res.json({
        success: true,
        message: 'Logged out successfully',
        redirect: '/'
    });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'Refresh token required'
            });
        }

        const jwt = require('jsonwebtoken');
        const { JWT_SECRET, generateToken, generateRefreshToken } = require('../middleware/authMiddleware');

        const decoded = jwt.verify(refreshToken, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }

        // Generate new tokens
        const newToken = generateToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        res.json({
            success: true,
            token: newToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid or expired refresh token'
        });
    }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        // User is already attached by protect middleware
        const user = await User.findById(req.user._id || req.user.id).select('-password');
        if (user) {
            res.json({ 
                success: true, 
                user: user.toPublicJSON() 
            });
        } else {
            res.status(404).json({ 
                success: false, 
                user: null,
                message: 'User not found'
            });
        }
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user info'
        });
    }
});

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { firstName, lastName, phone, address } = req.body;
        const currentUser = req.session.user || req.user;

        const user = await User.findById(currentUser._id || currentUser.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.phone = phone || user.phone;
        if (address) {
            user.address = { ...user.address, ...address };
        }

        await user.save();

        const userJSON = user.toPublicJSON();
        req.session.user = userJSON;

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: userJSON
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred. Please try again.'
        });
    }
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
router.put('/password', protect, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;
        const currentUser = req.session.user || req.user;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({
                success: false,
                message: 'New passwords do not match'
            });
        }

        const user = await User.findById(currentUser._id || currentUser.id);

        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: 'Cannot change password for social login accounts'
            });
        }

        const isValidPassword = await user.comparePassword(currentPassword);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred. Please try again.'
        });
    }
});

// @desc    Mock Google OAuth
// @route   POST /api/auth/mock-google
// @access  Public
router.post('/mock-google', async (req, res) => {
    try {
        const { email, firstName, lastName, picture } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        let user = await User.findByEmail(email);

        if (user) {
            user.oauth.google = `mock_${email}`;
            await user.save();
            const userJSON = user.toPublicJSON();
            req.session.user = userJSON;
            return res.json({
                success: true,
                message: 'Signed in with Google!',
                redirect: '/'
            });
        }

        const newUser = await User.create({
            firstName: firstName || email.split('@')[0],
            lastName: lastName || '',
            email: email.toLowerCase(),
            profilePicture: picture,
            oauth: { google: `mock_${email}` }
        });

        req.session.user = newUser.toPublicJSON();
        return res.json({
            success: true,
            message: 'Account created with Google!',
            redirect: '/'
        });

    } catch (error) {
        console.error('Mock Google auth error:', error);
        return res.status(500).json({ success: false, message: 'Authentication failed' });
    }
});

module.exports = router;
