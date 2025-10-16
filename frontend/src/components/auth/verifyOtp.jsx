import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authApi } from '../../services/api';
import { Link } from 'react-router-dom';
import axios from 'axios';

const VerifyOtp = () => {
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const inputRefs = useRef([]);
  
  // Get email and userId from URL params or location state
  const email = searchParams.get('email') || location.state?.email || '';
  const userId = searchParams.get('userId') || location.state?.userId || token || '';

  useEffect(() => {
    if (!email && !userId) {
      toast.error('Email or User ID not found, please try again');
      navigate('/auth/register');
    }
  }, [email, userId, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    
    // Auto focus to next input if value is entered
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    
    // Check if pasted content is a number and has a valid length
    if (!/^\d+$/.test(pastedData)) return;
    
    const digits = pastedData.slice(0, 4).split('');
    const newOtpValues = [...otpValues];
    
    digits.forEach((digit, index) => {
      if (index < 4) {
        newOtpValues[index] = digit;
      }
    });
    
    setOtpValues(newOtpValues);
    
    // Focus on the last filled input or the next empty one
    const lastFilledIndex = Math.min(digits.length - 1, 3);
    if (lastFilledIndex < 3 && digits.length < 4) {
      inputRefs.current[lastFilledIndex + 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const otpString = otpValues.join('');
    
    if (otpString.length !== 4) {
      toast.error('Please enter a valid 4-digit OTP');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create payload with exact format backend expects
      const payload = {};
      
      // Add email if it exists (preferred)
      if (email && email.trim()) {
        payload.email = email.trim();
      } 
      // Add userId only if email doesn't exist
      else if (userId && userId.trim()) {
        payload.userId = userId.trim();
      }
      
      // Add OTP as string
      payload.otp = otpString;
      
      console.log('Sending payload:', payload);
      
      // Use the API service function
      const response = await authApi.verifyOtp(payload);
      
      toast.success(response.data.message || 'OTP verified successfully');
      
      // Store token in localStorage if returned
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Redirect based on user role
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        // If no token (for password reset flow), navigate to reset password
        navigate('/auth/reset-password', { state: { email, otp: otpString } });
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      console.log('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Incorrect OTP, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendDisabled(true);
      setCountdown(60);
      // Send both email and userId if available
      await authApi.resendOtp({ email, userId });
      toast.success('New OTP has been sent to your email');
    } catch (error) {
      console.error('OTP resend error:', error);
      toast.error(error.response?.data?.message || 'Error occurred while resending OTP');
      setResendDisabled(false);
      setCountdown(0);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            OTP Verification
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 4-digit OTP sent to {email}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} onPaste={handlePaste}>
          <div className="flex justify-center space-x-4">
            {otpValues.map((value, index) => (
              <div key={index} className="w-14 h-14">
                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-full h-full text-center text-2xl font-bold border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-[#92c51b] border-gray-300"
                  style={{ backgroundColor: 'white' }}
                  autoFocus={index === 0}
                />
              </div>
            ))}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#92c51b] hover:bg-[#83b118] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#92c51b]"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify OTP'
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendDisabled}
              className={`font-medium ${
                resendDisabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-[#92c51b] hover:text-[#83b118]'
              }`}
            >
              {resendDisabled
                ? `Resend OTP (${countdown}s)`
                : 'Resend OTP'}
            </button>
            <div className="text-sm">
              <Link to="/auth/forgot-password" className="font-medium text-[#92c51b] hover:text-[#83b118]">
                Go Back
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;