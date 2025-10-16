import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ordersApi } from '../../services/api';
import { FaCheckCircle, FaBox, FaArrowLeft, FaShoppingCart, FaMapMarkerAlt, FaMoneyBillWave, FaCalendarAlt, FaSync } from 'react-icons/fa';

const OrderConfirmationPage = () => {
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

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
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
      <div className="max-w-4xl mx-auto">
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
        
        {/* Success Banner */}
        <div className="bg-green-50 rounded-lg p-6 mb-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-green-500 text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-green-700 mb-2">Order Placed Successfully!</h1>
          <p className="text-green-600 mb-4">Thank you for your purchase. Your order has been confirmed.</p>
          <p className="text-gray-600">Order ID: <span className="font-semibold">{order.orderId}</span></p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <FaCalendarAlt className="text-gray-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaMoneyBillWave className="text-gray-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium capitalize">{order.paymentMethod || 'Cash on Delivery'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaMapMarkerAlt className="text-gray-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Shipping Address</p>
                  <p className="font-medium">
                    {order.shippingAddress ? 
                      `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.pincode}` : 
                      'Default Address'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <FaBox className="text-gray-500 mt-1 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Order Status</p>
                  <p className="font-medium capitalize">{order.orderStatus}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.items && order.items.map((item) => (
                <div key={item._id} className="flex items-center border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="w-16 h-16 border border-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={item.product?.images?.[0] ? fixImageUrl(item.product.images[0]) : fixImageUrl('placeholder')} 
                      alt={item.product?.name} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="font-medium">{item.product?.name}</h4>
                    <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-6 bg-gray-50">
            <h3 className="font-semibold mb-4">Order Summary</h3>
            <div className="flex flex-col items-end">
              <div className="w-full max-w-md">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">₹{order.totalAmount ? (order.totalAmount - (order.shippingFee || 0) + (order.couponDiscount || 0)).toFixed(2) : order.totalPrice?.toFixed(2)}</span>
                </div>
                {order.couponDiscount > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Coupon Discount:</span>
                    <span className="font-medium text-green-600">-₹{order.couponDiscount?.toFixed(2)}</span>
                  </div>
                )}
                {(order.shippingFee > 0) && (
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">₹{order.shippingFee?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-t border-gray-200 mt-2">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-lg font-semibold">₹{order.totalAmount?.toFixed(2) || order.totalPrice?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link 
            to="/orders" 
            className="flex items-center text-main hover:text-main-dark transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            View All Orders
          </Link>
          
          <Link 
            to="/" 
            className="bg-main text-white px-6 py-3 rounded-md hover:bg-main-dark transition-colors flex items-center"
          >
            <FaShoppingCart className="mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;