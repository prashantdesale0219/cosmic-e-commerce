const Coupon = require('../../models/coupon/coupon');
const { sendCouponEmail } = require('../../utils/emailSender');
const crypto = require('crypto');

// Generate a unique coupon code
const generateCouponCode = (prefix = 'COSMIC') => {
    const randomString = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}-${randomString}`;
};

// Generate and send coupon to selected users
exports.generateAndSendCoupon = async (req, res) => {
    try {
        const { users, discountType, discountValue, minOrderAmount, maxDiscount, usageLimit, expiryDays } = req.body;

        if (!users || !Array.isArray(users) || users.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please select at least one user'
            });
        }

        if (!discountType || !discountValue) {
            return res.status(400).json({
                success: false,
                message: 'Discount type and value are required'
            });
        }

        // Generate coupon code
        const couponCode = generateCouponCode();
        
        // Calculate expiry date
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + (expiryDays || 30)); // Default 30 days

        // Create coupon
        const coupon = await Coupon.create({
            code: couponCode,
            type: discountType === 'percentage' ? 'percent' : 'flat',
            value: discountValue,
            minOrderAmount: minOrderAmount || 0,
            maxDiscount: maxDiscount || null,
            startDate,
            endDate,
            usageLimit: usageLimit || null,
            status: 'active'
        });

        // Send emails to selected users
        const emailPromises = users.map(user => {
            return sendCouponEmail(user.email, {
                couponCode,
                discountType,
                discountValue,
                minOrderAmount,
                maxDiscount,
                expiryDate: endDate
            });
        });

        await Promise.all(emailPromises);

        res.status(201).json({
            success: true,
            message: `Coupon generated and sent to ${users.length} users`,
            data: coupon
        });
    } catch (error) {
        console.error('Error generating coupon:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to generate coupon'
        });
    }
};

// Get all users who can receive coupons
exports.getUsersForCoupon = async (req, res) => {
    try {
        // This is a placeholder - you'll need to replace with actual user model
        // For now, we'll return mock data
        const users = [
            { id: '1', name: 'Darshini Patel', email: 'pateldarshini97@gmail.com' },
            { id: '2', name: 'Seema Raghav', email: 'semmaraghav@gmail.com' },
            { id: '3', name: 'Ketul Patel', email: 'mediguide83@gmail.com' },
            { id: '4', name: 'Divyesh Yadav', email: 'divyeshyadav@gmail.com' }
        ];

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch users'
        });
    }
};