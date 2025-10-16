const express = require('express');
const router = express.Router();
const productController = require('../controllers/products/productController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.get('/:id/details', productController.getProductDetails);
router.get('/:id/related', productController.getRelatedProducts);
router.get('/:id/rating-summary', productController.getProductRatingSummary);
router.get('/tags/:tag', productController.getProductsByTag);
router.get('/applications/list', productController.getProductApplications);

// Customer routes (protected)
router.get('/customer/recent', protect, productController.getRecentlyViewedProducts);
router.get('/customer/recommended', protect, productController.getRecommendedProducts);

module.exports = router;