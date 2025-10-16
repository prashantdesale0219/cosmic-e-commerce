const User = require('../../models/auth/auth');
const EmailVerification = require('../../models/auth/emailVerification');
const jwt = require('jsonwebtoken');
const { generateOTP } = require('../../utils/otpUtils');
const { sendVerificationEmail } = require('../../utils/emailSender');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register customer
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      mobileNumber,
      phoneNumber,
      secondaryNumber,
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

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check if customer already exists
    const customerExists = await User.findOne({ email });
    if (customerExists) {
      return res.status(400).json({
        success: false,
        message: 'Customer already exists'
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      mobileNumber,
      phoneNumber,
      secondaryNumber,
      addressLine1,
      addressLine2,
      suburb,
      state,
      zipCode,
      country,
      companyName,
      gstNumber,
      pan,
      role: 'customer'
    });

    // Generate OTP
    const otp = generateOTP();
    
    // Save OTP to database
    await EmailVerification.create({
      userId: user._id,
      email: user.email,
      otp
    });
    
    // Send verification email
    await sendVerificationEmail(user.email, otp);

    // Send response
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email for verification OTP',
      userId: user._id,
      email: user.email
    })
     
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};