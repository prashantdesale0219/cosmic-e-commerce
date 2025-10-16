import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingBag, FaUser, FaCog, FaBox, FaChartLine, FaShoppingCart, FaClipboardList, FaHeart } from 'react-icons/fa';
import { authApi } from '../../services/api';
import { toast } from 'react-toastify';

const DashboardHome = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    cart: 0 
  });
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Try to get user data from localStorage first for immediate display
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
        
        // Fetch fresh data from API
        const response = await authApi.getCurrentUser();
        if (response.data) {
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
          console.log(response.data)
        }
        
        // Fetch user stats (orders, wishlist, cart)
        const statsResponse = await authApi.getUserStats();
        if (statsResponse.data) {
          const { orders, cart, wishlist, firstName, lastName, name, email } = statsResponse.data;
          setStats({ orders, cart, wishlist });
          
          // Update user data with the latest from API
          const userData = {
            ...user,
            firstName,
            lastName,
            name,
            email
          };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Problem loading dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);
  
  const dashboardCards = [
    {
      title: 'My Orders',
      description: 'View and track all your orders',
      icon: <FaShoppingBag className="h-8 w-8 text-main" />,
      link: '/dashboard/my-orders',
      color: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      title: 'Profile',
      description: 'Update your profile information',
      icon: <FaUser className="h-8 w-8 text-main" />,
      link: '/dashboard/profile',
      color: 'bg-green-50 hover:bg-green-100'
    },
    {
      title: 'Settings',
      description: 'Manage your account settings',
      icon: <FaCog className="h-8 w-8 text-main" />,
      link: '/dashboard/settings',
      color: 'bg-yellow-50 hover:bg-yellow-100'
    }
  ];

  // Display loading state while fetching data
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main"></div>
        <span className="ml-3 text-gray-600">Loading your dashboard...</span>
      </div>
    );
  }

  // Format user name for display
  const displayName = user ? (user.firstName || user.name || user.email || 'Customer') : 'Customer';

  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h1>
      
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-main to-main-dark text-white p-8 rounded-xl mb-8 shadow-lg transform transition-all duration-300 hover:scale-[1.01]">
        <div className="flex items-center">
          <div className="mr-6">
            <FaChartLine className="h-12 w-12 text-white opacity-80" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">
              Welcome to Cosmic, {displayName}!
            </h2>
            <p className="opacity-90 text-lg">
              Here's a summary of your account activity
            </p>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="bg-main/10 p-3 rounded-full mr-4">
              <FaShoppingCart className="text-main text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Cart Items</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.cart || 0}</h3>
              <p className="text-xs text-gray-500 mt-1">Items in your shopping cart</p>
            </div>
          </div>
          <Link to="/dashboard/cart" className="text-main text-sm font-medium mt-4 inline-block hover:underline">
            View Cart
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full mr-4">
              <FaClipboardList className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Orders</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.orders || 0}</h3>
              <p className="text-xs text-gray-500 mt-1">Total orders placed</p>
            </div>
          </div>
          <Link to="/dashboard/my-orders" className="text-purple-600 text-sm font-medium mt-4 inline-block hover:underline">
            View Orders
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="bg-pink-100 p-3 rounded-full mr-4">
              <FaHeart className="text-pink-600 text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">Wishlist</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.wishlist || 0}</h3>
              <p className="text-xs text-gray-500 mt-1">Saved items for later</p>
            </div>
          </div>
          <Link to="/dashboard/wishlist" className="text-pink-600 text-sm font-medium mt-4 inline-block hover:underline">
            View Wishlist
          </Link>
        </div>
      </div>
      
      {/* Recent Orders Preview */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Recent Orders</h3>
          <Link to="/dashboard/my-orders" className="text-main hover:text-main-dark text-sm font-medium flex items-center">
            View All Orders
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        <div className="border rounded-xl overflow-hidden bg-gray-50">
          <div className="p-10 text-center text-gray-500">
            <FaBox className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <p className="text-lg mb-4">No orders yet</p>
            <Link to="/" className="mt-4 inline-block px-6 py-3 bg-main text-white rounded-lg hover:bg-main-dark transition-colors duration-300 font-medium">
              Shop Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;