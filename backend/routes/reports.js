const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getOrdersReport,
    getInventoryReport,
    getCustomersReport,
    getCouponsReport,
    getNewsletterReport
} = require('../controllers/reports/reportsController');

// All reports routes are protected for admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/ordersReports', getOrdersReport);
router.get('/inventoryReports', getInventoryReport);
router.get('/customersReports', getCustomersReport);
router.get('/couponsReports', getCouponsReport);
router.get('/newsletterReports', getNewsletterReport);

module.exports = router;