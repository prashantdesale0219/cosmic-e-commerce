const User = require('../../models/auth/auth');
const EmailVerification = require('../../models/auth/emailVerification');
const { logError } = require('../notifications/notificationController');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../../utils/emailSender');

// Get all users with filtering and pagination
exports.getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {};
    
    // Filter by status if provided
    if (status) {
      query.status = status;
    }
    
    // Search by name or email
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Set up sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const options = {
      sort,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      select: '-password'
    };
    
    const users = await User.find(query, null, options);
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { 
      email, 
      password,
      firstName,
      lastName,
      role = 'customer',
      status = 'active'
    } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }
    
    // Create user with minimal required fields
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      status,
      mobileNumber: req.body.mobileNumber || '0000000000', // Placeholder
      phoneNumber: req.body.phoneNumber || '0000000000', // Placeholder
      addressLine1: req.body.addressLine1 || 'To be updated', // Placeholder
      suburb: req.body.suburb || 'To be updated', // Placeholder
      state: req.body.state || 'To be updated', // Placeholder
      zipCode: req.body.zipCode || '000000', // Placeholder
      country: req.body.country || 'To be updated', // Placeholder
      isVerified: false
    });
    
    // Generate OTP for email verification (4-digit)
    const { generateOTP } = require('../../utils/otpUtils');
    const otp = generateOTP();
    const otpExpiry = new Date();
    otpExpiry.setHours(otpExpiry.getHours() + 1); // OTP valid for 1 hour
    console.log('Generated OTP:', otp);
    
    // Save the user
    await newUser.save();
    
    // Create email verification record
    const emailVerification = new EmailVerification({
      userId: newUser._id,
      email: newUser.email,
      otp
      // The model already has createdAt with TTL expiration
    });
    
    await emailVerification.save();
    
    // Send verification email
    await sendVerificationEmail(newUser.email, otp);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully. Verification email sent.',
      data: {
        user: {
          _id: newUser._id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          status: newUser.status,
          isVerified: newUser.isVerified
        }
      }
    });
  } catch (error) {
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body, updatedAt: Date.now() };
    
    // Remove password from update data if it exists
    if (updateData.password) {
      delete updateData.password;
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Block/Unblock user
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const statusMessage = status === 'active' ? 'activated' : 'deactivated';
    
    res.status(200).json({
      success: true,
      message: `User ${statusMessage} successfully`,
      data: user
    });
  } catch (error) {
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Verify OTP for admin-created user
exports.verifyUserOtp = async (req, res) => {
  try {
    const { email, otp, userId } = req.body;
    
    console.log('Verifying OTP:', { email, otp, userId });
    
    // Find the verification record by email AND userId to ensure we get the correct record
    const verification = await EmailVerification.findOne({ 
      email: email,
      userId: userId
    });
    
    console.log('Found verification record:', verification);
    
    if (!verification) {
      return res.status(400).json({ 
        success: false, 
        message: 'No verification record found or expired' 
      });
    }
    
    // Check if OTP is expired (1 hour)
    const now = new Date();
    const createdAt = new Date(verification.createdAt);
    const hourInMs = 60 * 60 * 1000;
    
    if (now - createdAt > hourInMs) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired' 
      });
    }
    
    console.log('Stored OTP:', verification.otp, 'Received OTP:', otp);
    
    // Force both OTPs to be strings and remove any whitespace
    // This ensures consistent comparison regardless of how they're stored
    const storedOtp = String(verification.otp).trim();
    const receivedOtp = String(otp).trim();
    
    console.log('Comparing OTPs - Stored (type):', typeof storedOtp, 'Received (type):', typeof receivedOtp);
    console.log('Comparing OTPs - Stored:', storedOtp, 'Received:', receivedOtp, 'Match:', storedOtp === receivedOtp);
    
    // Verify OTP match
    if (storedOtp !== receivedOtp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP' 
      });
    }
    
    console.log('OTP verified successfully');
    
    // Update user verification status
    await User.findByIdAndUpdate(
      verification.userId,
      { isVerified: true },
      { new: true }
    );
    
    // Delete the verification record
    await EmailVerification.findByIdAndDelete(verification._id);
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Complete user profile after verification
exports.completeUserProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const { 
      mobileNumber, 
      phoneNumber, 
      addressLine1, 
      addressLine2,
      suburb,
      state,
      zipCode,
      country,
      companyName,
      gstNumber,
      pan
    } = req.body;
    
    // Update user profile
    const user = await User.findByIdAndUpdate(
      userId,
      {
        mobileNumber,
        phoneNumber,
        addressLine1,
        addressLine2,
        suburb,
        state,
        zipCode,
        country,
        companyName,
        gstNumber,
        pan,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'User profile completed successfully',
      data: user
    });
  } catch (error) {
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const inactiveUsers = await User.countDocuments({ status: 'inactive' });
    
    // Get new users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Get monthly user registration for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ]);
    
    // Get admin users count
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    // Get new users today, this week, and this month
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: today }
    });
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });
    
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo }
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        newUsers,
        monthlyRegistrations,
        adminUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth
      }
    });
  } catch (error) {
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};