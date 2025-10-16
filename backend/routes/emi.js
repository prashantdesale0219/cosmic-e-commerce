const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const emiController = require('../controllers/emi/emiController');
const emiOptionsController = require('../controllers/emi/emiOptionsController');

// Admin routes (protected)
router.post('/', protect, authorize('admin'), emiController.createEMI);
router.put('/:id', protect, authorize('admin'), emiController.updateEMI);
router.delete('/:id', protect, authorize('admin'), emiController.deleteEMI);
router.get('/', protect, authorize('admin'), emiController.getEMIs);

// EMI Options routes (protected)
router.get('/options', protect, authorize('admin'), emiOptionsController.getEmiOptions);
router.post('/options', protect, authorize('admin'), emiOptionsController.createEmiOption);
router.get('/options/:id', protect, authorize('admin'), emiOptionsController.getEmiOption);
router.put('/options/:id', protect, authorize('admin'), emiOptionsController.updateEmiOption);
router.delete('/options/:id', protect, authorize('admin'), emiOptionsController.deleteEmiOption);

// Public routes
router.get('/product/:productId', emiController.getProductEMIs);
router.get('/:id', emiController.getEMI);

module.exports = router;