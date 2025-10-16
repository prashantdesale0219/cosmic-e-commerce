import React, { useState, useEffect } from 'react';
import { offerManagementApi, productManagementApi } from '../../services/adminApi';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaCheck, FaSpinner, FaFilter, FaSearch } from 'react-icons/fa';

const OffersManagement = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    startDate: '',
    endDate: '',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [currentOfferId, setCurrentOfferId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const response = await offerManagementApi.getAllOffers();
      setOffers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('Failed to fetch offers');
    } finally {
      setLoading(false);
    }
  };

  // Product fetch functionality removed as requested

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    
    if (!formData.discountValue) {
      errors.discountValue = 'Discount value is required';
    } else if (formData.discountType === 'percentage' && (formData.discountValue <= 0 || formData.discountValue > 100)) {
      errors.discountValue = 'Percentage discount must be between 1 and 100';
    } else if (formData.discountType === 'fixed' && formData.discountValue <= 0) {
      errors.discountValue = 'Fixed discount must be greater than 0';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    } else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      errors.endDate = 'End date must be after start date';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    // Convert string values to numbers for numeric fields
    const payload = {
      ...formData,
      discountValue: Number(formData.discountValue),
      discountPercentage: formData.discountType === 'percentage' ? Number(formData.discountValue) : 0
    };
    
    console.log('Submitting offer with payload:', payload);
    
    try {
      if (editMode) {
        await offerManagementApi.updateOffer(currentOfferId, payload);
        toast.success('Offer updated successfully');
      } else {
        const response = await offerManagementApi.createOffer(payload);
        console.log('Offer created:', response.data);
        toast.success('Offer created successfully');
      }
      
      resetForm();
      fetchOffers();
    } catch (error) {
      console.error('Error saving offer:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to save offer. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (offer) => {
    setFormData({
      title: offer.title || '',
      description: offer.description || '',
      discountType: offer.discountType || 'percentage',
      discountValue: offer.discountValue || offer.discountPercentage || '',
      startDate: offer.startDate?.split('T')[0] || '',
      endDate: offer.endDate?.split('T')[0] || '',
      isActive: offer.isActive
    });
    setFormErrors({});
    setEditMode(true);
    setCurrentOfferId(offer._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      try {
        await offerManagementApi.deleteOffer(id);
        toast.success('Offer deleted successfully');
        fetchOffers();
      } catch (error) {
        console.error('Error deleting offer:', error);
        toast.error('Failed to delete offer');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      startDate: '',
      endDate: '',
      isActive: true
    });
    setFormErrors({});
    setEditMode(false);
    setCurrentOfferId(null);
  };

  const filteredOffers = offers.filter(offer => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && offer.isActive) || 
      (filterStatus === 'inactive' && !offer.isActive);
    
    const matchesSearch = offer.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Offers Management</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">{editMode ? 'Edit Offer' : 'Create New Offer'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${formErrors.title ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Enter offer title (e.g., Summer Sale)"
              />
              {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
            </div>
            
            <div>
              <label className="block mb-2">Discount Type <span className="text-red-500">*</span></label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="w-full p-2 border rounded border-gray-300"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-2">
                Discount Value <span className="text-red-500">*</span>
                {formData.discountType === 'percentage' && <span className="text-sm text-gray-500 ml-1">(1-100%)</span>}
              </label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${formErrors.discountValue ? 'border-red-500' : 'border-gray-300'}`}
                min="1"
                max={formData.discountType === 'percentage' ? "100" : ""}
                placeholder={formData.discountType === 'percentage' ? "Enter percentage" : "Enter amount"}
              />
              {formErrors.discountValue && <p className="text-red-500 text-sm mt-1">{formErrors.discountValue}</p>}
            </div>
            
            <div>
              <label className="block mb-2">Start Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${formErrors.startDate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {formErrors.startDate && <p className="text-red-500 text-sm mt-1">{formErrors.startDate}</p>}
            </div>
            
            <div>
              <label className="block mb-2">End Date <span className="text-red-500">*</span></label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full p-2 border rounded ${formErrors.endDate ? 'border-red-500' : 'border-gray-300'}`}
              />
              {formErrors.endDate && <p className="text-red-500 text-sm mt-1">{formErrors.endDate}</p>}
            </div>
            
            <div className="mt-2 p-2 bg-green-50 rounded border border-green-100">
              <p className="text-sm text-green-700">
                <strong>Global offer:</strong> This offer will apply to all eligible products.
              </p>
            </div>
            
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="mr-2 h-4 w-4"
              />
              <label htmlFor="isActive" className="text-sm font-medium">Active</label>
              <p className="text-xs text-gray-500 ml-2">
                {formData.isActive ? 'Offer is available for use' : 'Offer is disabled'}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block mb-2">Description <span className="text-red-500">*</span></label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${formErrors.description ? 'border-red-500' : 'border-gray-300'}`}
              rows="3"
              placeholder="Enter offer description"
            ></textarea>
            {formErrors.description && <p className="text-red-500 text-sm mt-1">{formErrors.description}</p>}
          </div>
          
          <div className="flex mt-6">
            <button
              type="submit"
              disabled={submitting}
              className={`flex items-center justify-center px-4 py-2 rounded ${
                submitting 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white mr-2 min-w-[120px]`}
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  {editMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {editMode ? <FaEdit className="mr-2" /> : <FaPlus className="mr-2" />}
                  {editMode ? 'Update Offer' : 'Create Offer'}
                </>
              )}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-semibold">All Offers</h2>
          
          <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border rounded w-full md:w-64 pl-8"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            

            
            <button
              onClick={fetchOffers}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Refresh
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="animate-spin text-blue-600 text-2xl" />
            <span className="ml-2">Loading offers...</span>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded">
            <p className="text-gray-500">No offers found.</p>
            {searchTerm && <p className="text-sm text-gray-400 mt-1">Try changing your search criteria</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Title</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Discount</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Validity</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Status</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOffers.map(offer => (
                  <tr key={offer._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{offer.title}</td>
                    <td className="py-3 px-4">
                      <span className="text-green-600 font-medium">
                        {offer.discountType === 'fixed' 
                          ? `₹${offer.discountValue || 0}` 
                          : `${offer.discountValue || offer.discountPercentage || 0}%`}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div>From: {new Date(offer.startDate).toLocaleDateString()}</div>
                        <div>To: {new Date(offer.endDate).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        offer.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {offer.isActive ? (
                          <span className="flex items-center">
                            <FaCheck className="mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <FaTimes className="mr-1" />
                            Inactive
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(offer)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit offer"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(offer._id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete offer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersManagement;