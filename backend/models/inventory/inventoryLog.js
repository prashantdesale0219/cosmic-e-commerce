const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required']
    },
    change: {
        type: Number,
        required: [true, 'Inventory change amount is required']
    },
    reason: {
        type: String,
        required: [true, 'Reason for inventory change is required'],
        enum: ['order', 'manual', 'return'],
        default: 'manual'
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        default: null
    },
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        default: null
    },
    notes: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
inventoryLogSchema.index({ productId: 1, createdAt: -1 });
inventoryLogSchema.index({ orderId: 1 });
inventoryLogSchema.index({ reason: 1 });

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);