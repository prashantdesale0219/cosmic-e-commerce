const Review = require('../../models/review/review');
const Product = require('../../models/products/product');
const User = require('../../models/auth/auth');

/**
 * Get all reviews for admin
 */
exports.getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, productId } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;
    if (productId) query.productId = productId;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find reviews
    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: 'userId',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'productId',
        select: 'name'
      });
    
    // Format reviews for response
    const formattedReviews = reviews.map(review => {
      return {
        _id: review._id,
        productId: review.productId?._id || review.productId,
        productName: review.productId?.name || 'Unknown Product',
        userId: review.userId?._id || review.userId,
        userName: review.userId ? `${review.userId.firstName} ${review.userId.lastName}` : 'Anonymous',
        rating: review.rating,
        comment: review.comment,
        status: review.status || 'pending',
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      };
    });
    
    // Count total reviews for pagination
    const totalReviews = await Review.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: formattedReviews,
      pagination: {
        totalPages: Math.ceil(totalReviews / parseInt(limit)),
        currentPage: parseInt(page),
        totalReviews
      }
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message
    });
  }
};

/**
 * Get review by ID
 */
exports.getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findById(id)
      .populate({
        path: 'userId',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'productId',
        select: 'name'
      });
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review',
      error: error.message
    });
  }
};

/**
 * Approve a review
 */
exports.approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    review.status = 'approved';
    await review.save();
    
    // Update product average rating
    await updateProductAverageRating(review.productId);
    
    res.status(200).json({
      success: true,
      message: 'Review approved successfully',
      data: review
    });
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve review',
      error: error.message
    });
  }
};

/**
 * Reject a review
 */
exports.rejectReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    review.status = 'rejected';
    await review.save();
    
    // Update product average rating (exclude rejected reviews)
    await updateProductAverageRating(review.productId);
    
    res.status(200).json({
      success: true,
      message: 'Review rejected successfully',
      data: review
    });
  } catch (error) {
    console.error('Error rejecting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject review',
      error: error.message
    });
  }
};

/**
 * Delete a review (admin)
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Delete review
    await Review.findByIdAndDelete(id);
    
    // Update product average rating
    await updateProductAverageRating(review.productId);
    
    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message
    });
  }
};

/**
 * Helper function to update product average rating
 */
const updateProductAverageRating = async (productId) => {
  // Only count approved reviews for average rating
  const reviews = await Review.find({ 
    productId,
    status: 'approved'
  });
  
  if (reviews.length === 0) {
    // No approved reviews, reset rating to 0
    await Product.findByIdAndUpdate(productId, { 
      averageRating: 0,
      reviewCount: 0
    });
    return;
  }
  
  // Calculate average rating
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  
  // Update product
  await Product.findByIdAndUpdate(productId, { 
    averageRating: parseFloat(averageRating.toFixed(1)),
    reviewCount: reviews.length
  });
};