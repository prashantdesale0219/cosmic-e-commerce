const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  title: {
    type: String,
    required: [true, 'Offer title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Discount type is required']
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value must be greater than 0']
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index for faster lookups
offerSchema.index({ productId: 1, isActive: 1 });

// Pre-save hook to ensure only one active offer per product
offerSchema.pre('save', async function(next) {
  if (this.isActive) {
    const existingOffer = await this.constructor.findOne({
      productId: this.productId,
      isActive: true,
      _id: { $ne: this._id }
    });
    
    if (existingOffer) {
      throw new Error('Only one active offer allowed per product');
    }
  }
  next();
});

module.exports = mongoose.model('Offer', offerSchema);