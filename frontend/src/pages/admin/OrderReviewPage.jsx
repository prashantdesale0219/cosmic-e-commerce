import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersApi } from '../../services/api';
import { orderManagementApi } from '../../services/adminApi';
import axios from 'axios';
import { FaSpinner, FaSave, FaArrowLeft, FaUser, FaMapMarkerAlt, FaShoppingCart, FaTruck, FaPhone, FaEnvelope, FaMoneyBillWave, FaShippingFast, FaFileInvoiceDollar, FaClipboardCheck } from 'react-icons/fa';
import './OrderReviewPage.css';

const OrderReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [shippingCharges, setShippingCharges] = useState(0);
  const [adminNotes, setAdminNotes] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Force re-render to fix styling issues
  const [forceUpdate, setForceUpdate] = useState(0);

  // Check if user is authenticated and is an admin
  useEffect(() => {
    const token = localStorage.getItem('token');
    const adminToken = localStorage.getItem('adminToken'); // Check for admin token first
    const userRole = localStorage.getItem('userRole');
    
    // First check for admin token, which is the preferred auth method for admin pages
    if (adminToken) {
      // Admin token exists, proceed with page load
      return;
    }
    
    // Fallback to regular token + role check
    if (!token) {
      setError('You must be logged in to view this page');
      setLoading(false);
      // Redirect to admin login page after 2 seconds
      setTimeout(() => {
        navigate('/admin/login?redirect=' + encodeURIComponent(window.location.pathname));
      }, 2000);
      return;
    }
    
    // Check if user is an admin
    if (userRole !== 'admin') {
      setError('You are not authorized to access this page. Admin privileges required.');
      setLoading(false);
      // Redirect to admin login page after 2 seconds
      setTimeout(() => {
        navigate('/admin/login');
      }, 2000);
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // First try with adminToken, then fallback to regular token
        const adminToken = localStorage.getItem('adminToken');
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');
        
        // Determine which token to use
        const authToken = adminToken || token;
        
        if (!authToken) {
          setError('Authentication required. Please log in.');
          setLoading(false);
          return;
        }
        
        // If using regular token, verify admin role
        if (!adminToken && userRole !== 'admin') {
          setError('Admin privileges required to view order details.');
          setLoading(false);
          return;
        }

        console.log('Fetching order with ID:', id);
        // Make direct API call with token
        const API_URL = import.meta.env.NEXT_PUBLIC_API_URL || "https://cosmic-hzcn.onrender.com/api";
        const response = await axios.get(`${API_URL}/admin/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'X-Admin-Request': 'true' // Add admin request header
          }
        });
        
        if (response.data) {
          console.log('Order data received:', response.data);
          // Handle both response formats - direct data or nested in data property
          const orderData = response.data.data || response.data;
          setOrder(orderData);
          
          // Initialize shipping charges if it exists
          if (orderData.shippingCharges) {
            setShippingCharges(orderData.shippingCharges);
          }
          
          // Initialize admin notes if they exist
          if (orderData.adminNotes) {
            setAdminNotes(orderData.adminNotes);
          }
        } else {
          console.error('Invalid response format:', response);
          setError('Invalid order data received');
        }
      } catch (err) {
        // Handle authentication errors specifically
        if (err.response && err.response.status === 401) {
          setError('You are not authorized to view this order. Please log in with the correct account.');
          
          // Redirect to login page after 2 seconds
          setTimeout(() => {
            navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
          }, 2000);
        } else if (err.response && err.response.status === 500) {
          setError('Server error. Please try again later.');
          console.log('Server error details:', err.response.data);
        } else {
          setError('Failed to load order details. Please try again later.');
        }
        
        console.error('Error fetching order:', err);
        
        // Log detailed error information
        if (err.response) {
          console.error('Error response:', err.response.data);
          console.error('Error status:', err.response.status);
        } else if (err.request) {
          console.error('No response received:', err.request);
        } else {
          console.error('Error message:', err.message);
        }
      } finally {
        setLoading(false);
        // Force update after loading to ensure styles are applied
        setTimeout(() => setForceUpdate(prev => prev + 1), 100);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  const calculateSubtotal = () => {
    if (!order?.items || order.items.length === 0) return 0;
    return order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateFinalPrice = () => {
    const subtotal = order?.subtotal || calculateSubtotal();
    const discount = order?.couponDiscount || 0;
    return subtotal - discount + Number(shippingCharges);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // First try with adminToken, then fallback to regular token
      const adminToken = localStorage.getItem('adminToken');
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      
      // Determine which token to use
      const authToken = adminToken || token;
      
      // If using regular token, verify admin role
      if (!adminToken && userRole !== 'admin') {
        setError('Admin privileges required to update order.');
        setSubmitting(false);
        return;
      }
      
      // Calculate final price
      const finalPrice = calculateFinalPrice();
      
      // Send shipping charges, final price and admin notes to backend using direct API call
      const API_URL = import.meta.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      
      await axios.put(`${API_URL}/orders/${id}/shipping-price`, {
        shippingCharges: Number(shippingCharges),
        finalPrice: finalPrice,
        adminNotes: adminNotes
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-Admin-Request': 'true' // Add admin request header
        }
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/orders');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-600 text-4xl mx-auto mb-4" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 border-b pb-4">
          <button 
            onClick={() => navigate('/admin/orders')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 md:mb-0"
          >
            <FaArrowLeft className="mr-2" /> Back to Orders
          </button>
          
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <FaClipboardCheck className="text-blue-600 mr-3" />
            Review Order #{order?.orderId || id.substring(0, 8)}
          </h1>
          
          <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            {order?.orderStatus || 'Pending Review'}
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">Order updated successfully! Redirecting...</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Customer Information Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
              <div className="flex items-center mb-4 border-b pb-2">
                <FaUser className="text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold">Customer Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="flex items-center text-gray-700 mb-3">
                    <span className="font-medium mr-2 w-20">Name:</span> 
                    <span className="text-gray-900">{order?.userId?.name || order?.guestDetails?.name || order?.shippingAddress?.fullName || 'N/A'}</span>
                  </p>
                  <p className="flex items-center text-gray-700 mb-3">
                    <FaEnvelope className="text-gray-500 mr-2" />
                    <span className="font-medium mr-2 w-20">Email:</span> 
                    <span className="text-gray-900">{order?.userId?.email || order?.guestDetails?.email || order?.shippingAddress?.email || order?.customerEmail || 'N/A'}</span>
                  </p>
                </div>
                <div>
                  <p className="flex items-center text-gray-700 mb-3">
                    <FaPhone className="text-gray-500 mr-2" />
                    <span className="font-medium mr-2 w-20">Phone:</span> 
                    <span className="text-gray-900">{order?.shippingAddress?.phone || order?.guestDetails?.phone || 'N/A'}</span>
                  </p>
                  <p className="flex items-center text-gray-700">
                    <span className="font-medium mr-2 w-20">Type:</span> 
                    <span className={`px-2 py-1 rounded-full text-xs ${order?.isGuestOrder ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                      {order?.isGuestOrder ? 'Guest Customer' : 'Registered User'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            
            {/* Shipping Address Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
              <div className="flex items-center mb-4 border-b pb-2">
                <FaMapMarkerAlt className="text-red-500 mr-2" />
                <h2 className="text-lg font-semibold">Shipping Address</h2>
              </div>
              
              {order?.shippingAddress ? (
                <div className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  <p className="mb-2 font-medium">{order.shippingAddress.fullName || order?.userId?.name || 'N/A'}</p>
                  <p className="mb-2">{order.shippingAddress.address || 'N/A'}</p>
                  <p className="mb-2">
                    {order.shippingAddress.city || 'N/A'}, {order.shippingAddress.state || 'N/A'} {order.shippingAddress.pincode || 'N/A'}
                  </p>
                  <p className="mb-2">Phone: {order.shippingAddress.phone || 'N/A'}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    <FaShippingFast className="inline mr-1" /> 
                    Delivery Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic">No shipping address provided</p>
              )}
            </div>
            
            {/* Order Items Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
              <div className="flex items-center mb-4 border-b pb-2">
                <FaShoppingCart className="text-green-600 mr-2" />
                <h2 className="text-lg font-semibold">Order Items</h2>
              </div>
              
              {order?.items && order.items.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items.map((item, index) => (
                        <tr key={item._id || index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-12 w-12 flex-shrink-0 border border-gray-200 rounded-md overflow-hidden">
                                <img 
                                  className="h-full w-full object-cover" 
                                  src={item.productId?.images?.[0] || '/placeholder.png'} 
                                  alt={item.productId?.name || `Product ${index + 1}`}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/placeholder.png';
                                  }}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {item.productId?.name || `Product ${index + 1}`}
                                </div>
                                {item.productId?.sku && (
                                  <div className="text-xs text-gray-500">SKU: {item.productId.sku}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.price.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">Subtotal:</td>
                        <td className="px-6 py-3 text-sm font-medium text-gray-900">₹{calculateSubtotal().toFixed(2)}</td>
                      </tr>
                      {order?.couponDiscount > 0 && (
                        <tr>
                          <td colSpan="3" className="px-6 py-3 text-right text-sm font-medium text-gray-500">Discount:</td>
                          <td className="px-6 py-3 text-sm font-medium text-red-600">-₹{order.couponDiscount.toFixed(2)}</td>
                        </tr>
                      )}
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 italic">No items in this order</p>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            {/* Shipping and Pricing Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6 sticky top-4">
              <div className="flex items-center mb-4 border-b pb-2">
                <FaFileInvoiceDollar className="text-purple-600 mr-2" />
                <h2 className="text-lg font-semibold">Set Shipping & Final Price</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaMoneyBillWave className="inline mr-2 text-green-600" />
                    Subtotal
                  </label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700" 
                    value={`₹${calculateSubtotal().toFixed(2)}`} 
                    disabled 
                  />
                </div>
                
                {order?.couponDiscount > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Coupon Discount</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-red-600" 
                      value={`-₹${order.couponDiscount.toFixed(2)}`} 
                      disabled 
                    />
                    {order?.couponCode && (
                      <p className="mt-1 text-xs text-gray-500">Code: {order.couponCode}</p>
                    )}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaTruck className="inline mr-2 text-blue-600" />
                    Shipping Charges
                  </label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    value={shippingCharges} 
                    onChange={(e) => setShippingCharges(e.target.value)}
                    min="0"
                    step="1"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Enter shipping charges based on delivery location</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes (Optional)</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add any notes about this order..."
                  ></textarea>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Final Price (Including Shipping)</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 font-bold text-lg" 
                    value={`₹${calculateFinalPrice().toFixed(2)}`} 
                    disabled 
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center items-center px-5 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <FaSave className="-ml-1 mr-2 h-4 w-4" />
                        Save and Notify Customer
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReviewPage;