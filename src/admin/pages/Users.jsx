// Admin Users Management Page
import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';

const API_BASE_URL = 'http://localhost:3000/api';

const Users = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showRoleModal, setShowRoleModal] = useState(null);
    const [toast, setToast] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Fetch users from backend
    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('pb_token');
            const response = await fetch(`${API_BASE_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Transform backend data to match our UI structure
                const transformedUsers = (data.users || []).map(user => ({
                    id: user._id,
                    name: user.name || 'Unknown User',
                    email: user.email,
                    phone: user.phone || 'N/A',
                    role: user.role || 'user',
                    status: user.isBlocked ? 'inactive' : 'active',
                    isBlocked: user.isBlocked || false,
                    totalOrders: user.orderCount || 0,
                    totalSpent: user.totalSpent || 0,
                    joinedAt: user.createdAt,
                    lastActive: user.lastLoginAt || user.updatedAt,
                    avatar: user.avatar || null,
                    address: user.addresses?.[0] 
                        ? `${user.addresses[0].city}, ${user.addresses[0].state}` 
                        : 'N/A',
                    rewardPoints: user.rewardPoints || 0
                }));
                setUsers(transformedUsers);
            } else {
                setError(data.message || 'Failed to fetch users');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch users on mount
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const roles = ['all', 'user', 'admin'];
    const statuses = ['all', 'active', 'blocked'];

    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.phone || '').includes(searchQuery);
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        const matchesStatus = filterStatus === 'all' || 
            (filterStatus === 'active' && !user.isBlocked) ||
            (filterStatus === 'blocked' && user.isBlocked);
        return matchesSearch && matchesRole && matchesStatus;
    });

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-700 border border-purple-200';
            case 'user': return 'bg-blue-100 text-blue-700 border border-blue-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin': return '👑';
            case 'user': return '👤';
            default: return '👤';
        }
    };

    const handleBlockToggle = async (userId) => {
        const user = users.find(u => u.id === userId);
        const newBlockedState = !user.isBlocked;
        
        try {
            const token = localStorage.getItem('pb_token');
            const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isBlocked: newBlockedState })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setUsers(users.map(u => 
                    u.id === userId 
                        ? { 
                            ...u, 
                            isBlocked: newBlockedState,
                            status: newBlockedState ? 'inactive' : 'active'
                        }
                        : u
                ));
                
                if (selectedUser?.id === userId) {
                    setSelectedUser(prev => ({
                        ...prev,
                        isBlocked: newBlockedState,
                        status: newBlockedState ? 'inactive' : 'active'
                    }));
                }
                
                showToast(
                    newBlockedState 
                        ? `${user.name} has been blocked` 
                        : `${user.name} has been unblocked`,
                    newBlockedState ? 'warning' : 'success'
                );
            } else {
                showToast(data.message || 'Failed to update user', 'error');
            }
        } catch (err) {
            console.error('Error updating user:', err);
            showToast('Failed to update user', 'error');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        const user = users.find(u => u.id === userId);
        
        try {
            const token = localStorage.getItem('pb_token');
            const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setUsers(users.map(u => 
                    u.id === userId ? { ...u, role: newRole } : u
                ));
                
                if (selectedUser?.id === userId) {
                    setSelectedUser(prev => ({ ...prev, role: newRole }));
                }
                
                setShowRoleModal(null);
                showToast(`${user.name}'s role changed to ${newRole}`, 'success');
            } else {
                showToast(data.message || 'Failed to update role', 'error');
            }
        } catch (err) {
            console.error('Error updating role:', err);
            showToast('Failed to update role', 'error');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatLastActive = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 5) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return formatDate(dateString);
    };

    const getUserStats = () => {
        return {
            total: users.length,
            active: users.filter(u => !u.isBlocked).length,
            blocked: users.filter(u => u.isBlocked).length,
            admins: users.filter(u => u.role === 'admin').length,
            users: users.filter(u => u.role === 'user').length,
            totalRevenue: users.reduce((sum, u) => sum + u.totalSpent, 0)
        };
    };

    const stats = getUserStats();

    return (
        <div className="min-h-screen">
            <Header 
                title="Users" 
                subtitle="Manage customer and admin accounts"
            />

            <div className="p-4 lg:p-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-xl">👥</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                <p className="text-xs text-gray-500">Total Users</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-xl">✅</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                                <p className="text-xs text-gray-500">Active</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <span className="text-xl">🚫</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
                                <p className="text-xs text-gray-500">Blocked</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-xl">👑</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-purple-600">{stats.admins}</p>
                                <p className="text-xs text-gray-500">Admins</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-xl">👤</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-600">{stats.users}</p>
                                <p className="text-xs text-gray-500">Customers</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-gold to-yellow-600 rounded-xl p-4 shadow-sm text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <span className="text-xl">💰</span>
                            </div>
                            <div>
                                <p className="text-xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
                                <p className="text-xs opacity-80">Total Revenue</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
                    <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by name, email or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold transition-colors"
                            />
                        </div>

                        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                            {/* Role Filter */}
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold bg-white"
                            >
                                <option value="all">All Roles</option>
                                <option value="user">👤 Users</option>
                                <option value="admin">👑 Admins</option>
                            </select>

                            {/* Status Filter */}
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="active">✅ Active</option>
                                <option value="blocked">🚫 Blocked</option>
                            </select>

                            {/* Refresh Button */}
                            <button 
                                onClick={fetchUsers}
                                disabled={loading}
                                className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                                title="Refresh Users"
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
                                onClick={fetchUsers}
                                className="mt-2 text-red-700 underline text-sm"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && users.length === 0 && (
                    <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                        <span className="text-6xl mb-4 block">👥</span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No users yet</h3>
                        <p className="text-gray-500">When customers sign up, they will appear here</p>
                    </div>
                )}

                {/* Users Table */}
                {!loading && !error && users.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Orders</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Spent</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Active</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.isBlocked ? 'bg-red-50/50' : ''}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                    user.isBlocked 
                                                        ? 'bg-red-100 text-red-600' 
                                                        : user.role === 'admin' 
                                                            ? 'bg-purple-100 text-purple-600' 
                                                            : 'bg-gradient-to-br from-gold to-yellow-600 text-white'
                                                }`}>
                                                    <span className="font-bold text-sm">{user.name.split(' ').map(n => n[0]).join('')}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 flex items-center gap-2">
                                                        {user.name}
                                                        {user.role === 'admin' && <span className="text-xs">👑</span>}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => setShowRoleModal(user)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium capitalize flex items-center gap-1 hover:opacity-80 transition-opacity ${getRoleBadge(user.role)}`}
                                            >
                                                <span>{getRoleIcon(user.role)}</span>
                                                {user.role}
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-gray-700 font-medium">{user.totalOrders}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-semibold text-gray-900">₹{user.totalSpent.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.isBlocked ? (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1 w-fit">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                    </svg>
                                                    Blocked
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1 w-fit">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Active
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-gray-500 text-sm">{formatLastActive(user.lastActive)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    onClick={() => setSelectedUser(user)}
                                                    className="p-2 text-gray-500 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                </button>
                                                <button 
                                                    onClick={() => handleBlockToggle(user.id)}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        user.isBlocked 
                                                            ? 'text-green-600 hover:bg-green-50' 
                                                            : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                                                    }`}
                                                    title={user.isBlocked ? 'Unblock User' : 'Block User'}
                                                >
                                                    {user.isBlocked ? (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && users.length > 0 && (
                        <div className="p-12 text-center">
                            <span className="text-6xl mb-4 block">🔍</span>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No users found</h3>
                            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                        </div>
                    )}
                </div>
                )}
            </div>

            {/* User Detail Modal */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
                        {/* Header with gradient */}
                        <div className={`p-6 text-white relative overflow-hidden ${
                            selectedUser.isBlocked 
                                ? 'bg-gradient-to-r from-red-600 to-red-700'
                                : selectedUser.role === 'admin'
                                    ? 'bg-gradient-to-r from-purple-600 to-purple-800'
                                    : 'bg-gradient-to-r from-gold to-yellow-600'
                        }`}>
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
                            </div>
                            <div className="relative flex items-center justify-between">
                                <h3 className="text-xl font-bold">User Details</h3>
                                <button 
                                    onClick={() => setSelectedUser(null)} 
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            {/* User Avatar & Name */}
                            <div className="text-center mb-6 -mt-12">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg ${
                                    selectedUser.isBlocked 
                                        ? 'bg-red-100 text-red-600' 
                                        : selectedUser.role === 'admin' 
                                            ? 'bg-purple-100 text-purple-600' 
                                            : 'bg-gradient-to-br from-gold to-yellow-600 text-white'
                                }`}>
                                    <span className="font-bold text-2xl">{selectedUser.name.split(' ').map(n => n[0]).join('')}</span>
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                                    {selectedUser.name}
                                    {selectedUser.role === 'admin' && <span>👑</span>}
                                </h4>
                                <p className="text-gray-500">{selectedUser.email}</p>
                                <div className="flex items-center justify-center gap-2 mt-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadge(selectedUser.role)}`}>
                                        {getRoleIcon(selectedUser.role)} {selectedUser.role}
                                    </span>
                                    {selectedUser.isBlocked ? (
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                            🚫 Blocked
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            ✅ Active
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Block Reason */}
                            {selectedUser.isBlocked && selectedUser.blockReason && (
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                        <div>
                                            <p className="font-medium text-red-700">Block Reason</p>
                                            <p className="text-sm text-red-600">{selectedUser.blockReason}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* User Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-gray-900">{selectedUser.totalOrders}</p>
                                    <p className="text-sm text-gray-500">Orders</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <p className="text-2xl font-bold text-gold">₹{selectedUser.totalSpent.toLocaleString()}</p>
                                    <p className="text-sm text-gray-500">Spent</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <p className="text-sm font-bold text-gray-900">{formatDate(selectedUser.joinedAt)}</p>
                                    <p className="text-sm text-gray-500">Joined</p>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-3 mb-6">
                                <h5 className="font-semibold text-gray-700 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Contact Information
                                </h5>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-gray-700">{selectedUser.email}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    <span className="text-gray-700">{selectedUser.phone}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-gray-700">{selectedUser.address}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="text-gray-700">Last active: {formatLastActive(selectedUser.lastActive)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedUser(null);
                                        setShowRoleModal(selectedUser);
                                    }}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Change Role
                                </button>
                                <button 
                                    onClick={() => {
                                        handleBlockToggle(selectedUser.id);
                                    }}
                                    className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                                        selectedUser.isBlocked
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                                >
                                    {selectedUser.isBlocked ? (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                            </svg>
                                            Unblock User
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                            Block User
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Role Change Modal */}
            {showRoleModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm animate-scale-in">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900">Change User Role</h3>
                                <button 
                                    onClick={() => setShowRoleModal(null)} 
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Select a new role for {showRoleModal.name}</p>
                        </div>

                        <div className="p-6 space-y-3">
                            {[
                                { value: 'user', icon: '👤', label: 'User', desc: 'Regular customer account' },
                                { value: 'admin', icon: '👑', label: 'Admin', desc: 'Full admin access' }
                            ].map(role => (
                                <button
                                    key={role.value}
                                    onClick={() => handleRoleChange(showRoleModal.id, role.value)}
                                    className={`w-full flex items-center gap-4 p-4 border-2 rounded-xl transition-all ${
                                        showRoleModal.role === role.value
                                            ? 'border-gold bg-gold/5'
                                            : 'border-gray-200 hover:border-gold/50'
                                    }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                                        role.value === 'admin' ? 'bg-purple-100' : 'bg-blue-100'
                                    }`}>
                                        {role.icon}
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="font-semibold text-gray-900">{role.label}</p>
                                        <p className="text-sm text-gray-500">{role.desc}</p>
                                    </div>
                                    {showRoleModal.role === role.value && (
                                        <div className="w-6 h-6 bg-gold rounded-full flex items-center justify-center">
                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 animate-slide-in-right flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
                    toast.type === 'success' ? 'bg-green-600' : toast.type === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                } text-white`}>
                    {toast.type === 'success' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : toast.type === 'warning' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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

export default Users;
