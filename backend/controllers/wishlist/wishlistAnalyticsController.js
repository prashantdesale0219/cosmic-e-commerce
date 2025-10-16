const Wishlist = require('../../models/wishlist/wishlist');
const Product = require('../../models/products/product');

/**
 * Get wishlist analytics data for admin dashboard
 */
exports.getWishlistAnalytics = async (req, res) => {
  try {
    // Get all wishlists with populated product data
    const wishlists = await Wishlist.find()
      .populate({
        path: 'products',
        select: 'name price category',
        populate: {
          path: 'category',
          select: 'name'
        }
      })
      .populate({
        path: 'userId',
        select: 'name email'
      });

    // Transform data for analytics
    const analyticsData = [];
    
    // Process each wishlist
    wishlists.forEach(wishlist => {
      const userId = wishlist.userId?._id || wishlist.userId;
      const userName = wishlist.userId?.name || 'Unknown User';
      
      // Process each product in the wishlist
      wishlist.products.forEach(product => {
        if (product) {
          analyticsData.push({
            userId: userId,
            userName: userName,
            productId: product._id,
            productName: product.name,
            price: product.price,
            categoryId: product.category?._id,
            categoryName: product.category?.name || 'Uncategorized'
          });
        }
      });
    });

    // Calculate summary statistics
    const uniqueUsers = new Set(analyticsData.map(item => item.userId.toString())).size;
    const uniqueProducts = new Set(analyticsData.map(item => item.productId.toString())).size;
    const uniqueCategories = new Set(analyticsData.map(item => item.categoryId?.toString()).filter(Boolean)).size;

    const summary = {
      totalWishlists: wishlists.length,
      totalWishlistedProducts: analyticsData.length,
      uniqueUsers,
      uniqueProducts,
      uniqueCategories
    };

    res.status(200).json({
      success: true,
      summary,
      data: analyticsData
    });
  } catch (error) {
    console.error('Error fetching wishlist analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist analytics',
      error: error.message
    });
  }
};