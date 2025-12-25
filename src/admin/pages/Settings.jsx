// Admin Settings Page
import { useState } from 'react';
import Header from '../components/Header';
import { useAdmin } from '../context/AdminContext';

const Settings = () => {
    const { admin } = useAdmin();
    const [activeTab, setActiveTab] = useState('profile');
    const [saved, setSaved] = useState(false);

    const [profileData, setProfileData] = useState({
        name: admin?.name || 'Admin User',
        email: admin?.email || 'admin@perfectbakery.com',
        phone: '+91 98765 43210',
        role: 'Administrator'
    });

    const [storeData, setStoreData] = useState({
        storeName: 'Perfect Bakery',
        tagline: 'Freshly Baked, Made with Love',
        address: '123 Baker Street, Mumbai 400001',
        phone: '+91 98765 43210',
        email: 'hello@perfectbakery.com',
        openingHours: '8:00 AM - 9:00 PM'
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailOrders: true,
        emailMarketing: false,
        pushOrders: true,
        pushStock: true,
        smsOrders: false
    });

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const tabs = [
        { id: 'profile', name: 'Profile', icon: '👤' },
        { id: 'store', name: 'Store Info', icon: '🏪' },
        { id: 'notifications', name: 'Notifications', icon: '🔔' },
        { id: 'security', name: 'Security', icon: '🔒' },
        { id: 'billing', name: 'Billing', icon: '💳' }
    ];

    return (
        <div className="min-h-screen">
            <Header 
                title="Settings" 
                subtitle="Manage your account and store preferences"
            />

            <div className="p-4 lg:p-6">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {/* Tabs */}
                    <div className="border-b border-gray-100">
                        <div className="flex overflow-x-auto">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-gold text-gold'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    <span>{tab.icon}</span>
                                    {tab.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="max-w-2xl space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 bg-gold/20 rounded-full flex items-center justify-center">
                                        <span className="text-4xl font-bold text-gold">
                                            {profileData.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{profileData.name}</h3>
                                        <p className="text-gray-500">{profileData.role}</p>
                                        <button className="mt-2 text-sm text-gold hover:text-yellow-600 font-medium">
                                            Change Avatar
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                        <input
                                            type="tel"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                        <input
                                            type="text"
                                            value={profileData.role}
                                            disabled
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2.5 bg-gold text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}

                        {/* Store Info Tab */}
                        {activeTab === 'store' && (
                            <div className="max-w-2xl space-y-6">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                                        <input
                                            type="text"
                                            value={storeData.storeName}
                                            onChange={(e) => setStoreData({ ...storeData, storeName: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                                        <input
                                            type="text"
                                            value={storeData.tagline}
                                            onChange={(e) => setStoreData({ ...storeData, tagline: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                        <textarea
                                            value={storeData.address}
                                            onChange={(e) => setStoreData({ ...storeData, address: e.target.value })}
                                            rows={2}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold resize-none"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                            <input
                                                type="tel"
                                                value={storeData.phone}
                                                onChange={(e) => setStoreData({ ...storeData, phone: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                            <input
                                                type="email"
                                                value={storeData.email}
                                                onChange={(e) => setStoreData({ ...storeData, email: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Opening Hours</label>
                                        <input
                                            type="text"
                                            value={storeData.openingHours}
                                            onChange={(e) => setStoreData({ ...storeData, openingHours: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold"
                                        />
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2.5 bg-gold text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="max-w-2xl space-y-6">
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900">Email Notifications</h4>
                                    <div className="space-y-3">
                                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                                            <div>
                                                <p className="font-medium text-gray-900">Order Updates</p>
                                                <p className="text-sm text-gray-500">Get notified for new orders and status changes</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings.emailOrders}
                                                onChange={(e) => setNotificationSettings({ ...notificationSettings, emailOrders: e.target.checked })}
                                                className="w-5 h-5 text-gold rounded focus:ring-gold"
                                            />
                                        </label>
                                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                                            <div>
                                                <p className="font-medium text-gray-900">Marketing Emails</p>
                                                <p className="text-sm text-gray-500">Receive tips and best practices</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings.emailMarketing}
                                                onChange={(e) => setNotificationSettings({ ...notificationSettings, emailMarketing: e.target.checked })}
                                                className="w-5 h-5 text-gold rounded focus:ring-gold"
                                            />
                                        </label>
                                    </div>

                                    <h4 className="font-semibold text-gray-900 pt-4">Push Notifications</h4>
                                    <div className="space-y-3">
                                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                                            <div>
                                                <p className="font-medium text-gray-900">New Orders</p>
                                                <p className="text-sm text-gray-500">Instant alerts for incoming orders</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings.pushOrders}
                                                onChange={(e) => setNotificationSettings({ ...notificationSettings, pushOrders: e.target.checked })}
                                                className="w-5 h-5 text-gold rounded focus:ring-gold"
                                            />
                                        </label>
                                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer">
                                            <div>
                                                <p className="font-medium text-gray-900">Low Stock Alerts</p>
                                                <p className="text-sm text-gray-500">Get notified when products are running low</p>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={notificationSettings.pushStock}
                                                onChange={(e) => setNotificationSettings({ ...notificationSettings, pushStock: e.target.checked })}
                                                className="w-5 h-5 text-gold rounded focus:ring-gold"
                                            />
                                        </label>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2.5 bg-gold text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors"
                                >
                                    Save Preferences
                                </button>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="max-w-2xl space-y-6">
                                <div className="p-6 bg-gray-50 rounded-xl">
                                    <h4 className="font-semibold text-gray-900 mb-4">Change Password</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                            <input
                                                type="password"
                                                placeholder="Enter current password"
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                            <input
                                                type="password"
                                                placeholder="Enter new password"
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                            <input
                                                type="password"
                                                placeholder="Confirm new password"
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold bg-white"
                                            />
                                        </div>
                                        <button
                                            onClick={handleSave}
                                            className="px-6 py-2.5 bg-gold text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors"
                                        >
                                            Update Password
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 bg-gray-50 rounded-xl">
                                    <h4 className="font-semibold text-gray-900 mb-2">Two-Factor Authentication</h4>
                                    <p className="text-sm text-gray-500 mb-4">Add an extra layer of security to your account</p>
                                    <button className="px-4 py-2 border border-gold text-gold rounded-xl font-medium hover:bg-gold/10 transition-colors">
                                        Enable 2FA
                                    </button>
                                </div>

                                <div className="p-6 bg-red-50 rounded-xl border border-red-100">
                                    <h4 className="font-semibold text-red-700 mb-2">Danger Zone</h4>
                                    <p className="text-sm text-red-600 mb-4">Once you delete your account, there is no going back.</p>
                                    <button className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors">
                                        Delete Account
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Billing Tab */}
                        {activeTab === 'billing' && (
                            <div className="max-w-2xl space-y-6">
                                <div className="p-6 bg-gradient-to-r from-gold to-yellow-500 rounded-xl text-white">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-lg font-bold">Pro Plan</span>
                                        <span className="px-3 py-1 bg-white/20 rounded-full text-sm">Active</span>
                                    </div>
                                    <p className="text-3xl font-bold mb-1">₹2,999<span className="text-lg font-normal">/month</span></p>
                                    <p className="text-yellow-100">Next billing date: January 15, 2025</p>
                                </div>

                                <div className="p-6 bg-gray-50 rounded-xl">
                                    <h4 className="font-semibold text-gray-900 mb-4">Payment Method</h4>
                                    <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
                                        <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                                            VISA
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">•••• •••• •••• 4242</p>
                                            <p className="text-sm text-gray-500">Expires 12/2026</p>
                                        </div>
                                        <button className="text-gold hover:text-yellow-600 font-medium text-sm">
                                            Edit
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6 bg-gray-50 rounded-xl">
                                    <h4 className="font-semibold text-gray-900 mb-4">Billing History</h4>
                                    <div className="space-y-3">
                                        {[
                                            { date: 'Dec 15, 2024', amount: '₹2,999', status: 'Paid' },
                                            { date: 'Nov 15, 2024', amount: '₹2,999', status: 'Paid' },
                                            { date: 'Oct 15, 2024', amount: '₹2,999', status: 'Paid' }
                                        ].map((invoice, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-xl">
                                                <div>
                                                    <p className="font-medium text-gray-900">{invoice.date}</p>
                                                    <p className="text-sm text-gray-500">Pro Plan</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">{invoice.amount}</p>
                                                    <span className="text-xs text-green-600">{invoice.status}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Save Notification */}
                {saved && (
                    <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-slide-up">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Settings saved successfully!
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
