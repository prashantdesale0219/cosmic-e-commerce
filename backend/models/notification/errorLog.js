const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema({
  level: {
    type: String,
    required: true,
    enum: ['info', 'warning', 'error', 'critical']
  },
  message: {
    type: String,
    required: true
  },
  stack: {
    type: String,
    default: null
  },
  path: {
    type: String,
    default: null
  },
  method: {
    type: String,
    default: null
  },
  statusCode: {
    type: Number,
    default: null
  },
  requestData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  userType: {
    type: String,
    enum: ['user', 'admin', null],
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
errorLogSchema.index({ level: 1 });
errorLogSchema.index({ createdAt: -1 });
errorLogSchema.index({ statusCode: 1 });

const ErrorLog = mongoose.model('ErrorLog', errorLogSchema);

module.exports = ErrorLog;