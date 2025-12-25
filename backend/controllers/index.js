/**
 * Controllers barrel export
 */
const authController = require('./authController');
const productController = require('./productController');
const userController = require('./userController');
const orderController = require('./orderController');
const paymentController = require('./paymentController');

module.exports = {
    authController,
    productController,
    userController,
    orderController,
    paymentController
};
