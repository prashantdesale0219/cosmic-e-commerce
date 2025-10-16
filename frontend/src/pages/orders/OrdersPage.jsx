import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../../services/api';
import { FaBox, FaShippingFast, FaCheckCircle, FaTimesCircle, FaSpinner, FaEye, FaSync } from 'react-icons/fa';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const pollingInterval = useRef(null);

  useEffect(() => {
    fetchOrders();
    
    // Set up polling to refresh orders data every 60 seconds
    pollingInterval.current = setInterval(() => {
      fetchOrders(false);
    }, 60000);
    
    // Clean up interval on component unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      const response = await ordersApi.getMyOrders();
      if (response.data.success) {
        setOrders(response.data.data.orders || []);
      }
      
      if (showLoading) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again.');
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleManualRefresh = () => {
    fetchOrders(false);
  };

  const getFilteredOrders = () => {
    if (activeFilter === 'all') return orders;
    return orders.filter(order => order.orderStatus.toLowerCase() === activeFilter);
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <FaSpinner className="text-yellow-500" />;
      case 'processing':
        return <FaBox className="text-blue-500" />;
      case 'shipped':
        return <FaShippingFast className="text-purple-500" />;
      case 'delivered':
        return <FaCheckCircle className="text-green-500" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaSpinner className="text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
        <button 
          onClick={handleManualRefresh}
          className="flex items-center text-main hover:text-main-dark transition-colors"
          disabled={refreshing}
        >
          <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Orders'}
        </button>
      </div>
      
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === 'all' ? 'bg-main text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          All Orders
        </button>
        <button 
          onClick={() => setActiveFilter('pending')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Pending
        </button>
        <button 
          onClick={() => setActiveFilter('processing')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === 'processing' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Processing
        </button>
        <button 
          onClick={() => setActiveFilter('shipped')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === 'shipped' ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Shipped
        </button>
        <button 
          onClick={() => setActiveFilter('delivered')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === 'delivered' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Delivered
        </button>
        <button 
          onClick={() => setActiveFilter('cancelled')}
          className={`px-4 py-2 rounded-full text-sm font-medium ${activeFilter === 'cancelled' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Cancelled
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      ) : getFilteredOrders().length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBox className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
          <Link to="/products" className="inline-block bg-main text-white px-6 py-2 rounded-md hover:bg-main-dark transition-colors">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {getFilteredOrders().map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Order ID</p>
                    <p className="font-medium">{order.orderId}</p>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <p className="text-sm text-gray-500 mb-1">Order Date</p>
                    <p className="font-medium">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                    <p className="font-medium">₹{order.totalPrice.toFixed(2)}</p>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <div className="flex items-center">
                      {getStatusIcon(order.orderStatus)}
                      <span className="ml-2 font-medium capitalize">{order.orderStatus}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 sm:p-6">
                <h3 className="font-medium mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center">
                      <div className="w-16 h-16 border border-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        <img 
                          src={item.product?.images?.[0] ? fixImageUrl(item.product.images[0]) : fixImageUrl('placeholder')} 
                          alt={item.product?.name} 
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="font-medium text-sm">{item.product?.name}</h4>
                        <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{item.price.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 sm:p-6 bg-gray-50 flex justify-between items-center">
                <Link 
                  to={`/orders/${order._id}`} 
                  className="flex items-center text-main hover:text-main-dark transition-colors"
                >
                  <FaEye className="mr-2" />
                  View Details
                </Link>
                
                {order.orderStatus === 'pending' && (
                  <button 
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                    onClick={() => {/* Cancel order function */}}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;