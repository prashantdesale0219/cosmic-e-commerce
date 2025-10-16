const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { setupSecurity } = require('./middleware/security');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize main app
const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(cors({
  origin: [process.env.CLIENT_URL || 'https://fronte-cosmic-4sjm.vercel.app', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD'],
  exposedHeaders: ['Content-Length', 'Content-Type']
}));

// Apply security middleware
setupSecurity(app);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/categories', require('./routes/category'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/order-review', require('./routes/orderReview'));
app.use('/api/reviews', require('./routes/review'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/emi', require('./routes/emi'));
app.use('/api/newsletter', require('./routes/newsletter'));
app.use('/api/coupons', require('./routes/coupon'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/shipping', require('./routes/shipping'));

// Default route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Set proper headers for static files
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Add direct access to uploads folder with explicit path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add direct access to root folder
app.use(express.static(path.join(__dirname)));

// Start main server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Main server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`Uploads are now being served on the main server (port ${PORT})`);
});