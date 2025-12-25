// API Service for Perfect Bakery Frontend
const API_BASE_URL = 'http://localhost:3000/api';

// Helper for making requests
const request = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        credentials: 'include', // Include cookies for session
        ...options,
    };

    if (options.body && typeof options.body === 'object') {
        config.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
};

// ==================== AUTH API ====================
export const authAPI = {
    // Login user
    login: (email, password, remember = false) => {
        return request('/auth/login', {
            method: 'POST',
            body: { email, password, remember },
        });
    },

    // Register user
    signup: (userData) => {
        return request('/auth/signup', {
            method: 'POST',
            body: userData,
        });
    },

    // Logout user
    logout: () => {
        return request('/auth/logout', {
            method: 'POST',
        });
    },

    // Get current user
    getMe: () => {
        return request('/auth/me');
    },

    // Update profile
    updateProfile: (profileData) => {
        return request('/auth/profile', {
            method: 'PUT',
            body: profileData,
        });
    },

    // Change password
    changePassword: (currentPassword, newPassword, confirmNewPassword) => {
        return request('/auth/password', {
            method: 'PUT',
            body: { currentPassword, newPassword, confirmNewPassword },
        });
    },

    // Google OAuth (mock)
    googleLogin: (userData) => {
        return request('/auth/mock-google', {
            method: 'POST',
            body: userData,
        });
    },
};

// ==================== PRODUCTS API ====================
export const productsAPI = {
    // Get all products
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/products${query ? `?${query}` : ''}`);
    },

    // Get single product
    getById: (id) => {
        return request(`/products/${id}`);
    },

    // Get products by category
    getByCategory: (category) => {
        return request(`/products/category/${category}`);
    },

    // Get all categories
    getCategories: () => {
        return request('/products/categories/all');
    },

    // Search products
    search: (query) => {
        return request(`/products?search=${encodeURIComponent(query)}`);
    },

    // Seed products (admin)
    seed: () => {
        return request('/products/seed', { method: 'POST' });
    },
};

// ==================== ORDERS API ====================
export const ordersAPI = {
    // Create new order
    create: (orderData) => {
        return request('/orders', {
            method: 'POST',
            body: orderData,
        });
    },

    // Get user's orders
    getMyOrders: () => {
        return request('/orders/my-orders');
    },

    // Get single order
    getById: (id) => {
        return request(`/orders/${id}`);
    },

    // Cancel order
    cancel: (id) => {
        return request(`/orders/${id}/cancel`, {
            method: 'PUT',
        });
    },

    // Get all orders (admin)
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/orders${query ? `?${query}` : ''}`);
    },

    // Update order status (admin)
    updateStatus: (id, status) => {
        return request(`/orders/${id}/status`, {
            method: 'PUT',
            body: { status },
        });
    },

    // Get order statistics (admin)
    getStats: () => {
        return request('/orders/stats');
    },
};

// ==================== PAYMENTS API ====================
export const paymentsAPI = {
    // Check if payment gateway is configured
    getStatus: () => {
        return request('/payments/status');
    },

    // Create payment order
    createOrder: (amount, orderId) => {
        return request('/payments/create-order', {
            method: 'POST',
            body: { amount, orderId },
        });
    },

    // Verify payment
    verify: (paymentData) => {
        return request('/payments/verify', {
            method: 'POST',
            body: paymentData,
        });
    },

    // Get payment details
    getDetails: (paymentId) => {
        return request(`/payments/${paymentId}`);
    },
};

// ==================== HEALTH CHECK ====================
export const healthCheck = () => {
    return request('/health');
};

export default {
    auth: authAPI,
    products: productsAPI,
    orders: ordersAPI,
    payments: paymentsAPI,
    healthCheck,
};
