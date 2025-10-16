import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUser, FaSave, FaMapMarkerAlt, FaEnvelope, FaPhone, FaBriefcase } from 'react-icons/fa';
import { authApi } from '../../services/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: '',
    phoneNumber: '',
    secondaryNumber: '',
    addressLine1: '',
    addressLine2: '',
    suburb: '',
    state: '',
    zipCode: '',
    country: '',
    companyName: '',
    gstNumber: '',
    pan: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Try to get user data from localStorage first
        const userData = localStorage.getItem('user');
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // Populate form with user data from localStorage
          populateFormData(parsedUser);
        }
        
        // Also fetch fresh data from API
        const response = await authApi.getCurrentUser();
        if (response.data) {
          setUser(response.data);
          
          // Update localStorage with fresh data
          localStorage.setItem('user', JSON.stringify(response.data));
          
          // Update form with fresh data
          populateFormData(response.data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Problem loading profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Helper function to populate form data from user object
    const populateFormData = (userData) => {
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        mobileNumber: userData.mobileNumber || '',
        phoneNumber: userData.phoneNumber || '',
        secondaryNumber: userData.secondaryNumber || '',
        addressLine1: userData.addressLine1 || '',
        addressLine2: userData.addressLine2 || '',
        suburb: userData.suburb || '',
        state: userData.state || '',
        zipCode: userData.zipCode || '',
        country: userData.country || 'India',
        companyName: userData.companyName || '',
        gstNumber: userData.gstNumber || '',
        pan: userData.pan || ''
      });
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      // Call API to update user profile
      const response = await authApi.updateProfile(formData);
      
      if (response.data) {
        // Update local user data
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Problem updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-main"></div>
        <span className="ml-3 text-gray-600">Loading your profile...</span>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Profile</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="col-span-2">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                <FaUser className="mr-2 text-main" /> Personal Information
              </h2>
              <div className="h-px bg-gray-200 mb-6"></div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main transition-all duration-200"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main transition-all duration-200"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                <FaEnvelope className="mr-1 text-gray-500" /> Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main bg-gray-50 transition-all duration-200"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                <FaPhone className="mr-1 text-gray-500" /> Mobile Number
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main transition-all duration-200"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                <FaPhone className="mr-1 text-gray-500" /> Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main transition-all duration-200"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2 flex items-center">
                <FaPhone className="mr-1 text-gray-500" /> Secondary Number (Optional)
              </label>
              <input
                type="tel"
                name="secondaryNumber"
                value={formData.secondaryNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main transition-all duration-200"
              />
            </div>
            
            {/* Address Information */}
            <div className="col-span-2 mt-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                <FaMapMarkerAlt className="mr-2 text-main" /> Address Information
              </h2>
              <div className="h-px bg-gray-200 mb-6"></div>
            </div>
            
            <div className="mb-4 col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-2">Address Line 1</label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main transition-all duration-200"
                required
              />
            </div>
            
            <div className="mb-4 col-span-2">
              <label className="block text-gray-700 text-sm font-medium mb-2">Address Line 2 (Optional)</label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main transition-all duration-200"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Suburb/City</label>
              <input
                type="text"
                name="suburb"
                value={formData.suburb}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main transition-all duration-200"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">State/Province</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main transition-all duration-200"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">ZIP/Postal Code</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main transition-all duration-200"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main transition-all duration-200"
                required
              />
            </div>
            
            {/* Business Information */}
            <div className="col-span-2 mt-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
                <FaBriefcase className="mr-2 text-main" /> Business Information (Optional)
              </h2>
              <div className="h-px bg-gray-200 mb-6"></div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main transition-all duration-200"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">GST Number</label>
              <input
                type="text"
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main transition-all duration-200"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">PAN</label>
              <input
                type="text"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main transition-all duration-200"
              />
            </div>
            
            <div className="col-span-2 mt-6 flex justify-end">
              <button
                type="submit"
                className="bg-main text-white px-8 py-3 rounded-lg hover:bg-main-dark transition-colors duration-300 flex items-center justify-center shadow-sm hover:shadow-md"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" /> Save Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
