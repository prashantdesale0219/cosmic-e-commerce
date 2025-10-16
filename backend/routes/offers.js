const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const offerController = require('../controllers/offers/offerController');

router.post('/', protect, authorize('admin'), offerController.createOffer);
router.put('/:id', protect, authorize('admin'), offerController.updateOffer);
router.delete('/:id', protect, authorize('admin'), offerController.deleteOffer);
router.get('/', offerController.getOffers);
router.get('/product/:productId', offerController.getProductOffers);
router.get('/:id', offerController.getOffer);

module.exports = router;