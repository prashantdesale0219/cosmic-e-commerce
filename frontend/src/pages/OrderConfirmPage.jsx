import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaShoppingCart, FaSpinner } from 'react-icons/fa';

const OrderConfirmPage = () => {
  const { orderId, token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const confirmOrder = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
        const response = await axios.post(`${API_URL}/order-review/customer-confirm/${orderId}/${token}`);
        
        if (response.data.success) {
          setOrderDetails(response.data.order);
        } else {
          setError('Failed to confirm order. Please contact customer support.');
        }
      } catch (err) {
        console.error('Error confirming order:', err);
        setError(err.response?.data?.message || 'An error occurred while confirming your order.');
      } finally {
        setLoading(false);
      }
    };

    if (orderId && token) {
      confirmOrder();
    }
  }, [orderId, token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <FaSpinner className="animate-spin text-4xl text-blue-600 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700">Confirming your order...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-700 mb-2">Order Confirmation Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => navigate('/')} 
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-green-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Thank You for Your Order!</h2>
          <p className="text-gray-600 mb-6">Your order has been confirmed successfully.</p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-gray-700 font-medium">Order ID: <span className="font-bold">{orderId}</span></p>
            {orderDetails && (
              <>
                <p className="text-gray-700 font-medium mt-2">Total Amount: <span className="font-bold">₹{orderDetails.finalPrice || orderDetails.totalPrice}</span></p>
                {orderDetails.shippingAddress && (
                  <div className="mt-3 text-left">
                    <p className="font-medium text-gray-700">Shipping Address:</p>
                    <p className="text-gray-600 text-sm">
                      {orderDetails.shippingAddress.fullName}<br />
                      {orderDetails.shippingAddress.addressLine1}<br />
                      {orderDetails.shippingAddress.addressLine2 && `${orderDetails.shippingAddress.addressLine2}, `}
                      {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.postalCode}<br />
                      {orderDetails.shippingAddress.country || 'India'}<br />
                      Phone: {orderDetails.shippingAddress.phone}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          
          <p className="mb-4 flex items-center justify-center text-green-500">
            <FaCheckCircle className="mr-2" /> Your order is now being processed
          </p>
          
          <div className="flex flex-col space-y-3">
            <button 
              onClick={() => navigate('/')} 
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
            >
              Continue Shopping
            </button>
            <button 
              onClick={() => navigate('/orders')} 
              className="w-full py-2 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition duration-200"
            >
              View All Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmPage;