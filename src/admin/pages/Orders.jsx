// Admin Orders Management Page
import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';

const API_BASE_URL = 'http://localhost:3000/api';

const Orders = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [toast, setToast] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Fetch orders from backend
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('pb_token');
            const response = await fetch(`${API_BASE_URL}/orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Transform backend data to match our UI structure
                const transformedOrders = (data.orders || []).map(order => ({
                    id: order.orderNumber || order._id,
                    _id: order._id,
                    customer: {
                        name: order.user?.name || order.shippingAddress?.fullName || 'Guest',
                        email: order.user?.email || 'N/A',
                        phone: order.shippingAddress?.phone || 'N/A',
                        avatar: null
                    },
                    items: (order.items || []).map(item => ({
                        name: item.product?.name || item.name || 'Unknown Product',
                        quantity: item.quantity || 1,
                        price: item.price || 0,
                        image: getProductEmoji(item.product?.category)
                    })),
                    total: order.totalAmount || 0,
                    status: order.status || 'pending',
                    paymentMethod: order.paymentMethod || 'COD',
                    paymentStatus: order.paymentStatus || 'pending',
                    transactionId: order.paymentDetails?.razorpayPaymentId || null,
                    address: formatAddress(order.shippingAddress),
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt,
                    deliveredAt: order.deliveredAt,
                    notes: order.notes || ''
                }));
                setOrders(transformedOrders);
            } else {
                setError(data.message || 'Failed to fetch orders');
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Helper function to get product emoji
    const getProductEmoji = (category) => {
        const emojiMap = {
            'cake': '🎂',
            'pastry': '🥐',
            'bread': '🍞',
            'cookie': '🍪',
            'muffin': '🧁',
            'tart': '🥧'
        };
        return emojiMap[category?.toLowerCase()] || '🍰';
    };

    // Helper function to format address
    const formatAddress = (address) => {
        if (!address) return 'N/A';
        const parts = [
            address.street,
            address.city,
            address.state,
            address.zipCode
        ].filter(Boolean);
        return parts.join(', ') || 'N/A';
    };

    // Fetch orders on mount
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Updated statuses as per requirement
    const statuses = ['all', 'pending', 'preparing', 'delivered', 'cancelled'];
    const statusActions = ['pending', 'preparing', 'delivered', 'cancelled'];

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            (order.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.customer?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
            case 'preparing': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered': return '✅';
            case 'preparing': return '👨‍🍳';
            case 'pending': return '⏳';
            case 'cancelled': return '❌';
            default: return '📦';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'refunded': return 'bg-blue-100 text-blue-700';
            case 'failed': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        const order = orders.find(o => o.id === orderId || o._id === orderId);
        const actualId = order?._id || orderId;
        
        try {
            const token = localStorage.getItem('pb_token');
            const response = await fetch(`${API_BASE_URL}/orders/${actualId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });
            
            const data = await response.json();
            
            if (data.success) {
                const now = new Date().toISOString();
                setOrders(orders.map(o => {
                    if (o.id === orderId || o._id === orderId) {
                        const updatedOrder = { 
                            ...o, 
                            status: newStatus,
                            updatedAt: now
                        };
                        if (newStatus === 'delivered') {
                            updatedOrder.deliveredAt = now;
                        }
                        if (newStatus === 'cancelled') {
                            updatedOrder.cancelledAt = now;
                        }
                        return updatedOrder;
                    }
                    return o;
                }));
                
                if (selectedOrder?.id === orderId || selectedOrder?._id === orderId) {
                    setSelectedOrder(prev => ({ 
                        ...prev, 
                        status: newStatus,
                        updatedAt: now,
                        ...(newStatus === 'delivered' && { deliveredAt: now }),
                        ...(newStatus === 'cancelled' && { cancelledAt: now })
                    }));
                }
                
                showToast(`Order status updated to ${newStatus}`, 'success');
            } else {
                showToast(data.message || 'Failed to update status', 'error');
            }
        } catch (err) {
            console.error('Error updating order status:', err);
            showToast('Failed to update order status', 'error');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatShortDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getOrderStats = () => {
        const totalRevenue = orders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + o.total, 0);
        return {
            total: orders.length,
            pending: orders.filter(o => o.status === 'pending').length,
            preparing: orders.filter(o => o.status === 'preparing').length,
            delivered: orders.filter(o => o.status === 'delivered').length,
            cancelled: orders.filter(o => o.status === 'cancelled').length,
            revenue: totalRevenue
        };
    };

    const stats = getOrderStats();

    return (
        <div className="min-h-screen">
            <Header 
                title="Orders" 
                subtitle="Track and manage customer orders"
            />

            <div className="p-4 lg:p-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-xl">📦</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                <p className="text-xs text-gray-500">Total Orders</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <span className="text-xl">⏳</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                                <p className="text-xs text-gray-500">Pending</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <span className="text-xl">👨‍🍳</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-yellow-600">{stats.preparing}</p>
                                <p className="text-xs text-gray-500">Preparing</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-xl">✅</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                                <p className="text-xs text-gray-500">Delivered</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <span className="text-xl">❌</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                                <p className="text-xs text-gray-500">Cancelled</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-gold to-yellow-600 rounded-xl p-4 shadow-sm text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <span className="text-xl">💰</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</p>
                                <p className="text-xs opacity-80">Revenue</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by order ID or customer..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold transition-colors"
                            />
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            {/* Status Filter */}
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold bg-white capitalize"
                            >
                                {statuses.map(status => (
                                    <option key={status} value={status} className="capitalize">
                                        {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                                    </option>
                                ))}
                            </select>

                            {/* Refresh Button */}
                            <button 
                                onClick={fetchOrders}
                                disabled={loading}
                                className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                                title="Refresh Orders"
                            >
                                <svg className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>

                            {/* Export Button */}
                            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="hidden sm:inline">Export</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="text-center py-8 mb-8">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 inline-block">
                            <p className="text-red-600">{error}</p>
                            <button 
                                onClick={fetchOrders}
                                className="mt-2 text-red-700 underline text-sm"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && orders.length === 0 && (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                        <span className="text-6xl mb-4 block">📦</span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-500">When customers place orders, they will appear here</p>
                    </div>
                )}

                {/* Orders Table */}
                {!loading && !error && orders.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-semibold text-gold">{order.id}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-gold to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                    {order.customer.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{order.customer.name}</p>
                                                    <p className="text-xs text-gray-500">{order.customer.phone}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <span className="text-gray-600">{order.items.reduce((a, b) => a + b.quantity, 0)} items</span>
                                                <span className="text-gray-400">•</span>
                                                <span className="text-xs text-gray-400">{order.items.length} products</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-bold text-gray-900">₹{order.total.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-medium text-gray-700">{order.paymentMethod}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium inline-block w-fit ${getPaymentStatusColor(order.paymentStatus)}`}>
                                                    {order.paymentStatus}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border capitalize cursor-pointer focus:outline-none ${getStatusColor(order.status)}`}
                                            >
                                                {statusActions.map(status => (
                                                    <option key={status} value={status}>
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-gray-500 text-sm">{formatShortDate(order.createdAt)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button 
                                                onClick={() => setSelectedOrder(order)}
                                                className="inline-flex items-center gap-1 text-gold hover:text-yellow-600 font-medium text-sm transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredOrders.length === 0 && orders.length > 0 && (
                        <div className="p-12 text-center">
                            <span className="text-6xl mb-4 block">🔍</span>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
                            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-scale-in">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gold/10 to-transparent">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-xl font-bold text-gray-900">Order {selectedOrder.id}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(selectedOrder.status)}`}>
                                            {getStatusIcon(selectedOrder.status)} {selectedOrder.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">Placed on {formatDate(selectedOrder.createdAt)}</p>
                                </div>
                                <button 
                                    onClick={() => setSelectedOrder(null)} 
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Status Update Section */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Update Order Status</h4>
                                        <p className="text-sm text-gray-500">Change the current status of this order</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {statusActions.map(status => (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusChange(selectedOrder.id, status)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                                                    selectedOrder.status === status
                                                        ? getStatusColor(status) + ' ring-2 ring-offset-2 ring-gray-300'
                                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                {getStatusIcon(status)} {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Order Timeline */}
                            <div className="bg-white border border-gray-100 rounded-xl p-4">
                                <h4 className="font-semibold text-gray-900 mb-4">Order Timeline</h4>
                                <div className="relative">
                                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                    <div className="space-y-4">
                                        <div className="relative flex items-center gap-4">
                                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center z-10">
                                                <span className="text-sm">📝</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">Order Placed</p>
                                                <p className="text-sm text-gray-500">{formatDate(selectedOrder.createdAt)}</p>
                                            </div>
                                        </div>
                                        {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'pending' && (
                                            <div className="relative flex items-center gap-4">
                                                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center z-10">
                                                    <span className="text-sm">👨‍🍳</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">Preparing</p>
                                                    <p className="text-sm text-gray-500">Your order is being prepared</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedOrder.status === 'delivered' && (
                                            <div className="relative flex items-center gap-4">
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center z-10">
                                                    <span className="text-sm">✅</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">Delivered</p>
                                                    <p className="text-sm text-gray-500">{formatDate(selectedOrder.deliveredAt)}</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedOrder.status === 'cancelled' && (
                                            <div className="relative flex items-center gap-4">
                                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center z-10">
                                                    <span className="text-sm">❌</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium text-red-700">Cancelled</p>
                                                    <p className="text-sm text-gray-500">{formatDate(selectedOrder.cancelledAt)}</p>
                                                    {selectedOrder.cancelReason && (
                                                        <p className="text-sm text-red-500 mt-1">{selectedOrder.cancelReason}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Customer Info */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Customer Information
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-gold to-yellow-600 rounded-full flex items-center justify-center text-white font-bold">
                                                {selectedOrder.customer.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{selectedOrder.customer.name}</p>
                                                <p className="text-sm text-gray-500">{selectedOrder.customer.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <span>{selectedOrder.customer.phone}</span>
                                        </div>
                                        <div className="flex items-start gap-2 text-sm">
                                            <svg className="w-4 h-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span className="text-gray-600">{selectedOrder.address}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Info */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                        </svg>
                                        Payment Information
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Method</span>
                                            <span className="font-medium flex items-center gap-2">
                                                {selectedOrder.paymentMethod === 'UPI' && '📱'}
                                                {selectedOrder.paymentMethod === 'Card' && '💳'}
                                                {selectedOrder.paymentMethod === 'COD' && '💵'}
                                                {selectedOrder.paymentMethod}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Status</span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                                                {selectedOrder.paymentStatus}
                                            </span>
                                        </div>
                                        {selectedOrder.transactionId && (
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Transaction ID</span>
                                                <span className="font-mono text-xs text-gray-600">{selectedOrder.transactionId}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                            <span className="font-medium text-gray-700">Amount Paid</span>
                                            <span className="font-bold text-gold text-lg">₹{selectedOrder.total.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Notes */}
                            {selectedOrder.notes && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                    <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                        </svg>
                                        Customer Notes
                                    </h4>
                                    <p className="text-yellow-700">{selectedOrder.notes}</p>
                                </div>
                            )}

                            {/* Order Items */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Order Items ({selectedOrder.items.length})
                                </h4>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-cream to-white rounded-lg flex items-center justify-center">
                                                    <span className="text-2xl">{item.image || '🥐'}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.name}</p>
                                                    <p className="text-sm text-gray-500">₹{item.price} × {item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-medium">₹{selectedOrder.total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Delivery</span>
                                        <span className="font-medium text-green-600">Free</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Discount</span>
                                        <span className="font-medium text-gray-400">-₹0</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                        <span className="text-lg font-bold text-gray-900">Grand Total</span>
                                        <span className="text-xl font-bold text-gold">₹{selectedOrder.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Close
                                </button>
                                <button className="flex-1 px-4 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                    </svg>
                                    Print Invoice
                                </button>
                                <button className="px-4 py-2.5 bg-gold text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Contact
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 animate-slide-in-right flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
                    toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
                } text-white`}>
                    {toast.type === 'success' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                    <span className="font-medium">{toast.message}</span>
                    <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default Orders;
