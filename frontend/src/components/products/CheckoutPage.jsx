import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaLock, FaTag } from 'react-icons/fa';
import { cartApi, ordersApi } from '../../services/api';
import GuestCheckout from '../checkout/GuestCheckout';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [showGuestCheckout, setShowGuestCheckout] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [verificationOtp, setVerificationOtp] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod'
  });

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await cartApi.getCart();
      if (response.data.success) {
        const items = response.data.data.items || [];
        if (items.length === 0) {
          navigate('/cart');
          return;
        }
        setCartItems(items);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setError('Failed to load cart items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'couponCode') {
      setCouponCode(value.toUpperCase());
      setCouponError(null);
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price || 0) * item.quantity;
    }, 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    // Free shipping for orders above ₹10,000
    return subtotal > 10000 ? 0 : 250;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() - couponDiscount;
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || couponLoading) return;
    
    setCouponLoading(true);
    setCouponError(null);
    
    try {
      const response = await cartApi.applyCoupon({ code: couponCode });
      
      if (response.data.success) {
        setAppliedCoupon(response.data.data.coupon);
        setCouponDiscount(response.data.data.discount);
        setCouponCode('');
      } else {
        setCouponError(response.data.message || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError(error.response?.data?.message || 'Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };
  
  const handleRemoveCoupon = async () => {
    try {
      await cartApi.removeCoupon();
      setAppliedCoupon(null);
      setCouponDiscount(0);
    } catch (error) {
      console.error('Error removing coupon:', error);
    }
  };

  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (orderLoading) return;
    
    // Validate form data
    if (!formData.fullName || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
      setError('Please fill in all required fields');
      return;
    }
    
    // Show confirmation popup instead of immediately sending the order
    setOrderDetails({
      shippingAddress: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      },
      paymentMethod: formData.paymentMethod,
      totalAmount: calculateTotal(),
      totalPrice: calculateTotal(),
      shippingFee: calculateShipping(),
      couponCode: appliedCoupon?.code,
      couponDiscount: couponDiscount,
      status: 'pending_admin_review'
    });
    
    setShowConfirmationPopup(true);
  };
  
  // Function to send order to admin after confirmation
  const sendOrderToAdmin = async () => {
    setOrderLoading(true);
    setError(null);
    
    try {
      let response;
      
      if (!isLoggedIn) {
        if (!verifiedEmail || !verificationOtp) {
          setShowGuestCheckout(true);
          setOrderLoading(false);
          setShowConfirmationPopup(false);
          return;
        }
        
        // Send order details to admin for review (guest)
        response = await ordersApi.sendOrderForReview({
          email: verifiedEmail,
          otp: verificationOtp,
          shippingAddress: orderDetails.shippingAddress,
          paymentMethod: orderDetails.paymentMethod,
          totalAmount: orderDetails.totalAmount,
          totalPrice: orderDetails.totalPrice,
          shippingFee: orderDetails.shippingFee
        });
      } else {
        // Send order details to admin for review (logged-in user)
        const userId = localStorage.getItem('userId');
        response = await ordersApi.sendOrderForReview({
          ...orderDetails,
          userId: userId || "guest-user", // Provide fallback userId if null
          items: cartItems,
          subtotal: calculateSubtotal(), // Add required subtotal field
          totalPrice: calculateTotal() // Ensure totalPrice is set correctly
        });
      }
      
      if (response.data.success) {
        // Redirect to order pending page
        navigate(`/order-pending/${response.data.data._id}`);
      } else {
        setError(response.data.message || 'Failed to place order. Please try again.');
      }
      
    } catch (error) {
      console.error('Error processing order:', error);
      setError(error.response?.data?.message || 'Failed to process order. Please try again.');
    } finally {
      setOrderLoading(false);
      setShowConfirmationPopup(false);
    }
  };
  
  // Function removed as it's now integrated into handleSubmit
  const handleConfirmationPopup = () => {
    // This is just a placeholder function to maintain code structure
    // The actual confirmation popup functionality has been removed
    console.log('Confirmation popup functionality has been removed');
    
    // Placeholder to maintain code structure
    if (false) {
      try {
        // This is a placeholder try block
        console.log('This code will never execute');
        // Placeholder error handling
        setError('Failed to send order for review. Please try again.');
      } catch (error) {
        console.error('Error sending order for review:', error);
        setError(error.response?.data?.message || 'Failed to send order for review. Please try again.');
      } finally {
        setOrderLoading(false);
        setShowConfirmationPopup(false);
      }
    }
  };
  
  const handleGuestVerification = (email, otp) => {
    setVerifiedEmail(email);
    setVerificationOtp(otp);
    setShowGuestCheckout(false);
    setFormData({
      ...formData,
      email: email
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#92c51b]"></div>
        </div>
      </div>
    );
  }

  // Confirmation Popup Component
  const ConfirmationPopup = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold mb-4 text-center">Order Request</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <p className="text-yellow-700">Our team will contact you shortly with the final price including shipping charges.</p>
          </div>
          <p className="mb-4 text-gray-600">You will receive an email notification with a link to confirm or cancel your order once the price is determined.</p>
          
          <div className="flex justify-end space-x-4 mt-6">
            <button 
              onClick={() => setShowConfirmationPopup(false)} 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition duration-200"
            >
              Back
            </button>
            <button 
              onClick={sendOrderToAdmin} 
              className="px-4 py-2 bg-[#92c51b] text-white rounded hover:bg-[#7ba615] transition duration-200 font-medium"
              disabled={orderLoading}
            >
              {orderLoading ? 'Processing...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      {showConfirmationPopup && <ConfirmationPopup />}
      
      {showGuestCheckout && (
        <div className="mb-6">
          <GuestCheckout 
            onVerified={handleGuestVerification}
            onCancel={() => setShowGuestCheckout(false)}
          />
        </div>
      )}
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Checkout Form */}
        <div className="lg:w-2/3">
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Shipping Information</h2>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
            

            

          </form>
          
          <div className="mt-6">
            <button
              onClick={() => navigate('/cart')}
              className="inline-flex items-center text-[#92c51b] hover:text-[#82b10b]"
            >
              <FaArrowLeft className="mr-2" />
              Back to Cart
            </button>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="max-h-60 overflow-y-auto mb-4">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-start space-x-3 mb-3 pb-3 border-b border-gray-100">
                  <div className="w-16 h-16 flex-shrink-0 bg-gray-50 p-1 border border-gray-100 rounded-md">
                    <img 
                      src={item.productId?.images?.[0] ? fixImageUrl(item.productId.images[0]) : fixImageUrl('placeholder')} 
                      alt={item.productId?.name || 'Product'} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-1">
                      {item.productId?.name || 'Product'}
                    </h3>
                    <div className="flex justify-between items-end mt-1">
                      <p className="text-sm font-bold text-gray-900">
                        ₹{item.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{calculateSubtotal().toLocaleString()}</span>
              </div>
              
              {/* Coupon Input */}
              {!appliedCoupon && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">Apply Coupon</div>
                  <div className="flex space-x-2">
                    <div className="flex-grow">
                      <input
                        type="text"
                        name="couponCode"
                        placeholder="Enter coupon code"
                        value={couponCode}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className={`px-4 py-2 bg-[#92c51b] hover:bg-[#82b10b] text-white rounded-md ${
                        couponLoading || !couponCode.trim() ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {couponLoading ? 'Applying...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && (
                    <div className="mt-1 text-sm text-red-600">{couponError}</div>
                  )}
                </div>
              )}
              
              {/* Applied Coupon */}
              {appliedCoupon && (
                <div className="mb-4 p-2 bg-[#f5f9e8] border border-[#dbe8b0] rounded-md flex justify-between items-center">
                  <div className="flex items-center">
                    <FaTag className="text-[#92c51b] mr-2" />
                    <div>
                      <div className="font-medium">{appliedCoupon.code}</div>
                      <div className="text-xs text-[#92c51b]">₹{couponDiscount} discount applied</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-gray-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              )}
              
              {/* Coupon Discount */}
              {appliedCoupon && (
                <div className="flex justify-between text-[#92c51b]">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-₹{couponDiscount.toLocaleString()}</span>
                </div>
              )}
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{calculateTotal().toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  (Including taxes)
                </div>
              </div>
            </div>
            
            <button 
              type="submit"
              form="checkout-form"
              disabled={orderLoading}
              className={`w-full bg-[#92c51b] hover:bg-[#82b10b] text-white py-3 rounded-md font-medium flex items-center justify-center ${
                orderLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
              onClick={handleSubmit}
            >
              {orderLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FaLock className="mr-2" />
                  Place Order
                </>
              )}
            </button>
            
            <div className="mt-4 text-xs text-gray-500 text-center">
              <div className="flex items-center justify-center mb-1">
                <FaLock className="text-[#92c51b] mr-1" />
                Secure checkout
              </div>
              {formData.paymentMethod === 'online' && (
                <div>Powered by Razorpay</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;