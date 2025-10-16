const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orders/orderController');
const { protect, authorize } = require('../middleware/auth');
const shippingController = require('../controllers/orders/shippingController');

// All order routes require authentication
router.use(protect);

// Customer routes
router.post('/', orderController.placeOrder);
router.get('/', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);

// Admin routes for order review and shipping
router.put('/:id/shipping-price', protect, authorize('admin'), shippingController.addShippingCharges);

module.exports = router;