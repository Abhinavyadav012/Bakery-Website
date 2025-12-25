const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            category,
            search,
            minPrice,
            maxPrice,
            tag,
            sort = '-createdAt',
            page = 1,
            limit = 20
        } = req.query;

        // Build query
        const query = { isAvailable: true };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$text = { $search: search };
        }

        if (tag) {
            query.tags = tag;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const products = await Product.find(query)
            .sort(sort)
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            count: products.length,
            total,
            pages: Math.ceil(total / Number(limit)),
            currentPage: Number(page),
            products
        });

    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            product
        });

    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
            error: error.message
        });
    }
});

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public
router.get('/category/:category', async (req, res) => {
    try {
        const products = await Product.find({
            category: req.params.category,
            isAvailable: true
        }).sort('-createdAt');

        res.json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        console.error('Get products by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
});

// @desc    Get all categories
// @route   GET /api/products/categories/all
// @access  Public
router.get('/categories/all', async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        res.json({
            success: true,
            categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories'
        });
    }
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            product
        });

    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message
        });
    }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });

    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message
        });
    }
});

// @desc    Seed products (Development only)
// @route   POST /api/products/seed
// @access  Private/Admin
router.post('/seed', protect, admin, async (req, res) => {
    try {
        const products = [
            { name: 'Classic Chocolate Cake', price: 599, category: 'Cakes', tags: ['bestseller'], rating: 4.9, reviews: 234, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400' },
            { name: 'Red Velvet Dream', price: 699, category: 'Cakes', tags: ['new'], rating: 4.8, reviews: 156, image: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=400' },
            { name: 'Sourdough Bread', price: 149, category: 'Breads', tags: ['bestseller'], rating: 4.7, reviews: 312, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
            { name: 'French Croissant', price: 89, category: 'Pastries', tags: ['bestseller'], rating: 4.9, reviews: 445, image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400' },
            { name: 'Chocolate Chip Cookies', price: 199, originalPrice: 249, category: 'Cookies', tags: ['sale', 'bestseller'], rating: 4.8, reviews: 523, image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400' },
            { name: 'Glazed Donuts', price: 49, category: 'Donuts', rating: 4.6, reviews: 287, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400' },
            { name: 'Apple Pie', price: 449, category: 'Pies', tags: ['new'], rating: 4.7, reviews: 178, image: 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=400' },
            { name: 'Vanilla Cupcakes', price: 79, category: 'Cupcakes', rating: 4.5, reviews: 234, image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=400' }
        ];

        await Product.deleteMany({});
        const createdProducts = await Product.insertMany(products);

        res.json({
            success: true,
            message: 'Products seeded successfully',
            count: createdProducts.length
        });

    } catch (error) {
        console.error('Seed products error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to seed products',
            error: error.message
        });
    }
});

module.exports = router;
