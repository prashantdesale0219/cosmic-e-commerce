const Order = require('../../models/orders/order');
const User = require('../../models/auth/auth');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { logError } = require('../notifications/notificationController');
const emailSender = require('../../utils/emailSender');
const { createNotification } = require('../../utils/notificationHelper');

// Skip email sending in development mode to avoid authentication errors
let transporter;

// Check if we're in production or if email credentials are available
if (process.env.NODE_ENV === 'production' && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
} else {
  // Create a mock transporter that logs instead of sending
  transporter = {
    sendMail: (mailOptions, callback) => {
      console.log('Email sending skipped in development mode');
      console.log('Email would have been sent to:', mailOptions.to);
      console.log('Email subject:', mailOptions.subject);
      if (callback) callback(null, { response: 'Email sending skipped in development mode' });
      return Promise.resolve({ response: 'Email sending skipped in development mode' });
    }
  };
}

// Send order for admin review
exports.sendOrderForReview = async (req, res) => {
  try {
    const { 
      userId, 
      items, 
      shippingAddress, 
      billingAddress, 
      paymentMethod,
      subtotal,
      couponCode,
      couponDiscount,
      guestDetails
    } = req.body;
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order items are required and must be an array' });
    }
    
    if (!shippingAddress) {
      return res.status(400).json({ success: false, message: 'Shipping address is required' });
    }
    
    // Create order with Pending Review status (no order ID yet)
    const orderData = {
      orderId: crypto.randomUUID(), // Generate a unique ID to avoid duplicate key error
      orderStatus: 'Pending Review',
      items,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress, // Use shipping as billing if not provided
      paymentMethod: paymentMethod || 'cod', // Default to COD if not specified
      subtotal,
      couponCode,
      couponDiscount,
      isGuestOrder: !!guestDetails,
      totalPrice: subtotal // Set totalPrice to subtotal initially
    };

    // If it's a guest order, store guest details
    if (guestDetails) {
      orderData.guestDetails = guestDetails;
      orderData.userId = "guest-" + Date.now(); // Use a string ID for guests
      
      // Set customerEmail from guest details if available
      if (guestDetails.email && guestDetails.email.includes('@') && !guestDetails.email.includes('example.com')) {
        orderData.customerEmail = guestDetails.email;
      } else if (shippingAddress && shippingAddress.email && shippingAddress.email.includes('@') && !shippingAddress.email.includes('example.com')) {
        // Fallback to shipping address email
        orderData.customerEmail = shippingAddress.email;
      }
    } else {
      orderData.userId = userId || (req.user && req.user._id); // Use authenticated user if userId not provided
      
      // For registered users, we'll get email from User model later
      if (req.user && req.user.email) {
        orderData.customerEmail = req.user.email;
      }
    }

    // Ensure items have the required fields
    if (items.some(item => !item.productId || !item.quantity || !item.price)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Each item must have productId, quantity, and price' 
      });
    }
    
    try {
      const order = new Order(orderData);
      await order.save();
      
      // Populate order with product details for email
      const populatedOrder = await Order.findById(order._id)
        .populate({
          path: 'items.productId',
          select: 'name price images'
        });
        
      if (!populatedOrder) {
        return res.status(500).json({ success: false, message: 'Failed to create order' });
      }
      
      // Send email to admin
    const admins = await User.find({ role: 'admin' });
    const adminEmails = admins.map(admin => admin.email).join(',');
    
    // Generate a temporary reference for the order
    const tempReference = `REF-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;    
    
    // Format items for email
    const itemsList = populatedOrder.items.map(item => {
      return `
        <tr>
          <td>${item.productId.name}</td>
          <td>${item.quantity}</td>
          <td>₹${item.productId.price}</td>
          <td>₹${item.productId.price * item.quantity}</td>
        </tr>
      `;
    }).join('');

    // Format address for email
    const formatAddress = (address) => {
      return `
        ${address.street}, ${address.city}, 
        ${address.state}, ${address.country}, 
        ${address.zipCode}
      `;
    };

    const customerInfo = guestDetails ? 
      `Guest: ${guestDetails.name} (${guestDetails.email})` : 
      `Registered User ID: ${userId}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmails,
      subject: `New Order Request - Reference #${tempReference}`,
      html: `
        <h1>New Order Request Requires Review</h1>
        <p>${customerInfo}</p>
        <p>A new order request has been placed and requires your review to set shipping charges and final price.</p>
        <h2>Order Request Details</h2>
        <p><strong>Reference:</strong> ${tempReference}</p>
        <p><strong>Subtotal:</strong> ₹${subtotal}</p>
        ${couponCode ? `<p><strong>Coupon Applied:</strong> ${couponCode} (-₹${couponDiscount})</p>` : ''}
        <p><strong>Shipping:</strong> To be determined by you</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
        
        <h3>Items</h3>
        <table border="1" cellpadding="5" cellspacing="0">
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
          ${itemsList}
        </table>
        
        <h3>Shipping Address</h3>
        <p>${formatAddress(shippingAddress)}</p>
        
        <h3>Billing Address</h3>
        <p>${billingAddress && billingAddress.sameAsShipping ? 'Same as shipping address' : (billingAddress ? formatAddress(billingAddress) : 'Not provided')}</p>
        
        <p>Please review this order request and set the shipping charges and final price:</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/orders/review/${order._id}">Review Order Request</a>
      `
    };
    
    try {
      await emailSender.sendNotificationEmail(
        mailOptions.to,
        mailOptions.subject,
        mailOptions.html
      );
      console.log('Order request review email sent to admin');
    } catch (error) {
      console.error('Error sending order request review email:', error);
      // Continue with order creation even if email fails
    }

    return res.status(201).json({
      success: true,
      message: 'Order request sent for admin review successfully',
      data: {
        reference: tempReference,
        orderStatus: order.orderStatus,
        _id: order._id
      }
    });
  } catch (error) {
    console.error('Error sending order for review:', error);
    logError('Order Review', `Error sending order for review: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: 'Error sending order for review', 
      error: error.message 
    });
  }
  } catch (error) {
    console.error('Error sending order for review:', error);
    logError('Order Review', `Error sending order for review: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: 'Error sending order for review', 
      error: error.message 
    });
  }
};

