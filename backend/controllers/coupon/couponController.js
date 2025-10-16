const Coupon = require('../../models/coupon/coupon');
const User = require('../../models/auth/auth');
const { sendCouponEmail } = require('../../utils/emailSender');

// Create a new coupon
exports.createCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            data: coupon
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all coupons
exports.getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.status(200).json({
            success: true,
            count: coupons.length,
            data: coupons
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Generate and send coupons to selected users
exports.generateCouponForUsers = async (req, res) => {
    try {
        const { couponId, userIds } = req.body;
        
        if (!couponId || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide coupon ID and at least one user ID'
            });
        }
        
        // Find the coupon
        const coupon = await Coupon.findById(couponId);
        
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }
        
        // Find the users
        const users = await User.find({ _id: { $in: userIds } });
        
        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No valid users found'
            });
        }
        
        // Send emails to users with coupon code
        const emailPromises = users.map(user => {
            const emailContent = `
                <h1>Special Offer Just for You!</h1>
                <p>Dear ${user.name || 'Valued Customer'},</p>
                <p>We're excited to offer you a special discount:</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
                    <h2 style="color: #4CAF50; margin-bottom: 10px;">${coupon.code}</h2>
                    <p style="font-size: 18px; font-weight: bold;">
                        ${coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                    </p>
                    <p>Valid until: ${new Date(coupon.endDate).toLocaleDateString()}</p>
                </div>
                <p>Use this code at checkout to redeem your discount.</p>
                <p>Thank you for being a valued customer!</p>
            `;
            
            return sendCouponEmail(user.email, {
                couponCode: coupon.code,
                discountType: coupon.type === 'percent' ? 'percentage' : 'flat',
                discountValue: coupon.value,
                minOrderAmount: coupon.minOrderAmount,
                maxDiscount: coupon.maxDiscount,
                expiryDate: coupon.endDate
            });
        });
        
        await Promise.all(emailPromises);
        
        res.status(200).json({
            success: true,
            message: `Coupon code sent to ${users.length} users successfully`,
            data: {
                coupon,
                userCount: users.length
            }
        });
    } catch (error) {
        console.error('Error generating coupons:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate and send coupons'
        });
    }
};

// Get a single coupon
exports.getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: coupon
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update a coupon
exports.updateCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );
        
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Coupon updated successfully',
            data: coupon
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete a coupon
exports.deleteCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.id);
        
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Coupon deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Validate a coupon
exports.validateCoupon = async (req, res) => {
    try {
        const { code, orderAmount } = req.body;
        
        if (!code || !orderAmount) {
            return res.status(400).json({
                success: false,
                message: 'Please provide coupon code and order amount'
            });
        }
        
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Invalid coupon code'
            });
        }
        
        // Check if coupon is valid
        const validationResult = coupon.isValid(orderAmount);
        
        if (!validationResult.valid) {
            return res.status(400).json({
                success: false,
                message: validationResult.message
            });
        }
        
        // Calculate discount
        const discount = coupon.calculateDiscount(orderAmount);
        
        res.status(200).json({
            success: true,
            message: 'Coupon is valid',
            data: {
                coupon,
                discount,
                finalAmount: orderAmount - discount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Apply a coupon (increment usedCount)
exports.applyCoupon = async (req, res) => {
    try {
        const { code } = req.body;
        
        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Please provide coupon code'
            });
        }
        
        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Invalid coupon code'
            });
        }
        
        // Increment used count
        coupon.usedCount += 1;
        await coupon.save();
        
        res.status(200).json({
            success: true,
            message: 'Coupon applied successfully',
            data: coupon
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get coupon usage statistics
exports.getCouponStats = async (req, res) => {
    try {
        const stats = await Coupon.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalUsed: { $sum: '$usedCount' }
                }
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};