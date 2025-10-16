const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Coupon code is required'],
        unique: true,
        trim: true,
        uppercase: true
    },
    type: {
        type: String,
        required: [true, 'Coupon type is required'],
        enum: ['flat', 'percent'],
        default: 'percent'
    },
    value: {
        type: Number,
        required: [true, 'Coupon value is required'],
        min: [0, 'Coupon value cannot be negative']
    },
    minOrderAmount: {
        type: Number,
        required: [true, 'Minimum order amount is required'],
        default: 0,
        min: [0, 'Minimum order amount cannot be negative']
    },
    maxDiscount: {
        type: Number,
        default: null
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
        default: Date.now
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    usageLimit: {
        type: Number,
        default: null
    },
    usedCount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to validate that endDate is after startDate
couponSchema.pre('save', function(next) {
    if (this.endDate <= this.startDate) {
        return next(new Error('End date must be after start date'));
    }
    next();
});

// Method to check if coupon is valid
couponSchema.methods.isValid = function(orderAmount) {
    const now = new Date();
    
    // Check if coupon is active
    if (this.status !== 'active') {
        return { valid: false, message: 'Coupon is inactive' };
    }
    
    // Check if coupon is within valid date range
    if (now < this.startDate || now > this.endDate) {
        return { valid: false, message: 'Coupon is expired or not yet active' };
    }
    
    // Check if coupon has reached usage limit
    if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
        return { valid: false, message: 'Coupon usage limit reached' };
    }
    
    // Check if order meets minimum amount
    if (orderAmount < this.minOrderAmount) {
        return { 
            valid: false, 
            message: `Order amount must be at least ₹${this.minOrderAmount} to use this coupon` 
        };
    }
    
    return { valid: true, message: 'Coupon is valid' };
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(orderAmount) {
    let discount = 0;
    
    if (this.type === 'flat') {
        discount = this.value;
    } else if (this.type === 'percent') {
        discount = (orderAmount * this.value) / 100;
        
        // Apply max discount cap if exists
        if (this.maxDiscount !== null && discount > this.maxDiscount) {
            discount = this.maxDiscount;
        }
    }
    
    return discount;
};

module.exports = mongoose.model('Coupon', couponSchema);