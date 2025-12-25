// Admin Dashboard Page
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import { BarChart, LineChart, DonutChart } from '../components/Charts';

const Dashboard = () => {
    // Mock data for charts
    const revenueData = [
        { label: 'Mon', value: 4200 },
        { label: 'Tue', value: 5800 },
        { label: 'Wed', value: 4100 },
        { label: 'Thu', value: 7200 },
        { label: 'Fri', value: 8500 },
        { label: 'Sat', value: 9200 },
        { label: 'Sun', value: 6800 }
    ];

    const monthlyData = [
        { label: 'Jan', value: 45000 },
        { label: 'Feb', value: 52000 },
        { label: 'Mar', value: 48000 },
        { label: 'Apr', value: 61000 },
        { label: 'May', value: 55000 },
        { label: 'Jun', value: 67000 }
    ];

    const orderStatusData = [
        { label: 'Delivered', value: 156, color: '#22c55e' },
        { label: 'Processing', value: 43, color: '#D4AF37' },
        { label: 'Pending', value: 28, color: '#3b82f6' },
        { label: 'Cancelled', value: 12, color: '#ef4444' }
    ];

    const recentOrders = [
        { id: 'ORD-001', customer: 'Rahul Sharma', items: 3, total: 1250, status: 'delivered', time: '10 min ago' },
        { id: 'ORD-002', customer: 'Priya Singh', items: 2, total: 890, status: 'processing', time: '25 min ago' },
        { id: 'ORD-003', customer: 'Amit Kumar', items: 5, total: 2100, status: 'pending', time: '1 hour ago' },
        { id: 'ORD-004', customer: 'Neha Gupta', items: 1, total: 450, status: 'delivered', time: '2 hours ago' },
        { id: 'ORD-005', customer: 'Vikram Patel', items: 4, total: 1800, status: 'processing', time: '3 hours ago' }
    ];

    const topProducts = [
        { name: 'Chocolate Cake', sales: 156, revenue: 7800, trend: 'up' },
        { name: 'French Croissant', sales: 134, revenue: 2680, trend: 'up' },
        { name: 'Sourdough Bread', sales: 98, revenue: 1960, trend: 'down' },
        { name: 'Red Velvet Cupcake', sales: 87, revenue: 1305, trend: 'up' },
        { name: 'Cinnamon Rolls', sales: 76, revenue: 1140, trend: 'up' }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'processing': return 'bg-yellow-100 text-yellow-700';
            case 'pending': return 'bg-blue-100 text-blue-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen">
            <Header 
                title="Dashboard" 
                subtitle="Welcome back! Here's what's happening with your bakery."
            />

            <div className="p-4 lg:p-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    <StatsCard
                        title="Total Revenue"
                        value="₹2,45,890"
                        change={12.5}
                        changeType="increase"
                        color="gold"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }
                    />
                    <StatsCard
                        title="Total Orders"
                        value="1,234"
                        change={8.2}
                        changeType="increase"
                        color="blue"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        }
                    />
                    <StatsCard
                        title="Total Customers"
                        value="856"
                        change={5.1}
                        changeType="increase"
                        color="green"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        }
                    />
                    <StatsCard
                        title="Total Products"
                        value="48"
                        change={2.3}
                        changeType="decrease"
                        color="purple"
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        }
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                    {/* Revenue Chart */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Weekly Revenue</h3>
                                <p className="text-sm text-gray-500">Sales performance this week</p>
                            </div>
                            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gold">
                                <option>This Week</option>
                                <option>Last Week</option>
                                <option>This Month</option>
                            </select>
                        </div>
                        <BarChart data={revenueData} height={220} />
                    </div>

                    {/* Order Status */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Order Status</h3>
                        <DonutChart data={orderStatusData} size={140} />
                    </div>
                </div>

                {/* Monthly Trend & Top Products */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    {/* Monthly Trend */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Monthly Revenue Trend</h3>
                                <p className="text-sm text-gray-500">Last 6 months performance</p>
                            </div>
                        </div>
                        <div className="pb-6">
                            <LineChart data={monthlyData} height={180} />
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Top Products</h3>
                            <a href="/admin/products" className="text-sm text-gold hover:text-yellow-600 font-medium">View All</a>
                        </div>
                        <div className="space-y-4">
                            {topProducts.map((product, index) => (
                                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gold/10 rounded-lg flex items-center justify-center">
                                            <span className="text-lg">🥐</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{product.name}</p>
                                            <p className="text-sm text-gray-500">{product.sales} sold</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">₹{product.revenue.toLocaleString()}</p>
                                        <p className={`text-xs ${product.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                            {product.trend === 'up' ? '↑' : '↓'} {product.trend === 'up' ? '+12%' : '-5%'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
                            <a href="/admin/orders" className="text-sm text-gold hover:text-yellow-600 font-medium">View All Orders</a>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-medium text-gray-900">{order.id}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-gray-700">{order.customer}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-gray-600">{order.items} items</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-semibold text-gray-900">₹{order.total}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-gray-500 text-sm">{order.time}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button className="text-gold hover:text-yellow-600 font-medium text-sm">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
