const asyncHandler = require('express-async-handler');
const Order = require('../../models/orders/order');
const Cart = require('../../models/cart/cart');
const Wishlist = require('../../models/wishlist/wishlist');
const User = require('../../models/auth/auth');

/**
 * @desc    Get user statistics (orders, cart, wishlist counts)
 * @route   GET /api/auth/user-stats
 * @access  Private
 */
exports.getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Get user data
  const userData = await User.findById(userId).select('-password');
  
  // Get counts from different collections
  const ordersCount = await Order.countDocuments({ user: userId });
  const cartItems = await Cart.findOne({ user: userId });
  const cartCount = cartItems ? cartItems.items.length : 0;
  const wishlistItems = await Wishlist.findOne({ user: userId });
  const wishlistCount = wishlistItems ? wishlistItems.products.length : 0;

  res.status(200).json({
    success: true,
    orders: ordersCount,
    cart: cartCount,
    wishlist: wishlistCount,
    ...userData._doc
  });
});