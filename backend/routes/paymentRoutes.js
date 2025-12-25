const express = require('express');
const router = express.Router();
const {
    createPaymentOrder,
    verifyPayment,
    getPaymentDetails,
    initiateRefund,
    getPaymentGatewayStatus,
    handleWebhook
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/status', getPaymentGatewayStatus);
router.post('/webhook', handleWebhook);

// Protected routes
router.post('/create-order', protect, createPaymentOrder);
router.post('/verify', protect, verifyPayment);
router.get('/:paymentId', protect, getPaymentDetails);

// Admin routes
router.post('/:paymentId/refund', protect, admin, initiateRefund);

module.exports = router;
