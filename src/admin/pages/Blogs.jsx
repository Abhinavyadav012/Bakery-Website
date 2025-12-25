// Admin Blog Management Page
import { useState } from 'react';
import Header from '../components/Header';

const Blogs = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingBlog, setEditingBlog] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Mock blogs data
    const [blogs, setBlogs] = useState([
        {
            id: 1,
            title: 'The Art of French Pastry Making',
            excerpt: 'Discover the secrets behind crafting perfect croissants and other French delicacies...',
            author: 'Chef Marie',
            category: 'Techniques',
            status: 'published',
            views: 1250,
            comments: 24,
            publishedAt: '2024-01-10',
            image: '🥐'
        },
        {
            id: 2,
            title: '10 Tips for Perfect Birthday Cakes',
            excerpt: 'Learn how to create stunning birthday cakes that will wow your guests...',
            author: 'Baker John',
            category: 'Tips & Tricks',
            status: 'published',
            views: 980,
            comments: 18,
            publishedAt: '2024-01-08',
            image: '🎂'
        },
        {
            id: 3,
            title: 'Sourdough Bread: A Complete Guide',
            excerpt: 'Everything you need to know about making artisan sourdough bread at home...',
            author: 'Chef Marie',
            category: 'Recipes',
            status: 'draft',
            views: 0,
            comments: 0,
            publishedAt: null,
            image: '🍞'
        },
        {
            id: 4,
            title: 'Valentine\'s Day Special Treats',
            excerpt: 'Romantic dessert ideas to make your Valentine\'s Day extra special...',
            author: 'Baker Sarah',
            category: 'Seasonal',
            status: 'scheduled',
            views: 0,
            comments: 0,
            publishedAt: '2024-02-10',
            image: '💝'
        },
        {
            id: 5,
            title: 'Gluten-Free Baking Essentials',
            excerpt: 'A comprehensive guide to delicious gluten-free baked goods...',
            author: 'Chef Marie',
            category: 'Special Diets',
            status: 'published',
            views: 650,
            comments: 12,
            publishedAt: '2024-01-05',
            image: '🧁'
        }
    ]);

    const categories = ['all', 'Recipes', 'Tips & Tricks', 'Techniques', 'Seasonal', 'Special Diets'];
    const statuses = ['all', 'published', 'draft', 'scheduled'];

    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'all' || blog.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status) => {
        switch (status) {
            case 'published': return 'bg-green-100 text-green-700';
            case 'draft': return 'bg-gray-100 text-gray-700';
            case 'scheduled': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleAddBlog = () => {
        setEditingBlog(null);
        setShowModal(true);
    };

    const handleEditBlog = (blog) => {
        setEditingBlog(blog);
        setShowModal(true);
    };

    const handleDeleteBlog = (blogId) => {
        setBlogs(blogs.filter(b => b.id !== blogId));
        setDeleteConfirm(null);
    };

    const handleSaveBlog = (blogData) => {
        if (editingBlog) {
            setBlogs(blogs.map(b => b.id === editingBlog.id ? { ...b, ...blogData } : b));
        } else {
            setBlogs([...blogs, { ...blogData, id: Date.now(), views: 0, comments: 0 }]);
        }
        setShowModal(false);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getBlogStats = () => {
        return {
            total: blogs.length,
            published: blogs.filter(b => b.status === 'published').length,
            drafts: blogs.filter(b => b.status === 'draft').length,
            scheduled: blogs.filter(b => b.status === 'scheduled').length,
            totalViews: blogs.reduce((a, b) => a + b.views, 0)
        };
    };

    const stats = getBlogStats();

    return (
        <div className="min-h-screen">
            <Header 
                title="Blog Posts" 
                subtitle="Create and manage your bakery blog content"
            />

            <div className="p-4 lg:p-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    {[
                        { label: 'Total Posts', value: stats.total, icon: '📝', color: 'bg-gray-50' },
                        { label: 'Published', value: stats.published, icon: '✅', color: 'bg-green-50' },
                        { label: 'Drafts', value: stats.drafts, icon: '📋', color: 'bg-yellow-50' },
                        { label: 'Scheduled', value: stats.scheduled, icon: '⏰', color: 'bg-blue-50' },
                        { label: 'Total Views', value: stats.totalViews.toLocaleString(), icon: '👁️', color: 'bg-purple-50' }
                    ].map(stat => (
                        <div key={stat.label} className={`${stat.color} rounded-xl p-4`}>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{stat.icon}</span>
                                <div>
                                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-sm text-gray-600">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
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
                                placeholder="Search blog posts..."
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
                                        {status === 'all' ? 'All Status' : status}
                                    </option>
                                ))}
                            </select>

                            {/* New Post Button */}
                            <button
                                onClick={handleAddBlog}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gold text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="hidden sm:inline">New Post</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Blog Posts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBlogs.map(blog => (
                        <div key={blog.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
                            <div className="p-6 bg-gradient-to-br from-cream to-white flex items-center justify-center h-32">
                                <span className="text-5xl transform group-hover:scale-110 transition-transform duration-300">
                                    {blog.image}
                                </span>
                            </div>
                            <div className="p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(blog.status)}`}>
                                        {blog.status}
                                    </span>
                                    <span className="text-xs text-gray-500">{blog.category}</span>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{blog.title}</h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{blog.excerpt}</p>
                                
                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                    <span>{blog.author}</span>
                                    <span>{formatDate(blog.publishedAt)}</span>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            {blog.views}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                            </svg>
                                            {blog.comments}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEditBlog(blog)}
                                            className="p-2 text-gray-500 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(blog.id)}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredBlogs.length === 0 && (
                    <div className="bg-white rounded-2xl p-12 text-center">
                        <span className="text-6xl mb-4 block">📝</span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No blog posts found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <BlogModal
                    blog={editingBlog}
                    categories={categories.filter(c => c !== 'all')}
                    onClose={() => setShowModal(false)}
                    onSave={handleSaveBlog}
                />
            )}

            {/* Delete Confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-scale-in">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Blog Post?</h3>
                            <p className="text-gray-500 mb-6">This action cannot be undone. The blog post will be permanently removed.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteBlog(deleteConfirm)}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Blog Add/Edit Modal Component
const BlogModal = ({ blog, categories, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: blog?.title || '',
        excerpt: blog?.excerpt || '',
        category: blog?.category || categories[0],
        author: blog?.author || 'Chef Marie',
        status: blog?.status || 'draft',
        image: blog?.image || '📝',
        publishedAt: blog?.publishedAt || ''
    });

    const emojis = ['📝', '🎂', '🧁', '🍰', '🥐', '🍞', '🍪', '💝', '🎉', '⭐'];
    const authors = ['Chef Marie', 'Baker John', 'Baker Sarah', 'Admin'];

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">
                            {blog ? 'Edit Blog Post' : 'Create New Post'}
                        </h3>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Image Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Post Icon</label>
                        <div className="flex flex-wrap gap-2">
                            {emojis.map(emoji => (
                                <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, image: emoji })}
                                    className={`w-10 h-10 text-xl rounded-xl border-2 transition-all ${formData.image === emoji ? 'border-gold bg-gold/10' : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold"
                            placeholder="Enter blog title"
                            required
                        />
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                        <textarea
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold resize-none"
                            rows={3}
                            placeholder="Brief description of the post..."
                            required
                        />
                    </div>

                    {/* Category & Author */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold bg-white"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                            <select
                                value={formData.author}
                                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold bg-white"
                            >
                                {authors.map(author => (
                                    <option key={author} value={author}>{author}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Status & Publish Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold bg-white"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="scheduled">Scheduled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Publish Date</label>
                            <input
                                type="date"
                                value={formData.publishedAt}
                                onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-gold text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors"
                        >
                            {blog ? 'Update Post' : 'Create Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Blogs;
