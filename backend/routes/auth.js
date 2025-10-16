const express = require('express');
const router = express.Router();

// Import controllers
const { register } = require('../controllers/auth/register');
const { login } = require('../controllers/auth/login');
const { forgotPassword } = require('../controllers/auth/forgotPassword');
const { resetPassword } = require('../controllers/auth/resetPassword');
const { createAdmin } = require('../controllers/auth/createAdmin');
const { verifyOtp } = require('../controllers/auth/verifyOtp');
const { resendOtp } = require('../controllers/auth/resendOtp');
const { getMe } = require('../controllers/auth/me');
const { 
  getAllCustomers, 
  getCustomer, 
  updateCustomer, 
  deleteCustomer 
} = require('../controllers/auth/customers');

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// Routes
router.post('/register', register);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', protect, getMe); // Get current logged-in user

router.post('/admin',createAdmin);//admin route
router.post('/create-admin', protect, authorize('admin'), createAdmin); // Protected admin creation

// Customer routes
router.get('/customers', protect, authorize('admin'), getAllCustomers); // Get all customers (admin only)
router.get('/customers/:id', protect, getCustomer); // Get single customer (own profile or admin)
router.put('/customers/:id', protect, updateCustomer); // Update customer profile
router.delete('/customers/:id', protect, deleteCustomer); // Delete customer profile

// User stats
router.get('/user-stats', protect, require('../controllers/auth/userStats').getUserStats);

module.exports = router;