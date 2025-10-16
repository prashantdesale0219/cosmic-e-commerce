const mongoose = require('mongoose');

const EmiOptionSchema = new mongoose.Schema({
  months: {
    type: Number,
    required: [true, 'Please provide the tenure in months'],
    min: 1
  },
  interestRate: {
    type: Number,
    required: [true, 'Please provide the interest rate'],
    min: 0
  },
  minAmount: {
    type: Number,
    required: [true, 'Please provide the minimum amount'],
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EmiOption', EmiOptionSchema);