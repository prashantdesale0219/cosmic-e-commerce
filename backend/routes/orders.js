const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orders/orderController');
const { protect } = require('../middleware/auth');

// All order routes require authentication
router.use(protect);

// Customer routes
router.post('/', orderController.placeOrder);
router.get('/', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);

module.exports = router;