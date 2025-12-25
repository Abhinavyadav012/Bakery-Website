require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const path = require('path');
const connectDB = require('./config/db.cjs');
const User = require('./models/User.cjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// ==================== OAUTH CONFIGURATION ====================
// IMPORTANT: Replace these with your own OAuth credentials in .env file
// 
// For Google OAuth:
// 1. Go to https://console.cloud.google.com/
// 2. Create a new project or select existing
// 3. Go to "APIs & Services" > "Credentials"
// 4. Click "Create Credentials" > "OAuth Client ID"
// 5. Select "Web application"
// 6. Add http://localhost:3000 to "Authorized JavaScript origins"
// 7. Add http://localhost:3000/auth/google/callback to "Authorized redirect URIs"
// 8. Copy Client ID and Client Secret to .env file
//
// For Facebook OAuth:
// 1. Go to https://developers.facebook.com/
// 2. Create a new app (Consumer type)
// 3. Add "Facebook Login" product
// 4. Go to Settings > Basic to get App ID and App Secret
// 5. In Facebook Login settings, add http://localhost:3000/auth/facebook/callback to "Valid OAuth Redirect URIs"

const OAUTH_CONFIG = {
    google: {
        clientID: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
        callbackURL: 'http://localhost:3000/auth/google/callback'
    },
    facebook: {
        clientID: process.env.FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID',
        clientSecret: process.env.FACEBOOK_APP_SECRET || 'YOUR_FACEBOOK_APP_SECRET',
        callbackURL: 'http://localhost:3000/auth/facebook/callback'
    }
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'perfect-bakery-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// ==================== PASSPORT CONFIGURATION ====================

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user._id || user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        if (user) {
            done(null, user.toPublicJSON());
        } else {
            done(null, false);
        }
    } catch (error) {
        done(error, false);
    }
});

// Google OAuth Strategy
if (OAUTH_CONFIG.google.clientID !== 'YOUR_GOOGLE_CLIENT_ID') {
    passport.use(new GoogleStrategy({
        clientID: OAUTH_CONFIG.google.clientID,
        clientSecret: OAUTH_CONFIG.google.clientSecret,
        callbackURL: OAUTH_CONFIG.google.callbackURL
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user exists with this Google ID
            let user = await User.findByOAuthId('google', profile.id);
            
            if (user) {
                return done(null, user.toPublicJSON());
            }
            
            // Check if user exists with this email
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
            if (email) {
                user = await User.findByEmail(email);
                if (user) {
                    // Link Google account to existing user
                    user.oauth.google = profile.id;
                    await user.save();
                    return done(null, user.toPublicJSON());
                }
            }
            
            // Create new user
            const newUser = await User.create({
                firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User',
                lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
                email: email || `google_${profile.id}@oauth.local`,
                profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                oauth: { google: profile.id }
            });
            
            return done(null, newUser.toPublicJSON());
        } catch (error) {
            return done(error, null);
        }
    }));
}

// Facebook OAuth Strategy
if (OAUTH_CONFIG.facebook.clientID !== 'YOUR_FACEBOOK_APP_ID') {
    passport.use(new FacebookStrategy({
        clientID: OAUTH_CONFIG.facebook.clientID,
        clientSecret: OAUTH_CONFIG.facebook.clientSecret,
        callbackURL: OAUTH_CONFIG.facebook.callbackURL,
        profileFields: ['id', 'emails', 'name', 'displayName', 'photos']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Check if user exists with this Facebook ID
            let user = await User.findByOAuthId('facebook', profile.id);
            
            if (user) {
                return done(null, user.toPublicJSON());
            }
            
            // Check if user exists with this email
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
            if (email) {
                user = await User.findByEmail(email);
                if (user) {
                    // Link Facebook account to existing user
                    user.oauth.facebook = profile.id;
                    await user.save();
                    return done(null, user.toPublicJSON());
                }
            }
            
            // Create new user
            const newUser = await User.create({
                firstName: profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User',
                lastName: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '',
                email: email || `facebook_${profile.id}@oauth.local`,
                profilePicture: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
                oauth: { facebook: profile.id }
            });
            
            return done(null, newUser.toPublicJSON());
        } catch (error) {
            return done(error, null);
        }
    }));
}

