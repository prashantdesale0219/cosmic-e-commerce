const Review = require('../../models/review/review');
const Product = require('../../models/products/product');
const Order = require('../../models/orders/order');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for review image uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads/reviews');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
}).array('images', 5); // Allow up to 5 images

/**
 * Add a new review for a product
 */
exports.addReview = async (req, res) => {
  try {
    upload(req, res, async function(err) {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      
      const { productId, rating, title, comment } = req.body;
      const userId = req.user.id;

      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Verify user has purchased the product
      const hasPurchased = await Order.findOne({
        userId,
        'items.productId': productId,
        orderStatus: 'delivered'
      });

      // Set verification status based on purchase history
      const isVerified = !!hasPurchased;

      // Process uploaded images
      let reviewImages = [];
      if (req.files && req.files.length > 0) {
        const uploadUrl = process.env.UPLOAD_URL || 'http://localhost:5000';
        reviewImages = req.files.map(file => `/uploads/reviews/${file.filename}`);
      }

      // Check if user already reviewed this product
      const existingReview = await Review.findOne({ userId, productId });
      
      if (existingReview) {
        // Update existing review
        existingReview.rating = rating;
        if (title) existingReview.title = title;
        if (comment) existingReview.comment = comment;
        if (reviewImages.length > 0) existingReview.images = reviewImages;
        existingReview.isVerified = isVerified;
        
        await existingReview.save();
        
        // Update product average rating
        await Review.computeAverageRating(productId);
        
        return res.status(200).json({
          success: true,
          message: 'Review updated successfully',
          data: existingReview
        });
      }

      // Create new review
      const review = new Review({
        productId,
        userId,
        rating,
        title,
        comment,
        images: reviewImages,
        isVerified,
        status: isVerified ? 'approved' : 'pending' // Auto-approve verified purchases
      });

      await review.save();
      
      // Update product average rating
      await Review.computeAverageRating(productId);

      res.status(201).json({
        success: true,
        message: 'Review added successfully',
        data: review
      });
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review',
      error: error.message
    });
  }
};

/**
 * Get all reviews for a product
 */
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find reviews
    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: 'userId',
        select: 'firstName lastName'
      });
    
    // Count total reviews for pagination
    const totalReviews = await Review.countDocuments({ productId });
    
    res.status(200).json({
      success: true,
      data: {
        reviews,
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
 * Delete a review
 */
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find review
    const review = await Review.findById(id);
    
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }
    
    // Check if user is authorized to delete (owner or admin)
    if (review.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
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
  const reviews = await Review.find({ productId });
  
  if (reviews.length === 0) {
    // No reviews, reset rating to 0
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