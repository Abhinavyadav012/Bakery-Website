/**
 * Routes barrel export
 */
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const paymentRoutes = require('./paymentRoutes');
const userRoutes = require('./userRoutes');

module.exports = {
    authRoutes,
    productRoutes,
    orderRoutes,
    paymentRoutes,
    userRoutes
};
