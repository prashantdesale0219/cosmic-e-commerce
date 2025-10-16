import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaShoppingBag, FaCog, FaHome } from 'react-icons/fa';

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!token || !userData) {
      navigate('/');
      return;
    }
    
    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/');
    }
  }, [navigate]);
  
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <FaHome className="w-5 h-5" />
    },
    {
      name: 'My Orders',
      path: '/dashboard/my-orders',
      icon: <FaShoppingBag className="w-5 h-5" />
    },
    {
      name: 'Profile',
      path: '/dashboard/profile',
      icon: <FaUser className="w-5 h-5" />
    },
    {
      name: 'Settings',
      path: '/dashboard/settings',
      icon: <FaCog className="w-5 h-5" />
    }
  ];
  
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">User Dashboard</h1>
            <Link to="/" className="text-main hover:text-main-dark">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-14 w-14 rounded-full bg-main text-white flex items-center justify-center text-xl font-bold">
                  {user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{user?.firstName ? `${user.firstName} ${user.lastName}` : user?.name || 'User'}</h2>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                        location.pathname === item.path
                          ? 'bg-main text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="w-full md:w-3/4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;