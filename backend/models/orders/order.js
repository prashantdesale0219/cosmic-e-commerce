const mongoose = require('mongoose');
const { generateOrderId } = require('../../utils/orderUtils');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    // Remove default to ensure orderId is only generated after confirmation
  },
  userId: {
    type: mongoose.Schema.Types.Mixed, // Changed to Mixed type to support both ObjectId and string
    ref: 'User',
    required: true
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  items: [orderItemSchema],
  totalPrice: {
    type: Number,
    required: true
  },
  shippingAddress: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String
  },
  paymentMethod: {
    type: String,
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['Pending Review', 'Awaiting Confirmation', 'Confirmed', 'Cancelled', 'shipped', 'delivered'],
    default: 'Pending Review'
  },
  shippingCharges: {
    type: Number,
    default: 0
  },
  finalPrice: {
    type: Number
  },
  adminNotes: {
    type: String
  },
  subtotal: {
    type: Number
  },
  couponDiscount: {
    type: Number,
    default: 0
  },
  confirmationToken: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);