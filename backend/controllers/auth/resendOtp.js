const User = require('../../models/auth/auth');
const EmailVerification = require('../../models/auth/emailVerification');
const { generateOTP } = require('../../utils/otpUtils');
const { sendVerificationEmail } = require('../../utils/emailSender');

// @desc    Resend verification OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Check if user is already verified
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This account is already verified'
      });
    }

    // Find existing verification record
    const existingVerification = await EmailVerification.findOne({ userId: user._id });
    
    // Check if user is locked out
    if (existingVerification && existingVerification.lockUntil && existingVerification.lockUntil > new Date()) {
      const remainingTime = Math.ceil((existingVerification.lockUntil - new Date()) / (1000 * 60));
      return res.status(429).json({
        success: false,
        message: `Too many OTP requests. Please try again after ${remainingTime} minutes.`,
        lockUntil: existingVerification.lockUntil
      });
    }
    
    // Check if user has reached the limit of 3 attempts within 30 minutes
    if (existingVerification && existingVerification.resendCount >= 3) {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      if (existingVerification.lastResendTime > thirtyMinutesAgo) {
        // Lock the account for 30 minutes
        const lockUntil = new Date(Date.now() + 30 * 60 * 1000);
        existingVerification.lockUntil = lockUntil;
        await existingVerification.save();
        
        return res.status(429).json({
          success: false,
          message: 'You have reached the maximum number of OTP requests. Please try again after 30 minutes.',
          lockUntil
        });
      } else {
        // Reset counter if 30 minutes have passed since last attempt
        existingVerification.resendCount = 0;
      }
    }

    // Generate new OTP
    const otp = generateOTP();
    
    if (existingVerification) {
      // Update existing verification record
      existingVerification.otp = otp;
      existingVerification.resendCount += 1;
      existingVerification.lastResendTime = Date.now();
      await existingVerification.save();
    } else {
      // Create new verification record
      await EmailVerification.create({
        userId: user._id,
        email: user.email,
        otp,
        resendCount: 1,
        lastResendTime: Date.now()
      });
    }
    
    // Send verification email
    await sendVerificationEmail(user.email, otp);

    // Send response
    res.status(200).json({
      success: true,
      message: 'Verification OTP has been resent to your email',
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};