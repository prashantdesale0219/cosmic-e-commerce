/**
 * Utility functions for the application
 */

/**
 * Generate a random coupon code
 * @param {number} length - Length of the code (default: 8)
 * @param {string} prefix - Prefix for the code (default: '')
 * @returns {string} - Random coupon code
 */
const generateRandomCode = (length = 8, prefix = '') => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return prefix ? `${prefix}${result}` : result;
};

module.exports = {
  generateRandomCode
};