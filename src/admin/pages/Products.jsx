// Admin Products Management Page
import { useState, useRef, useEffect } from 'react';
import Header from '../components/Header';
import { useProducts, getCategoryEmoji, PRODUCT_CATEGORIES } from '../../context/ProductContext';

const Products = () => {
    const { 
        products: contextProducts, 
        loading: contextLoading, 
        error: contextError,
        addProduct: addProductToContext,
        updateProduct: updateProductInContext,
        deleteProduct: deleteProductFromContext,
        refreshProducts,
        getStats
    } = useProducts();

    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [toast, setToast] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Use context products
    const products = contextProducts;

    // Categories for admin (without 'all' for product creation)
    const categories = ['all', ...PRODUCT_CATEGORIES.filter(c => c.id !== 'all').map(c => c.name)];

    // Show toast notification
    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = filterCategory === 'all' || 
            product.category?.toLowerCase() === filterCategory.toLowerCase();
        return matchesSearch && matchesCategory;
    });

    const getStatusBadge = (status, stock) => {
        const stockNum = stock || 0;
        if (stockNum === 0) {
            return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Out of Stock</span>;
        }
        if (stockNum < 10) {
            return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Low Stock</span>;
        }
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">In Stock</span>;
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        setShowModal(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowModal(true);
    };

    const handleDeleteProduct = async (productId) => {
        setActionLoading(true);
        const result = await deleteProductFromContext(productId);
        setActionLoading(false);
        
        if (result.success) {
            setDeleteConfirm(null);
            showToast('Product deleted successfully', 'success');
        } else {
            showToast(result.message || 'Failed to delete product', 'error');
        }
    };

    const handleSaveProduct = async (productData) => {
        setActionLoading(true);
        
        if (editingProduct) {
            const productId = editingProduct._id || editingProduct.id;
            const result = await updateProductInContext(productId, productData);
            setActionLoading(false);
            
            if (result.success) {
                showToast('Product updated successfully', 'success');
                setShowModal(false);
            } else {
                showToast(result.message || 'Failed to update product', 'error');
            }
        } else {
            const result = await addProductToContext(productData);
            setActionLoading(false);
            
            if (result.success) {
                showToast('Product added successfully', 'success');
                setShowModal(false);
            } else {
                showToast(result.message || 'Failed to add product', 'error');
            }
        }
    };

    // Get product stats from context
    const stats = getStats();

    return (
        <div className="min-h-screen">
            <Header 
                title="Products" 
                subtitle="Manage your bakery products inventory"
            />

            <div className="p-4 lg:p-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-xl">📦</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                                <p className="text-sm text-gray-500">Total Products</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-xl">✅</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-600">{stats.inStock}</p>
                                <p className="text-sm text-gray-500">In Stock</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                                <span className="text-xl">⚠️</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
                                <p className="text-sm text-gray-500">Low Stock</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <span className="text-xl">❌</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                                <p className="text-sm text-gray-500">Out of Stock</p>
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
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold transition-colors"
                            />
                        </div>

                        <div className="flex gap-3 w-full md:w-auto">
                            {/* Category Filter */}
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold bg-white"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'all' ? 'All Categories' : cat}
                                    </option>
                                ))}
                            </select>

                            {/* Refresh Button */}
                            <button
                                onClick={() => refreshProducts()}
                                disabled={contextLoading}
                                className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                                title="Refresh Products"
                            >
                                <svg className={`w-5 h-5 text-gray-600 ${contextLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>

                            {/* Add Product Button */}
                            <button
                                onClick={handleAddProduct}
                                className="flex items-center gap-2 px-4 py-2.5 bg-gold text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="hidden sm:inline">Add Product</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {contextLoading && (
                    <div className="flex justify-center items-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
                    </div>
                )}

                {/* Error State */}
                {contextError && !contextLoading && (
                    <div className="text-center py-8 mb-8">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 inline-block">
                            <p className="text-red-600">Failed to load products. Please try again.</p>
                        </div>
                    </div>
                )}

                {/* Products Grid */}
                {!contextLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                    {filteredProducts.map(product => (
                        <div key={product._id || product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
                            {/* Product Image */}
                            <div className="relative h-40 bg-gradient-to-br from-cream to-white flex items-center justify-center overflow-hidden">
                                {product.imagePreview ? (
                                    <img 
                                        src={product.imagePreview} 
                                        alt={product.name}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="text-6xl transform group-hover:scale-110 transition-transform duration-300">
                                        {getCategoryEmoji(product.category)}
                                    </div>
                                )}
                                {/* Rating Badge */}
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-sm font-medium text-gray-700">{product.rating || 0}</span>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-bold text-gray-900">{product.name}</h3>
                                        <p className="text-sm text-gray-500">{product.category}</p>
                                    </div>
                                    {getStatusBadge(product.status, product.stock)}
                                </div>
                                {product.description && (
                                    <p className="text-xs text-gray-400 mb-3 line-clamp-2">{product.description}</p>
                                )}
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                    <div>
                                        <p className="text-lg font-bold text-gold">₹{product.price}</p>
                                        <p className="text-xs text-gray-500">{product.stock} in stock</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEditProduct(product)}
                                            className="p-2 text-gray-500 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(product._id || product.id)}
                                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                )}

                {filteredProducts.length === 0 && !contextLoading && (
                    <div className="bg-white rounded-2xl p-12 text-center">
                        <span className="text-6xl mb-4 block">🔍</span>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <ProductModal
                    product={editingProduct}
                    categories={categories.filter(c => c !== 'all')}
                    onClose={() => setShowModal(false)}
                    onSave={handleSaveProduct}
                    showToast={showToast}
                />
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
                    ) : toast.type === 'error' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Product?</h3>
                            <p className="text-gray-500 mb-6">This action cannot be undone. The product will be permanently removed.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteProduct(deleteConfirm)}
                                    disabled={actionLoading}
                                    className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? (
                                        <>
                                            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                            </svg>
                                            <span>Deleting...</span>
                                        </>
                                    ) : (
                                        'Delete'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Product Add/Edit Modal Component with Image Upload, Rating & Preview
const ProductModal = ({ product, categories, onClose, onSave, showToast }) => {
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        name: product?.name || '',
        category: product?.category || categories[0],
        price: product?.price || '',
        stock: product?.stock || '',
        image: product?.image || null,
        imagePreview: product?.imagePreview || null,
        description: product?.description || '',
        rating: product?.rating || 4.5
    });
    const [errors, setErrors] = useState({});
    const [isDragging, setIsDragging] = useState(false);

    // Handle image file selection
    const handleImageChange = (file) => {
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ ...errors, image: 'Image must be less than 5MB' });
                return;
            }
            if (!file.type.startsWith('image/')) {
                setErrors({ ...errors, image: 'Please upload an image file' });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ 
                    ...formData, 
                    image: file, 
                    imagePreview: reader.result 
                });
                setErrors({ ...errors, image: null });
            };
            reader.readAsDataURL(file);
        }
    };

    // Drag and drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleImageChange(file);
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Product name is required';
        if (!formData.price || formData.price <= 0) newErrors.price = 'Enter a valid price';
        if (formData.stock === '' || formData.stock < 0) newErrors.stock = 'Enter a valid stock quantity';
        if (!formData.category) newErrors.category = 'Select a category';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            showToast?.('Please fix the errors in the form', 'error');
            return;
        }
        onSave({
            ...formData,
            price: Number(formData.price),
            stock: Number(formData.stock),
            rating: Number(formData.rating),
            status: formData.stock > 0 ? (formData.stock <= 10 ? 'low_stock' : 'active') : 'out_of_stock'
        });
    };

    // Get category emoji for preview
    const getCategoryEmoji = (category) => {
        const emojiMap = {
            'Cakes': '🎂',
            'Pastries': '🥐',
            'Breads': '🍞',
            'Cupcakes': '🧁',
            'Muffins': '🧁',
            'Cookies': '🍪'
        };
        return emojiMap[category] || '🍰';
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scale-in">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gold/10 to-transparent">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {product ? 'Edit Product' : 'Add New Product'}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Fill in the details below</p>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row max-h-[calc(90vh-120px)] overflow-y-auto">
                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-5 overflow-y-auto">
                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Image
                            </label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                                    isDragging 
                                        ? 'border-gold bg-gold/5' 
                                        : errors.image 
                                            ? 'border-red-300 bg-red-50'
                                            : 'border-gray-200 hover:border-gold hover:bg-gold/5'
                                }`}
                            >
                                {formData.imagePreview ? (
                                    <div className="relative">
                                        <img 
                                            src={formData.imagePreview} 
                                            alt="Preview" 
                                            className="max-h-40 mx-auto rounded-lg object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFormData({ ...formData, image: null, imagePreview: null });
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="text-4xl mb-2">📷</div>
                                        <p className="text-sm text-gray-600">
                                            <span className="text-gold font-medium">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 5MB</p>
                                    </>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e.target.files[0])}
                                    className="hidden"
                                />
                            </div>
                            {errors.image && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {errors.image}
                                </p>
                            )}
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Product Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors ${
                                    errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-gold'
                                }`}
                                placeholder="Enter product name"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                            )}
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category <span className="text-red-500">*</span>
                            </label>
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

                        {/* Price & Stock */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price (₹) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors ${
                                        errors.price ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-gold'
                                    }`}
                                    placeholder="0"
                                    min="0"
                                />
                                {errors.price && (
                                    <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Stock <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    value={formData.stock}
                                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none transition-colors ${
                                        errors.stock ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-gold'
                                    }`}
                                    placeholder="0"
                                    min="0"
                                />
                                {errors.stock && (
                                    <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
                                )}
                            </div>
                        </div>

                        {/* Rating */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rating
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating: star })}
                                            className="p-1 transition-transform hover:scale-110"
                                        >
                                            <svg 
                                                className={`w-6 h-6 ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-200'}`}
                                                fill="currentColor" 
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                                <input
                                    type="number"
                                    value={formData.rating}
                                    onChange={(e) => setFormData({ 
                                        ...formData, 
                                        rating: Math.min(5, Math.max(0, parseFloat(e.target.value) || 0))
                                    })}
                                    className="w-20 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-gold text-center"
                                    step="0.1"
                                    min="0"
                                    max="5"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-gold resize-none"
                                rows={3}
                                placeholder="Describe your delicious product..."
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2.5 bg-gold text-white rounded-xl font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {product ? 'Update Product' : 'Add Product'}
                            </button>
                        </div>
                    </form>

                    {/* Preview Section */}
                    <div className="lg:w-80 bg-gray-50 p-6 border-l border-gray-100">
                        <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Live Preview
                        </h4>
                        
                        {/* Product Card Preview */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                            <div className="relative h-32 bg-gradient-to-br from-cream to-white flex items-center justify-center">
                                {formData.imagePreview ? (
                                    <img 
                                        src={formData.imagePreview} 
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-5xl">{getCategoryEmoji(formData.category)}</div>
                                )}
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                                    <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-xs font-medium">{formData.rating}</span>
                                </div>
                            </div>
                            <div className="p-3">
                                <div className="flex items-start justify-between mb-1">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm">
                                            {formData.name || 'Product Name'}
                                        </h3>
                                        <p className="text-xs text-gray-500">{formData.category}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                        !formData.stock || formData.stock <= 0
                                            ? 'bg-red-100 text-red-700'
                                            : formData.stock <= 10
                                                ? 'bg-yellow-100 text-yellow-700'
                                                : 'bg-green-100 text-green-700'
                                    }`}>
                                        {!formData.stock || formData.stock <= 0 
                                            ? 'Out of Stock' 
                                            : formData.stock <= 10 
                                                ? 'Low Stock' 
                                                : 'In Stock'}
                                    </span>
                                </div>
                                {formData.description && (
                                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">{formData.description}</p>
                                )}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <div>
                                        <p className="text-sm font-bold text-gold">
                                            ₹{formData.price || 0}
                                        </p>
                                        <p className="text-xs text-gray-500">{formData.stock || 0} in stock</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="mt-4 p-3 bg-blue-50 rounded-xl">
                            <h5 className="text-xs font-semibold text-blue-800 mb-2">💡 Tips</h5>
                            <ul className="text-xs text-blue-600 space-y-1">
                                <li>• Use high-quality product images</li>
                                <li>• Write descriptive product names</li>
                                <li>• Set accurate stock levels</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
