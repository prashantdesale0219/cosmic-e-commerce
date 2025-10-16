import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaMinus, FaArrowLeft, FaLock, FaTag } from 'react-icons/fa';
import { cartApi, ordersApi, couponApi } from '../../services/api';
import { fixImageUrl } from '../../utils/imageUtils';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const navigate = useNavigate();

  // Fetch cart items when component mounts
  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await cartApi.getCart();
      if (response.data.success) {
        setCartItems(response.data.data.items || []);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      setError('Failed to load cart items. Please try again.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { value } = e.target;
    setCouponCode(value);
  };
  
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    try {
      setCouponLoading(true);
      setCouponError(null);
      
      // First validate the coupon with the current subtotal
      const validateResponse = await couponApi.validateCoupon(couponCode.toUpperCase(), calculateSubtotal());
      
      if (validateResponse.data.success) {
        // If validation is successful, apply the coupon to increment usage count
        const applyResponse = await couponApi.applyCoupon(couponCode.toUpperCase());
        
        if (applyResponse.data.success) {
          setAppliedCoupon(validateResponse.data.data.coupon);
          setCouponDiscount(validateResponse.data.data.discount);
          setCouponCode(''); // Clear the input field after successful application
          toast.success('Coupon applied successfully!');
        } else {
          setCouponError(applyResponse.data.message || 'Failed to apply coupon');
        }
      } else {
        setCouponError(validateResponse.data.message || 'Invalid coupon');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError(error.response?.data?.message || 'Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await cartApi.updateCartItem(itemId, newQuantity);
      
      // Update local state
      setCartItems(prevItems => 
        prevItems.map(item => 
          item._id === itemId 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      );
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await cartApi.removeCartItem(itemId);
      
      // Update local state
      setCartItems(prevItems => 
        prevItems.filter(item => item._id !== itemId)
      );
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price || 0) * item.quantity;
    }, 0);
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() - couponDiscount;
  };
  
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    if (orderLoading) return;
    
    try {
      setOrderLoading(true);
      
      // Create order payload
      const orderData = {
        paymentMethod: 'cod', // Default to COD
        totalAmount: calculateTotal(),
        couponDiscount: couponDiscount,
        couponCode: appliedCoupon?.code || null
      };
      
      // Place order
      const response = await ordersApi.placeOrder(orderData);
      
      if (response.data.success) {
        // Clear cart manually by removing each item
        for (const item of cartItems) {
          await cartApi.removeCartItem(item._id);
        }
        
        // Redirect to order confirmation
        navigate(`/order-confirmation/${response.data.data._id}`);
      } else {
        setError(response.data.message || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError('Failed to place order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={fetchCartItems}
            className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added any products to your cart yet.</p>
          <Link 
            to="/solar-module" 
            className="bg-[#92c51b] hover:bg-[#82b10b] text-white px-6 py-3 rounded-md inline-flex items-center"
          >
            <FaArrowLeft className="mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Cart Items ({cartItems.length})</h2>
            </div>
            
            <div className="divide-y">
              {cartItems.map((item) => (
                <div key={item._id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center">
                  <div className="flex w-full sm:w-auto">
                    {/* Product Image */}
                    <div className="w-24 h-24 mb-4 sm:mb-0 flex-shrink-0">
                      <img 
                        src={item.productId?.images?.[0] ? fixImageUrl(item.productId.images[0]) : fixImageUrl('placeholder')} 
                        alt={item.productId?.name || 'Product'} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-grow px-4">
                      <Link to={`/product/${item.productId?._id}`} className="text-lg font-medium hover:text-[#92c51b] line-clamp-1">
                        {item.productId?.name || 'Product Name'}
                      </Link>
                      
                      <div className="text-sm text-gray-500 mt-1 hidden sm:block">
                        {item.productId?.description?.substring(0, 100) || 'Product description'}
                        {item.productId?.description?.length > 100 ? '...' : ''}
                      </div>
                      
                      <div className="mt-2 text-[#92c51b] font-semibold">
                        ₹{(item.price || 0).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Quantity Controls - Responsive Layout */}
                  <div className="flex items-center justify-between w-full sm:w-auto mt-4 sm:mt-0 sm:ml-auto">
                    <div className="flex items-center">
                      <button 
                        onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                        disabled={item.quantity <= 1}
                      >
                        <FaMinus className="w-3 h-3 text-gray-600" />
                      </button>
                      
                      <span className="mx-3 w-8 text-center">{item.quantity}</span>
                      
                      <button 
                        onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
                      >
                        <FaPlus className="w-3 h-3 text-gray-600" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleRemoveItem(item._id)}
                      className="ml-4 p-2 text-red-500 hover:text-red-700"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6">
            <Link 
              to="/solar-module" 
              className="inline-flex items-center text-[#92c51b] hover:text-[#82b10b]"
            >
              <FaArrowLeft className="mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{calculateSubtotal().toLocaleString()}</span>
              </div>
              

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
            
            {/* Coupon Input */}
            {!appliedCoupon && (
              <div className="mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex-grow">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className={`px-4 py-2 bg-[#92c51b] hover:bg-[#82b10b] text-white rounded-md ${
                      couponLoading || !couponCode.trim() ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {couponLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>
                {couponError && (
                  <div className="text-red-500 text-sm mt-1">{couponError}</div>
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
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponDiscount(0);
                    setCouponCode('');
                  }}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )}
            
            <button 
              onClick={handlePlaceOrder}
              disabled={orderLoading || cartItems.length === 0}
              className={`w-full bg-[#92c51b] hover:bg-[#82b10b] text-white py-3 rounded-md font-medium flex items-center justify-center ${
                orderLoading || cartItems.length === 0 ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {orderLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <FaLock className="mr-2" />
                  Place My Order
                </>
              )}
            </button>
            
            <div className="mt-4 text-xs text-gray-500 text-center">
              <div className="flex items-center justify-center mb-1">
                <FaLock className="text-[#92c51b] mr-1" />
                Secure checkout
              </div>
              <div>Cash on Delivery</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
