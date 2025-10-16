const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    adjustInventory,
    getInventoryLogs,
    getInventoryLog,
    getInventorySummary
} = require('../controllers/inventory/inventoryController');

// All inventory routes are protected for admin only
router.use(protect);
router.use(authorize('admin'));

// Create admin prefix for all routes
const adminRouter = express.Router();

adminRouter.post('/adjust', adjustInventory);
adminRouter.get('/logs', getInventoryLogs);
adminRouter.get('/logs/:id', getInventoryLog);
adminRouter.get('/summary', getInventorySummary);

// Mount admin routes
router.use('/admin', adminRouter);

module.exports = router;