import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const NewsletterManagement = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/newsletter/admin/subscribers');
      // Ensure subscribers is always an array
      setSubscribers(Array.isArray(response.data) ? response.data : 
                    (response.data.subscribers || response.data.data || []));
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      toast.error('Failed to load subscribers');
      setSubscribers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubscriber = async (subscriberId) => {
    if (!window.confirm('Are you sure you want to remove this subscriber?')) {
      return;
    }
    
    try {
      await axios.delete(`/api/newsletter/admin/subscribers/${subscriberId}`);
      setSubscribers(prev => prev.filter(sub => sub._id !== subscriberId));
      toast.success('Subscriber removed successfully');
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      toast.error('Failed to remove subscriber');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Newsletter Subscribers</h2>
          <button 
            onClick={fetchSubscribers}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <p className="text-lg text-gray-600">Loading subscribers...</p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-lg text-gray-600">No subscribers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-6 text-left font-semibold text-gray-700 border-b">Email</th>
                  <th className="py-3 px-6 text-left font-semibold text-gray-700 border-b">Subscribed On</th>
                  <th className="py-3 px-6 text-left font-semibold text-gray-700 border-b">Status</th>
                  <th className="py-3 px-6 text-left font-semibold text-gray-700 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map(subscriber => (
                  <tr key={subscriber._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-6">{subscriber.email}</td>
                    <td className="py-3 px-6">{new Date(subscriber.createdAt || subscriber.subscribedAt).toLocaleDateString()}</td>
                    <td className="py-3 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${(subscriber.isActive || subscriber.isSubscribed) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {(subscriber.isActive || subscriber.isSubscribed) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <button
                        onClick={() => handleDeleteSubscriber(subscriber._id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterManagement;