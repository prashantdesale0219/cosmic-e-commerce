const User = require('../../models/auth/auth');
const PasswordReset = require('../../models/auth/passwordReset');
const crypto = require('crypto');

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Set token expiry (10 minutes from now)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Create or update password reset record
    await PasswordReset.findOneAndDelete({ userId: user._id });
    await PasswordReset.create({
      userId: user._id,
      token: resetToken,
      expiresAt
    });

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    // In a real application, you would send an email with the reset URL
    // For this implementation, we'll just return the reset URL in the response
    
    res.status(200).json({
      success: true,
      message: 'Password reset link sent',
      resetUrl // In production, remove this and send via email instead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};