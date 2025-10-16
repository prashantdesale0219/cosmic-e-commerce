const express = require('express');
const router = express.Router();
const { 
  createNotification, 
  getUserNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  logActivity,
  getActivityLogs,
  getErrorLogs,
  sendNewsletterNotification
} = require('../controllers/notifications/notificationController');
const { protect, authorize } = require('../middleware/auth');

// User notification routes
router.get('/user', protect, getUserNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/mark-all-read', protect, markAllAsRead);
router.delete('/:id', protect, deleteNotification);

// Admin notification routes
router.post('/', protect, authorize('admin'), createNotification);
router.post('/newsletter', protect, authorize('admin'), sendNewsletterNotification);
router.get('/activity-logs', protect, authorize('admin'), getActivityLogs);
router.get('/error-logs', protect, authorize('admin'), getErrorLogs);
router.post('/log-activity', protect, logActivity);

module.exports = router;