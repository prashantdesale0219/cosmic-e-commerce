import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { cartApi } from '../services/api';
import { fixImageUrl } from '../utils/imageUtils';
import { FaShoppingCart, FaTrash, FaTimes, FaArrowRight, FaBolt, FaStar } from 'react-icons/fa';

// Import product image as fallback
import solarModule from '../assets/images/power1.webp';

const CartPopup = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const cartRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      fetchCartItems();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  // Close cart when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);
  
  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const response = await cartApi.getCart();
      if (response.data.success) {
        const items = response.data.data.items || [];
        setCartItems(items);
        
        // Calculate total price
        const total = items.reduce((sum, item) => {
          return sum + (item.price * item.quantity);
        }, 0);
        setTotalPrice(total);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveItem = async (itemId, e) => {
    e.stopPropagation();
    try {
      await cartApi.removeCartItem(itemId);
      fetchCartItems(); // Refresh cart after removal
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };
  
  if (!isOpen) return null;

  return (
    <>+00
  .    {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"></div>
      )}
      
      {/* Offcanvas */}
      <div        
        ref={cartRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-xl z-50 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ maxWidth: '100%' }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FaShoppingCart className="mr-2" /> 
              Your Cart <span className="ml-2 text-sm text-gray-500">({cartItems.length} items)</span>
            </h3>
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
          
          {/* Body */}
           <div className="flex-1 overflow-y-auto">
             {loading ? (
               <div className="p-8 text-center">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main mx-auto"></div>
                 <p className="mt-4 text-sm text-gray-500">Loading your cart...</p>
               </div>
             ) : cartItems.length === 0 ? (
               <div className="p-8 text-center">
                 <FaShoppingCart className="mx-auto h-16 w-16 text-gray-300" />
                 <p className="mt-4 text-base text-gray-500">Your cart is empty</p>
                 <Link 
                   to="/products" 
                   className="mt-6 inline-block px-6 py-3 bg-main text-white text-sm font-medium rounded-md hover:bg-main-dark transition-colors duration-200"
                   onClick={onClose}
                 >
                   Browse Products
                 </Link>
               </div>
             ) : (
               <>
                 <ul className="divide-y divide-gray-100">
                   {cartItems.map((item) => (
                     <li key={item._id} className="p-4 hover:bg-gray-50">
                       <div className="flex items-center space-x-4">
                         <div className="flex-shrink-0 w-20 h-20 border border-gray-200 rounded-md overflow-hidden">
                           <img 
                             src={item.productId?.images?.[0] ? fixImageUrl(item.productId.images[0]) : solarModule} 
                             alt={item.productId?.name || 'Product'} 
                             className="w-full h-full object-cover"
                           />
                         </div>
                         <div className="flex-1 min-w-0">
                           <Link to={`/product/${item.productId?._id}`} className="text-sm font-medium text-gray-900 truncate hover:text-main">
                             {item.productId?.name || 'Product'}
                           </Link>
                           <div className="flex items-center mt-1">
                             <span className="text-sm text-gray-500 mr-2">Qty: {item.quantity}</span>
                           </div>
                           <p className="text-sm font-medium text-main mt-1">
                             ₹{item.price || 0}
                           </p>
                         </div>
                         <div>
                           <button
                             onClick={(e) => handleRemoveItem(item._id, e)}
                             className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition-colors duration-200"
                             aria-label="Remove item"
                           >
                             <FaTrash className="h-4 w-4" />
                           </button>
                         </div>
                       </div>
                     </li>
                   ))}
                 </ul>
                 
                 {/* No dummy recommendations - we'll show actual related products */}
               </>
             )}
          </div>
          
          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between text-base font-medium text-gray-900 mb-3">
                <p>Subtotal</p>
                <p>₹{totalPrice.toLocaleString()}</p>
              </div>
              <div className="mt-4 space-y-2">
                <Link
                  to="/checkout"
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-main hover:bg-main-dark focus:outline-none transition-colors duration-200"
                  onClick={onClose}
                >
                  Proceed to Checkout <FaArrowRight className="ml-2" />
                </Link>
                <Link
                  to="/cart"
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors duration-200"
                  onClick={onClose}
                >
                  View Cart
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartPopup;