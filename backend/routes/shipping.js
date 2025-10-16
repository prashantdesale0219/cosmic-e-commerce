const express = require('express');
const router = express.Router();
const { 
  submitShippingAddress,
  addShippingCharges,
  confirmOrder,
  cancelOrder,
  getPendingAdminReviewOrders,
  getWaitingConfirmationOrders
} = require('../controllers/orders/shippingController');
const { protect, authorize } = require('../middleware/auth');

// Customer routes
router.post('/submit', protect, submitShippingAddress);
router.put('/confirm/:orderId', protect, confirmOrder);
router.put('/cancel/:orderId', protect, cancelOrder);

// Admin routes
router.put('/charges/:orderId', protect, authorize('admin'), addShippingCharges);
router.get('/pending-review', protect, authorize('admin'), getPendingAdminReviewOrders);
router.get('/waiting-confirmation', protect, authorize('admin'), getWaitingConfirmationOrders);

module.exports = router;