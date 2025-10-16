import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaBell, FaCheck, FaTrash, FaPlus } from 'react-icons/fa';
import { notificationManagementApi } from '../../services/adminApi';

const NotificationsManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'system_alert'
  });

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await notificationManagementApi.getAllNotifications();
        setNotifications(response.data.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await notificationManagementApi.markAsRead(id);
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification._id === id ? { ...notification, isRead: true } : notification
      ));
      
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  // Create new notification
  const createNotification = async (e) => {
    e.preventDefault();
    
    if (!newNotification.title || !newNotification.message) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      // Get the current admin user's ID from localStorage
      const adminUser = JSON.parse(localStorage.getItem('user'));
      
      if (!adminUser || !adminUser._id) {
        toast.error('Admin user information not found');
        return;
      }
      
      const response = await notificationManagementApi.createNotification({
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        recipientModel: 'Admin', // Set to Admin since we're using admin's ID
        recipient: adminUser._id // Using the admin's ID as recipient
      });
      
      // Add new notification to state
      setNotifications([response.data.data, ...notifications]);
      
      // Reset form
      setNewNotification({
        title: '',
        message: '',
        type: 'system_alert'
      });
      
      setShowForm(false);
      toast.success('Notification sent successfully');
    } catch (error) {
      console.error('Error creating notification:', error);
      toast.error(`Failed to send notification: ${error.response?.data?.error || error.message}`);
    }
  };
  
  // Delete notification
  const deleteNotification = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await notificationManagementApi.deleteNotification(id);
        
        // Remove from state
        setNotifications(notifications.filter(notification => notification._id !== id));
        
        toast.success('Notification deleted successfully');
      } catch (error) {
        console.error('Error deleting notification:', error);
        toast.error('Failed to delete notification');
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNotification({
      ...newNotification,
      [name]: value
    });
  };

  // Get notification type badge
  const getTypeBadge = (type) => {
    switch (type) {
      case 'info':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Info</span>;
      case 'success':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Success</span>;
      case 'warning':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Warning</span>;
      case 'error':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Error</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{type}</span>;
    }
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications Management</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-[#92c51b] text-white rounded-md hover:bg-[#7ba515] transition-colors"
        >
          <FaPlus className="mr-2" />
          {showForm ? 'Cancel' : 'Create Notification'}
        </button>
      </div>

      {/* Create Notification Form */}
      {showForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Create New Notification</h2>
          <form onSubmit={createNotification}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={newNotification.title}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
                Message*
              </label>
              <textarea
                id="message"
                name="message"
                value={newNotification.message}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="4"
                required
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
                Type
              </label>
              <select
                id="type"
                name="type"
                value={newNotification.type}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="system_alert">System Alert</option>
                <option value="order_update">Order Update</option>
                <option value="user_action">User Action</option>
                <option value="product_update">Product Update</option>
                <option value="admin_action">Admin Action</option>
              </select>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[#92c51b] hover:bg-[#7ba515] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Send Notification
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#92c51b]"></div>
        </div>
      ) : notifications.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-left">Title</th>
                <th className="py-3 px-4 text-left">Message</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <tr key={notification._id} className={notification.read ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-3 px-4">
                    {getTypeBadge(notification.type)}
                  </td>
                  <td className="py-3 px-4 font-medium">{notification.title}</td>
                  <td className="py-3 px-4">{notification.message.length > 50 
                    ? `${notification.message.substring(0, 50)}...` 
                    : notification.message}
                  </td>
                  <td className="py-3 px-4">{new Date(notification.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    {notification.isRead 
                      ? <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Read</span>
                      : <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Unread</span>
                    }
                  </td>
                  <td className="py-3 px-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="mr-2 text-green-600 hover:text-green-800"
                        title="Mark as read"
                      >
                        <FaCheck />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete notification"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <FaBell className="text-gray-400 text-5xl mb-4" />
          <p className="text-gray-500 text-lg">No notifications found</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsManagement;