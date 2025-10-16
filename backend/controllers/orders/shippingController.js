const Order = require('../../models/orders/order');
const User = require('../../models/auth/auth');
const { sendOrderStatusUpdateEmail } = require('../../utils/emailSender');
const { createNotification } = require('../notifications/notificationController');
const crypto = require('crypto');

/**
 * Submit shipping address and create pending order
 */
exports.submitShippingAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, items, totalAmount } = req.body;
    
    if (!shippingAddress || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address and items are required'
      });
    }
    
    // Create new order with pending_admin_review status
    const order = new Order({
      userId,
      items,
      totalPrice: totalAmount,
      shippingAddress,
      orderStatus: 'pending_admin_review',
      paymentStatus: 'pending'
    });
    
    // Save the order
    await order.save();
    
    // Get user details for email
    const user = await User.findById(userId).select('name email');
    console.log(user)
    
    // Format address for email
    const formatAddress = (address) => {
      return `${address.fullName}, ${address.addressLine1}, ${address.addressLine2 || ''}, 
      ${address.city}, ${address.state}, ${address.postalCode}, ${address.country || 'India'}, 
      Phone: ${address.phone}`;
    };
    
    // Format items for email
    const formatItems = (items) => {
      let itemsHtml = '';
      items.forEach(item => {
        itemsHtml += `
          <tr>
            <td>${item.name || 'Product'}</td>
            <td>${item.quantity}</td>
            <td>₹${item.price?.toFixed(2) || '0.00'}</td>
            <td>₹${(item.price * item.quantity)?.toFixed(2) || '0.00'}</td>
          </tr>
        `;
      });
      return itemsHtml;
    };
    
    // Notify admin about new order
    try {
      // Find admin users from database instead of using process.env
      const admins = await User.find({ role: 'admin' });
      
      if (admins && admins.length > 0) {
        // Create notification for admins
        await createNotification({
          title: 'New Order Received',
          message: `A new order has been received. Order ID: ${order.orderId}. Please add shipping charges.`,
          type: 'order',
          user: { id: 'admin' }, // For admin notification
          referenceId: order._id
        });
        
        // Send detailed email to admins
        for (const admin of admins) {
          await sendOrderStatusUpdateEmail(
            admin.email,
            'New Order Received - Action Required',
            `
            <h1>New Order Requires Shipping Charges</h1>
            <p>A new order has been received and requires you to add shipping charges.</p>
            
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Customer:</strong> ${user?.name || 'Customer'} (${user?.email || 'No email'})</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Subtotal:</strong> ₹${totalAmount?.toFixed(2) || '0.00'}</p>
            
            <h3>Shipping Address</h3>
            <p>${formatAddress(shippingAddress)}</p>
            
            <h3>Order Items</h3>
            <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
              ${formatItems(items)}
            </table>
            
            <p>Please add shipping charges for this order by clicking the link below:</p>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/shipping-panel" 
               style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
              Add Shipping Charges
            </a>
            `,
            order
          );
        }
      }
    } catch (notificationError) {
      console.error('Failed to send admin notification:', notificationError);
      // Continue with the process even if notification fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Shipping address submitted successfully. Waiting for admin to add shipping charges.',
      data: order
    });
  } catch (error) {
    console.error('Error submitting shipping address:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit shipping address',
      error: error.message
    });
  }
};

/**
 * Admin adds shipping charges to order
 */
