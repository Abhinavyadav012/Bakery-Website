const User = require('../models/User');
const Order = require('../models/Order');
const { ApiError, asyncHandler, parsePagination, buildPaginationResponse, parseSort, USER_ROLES } = require('../utils');

const ALLOWED_SORT_FIELDS = ['firstName', 'lastName', 'email', 'createdAt', 'rewards', 'role'];

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getUsers = asyncHandler(async (req, res) => {
    const { search, role, isActive, sort = '-createdAt' } = req.query;
    const { page, limit, skip } = parsePagination(req.query);

    // Build query
    const query = {};

    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    if (role) {
        query.role = role;
    }

    if (isActive !== undefined) {
        query.isActive = isActive === 'true';
    }

    const sortObj = parseSort(sort, ALLOWED_SORT_FIELDS);

    const [users, total] = await Promise.all([
        User.find(query)
            .select('-password -emailVerificationToken -passwordResetToken')
            .sort(sortObj)
            .skip(skip)
            .limit(limit),
        User.countDocuments(query)
    ]);

    res.json({
        success: true,
        data: users,
        pagination: buildPaginationResponse(total, page, limit)
    });
});

/**
 * @desc    Get single user
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .select('-password -emailVerificationToken -passwordResetToken');

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    // Get user's order count and total spent
    const orderStats = await Order.aggregate([
        { $match: { user: user._id } },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalSpent: { $sum: { $cond: ['$isPaid', '$totalPrice', 0] } }
            }
        }
    ]);

    res.json({
        success: true,
        data: {
            ...user.toPublicJSON(),
            stats: orderStats[0] || { totalOrders: 0, totalSpent: 0 }
        }
    });
});

/**
 * @desc    Create user (Admin)
 * @route   POST /api/users
 * @access  Private/Admin
 */
const createUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, phone, password, role } = req.body;

    // Check if email exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
        throw ApiError.conflict('Email already in use');
    }

    const user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        role: role || USER_ROLES.CUSTOMER
    });

    res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user.toPublicJSON()
    });
});

/**
 * @desc    Update user (Admin)
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, phone, role, isActive, rewards } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
        throw ApiError.notFound('User not found');
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (role && Object.values(USER_ROLES).includes(role)) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (rewards !== undefined) user.rewards = Math.max(0, rewards);

    await user.save();

    res.json({
        success: true,
        message: 'User updated successfully',
        data: user.toPublicJSON()
    });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    // Prevent deleting admin users
    if (user.role === USER_ROLES.ADMIN) {
        throw ApiError.forbidden('Cannot delete admin users');
    }

    // Soft delete - just deactivate
    user.isActive = false;
    await user.save();

    res.json({
        success: true,
        message: 'User deactivated successfully'
    });
});

/**
 * @desc    Update user role
 * @route   PATCH /api/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = asyncHandler(async (req, res) => {
    const { role } = req.body;

    if (!role || !Object.values(USER_ROLES).includes(role)) {
        throw ApiError.badRequest('Invalid role');
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
    );

    if (!user) {
        throw ApiError.notFound('User not found');
    }

    res.json({
        success: true,
        message: 'User role updated successfully',
        data: { id: user._id, role: user.role }
    });
});

/**
 * @desc    Get user's orders
 * @route   GET /api/users/:id/orders
 * @access  Private/Admin
 */
const getUserOrders = asyncHandler(async (req, res) => {
    const { page, limit, skip } = parsePagination(req.query);

    const [orders, total] = await Promise.all([
        Order.find({ user: req.params.id })
            .sort('-createdAt')
            .skip(skip)
            .limit(limit),
        Order.countDocuments({ user: req.params.id })
    ]);

    res.json({
        success: true,
        data: orders,
        pagination: buildPaginationResponse(total, page, limit)
    });
});

/**
 * @desc    Adjust user rewards
 * @route   PATCH /api/users/:id/rewards
 * @access  Private/Admin
 */
const adjustRewards = asyncHandler(async (req, res) => {
    const { amount, reason } = req.body;

    if (amount === undefined || typeof amount !== 'number') {
        throw ApiError.badRequest('Amount is required and must be a number');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        throw ApiError.notFound('User not found');
    }

    const newRewards = Math.max(0, user.rewards + amount);
    user.rewards = newRewards;
    await user.save();

    res.json({
        success: true,
        message: `Rewards ${amount >= 0 ? 'added' : 'deducted'} successfully`,
        data: {
            id: user._id,
            previousRewards: user.rewards - amount,
            adjustment: amount,
            currentRewards: newRewards,
            reason
        }
    });
});

/**
 * @desc    Get user statistics
 * @route   GET /api/users/stats
 * @access  Private/Admin
 */
const getUserStats = asyncHandler(async (req, res) => {
    const stats = await User.aggregate([
        {
            $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
                customers: { $sum: { $cond: [{ $eq: ['$role', 'customer'] }, 1, 0] } },
                admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
                totalRewards: { $sum: '$rewards' },
                avgRewards: { $avg: '$rewards' }
            }
        }
    ]);

    // New users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newUsersThisMonth = await User.countDocuments({
        createdAt: { $gte: startOfMonth }
    });

    // Users by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const usersByMonth = await User.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' }
                },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
        success: true,
        data: {
            overview: {
                ...stats[0],
                newUsersThisMonth
            },
            usersByMonth
        }
    });
});

module.exports = {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    updateUserRole,
    getUserOrders,
    adjustRewards,
    getUserStats
};
