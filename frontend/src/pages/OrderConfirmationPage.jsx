import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaShoppingCart } from 'react-icons/fa';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle className="text-green-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Thank You for Your Order!</h2>
          <p className="text-gray-600 mb-6">Your order has been confirmed successfully.</p>
          <div className="mb-4">
            <p className="text-gray-700 font-medium">Order ID: <span className="font-bold">{orderId || "123456"}</span></p>
            <p className="text-gray-700 font-medium mt-2">Total Amount: <span className="font-bold">₹12,999</span></p>
          </div>
          <p className="mb-4 flex items-center justify-center text-green-500">
            <FaShoppingCart className="mr-2" /> Your cart has been cleared
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

export default OrderConfirmationPage;