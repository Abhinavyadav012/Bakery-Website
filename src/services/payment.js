// Razorpay Payment Service for Perfect Bakery
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_KEY';

// Load Razorpay script dynamically
export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

// Initialize Razorpay payment
export const initiatePayment = async ({
    orderId,
    amount,
    currency = 'INR',
    razorpayOrderId,
    keyId,
    user,
    onSuccess,
    onFailure,
    onDismiss
}) => {
    // Load Razorpay script if not already loaded
    const scriptLoaded = await loadRazorpayScript();
    
    if (!scriptLoaded) {
        onFailure({ 
            message: 'Failed to load payment gateway. Please try again.' 
        });
        return;
    }

    const options = {
        key: keyId || RAZORPAY_KEY_ID,
        amount: amount * 100, // Amount in paise
        currency: currency,
        name: 'Perfect Bakery',
        description: `Order #${orderId}`,
        image: '/logo.png', // Bakery logo
        order_id: razorpayOrderId,
        prefill: {
            name: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
            email: user?.email || '',
            contact: user?.phone || ''
        },
        notes: {
            order_id: orderId,
            customer_name: user?.firstName || 'Customer'
        },
        theme: {
            color: '#D4AF37', // Gold color
            backdrop_color: 'rgba(68, 49, 37, 0.8)' // Brown overlay
        },
        modal: {
            ondismiss: () => {
                if (onDismiss) onDismiss();
            },
            confirm_close: true,
            escape: false
        },
        handler: function(response) {
            // Payment successful
            if (onSuccess) {
                onSuccess({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    orderId: orderId
                });
            }
        }
    };

    try {
        const razorpay = new window.Razorpay(options);
        
        razorpay.on('payment.failed', function(response) {
            if (onFailure) {
                onFailure({
                    code: response.error.code,
                    message: response.error.description,
                    reason: response.error.reason,
                    orderId: orderId,
                    paymentId: response.error.metadata?.payment_id
                });
            }
        });

        razorpay.open();
    } catch (error) {
        console.error('Razorpay initialization error:', error);
        if (onFailure) {
            onFailure({
                message: 'Failed to initialize payment. Please try again.'
            });
        }
    }
};

// Payment status messages
export const getPaymentStatusMessage = (status) => {
    const messages = {
        'created': 'Payment initiated',
        'authorized': 'Payment authorized',
        'captured': 'Payment successful',
        'refunded': 'Payment refunded',
        'failed': 'Payment failed'
    };
    return messages[status] || 'Unknown status';
};

// Payment method labels
export const getPaymentMethodLabel = (method) => {
    const labels = {
        'card': 'Credit/Debit Card',
        'upi': 'UPI',
        'netbanking': 'Net Banking',
        'wallet': 'Wallet',
        'emi': 'EMI',
        'cod': 'Cash on Delivery'
    };
    return labels[method] || method;
};

export default {
    loadRazorpayScript,
    initiatePayment,
    getPaymentStatusMessage,
    getPaymentMethodLabel
};
