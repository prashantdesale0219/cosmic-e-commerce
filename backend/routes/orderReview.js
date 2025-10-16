const express = require('express');
const router = express.Router();
const orderReviewController = require('../controllers/orders/orderReviewController');
const { protect, authorize } = require('../middleware/auth');

// Customer routes
router.post('/review', protect, orderReviewController.sendOrderForReview);
router.post('/:id/confirm', protect, orderReviewController.confirmOrder);
router.post('/:id/cancel-request', protect, orderReviewController.cancelOrderRequest);

// Public routes for customer confirmation via email
router.post('/customer-confirm/:orderId/:token', orderReviewController.confirmOrderByCustomer);
router.get('/customer-confirm/:orderId/:token', orderReviewController.confirmOrderByCustomer); // Adding GET method support
// Additional routes with order-review prefix to match frontend API calls
router.post('/order-review/customer-confirm/:orderId/:token', orderReviewController.confirmOrderByCustomer);
router.get('/order-review/customer-confirm/:orderId/:token', orderReviewController.confirmOrderByCustomer);
router.post('/customer-cancel/:orderId/:token', orderReviewController.cancelOrderByCustomer);
router.get('/customer-cancel/:orderId/:token', orderReviewController.cancelOrderByCustomer); // Adding GET method support
router.post('/order-review/customer-cancel/:orderId/:token', orderReviewController.cancelOrderByCustomer);
router.get('/order-review/customer-cancel/:orderId/:token', orderReviewController.cancelOrderByCustomer);

// Admin routes
router.put('/:id/set-shipping', protect, authorize('admin'), orderReviewController.setShippingAndFinalPrice);

module.exports = router;