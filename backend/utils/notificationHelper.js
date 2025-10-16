const Notification = require('../models/notification/notification');

/**
 * Create a notification in the database
 * @param {Object} notificationData - The notification data
 * @param {String} notificationData.recipient - ID of the recipient
 * @param {String} notificationData.recipientModel - Model type of recipient (User, Admin, etc.)
 * @param {String} notificationData.type - Type of notification (order, system, etc.)
 * @param {String} notificationData.title - Title of the notification
 * @param {String} notificationData.message - Message content
 * @param {Object} notificationData.data - Additional data related to notification
 * @returns {Promise<Object>} The created notification
 */
exports.createNotification = async (notificationData) => {
  try {
    const notification = new Notification({
      recipient: notificationData.recipient,
      recipientModel: notificationData.recipientModel || 'User',
      type: notificationData.type || 'system',
      title: notificationData.title,
      message: notificationData.message,
      data: notificationData.data || {},
      read: false
    });
    
    await notification.save();
    
    // Here you would trigger real-time notification via Socket.io if implemented
    // io.to(notification.recipient).emit('notification', notification);
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {String} notificationId - ID of the notification
 * @returns {Promise<Object>} The updated notification
 */
exports.markAsRead = async (notificationId) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true, readAt: new Date() },
      { new: true }
    );
    
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Get all notifications for a recipient
 * @param {String} recipientId - ID of the recipient
 * @param {String} recipientModel - Model type of recipient
 * @returns {Promise<Array>} List of notifications
 */
exports.getNotifications = async (recipientId, recipientModel = 'User') => {
  try {
    const notifications = await Notification.find({
      recipient: recipientId,
      recipientModel: recipientModel
    }).sort({ createdAt: -1 });
    
    return notifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};