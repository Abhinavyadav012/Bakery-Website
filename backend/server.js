require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

// Database connection
const connectDB = require('./config/db');

// Middleware
const { notFound, errorHandler, rateLimit } = require('./middleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// ==================== MIDDLEWARE ====================

// CORS configuration
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            process.env.FRONTEND_URL
        ].filter(Boolean);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all origins in development
        }
    },
    credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'perfect-bakery-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files from public folder
app.use(express.static(path.join(__dirname, '..', 'public')));

// ==================== API ROUTES ====================

// Apply rate limiting to auth routes
app.use('/api/auth/login', rateLimit(5, 60000)); // 5 requests per minute
app.use('/api/auth/signup', rateLimit(3, 60000)); // 3 requests per minute

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);

// Legacy routes support (for backward compatibility)
app.post('/api/login', (req, res, next) => {
    req.url = '/login';
    authRoutes(req, res, next);
});

app.post('/api/signup', (req, res, next) => {
    req.url = '/signup';
    authRoutes(req, res, next);
});

app.post('/api/logout', (req, res, next) => {
    req.url = '/logout';
    authRoutes(req, res, next);
});

app.get('/api/user', (req, res, next) => {
    req.url = '/me';
    authRoutes(req, res, next);
});

app.post('/auth/mock-google', (req, res, next) => {
    req.url = '/mock-google';
    authRoutes(req, res, next);
});

// OAuth status endpoint
app.get('/api/oauth/status', (req, res) => {
    res.json({
        google: process.env.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID',
        facebook: process.env.FACEBOOK_APP_ID !== 'YOUR_FACEBOOK_APP_ID'
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        version: '1.0.0'
    });
});

// ==================== PAGE ROUTES ====================

// Serve login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

// Serve signup page
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'signup.html'));
});

// Serve dashboard page
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html'));
});

// Mock OAuth page
app.get('/auth/google', (req, res) => {
    res.redirect('/mock-google-login.html');
});

app.get('/auth/facebook', (req, res) => {
    res.redirect('/mock-google-login.html?provider=facebook');
});

// Serve React app for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ==================== ERROR HANDLING ====================

app.use(notFound);
app.use(errorHandler);

// ==================== START SERVER ====================

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
    ║  Structure: Organized MVC Pattern                             ║
    ║                                                               ║
    ║  API Endpoints:                                               ║
    ║  • /api/auth     - Authentication                             ║
    ║  • /api/products - Products CRUD                              ║
    ║  • /api/orders   - Order Management                           ║
    ║  • /api/payments - Razorpay Payments                          ║
    ║  • /api/users    - User Management (Admin)                    ║
    ║                                                               ║
    ║  Payment Gateway: ${process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'YOUR_RAZORPAY_KEY_ID' ? '✅ Razorpay Configured' : '❌ Razorpay Not Configured'}              ║
    ╚═══════════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
