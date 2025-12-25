import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:3000/api';

const AuthContext = createContext(null);

// Token storage keys
const TOKEN_KEY = 'pb_token';
const REFRESH_TOKEN_KEY = 'pb_refresh_token';
const USER_KEY = 'pb_user';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get stored tokens
    const getToken = () => localStorage.getItem(TOKEN_KEY);
    const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

    // Store tokens
    const setTokens = (token, refreshToken) => {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    };

    // Clear all auth data
    const clearAuth = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
    };

    // Make authenticated request
    const authFetch = useCallback(async (endpoint, options = {}) => {
        const token = getToken();
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers,
            },
            ...options,
        };

        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            const data = await response.json();

            // If token expired, try to refresh
            if (response.status === 401 && data.message?.includes('expired')) {
                const refreshed = await refreshTokens();
                if (refreshed) {
                    // Retry the request with new token
                    config.headers['Authorization'] = `Bearer ${getToken()}`;
                    const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, config);
                    return retryResponse.json();
                } else {
                    clearAuth();
                    throw new Error('Session expired. Please login again.');
                }
            }

            return data;
        } catch (error) {
            console.error(`Auth Fetch Error [${endpoint}]:`, error);
            throw error;
        }
    }, []);

    // Refresh tokens
    const refreshTokens = async () => {
        const refreshToken = getRefreshToken();
        if (!refreshToken) return false;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (response.ok) {
                const data = await response.json();
                setTokens(data.token, data.refreshToken);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    };

    // Check if user is authenticated on mount
    const checkAuth = useCallback(async () => {
        const token = getToken();
        const storedUser = localStorage.getItem(USER_KEY);

        if (!token) {
            setLoading(false);
            return;
        }

        // Try to use stored user first for faster UI
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                // Invalid stored user, continue with API call
            }
        }

        try {
            const data = await authFetch('/auth/me');
            if (data.success && data.user) {
                setUser(data.user);
                localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            } else {
                // Token invalid, try refresh
                const refreshed = await refreshTokens();
                if (refreshed) {
                    const retryData = await authFetch('/auth/me');
                    if (retryData.success && retryData.user) {
                        setUser(retryData.user);
                        localStorage.setItem(USER_KEY, JSON.stringify(retryData.user));
                    } else {
                        clearAuth();
                    }
                } else {
                    clearAuth();
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            clearAuth();
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Login
    const login = async (email, password, remember = false) => {
        setError(null);
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, remember }),
            });

            const data = await response.json();

            if (data.success) {
                setTokens(data.token, data.refreshToken);
                setUser(data.user);
                localStorage.setItem(USER_KEY, JSON.stringify(data.user));
                return { success: true, user: data.user };
            } else {
                setError(data.message || 'Login failed');
                return { success: false, message: data.message, errors: data.errors };
            }
        } catch (error) {
            const message = 'Network error. Please try again.';
            setError(message);
            return { success: false, message };
        }
    };

    // Signup
    const signup = async (userData) => {
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (data.success) {
                setTokens(data.token, data.refreshToken);
                setUser(data.user);
                localStorage.setItem(USER_KEY, JSON.stringify(data.user));
                return { success: true, user: data.user };
            } else {
                setError(data.message || 'Signup failed');
                return { success: false, message: data.message, errors: data.errors };
            }
        } catch (error) {
            const message = 'Network error. Please try again.';
            setError(message);
            return { success: false, message };
        }
    };

    // Logout
    const logout = async () => {
        try {
            await authFetch('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            clearAuth();
        }
    };

    // Update profile
    const updateProfile = async (profileData) => {
        try {
            const data = await authFetch('/auth/profile', {
                method: 'PUT',
                body: profileData,
            });

            if (data.success && data.user) {
                setUser(data.user);
                localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    // Change password
    const changePassword = async (currentPassword, newPassword, confirmNewPassword) => {
        try {
            const data = await authFetch('/auth/password', {
                method: 'PUT',
                body: { currentPassword, newPassword, confirmNewPassword },
            });
            return data;
        } catch (error) {
            return { success: false, message: error.message };
        }
    };

    // Social Login (Google/Facebook mock)
    const socialLogin = async (provider, userData = {}) => {
        setError(null);
        
        try {
            // Generate mock user data based on provider
            const mockData = {
                name: userData.name || `${provider} User`,
                email: userData.email || `${provider.toLowerCase()}.user.${Date.now()}@example.com`,
                provider: provider.toLowerCase(),
                providerId: userData.providerId || `${provider.toLowerCase()}_${Date.now()}`
            };

            const response = await fetch(`${API_BASE_URL}/auth/mock-google`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(mockData),
            });

            const data = await response.json();

            if (data.success) {
                setTokens(data.token, data.refreshToken);
                setUser(data.user);
                localStorage.setItem(USER_KEY, JSON.stringify(data.user));
                return { success: true, user: data.user };
            } else {
                setError(data.message || `${provider} login failed`);
                return { success: false, message: data.message };
            }
        } catch (error) {
            const message = `${provider} login failed. Please try again.`;
            setError(message);
            return { success: false, message };
        }
    };

    const value = {
        user,
        loading,
        error,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile,
        changePassword,
        socialLogin,
        authFetch,
        getToken,
        clearError: () => setError(null),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
