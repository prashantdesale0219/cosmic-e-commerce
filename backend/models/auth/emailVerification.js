const mongoose = require('mongoose');

const EmailVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  resendCount: {
    type: Number,
    default: 0
  },
  lastResendTime: {
    type: Date,
    default: Date.now
  },
  lockUntil: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600 // OTP expires after 1 hour (3600 seconds)
  }
});

module.exports = mongoose.model('EmailVerification', EmailVerificationSchema);