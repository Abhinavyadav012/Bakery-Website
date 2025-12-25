const Razorpay = require('razorpay');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Verify Razorpay configuration
const isRazorpayConfigured = () => {
    return (
        process.env.RAZORPAY_KEY_ID && 
        process.env.RAZORPAY_KEY_ID !== 'YOUR_RAZORPAY_KEY_ID' &&
        process.env.RAZORPAY_KEY_SECRET && 
        process.env.RAZORPAY_KEY_SECRET !== 'YOUR_RAZORPAY_KEY_SECRET'
    );
};

module.exports = { razorpay, isRazorpayConfigured };
