const mongoose = require('mongoose');

const emiSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  durationMonths: {
    type: Number,
    required: [true, 'Duration in months is required'],
    min: [1, 'Duration must be at least 1 month']
  },
  interestRate: {
    type: Number,
    required: [true, 'Interest rate is required'],
    min: [0, 'Interest rate cannot be negative']
  },
  monthlyInstallment: {
    type: Number,
    min: [0, 'Monthly installment cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index for faster lookups
emiSchema.index({ productId: 1 });

module.exports = mongoose.model('EMI', emiSchema);