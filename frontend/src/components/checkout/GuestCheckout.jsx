import React, { useState } from 'react';
import { FaEnvelope, FaCheck } from 'react-icons/fa';

const GuestCheckout = ({ 
  onEmailVerified, 
  verifiedEmail, 
  setVerifiedEmail, 
  verificationOtp, 
  setVerificationOtp 
}) => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // In a real implementation, you would call an API to send OTP
      // For now, we'll simulate it with a timeout
      setTimeout(() => {
        setOtpSent(true);
        setLoading(false);
        // For demo purposes, let's set a fixed OTP
        setVerificationOtp('123456');
      }, 1000);
    } catch (error) {
      setError('Failed to send OTP. Please try again.');
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP sent to your email');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // In a real implementation, you would verify the OTP with an API
      // For now, we'll just check if it matches our fixed OTP
      if (otp === verificationOtp) {
        setVerifiedEmail(email);
        onEmailVerified(email);
        setLoading(false);
      } else {
        setError('Invalid OTP. Please try again.');
        setLoading(false);
      }
    } catch (error) {
      setError('Failed to verify OTP. Please try again.');
      setLoading(false);
    }
  };

  if (verifiedEmail) {
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="flex items-center text-green-600 mb-2">
          <FaCheck className="mr-2" />
          <span className="font-medium">Email Verified</span>
        </div>
        <p className="text-gray-700">{verifiedEmail}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="text-lg font-semibold mb-4">Guest Checkout</h3>
      
      {!otpSent ? (
        <form onSubmit={handleSendOtp}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <div className="mb-4">
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              type="text"
              id="otp"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter verification code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              A verification code has been sent to {email}
            </p>
          </div>
          
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>
      )}
    </div>
  );
};

export default GuestCheckout;