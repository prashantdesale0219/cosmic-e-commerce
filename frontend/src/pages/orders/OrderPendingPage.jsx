import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ordersApi } from '../../services/api';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';

const OrderPendingPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else {
      setLoading(false);
      setError('Order ID is missing. Please check your order confirmation email.');
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getOrderById(orderId);
      if (response.data.success) {
        setOrder(response.data.data);
      } else {
        setError('Order not found');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
        <h2 className="text-xl font-semibold">Loading order details...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center">
        <FaTimesCircle className="text-red-600 text-4xl mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Link to="/account/orders" className="text-blue-600 hover:underline flex items-center">
          <FaArrowLeft className="mr-2" /> Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center justify-center mb-4">
            <FaCheckCircle className="text-blue-600 text-5xl" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Thank You for Your Order!</h1>
          <p className="text-center text-gray-600 mb-4">
            Your order has been received and is pending review by our team.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
            <p className="text-center font-medium text-yellow-800">
              Our team will contact you shortly with the final price including shipping charges.
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 mb-2">Order ID: <span className="font-semibold">{order?.orderId || id}</span></p>
            <p className="text-gray-600">
              You will receive an email notification with a link to confirm or cancel your order once the final price is determined.
            </p>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          
          {order?.items && order.items.length > 0 ? (
            <div className="border rounded-md overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Product</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Quantity</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 mr-3">
                            <img 
                              src={item.productId?.images?.[0] || '/src/assets/images/placeholder.png'} 
                              alt={item.productId?.name} 
                              className="h-10 w-10 object-cover rounded"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/src/assets/images/placeholder.png';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.productId?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-500">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">₹{item.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">No items in this order</p>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">₹{order?.totalPrice?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Shipping:</span>
              <span className="font-medium">To be determined</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-lg font-semibold">To be determined</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <Link to="/" className="mb-4 sm:mb-0 text-blue-600 hover:underline flex items-center">
              <FaArrowLeft className="mr-2" /> Continue Shopping
            </Link>
            <Link to="/account/orders" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPendingPage;