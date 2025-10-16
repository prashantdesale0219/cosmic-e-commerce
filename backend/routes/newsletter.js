const express = require('express');
const router = express.Router();
const { subscribe, unsubscribe, getAllSubscribers, getActiveSubscribers, deleteSubscriber } = require('../controllers/newsletter/newsletterController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/subscribe', subscribe);
router.post('/unsubscribe', unsubscribe);

// Admin routes - protected with authentication and admin role
router.get('/admin/subscribers', protect, authorize('admin'), getAllSubscribers);
router.get('/admin/subscribers/active', protect, authorize('admin'), getActiveSubscribers);
router.delete('/admin/subscribers/:id', protect, authorize('admin'), deleteSubscriber);

module.exports = router;