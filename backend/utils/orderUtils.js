/**
 * Utility functions for order management
 */

/**
 * Generate a 6-digit order ID
 * @returns {string} 6-digit order ID
 */
exports.generateOrderId = () => {
  // Generate a random 6-digit number
  const min = 100000; // Minimum 6-digit number
  const max = 999999; // Maximum 6-digit number
  
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
};