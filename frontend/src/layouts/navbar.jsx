import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchModal from '../components/SearchModal';
import CartPopup from '../components/CartPopup';
import LoginModal from '../components/LoginModal';
import NotificationBell from '../components/common/NotificationBell';
import { toast } from 'react-toastify';
import { cartApi } from '../services/api';

const Navbar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [cartItemsCount, setCartItemsCount] = useState(0);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Reset expanded category when closing menu
    if (isOpen) {
      setExpandedCategory(null);
      // Enable body scroll when menu is closed
      document.body.style.overflow = '';
    } else {
      // Disable body scroll when menu is open
      document.body.style.overflow = 'hidden';
    }
  };
  
  // Clean up body style on component unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  
  // Fetch cart items count
  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        // Only fetch cart if user is logged in (token exists)
        const token = localStorage.getItem('token');
        if (token) {
          const response = await cartApi.getCart();
          if (response.data.success) {
            const items = response.data.data.items || [];
            setCartItemsCount(items.length);
          }
        } else {
          setCartItemsCount(0);
        }
      } catch (error) {
        console.error('Error fetching cart count:', error);
        setCartItemsCount(0);
      }
    };
    
    fetchCartCount();
    
    // Refetch cart count when cart is opened/closed
    if (!isCartOpen) {
      fetchCartCount();
    }
  }, [isCartOpen]);
  
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };
  
  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };
  
  const toggleLogin = () => {
    setIsLoginOpen(!isLoginOpen);
  };
  
  // Close profile dropdown when clicking outside
  const profileRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleCategoryExpand = (index) => {
    setExpandedCategory(expandedCategory === index ? null : index);
  };
  
  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData && userData !== 'undefined' && userData !== undefined) {
      try {
        const parsedData = userData === "undefined" ? null : JSON.parse(userData);
        if (parsedData) {
          setIsLoggedIn(true);
          setUser(parsedData);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Handle invalid JSON by clearing localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setIsLoggedIn(false);
      }
    }
  }, [isLoginOpen]);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  // SVG for Cosmic logo
  const CosmicLogo = () => (
    <div className="flex items-center">
     <img 
       src="/src/assets/images/navbar-logo.png" 
       alt="Cosmic Logo" 
       className="h-8 sm:h-10 w-auto transition-all duration-200" 
     />
   </div>
  );

  // Product categories with dropdown items
  const categories = [
    { 
      name: 'Solar Module', 
      path: '/products/category/solar-module',
      dropdown: [
        { name: 'Solar Panel', path: '/products/category/solar-module/solar-panel' },
        { name: 'Small Solar Modules', path: '/products/category/solar-module/small-solar-modules' },
        { name: 'Flexible Solar Module', path: '/products/category/solar-module/flexible-solar-module' },
        { name: 'Mono PERC Solar Modules', path: '/products/category/solar-module/mono-perc-solar-modules' },
        { name: 'Bifacial Solar Modules', path: '/products/category/solar-module/bifacial-solar-modules' }
      ]
    },
    { 
      name: 'Solar Inverter', 
      path: '/products/category/solar-inverter',
      dropdown: [
        { name: 'Three Phase On Grid Inverter', path: '/products/category/solar-inverter/three-phase-on-grid-inverter' },
        { name: 'Single Phase On Grid Inverter', path: '/products/category/solar-inverter/single-phase-on-grid-inverter' }
      ]
    },
    { 
      name: 'Li-ion Battery', 
      path: '/products/category/li-ion-battery',
      dropdown: [
        { name: 'UPS Li-ion Battery Pack', path: '/products/category/li-ion-battery/ups-li-ion-battery-pack' },
        { name: 'Solar Street Light Li-ion Battery Pack', path: '/products/category/li-ion-battery/solar-street-light-li-ion-battery-pack' },
        { name: 'EV - 2 Wheeler Li-ion Battery Pack', path: '/products/category/li-ion-battery/ev-2-wheeler-li-ion-battery-pack' },
        { name: 'Residential and Commercial Storage Li-ion Battery', path: '/products/category/li-ion-battery/residential-commercial-storage-li-ion-battery' }
      ]
    },
    { name: 'Radiance Solar Kit', path: '/products/category/radiance-solar-kit' },
    { name: 'Save More', path: '/save-more' }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <CosmicLogo isMobile={false} />
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden lg:flex lg:items-center lg:space-x-2 xl:space-x-4 justify-center max-w-4xl mx-auto">
            {/* Product Categories */}
            {categories.map((category, index) => (
              <div key={index} className="relative group">
                <Link 
                  to={category.path} 
                  className="px-3 xl:px-4 py-6 text-gray-700 hover:text-main flex items-center text-sm xl:text-base font-medium whitespace-nowrap transition-colors duration-200"
                >
                  {category.name}
                  {category.dropdown && (
                    <svg className="ml-1.5 h-4 w-4 text-gray-500 group-hover:text-main transition-colors duration-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </Link>
                
                {/* Dropdown Menu */}
                {category.dropdown && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 mt-0 w-72 bg-white rounded-lg shadow-xl py-3 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-100 top-full">
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 bg-white border-t border-l border-gray-100"></div>
                    <div className="py-1">
                      {category.dropdown.map((item, idx) => (
                        <Link
                          key={idx}
                          to={item.path}
                          className="block px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-main transition-colors"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile and Desktop Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Search Icon */}
            <button 
              onClick={toggleSearch}
              className="p-2 text-gray-700 hover:text-main rounded-full hover:bg-gray-100 transition-colors duration-200"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            {/* Notification Bell - Only show for logged in users */}
            {isLoggedIn && (
              <NotificationBell />
            )}
            
            {/* Cart Icon with Count */}
            <div className="relative">
              <button 
                onClick={toggleCart}
                className="p-2 text-gray-700 hover:text-main rounded-full hover:bg-gray-100 transition-colors duration-200 relative"
                aria-label="Cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-main text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                    {cartItemsCount}
                  </span>
                )}
              </button>
              {isCartOpen && <CartPopup isOpen={isCartOpen} onClose={toggleCart} />}
            </div>
            
            {/* Hamburger Menu (for mobile) */}
            <div className="lg:hidden">
              <button 
                onClick={toggleMenu}
                className="p-1 sm:p-2 text-gray-700 hover:text-main rounded-full hover:bg-gray-100"
                aria-label="Menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            {/* Profile Dropdown or Login Button (desktop only) */}
            {isLoggedIn ? (
              <div className="hidden lg:block relative group" ref={profileRef}>
                <button 
                  className="flex items-center ml-2 px-3 py-1.5 bg-main text-white rounded-md hover:bg-main-dark text-sm"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  aria-expanded={String(isProfileOpen)}
                >
                  <span className="flex items-center">
                   
                    <span className="mr-1">Account</span>
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Profile Dropdown Menu - Hover based */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
                  <div className="absolute -top-2 left-3/4 transform -translate-x-1/2 w-4 h-4 rotate-45 bg-white border-t border-l border-gray-100"></div>
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  
                  {user?.role === 'admin' ? (
                    <div className="py-1">
                      <Link to="/admin" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-main">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Admin Dashboard
                      </Link>
                      <Link to="/admin/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-main">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </Link>
                    </div>
                  ) : (
                    <div className="py-1">
                      <Link to="/dashboard" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-main">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                      </Link>
                      <Link to="/dashboard/my-orders" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-main">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        My Orders
                      </Link>
                      <Link to="/dashboard/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-main">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                      <Link to="/dashboard/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-main">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </Link>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-100 mt-1">
                    <button onClick={handleLogout} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={toggleLogin} className="hidden lg:flex ml-2 px-3 py-1.5 bg-main text-white rounded-md hover:bg-main-dark items-center text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login
              </button>
            )}
            
            {/* Login button for desktop only */}
          </div>
        </div>
      </div>

      {/* Mobile menu - Offcanvas style */}
      <div 
        className={`fixed inset-0 z-50 lg:hidden ${isOpen ? 'block' : 'hidden'}`} 
        id="mobile-menu"
      >
        {/* Overlay */}
        <div 
          className={`fixed inset-0 bg-black bg-opacity-60 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={toggleMenu}
        ></div>
        
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto`}>
          {/* Close button and logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <Link to="/" className="flex-shrink-0" onClick={toggleMenu}>
              <CosmicLogo />
            </Link>
            <button 
              onClick={toggleMenu}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="py-3 bg-white">
            {/* User Profile Section (if logged in) */}
            {isLoggedIn && (
              <div className="mb-4 px-4 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center mb-3">
                  <div className="h-12 w-12 rounded-full text-gray-700 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  <div>
                    <p className="font-medium text-gray-900">Account</p>
                    <p className="text-xs text-gray-500">{user?.email || ''}</p>
                  </div>
                </div>
                
                {/* User Navigation Links */}
                <div className="mt-3 space-y-1">
                  {user?.role === 'admin' ? (
                    <>
                      <Link 
                        to="/admin" 
                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-main rounded-md"
                        onClick={toggleMenu}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Admin Dashboard
                      </Link>
                      <Link 
                        to="/admin/settings" 
                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-main rounded-md"
                        onClick={toggleMenu}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/dashboard" 
                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-main rounded-md"
                        onClick={toggleMenu}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                      </Link>
                      <Link 
                        to="/dashboard/my-orders" 
                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-main rounded-md"
                        onClick={toggleMenu}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        My Orders
                      </Link>
                      <Link 
                        to="/dashboard/profile" 
                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-main rounded-md"
                        onClick={toggleMenu}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                      <Link 
                        to="/dashboard/settings" 
                        className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-main rounded-md"
                        onClick={toggleMenu}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </Link>
                    </>
                  )}
                  
                  <button 
                    onClick={() => {
                      handleLogout();
                      toggleMenu();
                    }} 
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
            
      
            
            {/* Product Categories in mobile view */}
            <div className="px-4 mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">Categories</h3>
              {categories.map((category, index) => (
                <div key={index} className="mb-2">
                  <div className="flex items-center bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-200">
                    <Link
                      to={category.path}
                      className="flex-grow px-3 py-2.5 text-gray-700 hover:text-main transition-colors duration-200 font-medium"
                      onClick={() => !category.dropdown && toggleMenu()}
                    >
                      {category.name}
                    </Link>
                    {category.dropdown && (
                      <button
                        onClick={() => toggleCategoryExpand(index)}
                        className="p-2 mr-1 text-gray-500 hover:text-gray-700 transition-colors duration-200 focus:outline-none"
                        aria-label={`Expand ${category.name} menu`}
                      >
                        <svg 
                          className={`h-5 w-5 transition-transform duration-300 ease-in-out ${expandedCategory === index ? 'transform rotate-180' : ''}`} 
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {category.dropdown && expandedCategory === index && (
                    <div className="pl-4 mt-1 space-y-1 border-l-2 border-main ml-3 animate-fadeIn">
                      {category.dropdown.map((item, idx) => (
                        <Link
                          key={idx}
                          to={item.path}
                          className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-main rounded-md transition-colors duration-200"
                          onClick={toggleMenu}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Add animation keyframes for fadeIn effect */}
            <style jsx="true">{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fadeIn {
                animation: fadeIn 0.3s ease-in-out;
              }
            `}</style>
          </div>
        </div>
        </div>
 
      
      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={toggleSearch} />
      
      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={toggleLogin} />
    </nav>
  );
}

export default Navbar;