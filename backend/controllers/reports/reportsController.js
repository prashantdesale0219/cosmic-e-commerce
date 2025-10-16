const Order = require('../../models/orders/order');
const Product = require('../../models/products/product');
const Customer = require('../../models/auth/auth');
const InventoryLog = require('../../models/inventory/inventoryLog');
const Coupon = require('../../models/coupon/coupon');
const Newsletter = require('../../models/newsletter/newsletter');

// Get orders report
exports.getOrdersReport = async (req, res) => {
    try {
        const { startDate, endDate, period = 'daily' } = req.query;
        
        // Validate dates
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required'
            });
        }
        
        // Parse dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        // Validate date range
        if (start > end) {
            return res.status(400).json({
                success: false,
                message: 'Start date must be before end date'
            });
        }
        
        // Build aggregation pipeline based on period
        let groupBy = {};
        let projectStage = {};
        
        if (period === 'daily') {
            groupBy = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
            };
            projectStage = {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$_id.date' } }
            };
        } else if (period === 'weekly') {
            groupBy = {
                year: { $year: '$createdAt' },
                week: { $week: '$createdAt' }
            };
            projectStage = {
                week: '$_id.week',
                year: '$_id.year'
            };
        } else if (period === 'monthly') {
            groupBy = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
            };
            projectStage = {
                month: '$_id.month',
                year: '$_id.year'
            };
        }
        
        // Aggregation pipeline
        const orderStats = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    count: { $sum: 1 },
                    totalSales: { $sum: '$grandTotal' },
                    avgOrderValue: { $avg: '$grandTotal' }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            },
            {
                $project: {
                    _id: 0,
                    ...projectStage,
                    count: 1,
                    totalSales: 1,
                    avgOrderValue: { $round: ['$avgOrderValue', 2] }
                }
            }
        ]);
        
        // Get order status distribution
        const statusDistribution = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$grandTotal' }
                }
            },
            {
                $project: {
                    status: '$_id',
                    _id: 0,
                    count: 1,
                    totalAmount: 1
                }
            }
        ]);
        
        // Get summary statistics
        const summary = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$grandTotal' },
                    avgOrderValue: { $avg: '$grandTotal' },
                    minOrderValue: { $min: '$grandTotal' },
                    maxOrderValue: { $max: '$grandTotal' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalOrders: 1,
                    totalRevenue: 1,
                    avgOrderValue: { $round: ['$avgOrderValue', 2] },
                    minOrderValue: 1,
                    maxOrderValue: 1
                }
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: {
                timeSeries: orderStats,
                statusDistribution,
                summary: summary[0] || {
                    totalOrders: 0,
                    totalRevenue: 0,
                    avgOrderValue: 0,
                    minOrderValue: 0,
                    maxOrderValue: 0
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get inventory report
exports.getInventoryReport = async (req, res) => {
    try {
        // Get low stock products
        const lowStockProducts = await Product.find({ stockQty: { $lt: 10 } })
            .select('title sku stockQty categoryId')
            .sort({ stockQty: 1 });
        
        // Get out of stock products
        const outOfStockProducts = await Product.find({ stockQty: 0 })
            .select('title sku categoryId')
            .sort({ title: 1 });
        
        // Get inventory movement statistics
        const { startDate, endDate } = req.query;
        
        let movementQuery = {};
        if (startDate && endDate) {
            movementQuery.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const inventoryMovement = await InventoryLog.aggregate([
            {
                $match: movementQuery
            },
            {
                $group: {
                    _id: '$reason',
                    count: { $sum: 1 },
                    totalChange: { $sum: '$change' }
                }
            },
            {
                $project: {
                    reason: '$_id',
                    _id: 0,
                    count: 1,
                    totalChange: 1
                }
            }
        ]);
        
        // Get top products by inventory turnover
        const topProductsByTurnover = await InventoryLog.aggregate([
            {
                $match: {
                    reason: 'order'
                }
            },
            {
                $group: {
                    _id: '$productId',
                    totalSold: { $sum: { $abs: '$change' } }
                }
            },
            {
                $sort: { totalSold: -1 }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'product'
                }
            },
            {
                $unwind: '$product'
            },
            {
                $project: {
                    _id: 0,
                    productId: '$_id',
                    title: '$product.title',
                    sku: '$product.sku',
                    totalSold: 1,
                    currentStock: '$product.stockQty'
                }
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalProducts: await Product.countDocuments(),
                    outOfStockCount: outOfStockProducts.length,
                    lowStockCount: lowStockProducts.length
                },
                lowStockProducts,
                outOfStockProducts,
                inventoryMovement,
                topProductsByTurnover
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get customers report
exports.getCustomersReport = async (req, res) => {
    try {
        // Get customer growth over time
        const { startDate, endDate, period = 'monthly' } = req.query;
        
        let groupBy = {};
        let projectStage = {};
        
        if (period === 'daily') {
            groupBy = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
            };
            projectStage = {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$_id.date' } }
            };
        } else if (period === 'weekly') {
            groupBy = {
                year: { $year: '$createdAt' },
                week: { $week: '$createdAt' }
            };
            projectStage = {
                week: '$_id.week',
                year: '$_id.year'
            };
        } else if (period === 'monthly') {
            groupBy = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
            };
            projectStage = {
                month: '$_id.month',
                year: '$_id.year'
            };
        }
        
        let timeQuery = {};
        if (startDate && endDate) {
            timeQuery = {
                createdAt: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }
        
        const customerGrowth = await Customer.aggregate([
            {
                $match: timeQuery
            },
            {
                $group: {
                    _id: groupBy,
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            },
            {
                $project: {
                    _id: 0,
                    ...projectStage,
                    count: 1
                }
            }
        ]);
        
        // Get top customers by order value
        const topCustomers = await Order.aggregate([
            {
                $match: {
                    customerId: { $ne: null }
                }
            },
            {
                $group: {
                    _id: '$customerId',
                    totalSpent: { $sum: '$grandTotal' },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $sort: { totalSpent: -1 }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            {
                $unwind: '$customer'
            },
            {
                $project: {
                    _id: 0,
                    customerId: '$_id',
                    name: '$customer.name',
                    email: '$customer.email',
                    totalSpent: 1,
                    orderCount: 1,
                    avgOrderValue: { $round: [{ $divide: ['$totalSpent', '$orderCount'] }, 2] }
                }
            }
        ]);
        
        // Get customer summary
        const summary = {
            totalCustomers: await Customer.countDocuments(),
            newCustomers: await Customer.countDocuments({
                createdAt: {
                    $gte: new Date(new Date().setDate(new Date().getDate() - 30))
                }
            })
        };
        
        res.status(200).json({
            success: true,
            data: {
                summary,
                customerGrowth,
                topCustomers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get coupons report
exports.getCouponsReport = async (req, res) => {
    try {
        // Get coupon usage statistics
        const couponStats = await Coupon.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalUsed: { $sum: '$usedCount' }
                }
            },
            {
                $project: {
                    status: '$_id',
                    _id: 0,
                    count: 1,
                    totalUsed: 1
                }
            }
        ]);
        
        // Get top coupons by usage
        const topCoupons = await Coupon.find()
            .sort({ usedCount: -1 })
            .limit(10);
        
        // Get orders with coupons
        const ordersWithCoupons = await Order.countDocuments({
            couponCode: { $ne: null, $ne: '' }
        });
        
        // Get total discount amount from orders
        const totalDiscountAmount = await Order.aggregate([
            {
                $match: {
                    discountApplied: { $gt: 0 }
                }
            },
            {
                $group: {
                    _id: null,
                    totalDiscount: { $sum: '$discountApplied' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalDiscount: 1
                }
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: {
                summary: {
                    totalCoupons: await Coupon.countDocuments(),
                    activeCoupons: await Coupon.countDocuments({ status: 'active' }),
                    ordersWithCoupons,
                    totalDiscountAmount: totalDiscountAmount[0]?.totalDiscount || 0
                },
                couponStats,
                topCoupons
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get newsletter report
exports.getNewsletterReport = async (req, res) => {
    try {
        // Get subscriber growth over time
        const { period = 'monthly' } = req.query;
        
        let groupBy = {};
        let projectStage = {};
        
        if (period === 'daily') {
            groupBy = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' },
                day: { $dayOfMonth: '$createdAt' }
            };
            projectStage = {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$_id.date' } }
            };
        } else if (period === 'weekly') {
            groupBy = {
                year: { $year: '$createdAt' },
                week: { $week: '$createdAt' }
            };
            projectStage = {
                week: '$_id.week',
                year: '$_id.year'
            };
        } else if (period === 'monthly') {
            groupBy = {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
            };
            projectStage = {
                month: '$_id.month',
                year: '$_id.year'
            };
        }
        
        const subscriberGrowth = await Newsletter.aggregate([
            {
                $group: {
                    _id: groupBy,
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            },
            {
                $project: {
                    _id: 0,
                    ...projectStage,
                    count: 1
                }
            }
        ]);
        
        // Get subscriber status distribution
        const statusDistribution = await Newsletter.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    status: '$_id',
                    _id: 0,
                    count: 1
                }
            }
        ]);
        
        // Get summary
        const summary = {
            totalSubscribers: await Newsletter.countDocuments(),
            activeSubscribers: await Newsletter.countDocuments({ status: 'active' }),
            unsubscribedCount: await Newsletter.countDocuments({ status: 'unsubscribed' }),
            newSubscribersThisMonth: await Newsletter.countDocuments({
                createdAt: {
                    $gte: new Date(new Date().setDate(1))
                }
            })
        };
        
        res.status(200).json({
            success: true,
            data: {
                summary,
                subscriberGrowth,
                statusDistribution
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};