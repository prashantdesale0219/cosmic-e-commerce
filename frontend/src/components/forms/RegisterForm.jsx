import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import { toast } from 'react-toastify';

const RegisterForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    mobileNumber: '',
    firstName: '',
    lastName: '',
    companyName: '',
    gstNumber: '',
    phoneNumber: '',
    secondaryNumber: '',
    addressLine1: '',
    addressLine2: '',
    suburbCity: '',
    country: '',
    stateProvince: '',
    zipPostcode: '',
    pan: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    // Validate password length
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Map frontend fields to backend expected fields
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.password,
        mobileNumber: formData.phoneNumber,
        phoneNumber: formData.phoneNumber,
        secondaryNumber: formData.secondaryNumber,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        suburb: formData.suburbCity,
        state: formData.stateProvince,
        zipCode: formData.zipPostcode,
        country: formData.country,
        companyName: formData.companyName,
        gstNumber: formData.gstNumber,
        pan: formData.pan
      };
      
      try {
        const response = await authApi.register(userData);
        
        // Show success message
        toast.success(response.data.message || "Registration successful! Please verify your email.");
        
        // Navigate to OTP verification page with userId and email
        navigate(`/auth/verify-otp/${response.data.userId}?email=${formData.email}`);
      } catch (error) {
        console.error("Registration error:", error);
        if (error.response && error.response.data) {
          toast.error(error.response.data.message || "Registration failed. Please try again.");
        } else {
          toast.error("Network error. Please check your connection and try again.");
        }
      }
      // Navigation is handled in the try block
      
    } catch (error) {
      console.error("Registration error:", error);
      
      // Display error message from API or fallback message
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center">New Account</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Email Address */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email Address<span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password<span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            required
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
            Confirm Password<span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            required
          />
        </div>

        {/* Mobile Number */}
        <div className="mb-4">
          <label htmlFor="mobileNumber" className="block text-sm font-medium mb-1">
            Mobile Number<span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="mobileNumber"
            name="mobileNumber"
            value={formData.mobileNumber}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            required
          />
        </div>

        {/* First Name */}
        <div className="mb-4">
          <label htmlFor="firstName" className="block text-sm font-medium mb-1">
            First Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            required
          />
        </div>

        {/* Last Name */}
        <div className="mb-4">
          <label htmlFor="lastName" className="block text-sm font-medium mb-1">
            Last Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            required
          />
        </div>

        {/* Company Name */}
        <div className="mb-4">
          <label htmlFor="companyName" className="block text-sm font-medium mb-1">
            Company Name
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        {/* GST Number */}
        <div className="mb-4">
          <label htmlFor="gstNumber" className="block text-sm font-medium mb-1">
            GST Number
          </label>
          <input
            type="text"
            id="gstNumber"
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        {/* Phone Number */}
        <div className="mb-4">
          <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
            Phone Number<span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            required
          />
        </div>

        {/* Secondary Number */}
        <div className="mb-4">
          <label htmlFor="secondaryNumber" className="block text-sm font-medium mb-1">
            Secondary Number
          </label>
          <input
            type="tel"
            id="secondaryNumber"
            name="secondaryNumber"
            value={formData.secondaryNumber}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        {/* Address Line 1 */}
        <div className="mb-4">
          <label htmlFor="addressLine1" className="block text-sm font-medium mb-1">
            Address Line 1<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="addressLine1"
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            required
          />
        </div>

        {/* Address Line 2 */}
        <div className="mb-4">
          <label htmlFor="addressLine2" className="block text-sm font-medium mb-1">
            Address Line 2
          </label>
          <input
            type="text"
            id="addressLine2"
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        {/* Suburb/City */}
        <div className="mb-4">
          <label htmlFor="suburbCity" className="block text-sm font-medium mb-1">
            Suburb/City<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="suburbCity"
            name="suburbCity"
            value={formData.suburbCity}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            required
          />
        </div>

        {/* Country */}
        <div className="mb-4">
          <label htmlFor="country" className="block text-sm font-medium mb-1">
            Country<span className="text-red-500">*</span>
          </label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            required
          >
            <option value="">Choose a Country</option>
            <option value="india">India</option>
            <option value="usa">USA</option>
            <option value="uk">UK</option>
            <option value="canada">Canada</option>
            <option value="australia">Australia</option>
          </select>
        </div>

        {/* State/Province */}
        <div className="mb-4">
          <label htmlFor="stateProvince" className="block text-sm font-medium mb-1">
            State/Province<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="stateProvince"
            name="stateProvince"
            value={formData.stateProvince}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            required
          />
        </div>

        {/* Zip/Postcode */}
        <div className="mb-4">
          <label htmlFor="zipPostcode" className="block text-sm font-medium mb-1">
            Zip/Postcode<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="zipPostcode"
            name="zipPostcode"
            value={formData.zipPostcode}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
            required
          />
        </div>

        {/* PAN */}
        <div className="mb-4">
          <label htmlFor="pan" className="block text-sm font-medium mb-1">
            PAN
          </label>
          <input
            type="text"
            id="pan"
            name="pan"
            value={formData.pan}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>

        {/* Submit Button - Full width on both columns */}
        <div className="col-span-1 md:col-span-2 mt-4">
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition duration-300"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Create Account"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;