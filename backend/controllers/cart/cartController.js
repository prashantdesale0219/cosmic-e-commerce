const Cart = require('../../models/cart/cart');
const Product = require('../../models/products/product');

/**
 * Get current user's cart
 */
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find cart and populate product details
    let cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      select: 'name description images'
    });
    
    // If no cart exists yet, return empty cart
    if (!cart) {
      return res.status(200).json({ 
        success: true, 
        data: { items: [], totalPrice: 0 } 
      });
    }
    
    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
};

/**
 * Add product to cart
 */
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;
    
    // Validate quantity
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }
    
    // Check if product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough stock. Only ${product.stock} available.`
      });
    }
    
    // Find user's cart or create new one
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      // Create new cart if it doesn't exist
      cart = new Cart({
        userId,
        items: [{
          productId,
          quantity,
          price: product.price
        }],
        totalPrice: product.price * quantity
      });
    } else {
      // Check if product already in cart
      const existingItemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId
      );
      
      if (existingItemIndex > -1) {
        // Update quantity if product already in cart
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item to cart
        cart.items.push({
          productId,
          quantity,
          price: product.price
        });
      }
      
      // Recalculate total price
      cart.totalPrice = cart.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    }
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Product added to cart',
      data: cart
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to cart',
      error: error.message
    });
  }
};

/**
 * Update cart item quantity
 */
exports.updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;
    
    // Validate quantity
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1'
      });
    }
    
    // Find user's cart
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Find the item in the cart
    const cartItem = cart.items.id(itemId);
    
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }
    
    // Check product stock
    const product = await Product.findById(cartItem.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product no longer exists'
      });
    }
    
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Not enough stock. Only ${product.stock} available.`
      });
    }
    
    // Update quantity
    cartItem.quantity = quantity;
    
    // Recalculate total price
    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      data: cart
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cart',
      error: error.message
    });
  }
};

/**
 * Remove item from cart
 */
exports.removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user.id;
    
    // Find user's cart
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Remove the item from cart
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    
    // Recalculate total price
    cart.totalPrice = cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove item from cart',
      error: error.message
    });
  }
};

/**
 * Clear cart
 */
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find and update cart
    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }
    
    // Clear items and reset total price
    cart.items = [];
    cart.totalPrice = 0;
    
    await cart.save();
    
    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cart',
      error: error.message
    });
  }
};