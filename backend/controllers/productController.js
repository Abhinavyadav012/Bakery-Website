const Product = require('../models/Product');
const { ApiError, ApiResponse, asyncHandler, parsePagination, buildPaginationResponse, parseSort } = require('../utils');
const { validateProduct } = require('../validators');

const ALLOWED_SORT_FIELDS = ['name', 'price', 'createdAt', 'rating', 'soldCount', 'stock'];

/**
 * @desc    Get all products with filtering, sorting, pagination
 * @route   GET /api/products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
    const {
        category,
        search,
        minPrice,
        maxPrice,
        tag,
        tags,
        inStock,
        featured,
        sort = '-createdAt'
    } = req.query;

    const { page, limit, skip } = parsePagination(req.query);

    // Build query
    const query = { isAvailable: true };

    if (category) {
        query.category = category;
    }

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    if (tag) {
        query.tags = tag;
    }

    if (tags) {
        query.tags = { $in: tags.split(',') };
    }

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (inStock === 'true') {
        query.stock = { $gt: 0 };
    }

    if (featured === 'true') {
        query.isFeatured = true;
    }

    const sortObj = parseSort(sort, ALLOWED_SORT_FIELDS);

    const [products, total] = await Promise.all([
        Product.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(limit),
        Product.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: products,
        pagination: buildPaginationResponse(total, page, limit)
    });
});

/**
 * @desc    Get single product by ID or slug
 * @route   GET /api/products/:id
 * @access  Public
 */
const getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Try to find by ID first, then by slug
    let product = await Product.findById(id).catch(() => null);
    if (!product) {
        product = await Product.findOne({ slug: id, isAvailable: true });
    }

    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    // Increment view count (don't await, fire and forget)
    product.incrementViews().catch(() => {});

    res.json({
        success: true,
        data: product
    });
});

/**
 * @desc    Get products by category
 * @route   GET /api/products/category/:category
 * @access  Public
 */
const getProductsByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    const { page, limit, skip } = parsePagination(req.query);

    const query = { category, isAvailable: true };

    const [products, total] = await Promise.all([
        Product.find(query)
            .sort('-createdAt')
            .skip(skip)
            .limit(limit),
        Product.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: products,
        pagination: buildPaginationResponse(total, page, limit)
    });
});

/**
 * @desc    Get all categories
 * @route   GET /api/products/meta/categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Product.aggregate([
        { $match: { isAvailable: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ]);

    res.json({
        success: true,
        data: categories.map(c => ({ name: c._id, count: c.count }))
    });
});

/**
 * @desc    Get featured products
 * @route   GET /api/products/featured
 * @access  Public
 */
const getFeaturedProducts = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.findFeatured(limit);

    res.json({
        success: true,
        data: products
    });
});

/**
 * @desc    Get bestseller products
 * @route   GET /api/products/bestsellers
 * @access  Public
 */
const getBestsellers = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.findBestsellers(limit);

    res.json({
        success: true,
        data: products
    });
});

/**
 * @desc    Search products
 * @route   GET /api/products/search
 * @access  Public
 */
const searchProducts = asyncHandler(async (req, res) => {
    const { q } = req.query;
    const { page, limit } = parsePagination(req.query);

    if (!q || q.trim().length < 2) {
        throw ApiError.badRequest('Search query must be at least 2 characters');
    }

    const products = await Product.searchProducts(q, { page, limit });
    const total = await Product.countDocuments({
        $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } }
        ],
        isAvailable: true
    });

    res.json({
        success: true,
        data: products,
        pagination: buildPaginationResponse(total, page, limit)
    });
});

/**
 * @desc    Create product
 * @route   POST /api/products
 * @access  Private/Admin
 */
const createProduct = asyncHandler(async (req, res) => {
    const validation = validateProduct(req.body);
    if (!validation.isValid) {
        throw ApiError.badRequest('Validation failed', validation.errors);
    }

    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product
    });
});

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
const updateProduct = asyncHandler(async (req, res) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    const validation = validateProduct({ ...product.toObject(), ...req.body });
    if (!validation.isValid) {
        throw ApiError.badRequest('Validation failed', validation.errors);
    }

    product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        message: 'Product updated successfully',
        data: product
    });
});

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    await product.deleteOne();

    res.json({
        success: true,
        message: 'Product deleted successfully'
    });
});

/**
 * @desc    Update product stock
 * @route   PATCH /api/products/:id/stock
 * @access  Private/Admin
 */
const updateStock = asyncHandler(async (req, res) => {
    const { stock } = req.body;

    if (stock === undefined || stock < 0) {
        throw ApiError.badRequest('Valid stock quantity is required');
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        { stock, isAvailable: stock > 0 },
        { new: true }
    );

    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    res.json({
        success: true,
        message: 'Stock updated successfully',
        data: { id: product._id, stock: product.stock, isAvailable: product.isAvailable }
    });
});

/**
 * @desc    Add product review
 * @route   POST /api/products/:id/reviews
 * @access  Private
 */
const addReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
        throw ApiError.badRequest('Rating must be between 1 and 5');
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
        throw ApiError.notFound('Product not found');
    }

    // Check if user already reviewed
    const existingReview = product.reviews.find(
        r => r.user.toString() === (req.user._id || req.user.id).toString()
    );

    if (existingReview) {
        throw ApiError.conflict('You have already reviewed this product');
    }

    product.reviews.push({
        user: req.user._id || req.user.id,
        rating,
        comment,
        isVerifiedPurchase: false // TODO: Check order history
    });

    await product.updateRating();

    res.status(201).json({
        success: true,
        message: 'Review added successfully',
        data: {
            rating: product.rating,
            numReviews: product.numReviews
        }
    });
});

/**
 * @desc    Get product stats (Admin)
 * @route   GET /api/products/stats
 * @access  Private/Admin
 */
const getProductStats = asyncHandler(async (req, res) => {
    const stats = await Product.aggregate([
        {
            $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                totalStock: { $sum: '$stock' },
                avgPrice: { $avg: '$price' },
                avgRating: { $avg: '$rating' },
                outOfStock: { $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] } },
                lowStock: { $sum: { $cond: [{ $lte: ['$stock', '$lowStockThreshold'] }, 1, 0] } }
            }
        }
    ]);

    const categoryStats = await Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
        { $sort: { count: -1 } }
    ]);

    res.json({
        success: true,
        data: {
            overview: stats[0] || {},
            byCategory: categoryStats
        }
    });
});

module.exports = {
    getProducts,
    getProduct,
    getProductsByCategory,
    getCategories,
    getFeaturedProducts,
    getBestsellers,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    addReview,
    getProductStats
};
