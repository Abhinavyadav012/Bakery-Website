/**
 * Application constants
 */

// User roles
const USER_ROLES = {
    CUSTOMER: 'customer',
    ADMIN: 'admin',
    MANAGER: 'manager'
};

// Order statuses
const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PREPARING: 'preparing',
    READY: 'ready',
    OUT_FOR_DELIVERY: 'out-for-delivery',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
};

// Payment methods
const PAYMENT_METHODS = {
    RAZORPAY: 'razorpay',
    COD: 'cod',
    UPI: 'upi',
    CARD: 'card',
    NETBANKING: 'netbanking'
};

// Payment statuses
const PAYMENT_STATUS = {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
};

// Product categories
const PRODUCT_CATEGORIES = [
    'Cakes',
    'Breads',
    'Pastries',
    'Cookies',
    'Donuts',
    'Pies',
    'Cupcakes',
    'Seasonal',
    'Beverages'
];

// Product tags
const PRODUCT_TAGS = [
    'bestseller',
    'new',
    'sale',
    'vegan',
    'gluten-free',
    'sugar-free',
    'organic',
    'premium'
];

// Delivery types
const DELIVERY_TYPES = {
    DELIVERY: 'delivery',
    PICKUP: 'pickup'
};

// Pagination defaults
const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
};

// Token expiry times
const TOKEN_EXPIRY = {
    ACCESS: '30d',
    REFRESH: '90d',
    RESET_PASSWORD: '1h',
    EMAIL_VERIFICATION: '24h'
};

// Rewards configuration
const REWARDS = {
    WELCOME_BONUS: 100,
    POINTS_PER_RUPEE: 0.1,  // 1 point per ₹10 spent
    MIN_REDEEM_POINTS: 50,
    POINTS_VALUE: 0.25      // 1 point = ₹0.25
};

module.exports = {
    USER_ROLES,
    ORDER_STATUS,
    PAYMENT_METHODS,
    PAYMENT_STATUS,
    PRODUCT_CATEGORIES,
    PRODUCT_TAGS,
    DELIVERY_TYPES,
    PAGINATION,
    TOKEN_EXPIRY,
    REWARDS
};
