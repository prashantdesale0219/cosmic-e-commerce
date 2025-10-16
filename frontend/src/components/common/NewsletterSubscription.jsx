import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { newsletterApi } from '../../services/api';

const NewsletterSubscription = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    try {
      setLoading(true);
      const response = await newsletterApi.subscribe({ email });
      
      if (response.data.success) {
        toast.success(response.data.message || 'Successfully subscribed to newsletter!');
        setEmail('');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error(error.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-row gap-2">
          <div className="relative flex-grow">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 bg-gray-600 text-white border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors whitespace-nowrap ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewsletterSubscription;