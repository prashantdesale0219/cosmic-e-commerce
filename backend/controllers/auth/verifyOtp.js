const User = require('../../models/auth/auth');
const EmailVerification = require('../../models/auth/emailVerification');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Verify OTP and activate account
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = async (req, res) => {
  try {
    const { userId, email, otp } = req.body;
    
    // Check if required fields are provided
    if ((!userId && !email) || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId or email, and OTP'
      });
    }
    
    // Use email as userId if provided
     const userIdentifier = email || userId;

     // Check if userIdentifier is an email
     let verification;
     let user;
     
     if (userIdentifier.includes('@')) {
       // If userIdentifier is an email, find verification by email
       verification = await EmailVerification.findOne({ email: userIdentifier });
       
       // Find user by email
       user = await User.findOne({ email: userIdentifier });
     } else {
       // If userIdentifier is an ObjectId, find verification by userId
       verification = await EmailVerification.findOne({ userId: userIdentifier });
       
       // Find user by id
       user = await User.findById(userIdentifier);
     }
    
    // Check if verification record exists
    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'Verification record not found or expired. Please request a new OTP.'
      });
    }

    // Check if OTP matches - convert both to strings for comparison
    if (verification.otp.toString() !== otp.toString()) {
      console.log('OTP mismatch:', {
        stored: verification.otp,
        received: otp,
        storedType: typeof verification.otp,
        receivedType: typeof otp
      });
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user verification status
    user.isVerified = true;
    await user.save();

    // Delete verification record
    await EmailVerification.findByIdAndDelete(verification._id);

    // Generate token
    const token = generateToken(user._id);

    // Set cookie options
    const options = {
      expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
      httpOnly: true
    };

    // Add secure flag in production
    if (process.env.NODE_ENV === 'production') {
      options.secure = true;
    }

    // Send response with cookie
    res.status(200)
      .cookie('token', token, options)
      .json({
        success: true,
        message: 'Email verified successfully',
        token,
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role
        }
      });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};