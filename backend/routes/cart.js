const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cart/cartController');
const { protect } = require('../middleware/auth');

// All cart routes require authentication
router.use(protect);

// Cart routes
router.get('/', cartController.getCart);
router.post('/', cartController.addToCart);
router.put('/:itemId', cartController.updateCartItem);
router.delete('/:itemId', cartController.removeCartItem);
router.delete('/', cartController.clearCart);

module.exports = router;