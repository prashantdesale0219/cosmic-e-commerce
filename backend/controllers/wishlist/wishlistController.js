const Wishlist = require('../../models/wishlist/wishlist');
const Product = require('../../models/products/product');

/**
 * Add product to wishlist
 */
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Find user's wishlist or create new one
    let wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        userId,
        products: [productId]
      });
    } else {
      // Check if product already in wishlist
      if (wishlist.products.includes(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Product already in wishlist'
        });
      }
      
      // Add product to wishlist
      wishlist.products.push(productId);
    }
    
    await wishlist.save();
    
    res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
      data: wishlist
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist',
      error: error.message
    });
  }
};

/**
 * Remove product from wishlist
 */
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    
    // Find user's wishlist
    const wishlist = await Wishlist.findOne({ userId });
    
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }
    
    // Check if product in wishlist
    if (!wishlist.products.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product not in wishlist'
      });
    }
    
    // Remove product from wishlist
    wishlist.products = wishlist.products.filter(
      id => id.toString() !== productId
    );
    
    await wishlist.save();
    
    res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
      data: wishlist
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist',
      error: error.message
    });
  }
};

/**
 * Get user's wishlist
 */
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find user's wishlist
    const wishlist = await Wishlist.findOne({ userId }).populate({
      path: 'products',
      select: 'name description price images stock'
    });
    
    if (!wishlist) {
      // Return empty wishlist if not found
      return res.status(200).json({
        success: true,
        data: {
          userId,
          products: []
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: wishlist
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: error.message
    });
  }
};