// Admin sets shipping charges and final price
exports.setShippingAndFinalPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { shippingCharges, finalPrice, adminNotes } = req.body;
    
    // Validate input
    if (!shippingCharges || !finalPrice) {
      return res.status(400).json({
        success: false,
        message: 'Shipping charges and final price are required'
      });
    }
    
    // Generate confirmation token for customer
    const confirmationToken = crypto.randomBytes(20).toString('hex');
    
    // Find and update order
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update order with shipping charges and final price
    order.shippingCharges = shippingCharges;
    order.finalPrice = finalPrice;
    order.adminNotes = adminNotes || '';
    order.orderStatus = 'Awaiting Confirmation';
    
    // Save token to order
    order.confirmationToken = confirmationToken;
    await order.save();
    
    // Get customer email
    let customerEmail;
    
    // For guest orders, use the guest email
    if (order.isGuestOrder && order.guestDetails && order.guestDetails.email) {
      customerEmail = order.guestDetails.email;
      console.log(`Using guest email: ${customerEmail}`);
    } 
    // Check if userId starts with "guest-" (for guest users)
    else if (order.userId && typeof order.userId === 'string' && order.userId.startsWith('guest-')) {
      // For guest users, we must have a valid email in shippingAddress
      if (order.shippingAddress && order.shippingAddress.email && order.shippingAddress.email.includes('@') && !order.shippingAddress.email.includes('example.com')) {
        customerEmail = order.shippingAddress.email;
        console.log(`Using shipping address email for guest user: ${customerEmail}`);
      }
      // Or check if we have customerEmail directly in the order
      else if (order.customerEmail && order.customerEmail.includes('@') && !order.customerEmail.includes('example.com')) {
        customerEmail = order.customerEmail;
        console.log(`Using order's customerEmail for guest user: ${customerEmail}`);
      }
      // If no valid email found, return error
      else {
        return res.status(400).json({ 
          success: false, 
          message: 'Valid customer email is required for guest orders' 
        });
      }
    }
    // If we have customerEmail directly in the order, use it
    else if (order.customerEmail && order.customerEmail.includes('@') && !order.customerEmail.includes('example.com')) {
      customerEmail = order.customerEmail;
      console.log(`Using order's customerEmail: ${customerEmail}`);
    }
    // For orders with valid userId (must be a valid MongoDB ObjectId)
    else if (order.userId && /^[0-9a-fA-F]{24}$/.test(order.userId)) {
      try {
        const customer = await User.findById(order.userId);
        if (customer && customer.email) {
          customerEmail = customer.email;
          console.log(`Found customer email: ${customerEmail}`);
        } else {
          // Don't use fallback email, return error if no valid email found
          return res.status(400).json({ 
            success: false, 
            message: 'Customer email not found for registered user' 
          });
        }
      } catch (error) {
        console.error(`Error finding customer with ID ${order.userId}: ${error.message}`);
        return res.status(400).json({ 
          success: false, 
          message: 'Error finding customer information' 
        });
      }
    } 
    // For any other case, check if we have a valid email
    else {
      if (order.userId) {
        console.log(`Invalid userId format: ${order.userId}, checking for customer email`);
      }
      
      // Make sure we have a valid customer email
      if (!order.customerEmail || !order.customerEmail.includes('@') || order.customerEmail.includes('example.com')) {
        return res.status(400).json({ 
          success: false, 
          message: 'Valid customer email is required to send confirmation' 
        });
      }
      
      customerEmail = order.customerEmail;
      console.log(`Using customer email: ${customerEmail}`);
    }
    
    // Create confirmation and cancellation URLs
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const confirmUrl = `${baseUrl}/order/confirm/${order._id}/${confirmationToken}`;
    const cancelUrl = `${baseUrl}/order/cancel/${order._id}/${confirmationToken}`;
    
    // Send email to customer with confirmation link
    const emailTemplate = `
        <h1 style="color: #333; text-align: center; margin-bottom: 20px;">Your Order is Ready for Confirmation</h1>
        <p style="font-size: 16px;">Dear Customer,</p>
        <p>We have reviewed your order and determined the final price including shipping charges.</p>
        
        <div style="background-color: #f5f5f5; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
            <p><strong>Order ID:</strong> ${order.orderId}</p>
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
    `;
    
    try {
      // Use emailSender instead of direct transporter
      await emailSender.sendOrderStatusUpdateEmail(
        customerEmail,
        `Your Order #${order.orderId} - Final Price Confirmation`,
        emailTemplate,
        order
      );
      console.log('Customer notification email sent successfully');
    } catch (error) {
      console.error('Error sending customer notification email:', error);
      // Continue with order update even if email fails
    }
    
    return res.status(200).json({
      success: true,
      message: 'Order updated with shipping charges and final price, customer notified',
      data: order
    });
  } catch (error) {
    logError('Error setting shipping charges and final price', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update order',
      error: error.message
    });
  }
};