// ==================== MIDDLEWARE ====================
const isAuthenticated = (req, res, next) => {
    if (req.session.user || req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
};

const isGuest = (req, res, next) => {
    if (!req.session.user && !req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/dashboard');
    }
};

// ==================== PAGE ROUTES ====================

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login page
app.get('/login', isGuest, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Signup page
app.get('/signup', isGuest, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Dashboard page (protected)
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// ==================== OAUTH ROUTES ====================

// Helper to check if OAuth is configured
const isGoogleConfigured = () => OAUTH_CONFIG.google.clientID !== 'YOUR_GOOGLE_CLIENT_ID';
const isFacebookConfigured = () => OAUTH_CONFIG.facebook.clientID !== 'YOUR_FACEBOOK_APP_ID';

// Mock Google OAuth (works without credentials)
app.get('/auth/google', (req, res, next) => {
    if (!isGoogleConfigured()) {
        // Redirect to mock Google login page
        return res.redirect('/mock-google-login.html');
    }
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Mock Google OAuth handler
app.post('/auth/mock-google', async (req, res) => {
    try {
        const { email, firstName, lastName, picture } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        
        // Check if user exists with this email
        let user = await User.findByEmail(email);
        
        if (user) {
            // User exists, update OAuth info and log them in
            user.oauth.google = `mock_${email}`;
            await user.save();
            const userJSON = user.toPublicJSON();
            req.session.user = userJSON;
            return res.json({ 
                success: true, 
                message: 'Signed in with Google!',
                redirect: '/dashboard'
            });
        }
        
        // Create new user with Google OAuth
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
            redirect: '/dashboard'
        });
        
    } catch (error) {
        console.error('Mock Google auth error:', error);
        return res.status(500).json({ success: false, message: 'Authentication failed' });
    }
});

app.get('/auth/google/callback', (req, res, next) => {
    if (!isGoogleConfigured()) {
        return res.redirect('/login?error=google_not_configured');
    }
    passport.authenticate('google', { failureRedirect: '/login?error=google_auth_failed' })(req, res, () => {
        req.session.user = req.user;
        res.redirect('/dashboard');
    });
});

// Mock Facebook OAuth (works without credentials)
app.get('/auth/facebook', (req, res, next) => {
    if (!isFacebookConfigured()) {
        // Redirect to mock Google login page (can reuse for Facebook)
        return res.redirect('/mock-google-login.html?provider=facebook');
    }
    passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
});

app.get('/auth/facebook/callback', (req, res, next) => {
    if (!isFacebookConfigured()) {
        return res.redirect('/login?error=facebook_not_configured');
    }
    passport.authenticate('facebook', { failureRedirect: '/login?error=facebook_auth_failed' })(req, res, () => {
        req.session.user = req.user;
        res.redirect('/dashboard');
    });
});

// ==================== API ROUTES ====================

// Get current user session
app.get('/api/user', (req, res) => {
    const user = req.session.user || req.user;
    if (user) {
        res.json({ success: true, user: user });
    } else {
        res.json({ success: false, user: null });
    }
});

// Check OAuth configuration status
app.get('/api/oauth/status', (req, res) => {
    res.json({
        google: OAUTH_CONFIG.google.clientID !== 'YOUR_GOOGLE_CLIENT_ID',
        facebook: OAUTH_CONFIG.facebook.clientID !== 'YOUR_FACEBOOK_APP_ID'
    });
});

// Login API
app.post('/api/login', async (req, res) => {
    try {
        const { email, password, remember } = req.body;
        
        // Validation
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }
        
        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }
        
        // Check if user has password (might be OAuth only user)
        if (!user.password) {
            return res.status(401).json({ 
                success: false, 
                message: 'This account uses social login. Please sign in with Google or Facebook.' 
            });
        }
        
        // Check password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid email or password' 
            });
        }
        
        // Set session
        const userJSON = user.toPublicJSON();
        req.session.user = userJSON;
        
        // Extend session if "remember me" is checked
        if (remember) {
            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        }
        
        res.json({ 
            success: true, 
            message: 'Login successful!',
            user: userJSON,
            redirect: '/dashboard'
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred. Please try again.' 
        });
    }
});

// Signup API
app.post('/api/signup', async (req, res) => {
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
            password: password // Will be hashed by pre-save hook
        });
        
        // Set session
        const userJSON = newUser.toPublicJSON();
        req.session.user = userJSON;
        
        res.json({ 
            success: true, 
            message: 'Account created successfully! Welcome to Perfect Bakery!',
            user: userJSON,
            redirect: '/dashboard'
        });
        
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred. Please try again.' 
        });
    }
});

// Logout API
app.post('/api/logout', (req, res) => {
    req.logout((err) => {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ 
                    success: false, 
                    message: 'Failed to logout' 
                });
            }
            res.json({ 
                success: true, 
                message: 'Logged out successfully',
                redirect: '/'
            });
        });
    });
});

// Update user profile
app.put('/api/user/profile', isAuthenticated, async (req, res) => {
    try {
        const { firstName, lastName, phone } = req.body;
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

// Change password
app.put('/api/user/password', isAuthenticated, async (req, res) => {
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
        
        user.password = newPassword; // Will be hashed by pre-save hook
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

// Get all users (admin endpoint - for testing)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║        🥐 Perfect Bakery Server is Running! 🥐               ║
    ║                                                               ║
    ║        Local: http://localhost:${PORT}                          ║
    ║                                                               ║
    ╠═══════════════════════════════════════════════════════════════╣
    ║  Database: MongoDB                                            ║
    ║                                                               ║
    ║  OAuth Status:                                                ║
    ║  • Google:   ${OAUTH_CONFIG.google.clientID !== 'YOUR_GOOGLE_CLIENT_ID' ? '✅ Configured' : '❌ Not configured'}                                  ║
    ║  • Facebook: ${OAUTH_CONFIG.facebook.clientID !== 'YOUR_FACEBOOK_APP_ID' ? '✅ Configured' : '❌ Not configured'}                                  ║
    ║                                                               ║
    ║  To enable OAuth, update .env file with credentials          ║
    ╚═══════════════════════════════════════════════════════════════╝
    `);
});
