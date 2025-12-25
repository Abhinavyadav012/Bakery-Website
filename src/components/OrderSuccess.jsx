import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';

const OrderSuccess = () => {
    const { lastOrder, setLastOrder, user } = useCart();
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        setTimeout(() => setAnimateIn(true), 100);
        
        // Cleanup on unmount
        return () => {
            // Don't clear lastOrder immediately to allow page refresh
        };
    }, []);

    // If no order, show a fallback
    if (!lastOrder) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">🛒</div>
                    <h2 className="font-display text-2xl font-bold text-brown-900 mb-2">No Order Found</h2>
                    <p className="text-brown-600 mb-6">It looks like you haven't placed an order yet.</p>
                    <a 
                        href="/" 
                        className="inline-block px-8 py-3 bg-gold text-brown-900 font-bold rounded-full hover:bg-yellow-400 transition-all duration-300 hover:shadow-lg"
                    >
                        Continue Shopping
                    </a>
                </div>
            </div>
        );
    }

    const { order } = lastOrder;
    const orderDate = new Date(order.createdAt || Date.now());
    const estimatedDelivery = new Date(order.estimatedDelivery || Date.now() + 2 * 24 * 60 * 60 * 1000);

    const getPaymentMethodLabel = (method) => {
        switch (method) {
            case 'cod': return '💵 Cash on Delivery';
            case 'razorpay': return '💳 Razorpay (Online)';
            case 'upi': return '📱 UPI Payment';
            case 'card': return '💳 Credit/Debit Card';
            default: return method;
        }
    };

    const getPaymentStatusBadge = (isPaid, method) => {
        if (isPaid) {
            return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">✅ Paid</span>;
        }
        if (method === 'cod') {
            return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">💵 Pay on Delivery</span>;
        }
        return <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">⏳ Payment Pending</span>;
    };

    const getOrderStatusBadge = (status) => {
        switch (status) {
            case 'confirmed':
                return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">📦 Confirmed</span>;
            case 'processing':
                return <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">🔄 Processing</span>;
            case 'shipped':
                return <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">🚚 Shipped</span>;
            case 'delivered':
                return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">✅ Delivered</span>;
            case 'cancelled':
                return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">❌ Cancelled</span>;
            default:
                return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">📝 {status || 'Pending'}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream py-12 px-4">
            <div className={`max-w-3xl mx-auto transition-all duration-700 ${animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 transition-all duration-500 ${animateIn ? 'scale-100' : 'scale-0'}`}>
                        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="font-display text-4xl font-bold text-brown-900 mb-2">Order Placed Successfully! 🎉</h1>
                    <p className="text-brown-600 text-lg">Thank you for your order, {user?.firstName || 'valued customer'}!</p>
                </div>

                {/* Order Info Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                    {/* Order Number Banner */}
                    <div className="bg-gradient-to-r from-gold via-yellow-400 to-gold p-6 text-center">
                        <p className="text-brown-900 text-sm font-medium mb-1">Order Number</p>
                        <p className="text-brown-900 text-2xl font-bold font-mono tracking-wider">
                            #{order._id?.slice(-8).toUpperCase() || 'N/A'}
                        </p>
                    </div>

                    {/* Order Details */}
                    <div className="p-6 space-y-6">
                        {/* Status Section */}
                        <div className="flex flex-wrap gap-4 justify-center">
                            <div className="text-center">
                                <p className="text-brown-500 text-sm mb-1">Order Status</p>
                                {getOrderStatusBadge(order.orderStatus || order.status)}
                            </div>
                            <div className="text-center">
                                <p className="text-brown-500 text-sm mb-1">Payment Status</p>
                                {getPaymentStatusBadge(order.isPaid, order.paymentMethod)}
                            </div>
                            <div className="text-center">
                                <p className="text-brown-500 text-sm mb-1">Payment Method</p>
                                <span className="px-3 py-1 bg-brown-100 text-brown-700 rounded-full text-sm font-medium">
                                    {getPaymentMethodLabel(order.paymentMethod)}
                                </span>
                            </div>
                        </div>

                        {/* Payment Details (for online payments) */}
                        {order.paymentResult?.razorpay_payment_id && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    <span className="font-semibold text-green-800">Payment Verified</span>
                                </div>
                                <p className="text-sm text-green-700">
                                    Transaction ID: <span className="font-mono">{order.paymentResult.razorpay_payment_id}</span>
                                </p>
                            </div>
                        )}

                        {/* Order Items */}
                        <div className="border-t border-b border-brown-100 py-4">
                            <h3 className="font-display text-lg font-bold text-brown-900 mb-4">Order Items</h3>
                            <div className="space-y-3">
                                {order.items?.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 p-3 bg-cream/50 rounded-xl">
                                        <div className="w-16 h-16 bg-brown-100 rounded-lg flex items-center justify-center overflow-hidden">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-2xl">🧁</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-brown-900">{item.name}</p>
                                            <p className="text-brown-500 text-sm">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-bold text-brown-900">₹{item.price * item.quantity}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="bg-cream/50 rounded-xl p-4">
                            <h3 className="font-display text-lg font-bold text-brown-900 mb-3">Payment Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-brown-600">
                                    <span>Subtotal</span>
                                    <span>₹{order.itemsPrice || 0}</span>
                                </div>
                                <div className="flex justify-between text-brown-600">
                                    <span>Tax (5%)</span>
                                    <span>₹{order.taxPrice || 0}</span>
                                </div>
                                <div className="flex justify-between text-brown-600">
                                    <span>Shipping</span>
                                    <span>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span>
                                </div>
                                {order.discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-₹{order.discountAmount}</span>
                                    </div>
                                )}
                                <div className="border-t border-brown-200 pt-2 mt-2">
                                    <div className="flex justify-between font-bold text-lg text-brown-900">
                                        <span>Total Paid</span>
                                        <span className="text-gold">₹{order.totalPrice || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                            <div>
                                <p className="text-brown-500 text-sm">Payment Method</p>
                                <p className="font-medium text-brown-900">{getPaymentMethodLabel(order.paymentMethod)}</p>
                            </div>
                            {order.paymentMethod === 'cod' && (
                                <div className="text-right">
                                    <p className="text-sm text-brown-500">Amount Due</p>
                                    <p className="font-bold text-brown-900">₹{order.totalPrice}</p>
                                </div>
                            )}
                        </div>

                        {/* Delivery Information */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-green-50 rounded-xl">
                                <h4 className="font-medium text-brown-900 mb-2 flex items-center gap-2">
                                    <span>📍</span> Delivery Address
                                </h4>
                                <div className="text-brown-600 text-sm space-y-1">
                                    <p className="font-medium">{order.shippingAddress?.fullName}</p>
                                    <p>{order.shippingAddress?.street}</p>
                                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                                    <p>{order.shippingAddress?.pincode}</p>
                                    <p className="mt-2">📞 {order.shippingAddress?.phone}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-xl">
                                <h4 className="font-medium text-brown-900 mb-2 flex items-center gap-2">
                                    <span>📅</span> Delivery Timeline
                                </h4>
                                <div className="text-brown-600 text-sm space-y-2">
                                    <div>
                                        <p className="text-brown-500">Order Date</p>
                                        <p className="font-medium">{orderDate.toLocaleDateString('en-IN', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}</p>
                                    </div>
                                    <div>
                                        <p className="text-brown-500">Estimated Delivery</p>
                                        <p className="font-medium text-green-600">{estimatedDelivery.toLocaleDateString('en-IN', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Notes */}
                        {order.notes && (
                            <div className="p-4 bg-yellow-50 rounded-xl">
                                <h4 className="font-medium text-brown-900 mb-2 flex items-center gap-2">
                                    <span>📝</span> Order Notes
                                </h4>
                                <p className="text-brown-600 text-sm">{order.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a 
                        href="/" 
                        className="inline-flex items-center justify-center px-8 py-3 bg-gold text-brown-900 font-bold rounded-full hover:bg-yellow-400 transition-all duration-300 hover:shadow-lg"
                    >
                        <span className="mr-2">🛒</span> Continue Shopping
                    </a>
                    <button 
                        onClick={() => window.print()}
                        className="inline-flex items-center justify-center px-8 py-3 border-2 border-brown-300 text-brown-700 font-bold rounded-full hover:bg-brown-100 transition-all duration-300"
                    >
                        <span className="mr-2">🖨️</span> Print Receipt
                    </button>
                </div>

                {/* Help Section */}
                <div className="mt-8 text-center">
                    <p className="text-brown-500 text-sm">
                        Need help? Contact us at{' '}
                        <a href="mailto:support@perfectbakery.com" className="text-gold hover:underline">
                            support@perfectbakery.com
                        </a>
                        {' '}or call{' '}
                        <a href="tel:+911234567890" className="text-gold hover:underline">
                            +91 123 456 7890
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;
