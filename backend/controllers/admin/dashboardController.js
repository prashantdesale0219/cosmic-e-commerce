const User = require('../../models/auth/auth');
const Product = require('../../models/products/product');
const Order = require('../../models/orders/order');
const { logError } = require('../notifications/notificationController');

// Get combined dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Dates for calculations
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    // User Stats - Run queries in parallel for better performance
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      newUsers,
      usersLastMonth
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } })
    ]);
    
    // Calculate user growth percentage with safeguard against division by zero
    const userGrowth = usersLastMonth > 0 
      ? Math.round(((newUsers - usersLastMonth) / usersLastMonth) * 100) 
      : (newUsers > 0 ? 100 : 0);
    
    // Product Stats - Run queries in parallel
    const [
      totalProducts,
      inStockProducts,
      outOfStockProducts,
      lowStockProducts,
      newProducts,
      productsLastMonth
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ stock: { $gt: 0 } }),
      Product.countDocuments({ stock: 0 }),
      Product.countDocuments({ stock: { $gt: 0, $lte: 10 } }),
      Product.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Product.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } })
    ]);
    
    // Calculate product growth percentage with safeguard
    const productGrowth = productsLastMonth > 0 
      ? Math.round(((newProducts - productsLastMonth) / productsLastMonth) * 100) 
      : (newProducts > 0 ? 100 : 0);
    
    // Order Stats - Run queries in parallel
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      pendingAdminReviewOrders,
      newOrders,
      ordersLastMonth
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'processing' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.countDocuments({ status: 'pending_admin_review' }),
      Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Order.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } })
    ]);
    
    // Calculate order growth percentage with safeguard
    const orderGrowth = ordersLastMonth > 0 
      ? Math.round(((newOrders - ordersLastMonth) / ordersLastMonth) * 100) 
      : (newOrders > 0 ? 100 : 0);
    
    // Calculate revenue metrics in parallel
    const [revenueResult, revenueThisMonth, revenueLastMonth] = await Promise.all([
      Order.aggregate([
        { $match: { status: { $in: ['delivered', 'shipped', 'processing'] } } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { 
          $match: { 
            status: { $in: ['delivered', 'shipped', 'processing'] },
            createdAt: { $gte: thirtyDaysAgo }
          } 
        },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { 
          $match: { 
            status: { $in: ['delivered', 'shipped', 'processing'] },
            createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
          } 
        },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ])
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    const thisMonthRevenue = revenueThisMonth.length > 0 ? revenueThisMonth[0].totalRevenue : 0;
    const lastMonthRevenue = revenueLastMonth.length > 0 ? revenueLastMonth[0].totalRevenue : 0;
    
    // Calculate revenue growth percentage with safeguard
    const revenueGrowth = lastMonthRevenue > 0 
      ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) 
      : (thisMonthRevenue > 0 ? 100 : 0);
    
    // Get monthly sales data for the last 6 months more efficiently
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: { $in: ['delivered', 'shipped', 'processing'] }
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);
    
    // Cache the results to improve dashboard loading time
    
    // Format the monthly sales data for charts
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthlySales = monthlySales.map(item => ({
      month: monthNames[item._id.month - 1],
      year: item._id.year,
      count: item.count,
      revenue: item.revenue
    }));
    
    // Get top selling products
    const topSellingProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          revenue: 1,
          name: { $arrayElemAt: ['$productInfo.name', 0] },
          image: { $arrayElemAt: ['$productInfo.images', 0] }
        }
      }
    ]);
    
    // Get shipping statistics
    const shippingStats = await Order.aggregate([
      {
        $match: {
          shippingCharges: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          totalShipping: { $sum: '$shippingCharges' },
          avgShipping: { $avg: '$shippingCharges' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          totalShipping: { $round: ['$totalShipping', 2] },
          avgShipping: { $round: ['$avgShipping', 2] },
          count: 1
        }
      }
    ]);
    
    // Get order status distribution
    const orderStatusData = {
      pending_admin_review: pendingAdminReviewOrders,
      pending: pendingOrders,
      processing: processingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders
    };
    
    // Get recent orders requiring admin review
    const recentPendingOrders = await Order.find({ status: 'pending_admin_review' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderId customer email date totalAmount')
      .lean();
    
    // Calculate average order value
    const avgOrderValueResult = await Order.aggregate([
      {
        $match: {
          status: { $nin: ['cancelled'] }
        }
      },
      {
        $group: {
          _id: null,
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      {
        $project: {
          _id: 0,
          avgOrderValue: { $round: ['$avgOrderValue', 2] }
        }
      }
    ]);
    
    const avgOrderValue = avgOrderValueResult.length > 0 ? avgOrderValueResult[0].avgOrderValue : 0;
    
    // Return all stats with a small delay to ensure frontend can handle the response
    setTimeout(() => {
      res.status(200).json({
        success: true,
        data: {
          userStats: {
            total: totalUsers,
            active: activeUsers,
            inactive: inactiveUsers,
            new: newUsers,
            growth: `${userGrowth}%`
          },
          productStats: {
            total: totalProducts,
            inStock: inStockProducts,
            outOfStock: outOfStockProducts,
            lowStock: lowStockProducts,
            new: newProducts,
            growth: `${productGrowth}%`
          },
          orderStats: {
            total: totalOrders,
            pending: pendingOrders,
            processing: processingOrders,
            shipped: shippedOrders,
            delivered: deliveredOrders,
            cancelled: cancelledOrders,
            pendingReview: pendingAdminReviewOrders,
            new: newOrders,
            growth: `${orderGrowth}%`,
            avgOrderValue
          },
          revenueStats: {
            total: totalRevenue,
            recent: thisMonthRevenue,
            growth: `${revenueGrowth}%`
          },
          shippingStats: shippingStats.length > 0 ? shippingStats[0] : {
            totalShipping: 0,
            avgShipping: 0,
            count: 0
          },
          orderStatusData,
          recentPendingOrders,
          chartData: {
            monthlySales: formattedMonthlySales,
            topSellingProducts
          }
        }
      });
    }, 100); // Small delay to ensure frontend can process the response
  } catch (error) {
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};