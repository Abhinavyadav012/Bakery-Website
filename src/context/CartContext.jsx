import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, ordersAPI, paymentsAPI } from '../services/api';
import { initiatePayment, loadRazorpayScript } from '../services/payment';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [orderStep, setOrderStep] = useState(1);
    const [notification, setNotification] = useState(null);
    const [wishlist, setWishlist] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [orders, setOrders] = useState([]);
    const [lastOrder, setLastOrder] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState(null); // 'processing', 'success', 'failed'
    
    // Authentication State
    const [user, setUser] = useState(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');

    // Fetch user session on load and handle post-login redirects
    useEffect(() => {
        // Check if coming back from login/signup pages
        const loginSuccess = sessionStorage.getItem('loginSuccess');
        const signupSuccess = sessionStorage.getItem('signupSuccess');
        const oauthSuccess = sessionStorage.getItem('oauthSuccess');
        
        if (loginSuccess) {
            try {
                const userData = JSON.parse(loginSuccess);
                setUser(userData);
                showNotification(`Welcome back, ${userData.firstName}! 🎉`);
            } catch (e) {
                console.error('Error parsing login data');
            }
            sessionStorage.removeItem('loginSuccess');
        } else if (signupSuccess) {
            try {
                const userData = JSON.parse(signupSuccess);
                setUser(userData);
                showNotification(`Welcome to Perfect Bakery, ${userData.firstName}! 🎉`);
            } catch (e) {
                console.error('Error parsing signup data');
            }
            sessionStorage.removeItem('signupSuccess');
        } else if (oauthSuccess) {
            try {
                const userData = JSON.parse(oauthSuccess);
                setUser(userData);
                showNotification(`Welcome, ${userData.firstName}! Signed in with Google 🎉`);
            } catch (e) {
                console.error('Error parsing oauth data');
            }
            sessionStorage.removeItem('oauthSuccess');
        } else {
            // Fetch user session from server
            fetch('/api/user')
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.user) {
                        setUser(data.user);
                    }
                })
                .catch(err => console.log('No active session'));
        }
    }, []);

    const login = (userData) => {
        setUser(userData);
        setIsAuthModalOpen(false);
        showNotification(`Welcome back, ${userData.firstName}!`);
    };

    const signup = (userData) => {
        setUser(userData);
        setIsAuthModalOpen(false);
        showNotification(`Welcome to Perfect Bakery, ${userData.firstName}!`);
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
        setUser(null);
        setWishlist([]);
        setOrders([]);
        showNotification('You have been logged out');
    };

    // Fetch user orders
    const fetchOrders = async () => {
        if (!user) return;
        try {
            const data = await ordersAPI.getMyOrders();
            if (data.success) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    // Place order
    const placeOrder = async (orderData) => {
        if (!user) {
            showNotification('Please login to place an order');
            return { success: false, message: 'Not logged in' };
        }

        setIsLoading(true);
        setPaymentStatus('processing');

        try {
            const itemsPrice = cartTotal;
            const taxPrice = Math.round(cartTotal * 0.05);
            const shippingPrice = cartTotal >= 500 ? 0 : 50;
            const totalPrice = itemsPrice + taxPrice + shippingPrice;

            // Create the order first
            const orderPayload = {
                items: cart.map(item => ({
                    product: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                })),
                shippingAddress: orderData.shippingAddress,
                paymentMethod: orderData.paymentMethod || 'cod',
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
                deliveryType: orderData.deliveryType || 'delivery',
                notes: orderData.notes || ''
            };

            const response = await ordersAPI.create(orderPayload);

            if (!response.success) {
                setPaymentStatus('failed');
                return { success: false, message: response.message };
            }

            const order = response.order;

            // If payment method is COD, complete the order directly
            if (orderData.paymentMethod === 'cod') {
                setLastOrder({ order, success: true });
                clearCart();
                setIsCheckoutOpen(false);
                setOrderStep(1);
                setPaymentStatus('success');
                showNotification('Order placed successfully! 🎉');
                fetchOrders();
                navigate('/order-success');
                return { success: true, order };
            }

            // For online payment (Razorpay)
            try {
                // Create Razorpay order
                const paymentOrderResponse = await paymentsAPI.createOrder(totalPrice, order._id);

                if (!paymentOrderResponse.success) {
                    // If Razorpay not configured, fallback to COD
                    if (paymentOrderResponse.configured === false) {
                        showNotification('Online payment not available. Switching to COD.');
                        setLastOrder({ order, success: true });
                        clearCart();
                        setIsCheckoutOpen(false);
                        setOrderStep(1);
                        setPaymentStatus('success');
                        navigate('/order-success');
                        return { success: true, order };
                    }
                    throw new Error(paymentOrderResponse.message);
                }

                // Initialize Razorpay payment
                setPaymentStatus('processing');
                
                initiatePayment({
                    orderId: order._id,
                    amount: totalPrice,
                    razorpayOrderId: paymentOrderResponse.order.id,
                    keyId: paymentOrderResponse.key_id,
                    user,
                    onSuccess: async (paymentData) => {
                        // Verify payment on backend
                        try {
                            const verifyResponse = await paymentsAPI.verify({
                                ...paymentData,
                                orderId: order._id
                            });

                            if (verifyResponse.success) {
                                setLastOrder({ order: { ...order, isPaid: true }, success: true });
                                clearCart();
                                setIsCheckoutOpen(false);
                                setOrderStep(1);
                                setPaymentStatus('success');
                                showNotification('Payment successful! Order confirmed 🎉');
                                fetchOrders();
                                navigate('/order-success');
                            } else {
                                setPaymentStatus('failed');
                                showNotification('Payment verification failed. Please contact support.');
                            }
                        } catch (verifyError) {
                            console.error('Payment verification error:', verifyError);
                            setPaymentStatus('failed');
                            showNotification('Payment verification failed. Please contact support.');
                        }
                    },
                    onFailure: (error) => {
                        console.error('Payment failed:', error);
                        setPaymentStatus('failed');
                        showNotification(error.message || 'Payment failed. Please try again.');
                    },
                    onDismiss: () => {
                        setPaymentStatus(null);
                        setIsLoading(false);
                        showNotification('Payment cancelled. Your order is saved as pending.');
                    }
                });

                return { success: true, order, paymentInitiated: true };

            } catch (paymentError) {
                console.error('Payment initialization error:', paymentError);
                setPaymentStatus('failed');
                showNotification('Failed to initialize payment. Order saved as pending.');
                return { success: true, order, paymentFailed: true };
            }

        } catch (error) {
            console.error('Place order error:', error);
            setPaymentStatus('failed');
            // Check if it's an authentication error
            if (error.message && (error.message.includes('authorized') || error.message.includes('login'))) {
                showNotification('Please login to place an order');
                setUser(null);
            } else {
                showNotification(error.message || 'Failed to place order. Please try again.');
            }
            return { success: false, message: error.message };
        } finally {
            setIsLoading(false);
        }
    };

    // Retry payment for pending orders
    const retryPayment = async (orderId, amount) => {
        if (!user) {
            showNotification('Please login to complete payment');
            return { success: false };
        }

        setIsLoading(true);
        setPaymentStatus('processing');

        try {
            const paymentOrderResponse = await paymentsAPI.createOrder(amount, orderId);

            if (!paymentOrderResponse.success) {
                throw new Error(paymentOrderResponse.message);
            }

            initiatePayment({
                orderId,
                amount,
                razorpayOrderId: paymentOrderResponse.order.id,
                keyId: paymentOrderResponse.key_id,
                user,
                onSuccess: async (paymentData) => {
                    try {
                        const verifyResponse = await paymentsAPI.verify({
                            ...paymentData,
                            orderId
                        });

                        if (verifyResponse.success) {
                            setPaymentStatus('success');
                            showNotification('Payment successful! 🎉');
                            fetchOrders();
                        } else {
                            setPaymentStatus('failed');
                            showNotification('Payment verification failed.');
                        }
                    } catch (error) {
                        setPaymentStatus('failed');
                        showNotification('Payment verification failed.');
                    }
                },
                onFailure: (error) => {
                    setPaymentStatus('failed');
                    showNotification(error.message || 'Payment failed.');
                },
                onDismiss: () => {
                    setPaymentStatus(null);
                    setIsLoading(false);
                }
            });

            return { success: true };
        } catch (error) {
            setPaymentStatus('failed');
            showNotification(error.message || 'Failed to initialize payment.');
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    };

    const openAuthModal = (mode = 'login') => {
        setAuthMode(mode);
        setIsAuthModalOpen(true);
    };

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => 
                    item.id === product.id 
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
        showNotification(`${product.name} added to cart!`);
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCart(prev => prev.map(item => 
            item.id === productId ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => setCart([]);

    const toggleWishlist = (product) => {
        setWishlist(prev => {
            const exists = prev.find(item => item.id === product.id);
            if (exists) {
                showNotification(`${product.name} removed from wishlist`);
                return prev.filter(item => item.id !== product.id);
            }
            showNotification(`${product.name} added to wishlist!`);
            return [...prev, product];
        });
    };

    const isInWishlist = (productId) => wishlist.some(item => item.id === productId);

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const showNotification = (message) => {
        setNotification(message);
        // Auto-clear handled by Notification component
    };

    const clearNotification = () => {
        setNotification(null);
    };

    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <CartContext.Provider value={{
            cart, addToCart, removeFromCart, updateQuantity, clearCart,
            isCartOpen, setIsCartOpen,
            isCheckoutOpen, setIsCheckoutOpen,
            orderStep, setOrderStep,
            cartTotal, cartCount,
            notification, showNotification, clearNotification,
            wishlist, toggleWishlist, isInWishlist,
            scrollToSection,
            user, login, signup, logout,
            isAuthModalOpen, setIsAuthModalOpen,
            authMode, setAuthMode, openAuthModal,
            isLoading, orders, fetchOrders, placeOrder,
            lastOrder, setLastOrder,
            paymentStatus, setPaymentStatus, retryPayment
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);

export default CartContext;
