import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AdminAuthContext = createContext();
const API_URL = import.meta.env.NEXT_PUBLIC_API_URL;

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if admin is logged in on component mount
    const checkAdminAuth = async () => {
      const token = localStorage.getItem('adminToken');
      
      if (token) {
        try {
          // Set default Authorization header for all axios requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Verify token by fetching admin profile
          const response = await axios.get(`${API_URL}/admin/user-stats`);
          
          // If successful response, user is authenticated as admin
          setAdmin({
            ...response.data.data,
            role: 'admin',
            token: token
          });
        } catch (err) {
          console.error('Admin auth error:', err);
          // Clear token if invalid
          localStorage.removeItem('adminToken');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      
      setLoading(false);
    };

    checkAdminAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (response.data.success && response.data.data.role === 'admin') {
        // Store token in localStorage
        const token = response.data.token;
        localStorage.setItem('adminToken', token);
        
        // Set default Authorization header for all future axios requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Set admin state
        setAdmin({
          ...response.data.data,
          token: token
        });
        
        return true;
      } else {
        setError('Unauthorized: Admin access required');
        return false;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('adminToken');
    delete axios.defaults.headers.common['Authorization'];
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, error, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);

export default AdminAuthContext;