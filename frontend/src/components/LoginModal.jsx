import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authApi } from '../services/api';

const LoginModal = ({ isOpen, onClose }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Check if user is already logged in when modal opens
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      try {
        // Only parse if userData exists and is not 'undefined'
        const user = userData && userData !== 'undefined' ? JSON.parse(userData) : null;
        
        if (token && user) {
          // If already logged in, redirect based on role and close modal
          if (user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
          onClose();
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data
        localStorage.removeItem('user');
      }
    }
  }, [isOpen, navigate, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // Trim whitespace from email and password
      const trimmedCredentials = {
        email: credentials.email.trim(),
        password: credentials.password.trim()
      };
      
      console.log('Attempting login with:', { email: trimmedCredentials.email });
      const response = await authApi.login(trimmedCredentials);
      
      // Store token in localStorage
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // If user data is available in the response, use it directly
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          // Show success message
          toast.success('Login successful');
          
          // Redirect based on user role
          if (response.data.user.role === 'admin') {
            console.log('Admin login detected, redirecting to admin dashboard');
            navigate('/admin');
          } else {
            console.log('User login detected, redirecting to home page');
            navigate('/');
          }
          
          // Close the modal after successful login
          onClose();
        } 
        // If user data is missing or incomplete, fetch it from /me endpoint
        else {
          try {
            const userResponse = await authApi.getCurrentUser();
            if (userResponse.data && userResponse.data.data) {
              localStorage.setItem('user', JSON.stringify(userResponse.data.data));
              
              // Show success message
              toast.success('Login successful');
              
              // Redirect based on user role
              if (userResponse.data.data.role === 'admin') {
                console.log('Admin login detected, redirecting to admin dashboard');
                navigate('/admin');
              } else {
                console.log('User login detected, redirecting to home page');
                navigate('/');
              }
              
              // Close the modal after successful login
              onClose();
            } else {
              throw new Error('User data not found');
            }
          } catch (userError) {
            console.error('Error fetching user data:', userError);
            toast.error('Login successful but unable to fetch user data');
            localStorage.removeItem('token');
            navigate('/');
            onClose();
          }
        }
      } else {
        throw new Error('Token not found in response');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Provide more specific error messages based on the error
      if (error.response) {
        if (error.response.status === 401) {
          toast.error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error('Login failed. Please try again.');
        }
      } else if (error.request) {
        toast.error('Server not responding. Please check your internet connection.');
      } else {
        toast.error('An error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center sm:justify-end z-50 p-4 sm:p-6 md:p-8">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[350px] sm:w-96 md:w-[420px] p-5 sm:p-6 md:p-8 relative sm:mt-0 sm:mr-6 md:mr-8 animate-fadeIn">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        
        <div className="text-center mb-5 sm:mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-2xl font-bold text-gray-800">Login to my account</h2>
          <p className="text-gray-600 text-sm sm:text-base mt-2">Enter your e-mail and password:</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4 sm:mb-5">
            <label htmlFor="modal-email" className="block text-gray-700 text-sm sm:text-base font-medium mb-2">Email Address:</label>
            <input
              type="email"
              id="modal-email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2.5 sm:p-3 focus:outline-none focus:ring-2 focus:ring-main focus:border-main text-sm sm:text-base"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="mb-5 sm:mb-6">
            <label htmlFor="modal-password" className="block text-gray-700 text-sm sm:text-base font-medium mb-2">Password:</label>
            <input
              type="password"
              id="modal-password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2.5 sm:p-3 focus:outline-none focus:ring-2 focus:ring-main focus:border-main text-sm sm:text-base"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-main text-white py-2.5 sm:py-3 md:py-3.5 rounded-md font-medium hover:bg-main-dark transition duration-300 text-sm sm:text-base shadow-sm"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Sign In'}
          </button>
        </form>
        
        <div className="text-center mt-5 sm:mt-6">
          <p className="text-gray-600 text-sm sm:text-base font-medium">New Customer?</p>
          <Link 
            to="/auth/register" 
            onClick={onClose}
            className="block mt-3 border border-main text-main py-2 sm:py-2.5 md:py-3 rounded-md font-medium hover:bg-main-light transition duration-300 text-sm sm:text-base shadow-sm"
          >
            <span className="flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 w-4 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Create an Account
            </span>
          </Link>
        </div>
        
        <div className="text-center mt-4 sm:mt-5 md:mt-6">
          <Link to="/auth/forgot-password" onClick={onClose} className="text-main hover:underline text-sm sm:text-base font-medium transition-colors duration-200">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;