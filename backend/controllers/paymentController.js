const crypto = require('crypto');
const { razorpay, isRazorpayConfigured } = require('../config/razorpay');
const Order = require('../models/Order');

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private
const createPaymentOrder = async (req, res) => {
    try {
        // Check if Razorpay is configured
        if (!isRazorpayConfigured()) {
            return res.status(503).json({
                success: false,
                message: 'Payment gateway is not configured. Please use Cash on Delivery.',
                configured: false
            });
        }

        const { amount, currency = 'INR', orderId } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
        }

        // Amount in paise (smallest currency unit)
        const amountInPaise = Math.round(amount * 100);

        const options = {
            amount: amountInPaise,
            currency,
            receipt: `order_${orderId || Date.now()}`,
            notes: {
                bakeryOrder: orderId || 'new_order'
            }
        };

        const razorpayOrder = await razorpay.orders.create(options);

        res.json({
            success: true,
            order: {
                id: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                receipt: razorpayOrder.receipt
            },
            key_id: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error('Create payment order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order',
            error: error.message
        });
    }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payments/verify
// @access  Private
const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Missing payment verification parameters'
            });
        }

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed - Invalid signature'
            });
        }

        // Update order payment status
        if (orderId) {
            const order = await Order.findById(orderId);
            if (order) {
                order.isPaid = true;
                order.paidAt = new Date();
                order.status = 'confirmed';
                order.paymentResult = {
                    razorpay_order_id,
                    razorpay_payment_id,
                    razorpay_signature,
                    status: 'completed'
                };
                await order.save();
            }
        }

        res.json({
            success: true,
            message: 'Payment verified successfully',
            paymentId: razorpay_payment_id
        });

    } catch (error) {
        console.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.message
        });
    }
};

// @desc    Get payment details
// @route   GET /api/payments/:paymentId
// @access  Private
const getPaymentDetails = async (req, res) => {
    try {
        if (!isRazorpayConfigured()) {
            return res.status(503).json({
                success: false,
                message: 'Payment gateway is not configured'
            });
        }

        const { paymentId } = req.params;

        const payment = await razorpay.payments.fetch(paymentId);

        res.json({
            success: true,
            payment: {
                id: payment.id,
                amount: payment.amount / 100, // Convert from paise to rupees
                currency: payment.currency,
                status: payment.status,
                method: payment.method,
                email: payment.email,
                contact: payment.contact,
                created_at: payment.created_at
            }
        });

    } catch (error) {
        console.error('Get payment details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment details',
            error: error.message
        });
    }
};

// @desc    Initiate refund
// @route   POST /api/payments/:paymentId/refund
// @access  Private/Admin
const initiateRefund = async (req, res) => {
    try {
        if (!isRazorpayConfigured()) {
            return res.status(503).json({
                success: false,
                message: 'Payment gateway is not configured'
            });
        }

        const { paymentId } = req.params;
        const { amount, reason } = req.body;

        const refundOptions = {
            speed: 'normal',
            notes: {
                reason: reason || 'Customer requested refund'
            }
        };

        // If amount specified, do partial refund
        if (amount) {
            refundOptions.amount = Math.round(amount * 100); // Convert to paise
        }

        const refund = await razorpay.payments.refund(paymentId, refundOptions);

        res.json({
            success: true,
            message: 'Refund initiated successfully',
            refund: {
                id: refund.id,
                amount: refund.amount / 100,
                status: refund.status,
                speed_processed: refund.speed_processed
            }
        });

    } catch (error) {
        console.error('Initiate refund error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initiate refund',
            error: error.message
        });
    }
};

// @desc    Check payment gateway status
// @route   GET /api/payments/status
// @access  Public
const getPaymentGatewayStatus = (req, res) => {
    res.json({
        success: true,
        configured: isRazorpayConfigured(),
        gateway: 'razorpay',
        supportedMethods: ['card', 'upi', 'netbanking', 'wallet'],
        currency: 'INR'
    });
};

// @desc    Razorpay webhook handler
// @route   POST /api/payments/webhook
// @access  Public
const handleWebhook = async (req, res) => {
    try {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Verify webhook signature if secret is configured
        if (secret) {
            const signature = req.headers['x-razorpay-signature'];
            const body = JSON.stringify(req.body);

            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(body)
                .digest('hex');

            if (signature !== expectedSignature) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid webhook signature'
                });
            }
        }

        const event = req.body.event;
        const payload = req.body.payload;

        console.log('Razorpay Webhook Event:', event);

        switch (event) {
            case 'payment.captured':
                // Payment successful
                console.log('Payment captured:', payload.payment.entity.id);
                break;

            case 'payment.failed':
                // Payment failed
                console.log('Payment failed:', payload.payment.entity.id);
                break;

            case 'refund.created':
                // Refund initiated
                console.log('Refund created:', payload.refund.entity.id);
                break;

            default:
                console.log('Unhandled webhook event:', event);
        }

        res.json({ success: true, received: true });

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({
            success: false,
            message: 'Webhook processing failed'
        });
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment,
    getPaymentDetails,
    initiateRefund,
    getPaymentGatewayStatus,
    handleWebhook
};
