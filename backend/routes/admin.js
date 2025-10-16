const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../utils/multerConfig');

// Import controllers - Using only admin controllers for consistency
const userManagementController = require('../controllers/admin/userManagementController');
const productManagementController = require('../controllers/admin/productManagementController');
const orderManagementController = require('../controllers/admin/orderManagementController');
const dashboardController = require('../controllers/admin/dashboardController');
const notificationController = require('../controllers/notifications/notificationController');
const categoryController = require('../controllers/category/categoryController');
const couponController = require('../controllers/coupon/couponController');
const offerController = require('../controllers/offers/offerController');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// User Management Routes
router.get('/users', userManagementController.getAllUsers);
router.post('/users/create', userManagementController.createUser);
router.post('/users/verify-otp', userManagementController.verifyUserOtp);
router.post('/users/complete-profile', userManagementController.completeUserProfile);
router.get('/users/stats', userManagementController.getUserStats);
router.get('/user-stats', userManagementController.getUserStats); // Keep for backward compatibility
router.get('/users/:id', userManagementController.getUserById);
router.put('/users/:id', userManagementController.updateUser);
router.delete('/users/:id', userManagementController.deleteUser);
router.put('/users/:id/status', userManagementController.toggleUserStatus);

// Product Management Routes
router.get('/products', productManagementController.getAllProducts);
router.get('/products/:id', productManagementController.getProductById);
router.post('/products', upload.array('images', 10), productManagementController.createProduct);
router.put('/products/:id', upload.array('images', 10), productManagementController.updateProduct);
router.delete('/products/:id', productManagementController.deleteProduct);
router.put('/products/:id/stock', productManagementController.updateStock);
router.put('/products/:id/featured', productManagementController.toggleFeaturedStatus);
router.put('/products/:id/status', productManagementController.toggleActiveStatus);
router.get('/product-stats', productManagementController.getProductStats);
// Fix the export route - it needs to come before the :id route to avoid conflict
router.get('/products-export', productManagementController.exportProducts);
// Documentation routes
router.post('/products/:id/documentation', upload.single('file'), productManagementController.uploadDocumentation);
router.get('/products/:id/documentation', productManagementController.downloadDocumentation);

// Category Routes
router.get('/categories', categoryController.getCategories);
router.get('/categories/:id', categoryController.getCategory);
router.post('/categories', upload.single('image'), categoryController.createCategory);
router.put('/categories/:id', upload.single('image'), categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);
router.get('/main-categories', (req, res) => {
  req.query.mainOnly = 'true';
  categoryController.getCategories(req, res);
});
router.get('/subcategories/:parentId', (req, res) => {
  req.query.parent = req.params.parentId;
  categoryController.getCategories(req, res);
});

// Order Management Routes
router.get('/orders', orderManagementController.getAllOrders);
router.get('/orders/:id', orderManagementController.getOrderById);
router.put('/orders/:id/status', orderManagementController.updateOrderStatus);
router.delete('/orders/:id', orderManagementController.deleteOrder);
router.get('/orders/stats', orderManagementController.getOrderStats);
router.get('/orders/export', orderManagementController.exportOrders);

// Notification Routes
router.get('/notifications', notificationController.getUserNotifications);
router.put('/notifications/:id/read', notificationController.markAsRead);
router.put('/notifications/read-all', notificationController.markAllAsRead);
router.delete('/notifications/:id', notificationController.deleteNotification);

// Coupon Management Routes
router.get('/coupons', couponController.getAllCoupons);
router.post('/coupons', couponController.createCoupon);
router.get('/coupons/:id', couponController.getCoupon);
router.put('/coupons/:id', couponController.updateCoupon);
router.delete('/coupons/:id', couponController.deleteCoupon);
router.post('/coupons/validate', couponController.validateCoupon);
router.post('/coupons/apply', couponController.applyCoupon);
router.get('/coupons/stats', couponController.getCouponStats);

// Offer Management Routes
router.get('/offers/stats', offerController.getOfferStats);
router.get('/offers/product/:productId', offerController.getProductOffers);
router.get('/offers', offerController.getOffers);
router.post('/offers', offerController.createOffer);
router.get('/offers/:id', offerController.getOffer);
router.put('/offers/:id', offerController.updateOffer);
router.delete('/offers/:id', offerController.deleteOffer);

// Dashboard Routes
router.get('/dashboard/stats', dashboardController.getDashboardStats);

// Activity Logs Routes
router.get('/activity-logs', notificationController.getActivityLogs);
router.get('/error-logs', notificationController.getErrorLogs);

module.exports = router;