const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    createCoupon,
    getAllCoupons,
    getCoupon,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
    applyCoupon,
    getCouponStats
} = require('../controllers/coupon/couponController');

// Import user coupon controller
const userCouponController = require('../controllers/coupon/userCouponController');

// Public routes
router.post('/validate', validateCoupon);
router.post('/apply', applyCoupon);
// Admin routes
router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(getAllCoupons)
    .post(createCoupon);

router.route('/:id')
    .get(getCoupon)
    .put(updateCoupon)
    .delete(deleteCoupon);


router.get('/stats', getCouponStats);

// User coupon routes
router.post('/generate-and-send', protect, authorize('admin'), userCouponController.generateAndSendCoupon);
router.get('/users-for-coupon', protect, authorize('admin'), userCouponController.getUsersForCoupon);

// Generate and send coupons to selected users
router.post('/generate-for-users', protect, authorize('admin'), require('../controllers/coupon/couponController').generateCouponForUsers);

module.exports = router;