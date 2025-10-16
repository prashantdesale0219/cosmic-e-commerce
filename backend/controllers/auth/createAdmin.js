const User = require('../../models/auth/auth');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { _id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

// @desc    Create admin user directly
// @route   POST /api/auth/admin
// @access  Public
exports.createAdmin = async (req, res) => {
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

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Admin already exists'
      });
    }

    // Create admin user
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
      role: 'admin'
    });

    // Generate token
    const token = generateToken(user);

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
    res.status(201)
      .cookie('token', token, options)
      .json({
        success: true,
        message: 'Admin  created successfully',
        token,
        user: {
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: user.role
        }
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};