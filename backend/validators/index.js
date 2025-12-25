/**
 * Validation helper functions
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
const pincodeRegex = /^[1-9][0-9]{5}$/;

/**
 * Validate email format
 */
const isValidEmail = (email) => {
    return emailRegex.test(email);
};

/**
 * Validate Indian phone number
 */
const isValidPhone = (phone) => {
    if (!phone) return true; // Optional
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate Indian pincode
 */
const isValidPincode = (pincode) => {
    return pincodeRegex.test(pincode);
};

/**
 * Validate password strength
 */
const isValidPassword = (password) => {
    if (!password || password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters' };
    }
    return { valid: true };
};

/**
 * Validate strong password (for enhanced security)
 */
const isStrongPassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
        errors.push('at least 8 characters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('one lowercase letter');
    }
    if (!/\d/.test(password)) {
        errors.push('one number');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('one special character');
    }
    
    if (errors.length > 0) {
        return { valid: false, message: `Password must contain ${errors.join(', ')}` };
    }
    return { valid: true };
};

/**
 * Validate MongoDB ObjectId format
 */
const isValidObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Validate signup data
 */
const validateSignup = (data) => {
    const errors = {};

    if (!data.firstName || data.firstName.trim().length < 2) {
        errors.firstName = 'First name must be at least 2 characters';
    }

    if (!data.lastName || data.lastName.trim().length < 2) {
        errors.lastName = 'Last name must be at least 2 characters';
    }

    if (!data.email || !isValidEmail(data.email)) {
        errors.email = 'Please enter a valid email address';
    }

    if (data.phone && !isValidPhone(data.phone)) {
        errors.phone = 'Please enter a valid Indian phone number';
    }

    const passwordCheck = isValidPassword(data.password);
    if (!passwordCheck.valid) {
        errors.password = passwordCheck.message;
    }

    if (data.password !== data.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }

    if (!data.agreeTerms) {
        errors.agreeTerms = 'You must agree to the Terms of Service';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate login data
 */
const validateLogin = (data) => {
    const errors = {};

    if (!data.email || !isValidEmail(data.email)) {
        errors.email = 'Please enter a valid email address';
    }

    if (!data.password) {
        errors.password = 'Password is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate shipping address
 */
const validateShippingAddress = (address) => {
    const errors = {};
    const required = ['fullName', 'phone', 'email', 'street', 'city', 'state', 'pincode'];

    required.forEach(field => {
        if (!address[field] || !address[field].trim()) {
            errors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        }
    });

    if (address.email && !isValidEmail(address.email)) {
        errors.email = 'Please enter a valid email address';
    }

    if (address.phone && !isValidPhone(address.phone)) {
        errors.phone = 'Please enter a valid phone number';
    }

    if (address.pincode && !isValidPincode(address.pincode)) {
        errors.pincode = 'Please enter a valid 6-digit pincode';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate product data
 */
const validateProduct = (data) => {
    const errors = {};

    if (!data.name || data.name.trim().length < 2) {
        errors.name = 'Product name must be at least 2 characters';
    }

    if (data.price === undefined || data.price < 0) {
        errors.price = 'Price must be a positive number';
    }

    if (!data.category) {
        errors.category = 'Category is required';
    }

    if (data.stock !== undefined && data.stock < 0) {
        errors.stock = 'Stock cannot be negative';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Validate order items
 */
const validateOrderItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        return { isValid: false, errors: { items: 'Order must have at least one item' } };
    }

    const errors = {};
    items.forEach((item, index) => {
        if (!item.name) {
            errors[`items.${index}.name`] = 'Item name is required';
        }
        if (!item.price || item.price <= 0) {
            errors[`items.${index}.price`] = 'Item price must be positive';
        }
        if (!item.quantity || item.quantity < 1) {
            errors[`items.${index}.quantity`] = 'Item quantity must be at least 1';
        }
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

module.exports = {
    isValidEmail,
    isValidPhone,
    isValidPincode,
    isValidPassword,
    isStrongPassword,
    isValidObjectId,
    validateSignup,
    validateLogin,
    validateShippingAddress,
    validateProduct,
    validateOrderItems
};