// Customer confirms order
exports.confirmOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { token } = req.body;
    
    // Find order
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Verify token (implement proper token verification)
    // This is a simplified version
    
    // Update order status
    order.orderStatus = 'confirmed';
    await order.save();
    
    // If HTML request, redirect to frontend
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/order/confirm/${order._id}/${token}`);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Order confirmed successfully',
      order: {
        _id: order._id,
        orderId: order.orderId,
        orderStatus: order.orderStatus,
        totalPrice: order.totalPrice,
        finalPrice: order.finalPrice,
        shippingAddress: order.shippingAddress
      }
    });
  } catch (error) {
    logError('Error confirming order', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to confirm order',
      error: error.message
    });
  }
};

// Customer cancels order
exports.cancelOrderRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find order
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Update order status
    order.orderStatus = 'cancelled';
    await order.save();
    
    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    logError('Error cancelling order', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};

// Confirm order by customer
exports.confirmOrderByCustomer = async (req, res) => {
  try {
    const { orderId, token } = req.params;
    
    // Find order by ID and token
    const order = await Order.findOne({
      _id: orderId,
      confirmationToken: token
    });
    
    if (!order) {
      // If HTML request, show error page
      if (req.headers.accept && req.headers.accept.includes('text/html')) {
        return res.send(`
          <html>
            <head>
              <title>Order Confirmation Failed</title>
              <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .error-container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f5c6cb; border-radius: 5px; background-color: #f8d7da; }
                h1 { color: #721c24; }
                .btn { display: inline-block; padding: 10px 20px; margin-top: 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
              </style>
            </head>
            <body>
              <div class="error-container">
                <h1>Order Confirmation Failed</h1>
                <p>Sorry, we couldn't find your order or the confirmation link has expired.</p>
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="btn">Go to Homepage</a>
              </div>
            </body>
          </html>
        `);
      }
      
      return res.status(404).json({
        success: false,
        message: 'Invalid order or confirmation token'
      });
    }
    
    // Check if order is already confirmed to prevent duplicate processing
    if (order.orderStatus === 'Confirmed') {
      return res.status(200).json({
        success: true,
        message: 'Order already confirmed',
        order: {
          _id: order._id,
          orderId: order.orderId,
          orderStatus: order.orderStatus,
          totalPrice: order.totalPrice,
          finalPrice: order.finalPrice,
          shippingAddress: order.shippingAddress
        }
      });
    }
    
    // Generate real order ID now that customer has confirmed
    const uniqueOrderId = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Update order status and set order ID
    order.orderStatus = 'Confirmed';
    order.adminStatus = 'Confirmed'; // Update admin status as well
    order.orderId = uniqueOrderId;
    order.confirmationToken = undefined; // Clear token after use
    order.confirmedAt = new Date();
    
    await order.save();
    
    // Create notification for admin
    try {
      await createNotification({
        type: 'ORDER_CONFIRMED',
        message: `Order #${orderId} has been confirmed by customer`,
        userId: 'admin',
        orderId: order._id,
        isAdminNotification: true
      });
    } catch (notifError) {
      console.error('Failed to create admin notification:', notifError);
    }
    
    // Send confirmation email to customer
    let customerEmail, customerName;
    if (order.isGuestOrder && order.guestDetails) {
      customerEmail = order.guestDetails.email;
      customerName = order.guestDetails.name;
    } else if (order.userId && typeof order.userId === 'object') {
      customerEmail = order.userId.email;
      customerName = order.userId.name;
    } else if (order.customerEmail) {
      customerEmail = order.customerEmail;
      customerName = 'Customer';
    }
    
    if (customerEmail) {
      try {
        await emailSender.sendOrderStatusUpdateEmail(
          customerEmail,
          `Order #${order.orderId} Confirmed`,
          `
            <h1>Your Order is Confirmed!</h1>
            <p>Dear ${customerName || 'Customer'},</p>
            <p>Thank you for confirming your order. We will process it right away.</p>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Total Amount:</strong> ₹${order.finalPrice.toFixed(2)}</p>
            <p>You will receive another email when your order ships.</p>
            <p>Thank you for shopping with us!</p>
          `,
          order
        );
        console.log('Customer confirmation email sent successfully');
      } catch (emailError) {
        console.error('Error sending customer confirmation email:', emailError);
        // Continue with order confirmation even if email fails
      }
    }
    
    // Notify admin about order confirmation
    try {
      const admins = await User.find({ role: 'admin' });
      const adminEmails = admins.map(admin => admin.email).filter(email => email).join(',');
      
      if (adminEmails) {
        await emailSender.sendNotificationEmail(
          adminEmails,
          `Order #${order.orderId} Confirmed by Customer`,
          `
            <h1>Order Confirmed by Customer</h1>
            <p>The customer has confirmed the following order:</p>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Customer:</strong> ${customerName || 'Guest'} ${customerEmail ? `(${customerEmail})` : ''}</p>
            <p><strong>Total Amount:</strong> ₹${order.finalPrice.toFixed(2)}</p>
            <p>Please proceed with processing this order.</p>
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/orders/${order._id}" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">View Order</a>
          `
        );
        console.log('Admin notification email sent successfully');
      }
    } catch (adminEmailError) {
      console.error('Error sending admin notification email:', adminEmailError);
      // Continue with order confirmation even if admin email fails
    }
    
    // Redirect to success page or show success message
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.send(`
        <html>
          <head>
            <title>Order Confirmed Successfully</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .success-container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #c3e6cb; border-radius: 5px; background-color: #d4edda; }
              h1 { color: #155724; }
              .details { text-align: left; margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
              .btn { display: inline-block; padding: 10px 20px; margin-top: 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="success-container">
              <h1>Order Confirmed Successfully!</h1>
              <p>Thank you for confirming your order. We will process it right away.</p>
              <div class="details">
                <p><strong>Order ID:</strong> ${order.orderId}</p>
                <p><strong>Total Amount:</strong> ₹${order.finalPrice.toFixed(2)}</p>
              </div>
              <p>A confirmation email has been sent to your email address.</p>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" class="btn">Continue Shopping</a>
            </div>
          </body>
        </html>
      `);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Order confirmed successfully',
      data: {
        orderId: order.orderId,
        status: order.orderStatus
      }
    });
  } catch (error) {
    console.error('Error confirming order:', error);
    
    // If HTML request, show error page
    if (req.headers.accept && req.headers.accept.includes('text/html')) {
      return res.status(500).send(`
        <html>
          <head>
            <title>Order Confirmation Error</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .error-container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f5c6cb; border-radius: 5px; background-color: #f8d7da; }
              h1 { color: #721c24; }
              .btn { display: inline-block; padding: 10px 20px; margin-top: 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
            </style>
          </head>
          <body>
            <div class="error-container">
              <h1>Order Confirmation Error</h1>
              <p>Sorry, something went wrong while confirming your order. Please contact customer support.</p>
              <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" class="btn">Go to Homepage</a>
            </div>
          </body>
        </html>
      `);
    }
    
    logError('Order Confirmation', `Error confirming order: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to confirm order',
      error: error.message
    });
  }
};

// Cancel order by customer
exports.cancelOrderByCustomer = async (req, res) => {
  try {
    const { id, token } = req.params;
    const { cancelReason } = req.body;
    
    // Find order by ID and token
    const order = await Order.findOne({
      _id: id,
      confirmationToken: token,
      orderStatus: 'Awaiting Confirmation'
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Invalid order or confirmation token'
      });
    }
    
    // Update order status
    order.orderStatus = 'Cancelled';
    order.cancelReason = cancelReason || 'Cancelled by customer';
    order.confirmationToken = undefined; // Clear token after use
    await order.save();
    
    // Send cancellation email to customer
    let customerEmail, customerName;
    if (order.isGuestOrder && order.guestDetails) {
      customerEmail = order.guestDetails.email;
      customerName = order.guestDetails.name;
    } else if (order.userId && typeof order.userId === 'object') {
      customerEmail = order.userId.email;
      customerName = order.userId.name;
    } else if (order.customerEmail) {
      customerEmail = order.customerEmail;
      customerName = 'Customer';
    }
    
    if (customerEmail) {
      try {
        await emailSender.sendOrderStatusUpdateEmail(
          customerEmail,
          `Order Cancellation Confirmation`,
          `
            <h1>Your Order has been Cancelled</h1>
            <p>Dear ${customerName || 'Customer'},</p>
            <p>Your order has been cancelled as requested.</p>
            <p><strong>Order Reference:</strong> ${order.orderId || 'Pending'}</p>
            <p><strong>Reason:</strong> ${order.cancelReason}</p>
            <p>If you have any questions, please contact our customer support.</p>
            <p>Thank you for your interest in our products.</p>
          `,
          order
        );
        console.log('Customer cancellation email sent successfully');
      } catch (emailError) {
        console.error('Error sending customer cancellation email:', emailError);
        // Continue with order cancellation even if email fails
      }
    }
    
    // Notify admin about order cancellation
    try {
      const admins = await User.find({ role: 'admin' });
      const adminEmails = admins.map(admin => admin.email).filter(email => email).join(',');
      
      if (adminEmails) {
        await emailSender.sendNotificationEmail(
          adminEmails,
          `Order Cancelled by Customer`,
          `
            <h1>Order Cancelled by Customer</h1>
            <p>The customer has cancelled the following order:</p>
            <p><strong>Order Reference:</strong> ${order.orderId || 'Pending'}</p>
            <p><strong>Customer:</strong> ${customerName || 'Guest'} ${customerEmail ? `(${customerEmail})` : ''}</p>
            <p><strong>Reason:</strong> ${order.cancelReason}</p>
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/orders" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">View Orders</a>
          `
        );
        console.log('Admin notification email sent successfully');
      }
    } catch (adminEmailError) {
      console.error('Error sending admin notification email:', adminEmailError);
      // Continue with order cancellation even if admin email fails
    }
    
    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: {
        status: order.orderStatus
      }
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    logError('Order Cancellation', `Error cancelling order: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};

// Helper function to send email to admin
const sendAdminNotification = async (order) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: adminEmail,
      subject: `New Order Received - ${order.orderId}`,
      html: `
        <h1>New Order Received</h1>
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <p><strong>Customer:</strong> ${order.userId.name}</p>
        <p><strong>Email:</strong> ${order.userId.email}</p>
        <p><strong>Shipping Address:</strong> ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}</p>
        <p><strong>Phone:</strong> ${order.shippingAddress.phone}</p>
        <h2>Order Items</h2>
        <table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse;">
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Price</th>
          </tr>
          ${order.items.map(item => `
            <tr>
              <td>${item.productId.name}</td>
              <td>${item.quantity}</td>
              <td>₹${item.price.toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
        <p><strong>Total Amount:</strong> ₹${order.totalPrice.toFixed(2)}</p>
        <p>Please add shipping charges and set the final price for this order.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/admin/orders/${order._id}" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Review Order</a>
      `
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    logError('Error sending admin notification email', error);
  }
};

// Helper function to send confirmation email to customer
const sendCustomerConfirmationEmail = async (order) => {
  try {
    // Get user email
    const user = await User.findById(order.userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate confirmation token (simplified)
    const token = crypto.randomBytes(20).toString('hex');
    
    // Store token with expiry (implement proper token storage)
    
    const confirmUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/confirm/${order._id}?token=${token}`;
    const cancelUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/cancel/${order._id}?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: user.email,
      subject: `Order Ready for Confirmation - ${order.orderId}`,
      html: `
        <h1>Your Order is Ready for Confirmation</h1>
        <p>Dear ${user.name},</p>
        <p>Our team has reviewed your order and added shipping charges. Here are the details:</p>
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <p><strong>Subtotal:</strong> ₹${order.totalPrice.toFixed(2)}</p>
        <p><strong>Shipping Charges:</strong> ₹${order.shippingCharges.toFixed(2)}</p>
        <p><strong>Final Price:</strong> ₹${order.finalPrice.toFixed(2)}</p>
        ${order.adminNotes ? `<p><strong>Notes:</strong> ${order.adminNotes}</p>` : ''}
        <p>Please confirm your order by clicking the button below:</p>
        <div style="margin: 20px 0;">
          <a href="${confirmUrl}" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin-right: 10px;">Confirm Order</a>
          <a href="${cancelUrl}" style="padding: 10px 15px; background-color: #f44336; color: white; text-decoration: none; border-radius: 4px;">Cancel Order</a>
        </div>
        <p>If you have any questions, please contact our customer support.</p>
        <p>Thank you for shopping with us!</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    logError('Error sending customer confirmation email', error);
  }
};