const Order = require('../../models/orders/order');
const { logError } = require('../notifications/notificationController');

// Get all orders with filtering and pagination
exports.getAllOrders = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate
    } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status && status !== 'All') {
      query.orderStatus = status;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    // Search by order ID
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Set up sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const options = {
      sort,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };
    
    // Handle guest users by conditionally populating userId only for non-guest orders
    const orders = await Order.find(query, null, options);
    
    // Populate user data only for orders with valid MongoDB ObjectId userId
    for (let i = 0; i < orders.length; i++) {
      if (orders[i].userId && !orders[i].userId.toString().startsWith('guest-')) {
        await orders[i].populate('userId');
      }
    }
    const total = await Order.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Conditionally populate user data only for non-guest orders
    if (order.userId && !order.userId.toString().startsWith('guest-')) {
      await order.populate('userId');
    }
    
    // Always populate product data
    await order.populate('items.productId');
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error in getOrderById:', error);
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;
    
    if (!orderStatus) {
      return res.status(400).json({ success: false, message: 'Order status is required' });
    }
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: `Status must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    const order = await Order.findByIdAndUpdate(
      id,
      { 
        orderStatus: orderStatus
      },
      { new: true }
    ).populate('userId');
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Here you would trigger a notification to the user about order status change
    // notificationController.createNotification({...})
    
    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get order statistics
exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    
    // Count orders by status
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const confirmedOrders = await Order.countDocuments({ orderStatus: 'confirmed' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });
    
    // Calculate total revenue
    const revenueResult = await Order.aggregate([
      {
        $match: { orderStatus: { $ne: 'cancelled' } }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    
    // Get monthly orders and revenue for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          orderCount: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        ordersByStatus: {
          pending: pendingOrders,
          confirmed: confirmedOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        },
        totalRevenue,
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Error in getOrderStats:', error);
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Export orders data (CSV format)
exports.exportOrders = async (req, res) => {
  try {
    const { format = 'csv', startDate, endDate, status } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status) {
      query.orderStatus = status;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    if (format === 'csv') {
      // Generate CSV data
      let csvData = 'Order ID,Customer,Email,Date,Status,Items,Total Amount\n';
      
      orders.forEach(order => {
        const itemsText = order.items.map(item => 
          `${item.quantity}x ${item.price}`
        ).join('; ');
        
        csvData += `${order.orderId},${order.userId ? order.userId.name : 'N/A'},${order.userId ? order.userId.email : 'N/A'},${order.createdAt.toISOString().split('T')[0]},${order.orderStatus},${itemsText},${order.totalPrice}\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=orders-${Date.now()}.csv`);
      return res.status(200).send(csvData);
    } else {
      // Default JSON response
      return res.status(200).json({
        success: true,
        data: orders
      });
    }
  } catch (error) {
    console.error('Error in exportOrders:', error);
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    await Order.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteOrder:', error);
    await logError(error, req);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};