exports.addShippingCharges = async (req, res) => {
  try {
    const { id } = req.params;
    const { shippingCharges, adminNotes, finalPrice } = req.body;
    
    // Validate input data
    if (shippingCharges === undefined || shippingCharges === null) {
      return res.status(400).json({
        success: false,
        message: 'Shipping charges are required'
      });
    }
    
    // Convert to number and validate
    const shippingChargesNum = Number(shippingCharges);
    if (isNaN(shippingChargesNum)) {
      return res.status(400).json({
        success: false,
        message: 'Shipping charges must be a valid number'
      });
    }
    
    // Find the order by ID
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update order with shipping charges
    order.shippingCharges = shippingChargesNum;
    order.adminNotes = adminNotes || '';
    order.finalPrice = finalPrice || (order.totalPrice + shippingChargesNum);
    order.orderStatus = 'Awaiting Confirmation';
    
    try {
      await order.save();
    } catch (saveError) {
      console.error('Error saving order:', saveError);
      return res.status(500).json({
        success: false,
        message: 'Failed to save order with shipping charges',
        error: saveError.message
      });
    }
    
    // Handle notification for both registered users and guest users
    const customerEmail = order.customerEmail || (order.userId && typeof order.userId === 'object' ? order.userId.email : null);
    
    if (customerEmail) {
      try {
        // Create notification for customer if possible
        if (order.userId && typeof order.userId === 'object' && order.userId._id) {
          await createNotification({
            title: 'Shipping Charges Added',
            message: `Shipping charges of ₹${shippingCharges} have been added to your order. Total amount: ₹${order.finalPrice}. Please confirm to proceed.`,
            type: 'order',
            user: { id: order.userId._id },
            referenceId: order._id
          });
        }
        
        // Generate confirmation token
        const confirmationToken = crypto.randomBytes(20).toString('hex');
        
        // Save token to order
        order.confirmationToken = confirmationToken;
        await order.save();
        
        // Create confirmation and cancellation URLs
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const confirmUrl = `${baseUrl}/order/confirm/${order._id}/${confirmationToken}`;
        const cancelUrl = `${baseUrl}/order/cancel/${order._id}/${confirmationToken}`;
        
        // Send email to customer with confirmation buttons
        try {
          await sendOrderStatusUpdateEmail(
            customerEmail,
            'Shipping Charges Added - Action Required',
            `
              <h1 style="color: #333; text-align: center; margin-bottom: 20px;">Your Order is Ready for Confirmation</h1>
              <p style="font-size: 16px;">Dear Customer,</p>
              <p>We have reviewed your order and determined the final price including shipping charges.</p>
              
              <div style="background-color: #f5f5f5; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
                  <p><strong>Subtotal:</strong> ₹${order.totalPrice}</p>
                  <p><strong>Shipping:</strong> ₹${order.shippingCharges}</p>
                  <p><strong>Total:</strong> ₹${order.finalPrice}</p>
                  ${order.adminNotes ? `<p><strong>Notes:</strong> ${order.adminNotes}</p>` : ''}
              </div>
              
              <p style="font-weight: bold; text-align: center; margin: 20px 0;">Please click one of the buttons below to confirm or cancel your order:</p>
              
              <table width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                      <td align="center" style="padding: 10px;">
                          <table cellspacing="0" cellpadding="0">
                              <tr>
                                  <td style="border-radius: 5px; background: #4CAF50; text-align: center;">
                                      <a href="${confirmUrl}" style="display: inline-block; padding: 12px 25px; color: white; font-weight: bold; text-decoration: none; font-size: 16px;">✅ CONFIRM ORDER</a>
                                  </td>
                              </tr>
                          </table>
                      </td>
                      <td align="center" style="padding: 10px;">
                          <table cellspacing="0" cellpadding="0">
                              <tr>
                                  <td style="border-radius: 5px; background: #f44336; text-align: center;">
                                      <a href="${cancelUrl}" style="display: inline-block; padding: 12px 25px; color: white; font-weight: bold; text-decoration: none; font-size: 16px;">❌ CANCEL ORDER</a>
                                  </td>
                              </tr>
                          </table>
                      </td>
                  </tr>
              </table>
              
              <p style="margin-top: 30px;">If you have any questions, please contact our customer support.</p>
              <p>Thank you for shopping with us!</p>
              
              <div style="font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                  <p>If the buttons above do not work, you can copy and paste these links into your browser:</p>
                  <p>Confirm: ${confirmUrl}</p>
                  <p>Cancel: ${cancelUrl}</p>
              </div>
            `,
            order
          );
          console.log('Order status update email sent successfully');
        } catch (emailError) {
          console.error('Error sending order status email:', emailError);
          // Continue even if email fails, but log the error
        }
      } catch (error) {
        console.error('Error sending notification:', error);
        // Continue even if notification fails
      }
    }
    
    // Return success response without sending the entire order object
    return res.status(200).json({
      success: true,
      message: 'Shipping charges added successfully',
      orderId: order._id,
      shippingCharges: order.shippingCharges,
      finalPrice: order.finalPrice
    });
  } catch (error) {
    console.error('Error in addShippingCharges:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add shipping charges',
      error: error.message
    });
  }
};

/**
 * Customer confirms order with shipping charges
 */
exports.confirmOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    
    // Find the order
    const order = await Order.findOne({ orderId, userId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    if (order.orderStatus !== 'waiting_confirmation') {
      return res.status(400).json({
        success: false,
        message: 'Order is not in waiting confirmation status'
      });
    }
    
    // Update order status
    order.orderStatus = 'confirmed';
    await order.save();
    
    // Find admin users
    const admins = await User.find({ role: 'admin' });
    
    if (admins && admins.length > 0) {
      // Create notification for admins
      await createNotification({
        title: 'Order Confirmed',
        message: `Order ${order.orderId} has been confirmed by the customer.`,
        type: 'order',
        user: { id: 'admin' },
        referenceId: order._id
      });
      
      // Send email to admins
      for (const admin of admins) {
        await sendOrderStatusUpdateEmail(
          admin.email,
          'Order Confirmed',
          `Order ${order.orderId} has been confirmed by the customer.`,
          order
        );
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Order confirmed successfully',
      data: order
    });
  } catch (error) {
    console.error('Error confirming order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm order',
      error: error.message
    });
  }
};

/**
 * Customer cancels order
 */
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const { cancelReason } = req.body;
    
    // Find the order
    const order = await Order.findOne({ orderId, userId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    if (order.orderStatus === 'confirmed' || order.orderStatus === 'shipped' || order.orderStatus === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order in current status'
      });
    }
    
    // Update order status
    order.orderStatus = 'cancelled';
    order.adminNotes = (order.adminNotes || '') + `\nCancelled by customer. Reason: ${cancelReason || 'No reason provided'}`;
    await order.save();
    
    // Find admin users
    const admins = await User.find({ role: 'admin' });
    
    if (admins && admins.length > 0) {
      // Create notification for admins
      await createNotification({
        title: 'Order Cancelled',
        message: `Order ${order.orderId} has been cancelled by the customer. Reason: ${cancelReason || 'No reason provided'}`,
        type: 'order',
        user: { id: 'admin' },
        referenceId: order._id
      });
      
      // Send email to admins
      for (const admin of admins) {
        await sendOrderStatusUpdateEmail(
          admin.email,
          'Order Cancelled',
          `Order ${order.orderId} has been cancelled by the customer. Reason: ${cancelReason || 'No reason provided'}`,
          order
        );
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};

/**
 * Get all pending admin review orders
 */
exports.getPendingAdminReviewOrders = async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: 'pending_admin_review' })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone');
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error getting pending admin review orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get pending admin review orders',
      error: error.message
    });
  }
};

/**
 * Get all waiting confirmation orders
 */
exports.getWaitingConfirmationOrders = async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: 'waiting_confirmation' })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone');
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error getting waiting confirmation orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get waiting confirmation orders',
      error: error.message
    });
  }
};