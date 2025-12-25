/**
 * Utility helper functions
 */

/**
 * Generate a unique order number
 */
const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `PB${year}${month}${day}${random}`;
};

/**
 * Generate a random string (for tokens, etc.)
 */
const generateRandomString = (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Parse pagination parameters from query
 */
const parsePagination = (query, defaults = {}) => {
    const page = Math.max(1, parseInt(query.page) || defaults.page || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || defaults.limit || 10));
    const skip = (page - 1) * limit;
    
    return { page, limit, skip };
};

/**
 * Build pagination response
 */
const buildPaginationResponse = (total, page, limit) => ({
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1
});

/**
 * Parse sort string to MongoDB sort object
 */
const parseSort = (sortString, allowedFields = []) => {
    if (!sortString) return { createdAt: -1 };
    
    const sort = {};
    const fields = sortString.split(',');
    
    fields.forEach(field => {
        const direction = field.startsWith('-') ? -1 : 1;
        const fieldName = field.replace(/^-/, '');
        
        if (allowedFields.length === 0 || allowedFields.includes(fieldName)) {
            sort[fieldName] = direction;
        }
    });
    
    return Object.keys(sort).length > 0 ? sort : { createdAt: -1 };
};

/**
 * Sanitize user input - remove potentially harmful characters
 */
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.trim().replace(/[<>]/g, '');
};

/**
 * Calculate order totals
 */
const calculateOrderTotals = (items, options = {}) => {
    const { taxRate = 0.05, freeShippingThreshold = 500, shippingCharge = 40, discount = 0 } = options;
    
    const itemsPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxPrice = Math.round(itemsPrice * taxRate * 100) / 100;
    const shippingPrice = itemsPrice >= freeShippingThreshold ? 0 : shippingCharge;
    const discountAmount = typeof discount === 'number' ? discount : 0;
    const totalPrice = Math.round((itemsPrice + taxPrice + shippingPrice - discountAmount) * 100) / 100;
    
    return {
        itemsPrice,
        taxPrice,
        shippingPrice,
        discountAmount,
        totalPrice
    };
};

/**
 * Format price for display
 */
const formatPrice = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency
    }).format(amount);
};

/**
 * Calculate estimated delivery date
 */
const calculateEstimatedDelivery = (deliveryType = 'delivery', daysToAdd = 2) => {
    const date = new Date();
    if (deliveryType === 'pickup') {
        // Same day if before 4 PM, next day otherwise
        if (date.getHours() < 16) {
            return date;
        }
        date.setDate(date.getDate() + 1);
        return date;
    }
    date.setDate(date.getDate() + daysToAdd);
    return date;
};

/**
 * Calculate rewards points from order total
 */
const calculateRewardsPoints = (totalAmount, pointsPerRupee = 0.1) => {
    return Math.floor(totalAmount * pointsPerRupee);
};

module.exports = {
    generateOrderNumber,
    generateRandomString,
    parsePagination,
    buildPaginationResponse,
    parseSort,
    sanitizeInput,
    calculateOrderTotals,
    formatPrice,
    calculateEstimatedDelivery,
    calculateRewardsPoints
};
