const express = require('express');
const router = express.Router();
const { addReview, getProductReviews, deleteReview } = require('../controllers/review/reviewController');
const adminReviewController = require('../controllers/review/adminReviewController');
const { protect, authorize } = require('../middleware/auth');

// User routes
// Add review - requires authentication
router.post('/', protect, addReview);

// Get all reviews for a product - public
router.get('/:productId', getProductReviews);

// Delete review - requires authentication
router.delete('/:id', protect, deleteReview);

// Admin routes
// Get all reviews for admin
router.get('/admin/all', protect, authorize('admin'), adminReviewController.getAllReviews);

// Get review by ID
router.get('/admin/:id', protect, authorize('admin'), adminReviewController.getReviewById);

// Approve review
router.put('/admin/:id/approve', protect, authorize('admin'), adminReviewController.approveReview);

// Reject review
router.put('/admin/:id/reject', protect, authorize('admin'), adminReviewController.rejectReview);

// Delete review (admin)
router.delete('/admin/:id', protect, authorize('admin'), adminReviewController.deleteReview);

module.exports = router;