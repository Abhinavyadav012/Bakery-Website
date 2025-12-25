// Admin Analytics Page
import Header from '../components/Header';
import { BarChart, LineChart, DonutChart } from '../components/Charts';

const Analytics = () => {
    // Mock data
    const salesByCategory = [
        { label: 'Cakes', value: 45000 },
        { label: 'Pastries', value: 32000 },
        { label: 'Breads', value: 28000 },
        { label: 'Cookies', value: 18000 },
        { label: 'Cupcakes', value: 15000 }
    ];

    const monthlyRevenue = [
        { label: 'Jul', value: 42000 },
        { label: 'Aug', value: 48000 },
        { label: 'Sep', value: 51000 },
        { label: 'Oct', value: 55000 },
        { label: 'Nov', value: 62000 },
        { label: 'Dec', value: 78000 }
    ];

    const trafficSources = [
        { label: 'Direct', value: 4200, color: '#D4AF37' },
        { label: 'Google', value: 3100, color: '#3b82f6' },
        { label: 'Social', value: 2400, color: '#22c55e' },
        { label: 'Referral', value: 1800, color: '#8b5cf6' }
    ];

    const customerRetention = [
        { label: 'New', value: 340, color: '#3b82f6' },
        { label: 'Returning', value: 520, color: '#22c55e' },
        { label: 'Inactive', value: 145, color: '#ef4444' }
    ];

    const topSellingProducts = [
        { rank: 1, name: 'Chocolate Truffle Cake', category: 'Cakes', sales: 234, revenue: 128700, growth: 12.5 },
        { rank: 2, name: 'French Croissant', category: 'Pastries', sales: 412, revenue: 49440, growth: 8.3 },
        { rank: 3, name: 'Red Velvet Cupcakes', category: 'Cupcakes', sales: 356, revenue: 30260, growth: 15.2 },
        { rank: 4, name: 'Sourdough Bread', category: 'Breads', sales: 289, revenue: 52020, growth: -2.1 },
        { rank: 5, name: 'Butter Cookies Box', category: 'Cookies', sales: 198, revenue: 29700, growth: 6.7 }
    ];

    const metrics = [
        { 
            title: 'Total Revenue', 
            value: '₹3,36,000', 
            change: '+12.5%', 
            isPositive: true,
            subtext: 'vs last month',
            icon: '💰'
        },
        { 
            title: 'Average Order Value', 
            value: '₹785', 
            change: '+5.2%', 
            isPositive: true,
            subtext: 'vs last month',
            icon: '📊'
        },
        { 
            title: 'Conversion Rate', 
            value: '3.8%', 
            change: '+0.4%', 
            isPositive: true,
            subtext: 'vs last month',
            icon: '🎯'
        },
        { 
            title: 'Customer Lifetime Value', 
            value: '₹4,250', 
            change: '-2.1%', 
            isPositive: false,
            subtext: 'vs last month',
            icon: '👥'
        }
    ];

    return (
        <div className="min-h-screen">
            <Header 
                title="Analytics" 
                subtitle="Track your bakery's performance metrics"
            />

            <div className="p-4 lg:p-6 space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {metrics.map((metric, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                                <span className="text-3xl">{metric.icon}</span>
                                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                                    metric.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {metric.change}
                                </span>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                            <p className="text-sm text-gray-500">{metric.title}</p>
                            <p className="text-xs text-gray-400 mt-1">{metric.subtext}</p>
                        </div>
                    ))}
                </div>

                {/* Revenue Trend */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Revenue Trend</h3>
                            <p className="text-sm text-gray-500">Last 6 months performance</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-gold text-white rounded-lg text-sm font-medium">Monthly</button>
                            <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">Weekly</button>
                            <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200">Daily</button>
                        </div>
                    </div>
                    <LineChart data={monthlyRevenue} height={250} />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sales by Category */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Sales by Category</h3>
                        <BarChart data={salesByCategory} height={220} />
                    </div>

                    {/* Traffic Sources & Customer Retention */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Traffic Sources</h3>
                            <DonutChart data={trafficSources} size={120} />
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Customers</h3>
                            <DonutChart data={customerRetention} size={120} />
                        </div>
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Top Selling Products</h3>
                        <p className="text-sm text-gray-500">Best performers this month</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Units Sold</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Growth</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {topSellingProducts.map((product) => (
                                    <tr key={product.rank} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                                product.rank === 1 ? 'bg-gold text-white' :
                                                product.rank === 2 ? 'bg-gray-300 text-gray-700' :
                                                product.rank === 3 ? 'bg-amber-600 text-white' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                                {product.rank}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-medium text-gray-900">{product.name}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-gray-700">{product.sales}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-semibold text-gray-900">₹{product.revenue.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`flex items-center gap-1 text-sm font-medium ${
                                                product.growth >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {product.growth >= 0 ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                    </svg>
                                                )}
                                                {Math.abs(product.growth)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Performance Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <span className="text-lg font-bold">Growth</span>
                        </div>
                        <p className="text-3xl font-bold mb-2">+24.5%</p>
                        <p className="text-green-100">Revenue growth compared to last quarter</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <span className="text-lg font-bold">New Customers</span>
                        </div>
                        <p className="text-3xl font-bold mb-2">+156</p>
                        <p className="text-blue-100">New customers acquired this month</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                            </div>
                            <span className="text-lg font-bold">Satisfaction</span>
                        </div>
                        <p className="text-3xl font-bold mb-2">4.8/5</p>
                        <p className="text-purple-100">Average customer rating this month</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
