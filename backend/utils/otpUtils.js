/**
 * Utility functions for OTP generation and verification
 */

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

module.exports = {
  generateOTP
};