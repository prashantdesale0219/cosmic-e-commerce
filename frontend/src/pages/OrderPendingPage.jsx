import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ordersApi } from '../services/api';
import { FaCheckCircle, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const OrderPendingPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { clearCart } = useCart();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await ordersApi.getOrderById(id);
        setOrder(response.data.data);
        // Clear cart after successfully fetching order
        clearCart();
      } catch (err) {
        setError('Failed to load order details. Please try again later.');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, clearCart]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <FaArrowLeft className="mr-2" /> Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="text-blue-500 text-5xl mb-4">
          <FaCheckCircle className="mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Thank You for Your Order!</h1>
        <p className="text-gray-600 mb-6">Your order has been received and is pending review by our team.</p>
        
        <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md mb-6">
          <p className="text-yellow-800 font-medium">Our team will contact you shortly with the final price including shipping charges.</p>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 font-medium">Order ID: <span className="font-bold">{order?.orderId}</span></p>
        </div>
        
        <p className="text-gray-600 mb-6">
          You will receive an email notification with a link to confirm or cancel your order once the final price is determined.
        </p>
        
        <div className="flex flex-col space-y-3">
          <Link 
            to="/" 
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200"
          >
            Continue Shopping
          </Link>
          
          <Link 
            to="/account/orders" 
            className="w-full py-2 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md transition duration-200"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderPendingPage;