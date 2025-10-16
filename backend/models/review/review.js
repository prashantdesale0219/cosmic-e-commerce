const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: false,
    trim: true
  },
  comment: {
    type: String,
    required: false
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^(http|https):\/\/[^ "]+$/.test(v) || v.startsWith('/uploads/');
      },
      message: props => `${props.value} is not a valid image path!`
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  likes: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

// Compound index to prevent multiple reviews from same user on same product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ productId: 1, createdAt: -1 });

// Static method to compute average rating for a product
reviewSchema.statics.computeAverageRating = async function(productId) {
  const Product = mongoose.model('Product');
  
  const result = await this.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId), status: 'approved' } },
    { $group: {
        _id: '$productId',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 }
      }
    }
  ]);
  
  // Update product with new rating data
  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: parseFloat(result[0].averageRating.toFixed(1)),
      reviewCount: result[0].reviewCount
    });
    return result[0];
  } else {
    await Product.findByIdAndUpdate(productId, {
      averageRating: 0,
      reviewCount: 0
    });
    return { averageRating: 0, reviewCount: 0 };
  }
};

module.exports = mongoose.model('Review', reviewSchema);