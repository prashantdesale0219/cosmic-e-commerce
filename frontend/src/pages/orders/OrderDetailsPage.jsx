import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ordersApi } from '../../services/api';
import { FaArrowLeft, FaBox, FaShippingFast, FaCheckCircle, FaTimesCircle, FaSpinner, FaSync } from 'react-icons/fa';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const pollingInterval = useRef(null);

  useEffect(() => {
    fetchOrderDetails();
    
    // Set up polling to refresh order data every 30 seconds
    pollingInterval.current = setInterval(() => {
      fetchOrderDetails(false);
    }, 30000);
    
    // Clean up interval on component unmount
    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [id]);

  const fetchOrderDetails = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      
      const response = await ordersApi.getOrderById(id);
      if (response.data.success) {
        setOrder(response.data.data);
      }
      
      if (showLoading) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details. Please try again.');
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleManualRefresh = () => {
    fetchOrderDetails(false);
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
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
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
        <div className="mt-4">
          <button 
            onClick={() => navigate('/orders')}
            className="flex items-center text-main hover:text-main-dark transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 text-yellow-600 p-4 rounded-md">
          Order not found.
        </div>
        <div className="mt-4">
          <button 
            onClick={() => navigate('/orders')}
            className="flex items-center text-main hover:text-main-dark transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <button 
          onClick={() => navigate('/orders')}
          className="flex items-center text-main hover:text-main-dark transition-colors"
        >
          <FaArrowLeft className="mr-2" />
          Back to Orders
        </button>
        
        <button 
          onClick={handleManualRefresh}
          className="flex items-center text-main hover:text-main-dark transition-colors"
          disabled={refreshing}
        >
          <FaSync className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Order'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Order ID</p>
              <p className="font-medium">{order.orderId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Order Date</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Amount</p>
              <p className="font-medium">₹{order.totalPrice?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Status</p>
              <div className="flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(order.orderStatus)}`}>
                  {getStatusIcon(order.orderStatus)}
                  <span className="ml-1 capitalize">{order.orderStatus}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Order Timeline</h2>
          <div className="space-y-4">
            {order.statusUpdates && order.statusUpdates.length > 0 ? (
              order.statusUpdates.map((update, index) => (
                <div key={index} className="flex">
                  <div className="mr-4">
                    <div className="w-8 h-8 rounded-full bg-main flex items-center justify-center">
                      {getStatusIcon(update.status)}
                    </div>
                    {index < order.statusUpdates.length - 1 && (
                      <div className="w-0.5 h-12 bg-gray-200 mx-auto"></div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium capitalize">{update.status}</p>
                    <p className="text-sm text-gray-500">{formatDate(update.timestamp)}</p>
                    {update.comment && (
                      <p className="text-sm mt-1">{update.comment}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500">No status updates available.</div>
            )}
          </div>
        </div>

        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items && order.items.map((item) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img 
                            className="h-10 w-10 object-contain" 
                            src={item.product?.images?.[0] ? fixImageUrl(item.product.images[0]) : fixImageUrl('placeholder')} 
                            alt={item.product?.name} 
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {item.product?.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{item.price?.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">₹{(item.price * item.quantity)?.toFixed(2)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-6 bg-gray-50">
          <div className="flex flex-col items-end">
            <div className="w-full max-w-md">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">₹{order.totalPrice?.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-medium text-green-600">-₹{order.discount?.toFixed(2)}</span>
                </div>
              )}
              {order.shippingFee > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">₹{order.shippingFee?.toFixed(2)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">₹{order.tax?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-lg font-semibold">₹{order.totalPrice?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;