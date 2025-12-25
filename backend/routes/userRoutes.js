const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    updateUserRole,
    getUserOrders,
    adjustRewards,
    getUserStats
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes require admin access
router.use(protect, admin);

// Stats route (before :id to avoid conflict)
router.get('/stats', getUserStats);

// CRUD routes
router.route('/')
    .get(getUsers)
    .post(createUser);

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

// Special routes
router.patch('/:id/role', updateUserRole);
router.patch('/:id/rewards', adjustRewards);
router.get('/:id/orders', getUserOrders);

module.exports = router;
