import React, { useState, useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import axios from 'axios';
import { FaUsers, FaShoppingCart, FaBoxOpen, FaChartBar, FaTags, FaPercent, FaClipboardList, FaNewspaper, FaBell, FaHeart, FaCommentAlt, FaCreditCard, FaWarehouse } from 'react-icons/fa';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  const location = useLocation();
  const pathname = location.pathname;
  
  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <FaChartBar /> },
    { name: 'User Management', path: '/admin/users', icon: <FaUsers /> },
    { name: 'Product Management', path: '/admin/products', icon: <FaBoxOpen /> },
    { name: 'Order Management', path: '/admin/orders', icon: <FaShoppingCart /> },
    { name: 'Category Management', path: '/admin/categories', icon: <FaTags /> },
    { name: 'Inventory', path: '/admin/inventory', icon: <FaWarehouse /> },
    { name: 'Offers', path: '/admin/offers', icon: <FaPercent /> },
    { name: 'Coupons', path: '/admin/coupons', icon: <FaPercent /> },
    { name: 'Reports', path: '/admin/reports', icon: <FaChartBar />, hasNew: true },
    { name: 'Newsletter', path: '/admin/newsletter', icon: <FaNewspaper /> },
    { name: 'Notifications', path: '/admin/notifications', icon: <FaBell />, hasNew: true },
    { name: 'Reviews', path: '/admin/reviews', icon: <FaCommentAlt /> },
    { name: 'Wishlist Analytics', path: '/admin/wishlist', icon: <FaHeart /> },
    { name: 'EMI Options', path: '/admin/emi', icon: <FaCreditCard /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className={`bg-[#92c51b] text-white ${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out flex flex-col h-screen`}>
        <div className="p-4 flex justify-between items-center">
          {!collapsed && <h2 className="text-xl font-bold">Admin Panel</h2>}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className="p-2 rounded-md hover:bg-[#7ba515]"
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>
        <nav className="mt-6 flex-1 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center p-4 hover:bg-[#7ba515] transition-colors duration-200 ${pathname === item.path ? 'bg-[#7ba515]' : ''}`}
            >
              <span className="text-xl">{item.icon}</span>
              {!collapsed && <span className="ml-4">{item.name}</span>}
              {!collapsed && item.hasNew && <span className="ml-auto px-2 py-1 text-xs bg-white text-[#92c51b] rounded-full">New</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;