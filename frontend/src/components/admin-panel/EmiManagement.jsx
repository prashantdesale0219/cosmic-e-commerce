import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { emiManagementApi } from '../../services/adminApi';

const EmiManagement = () => {
  const [emiOptions, setEmiOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    months: '',
    interestRate: '',
    minAmount: '',
    isActive: true
  });
  const [editMode, setEditMode] = useState(false);
  const [currentEmiId, setCurrentEmiId] = useState(null);

  useEffect(() => {
    fetchEmiOptions();
  }, []);

  const fetchEmiOptions = async () => {
    setLoading(true);
    try {
      const response = await emiManagementApi.getAllEmiOptions();
      setEmiOptions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching EMI options:', error);
      toast.error('Failed to fetch EMI options');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await emiManagementApi.updateEmiOption(currentEmiId, formData);
        toast.success('EMI option updated successfully');
      } else {
        await emiManagementApi.createEmiOption(formData);
        toast.success('EMI option created successfully');
      }
      
      resetForm();
      fetchEmiOptions();
    } catch (error) {
      console.error('Error saving EMI option:', error);
      toast.error(error.response?.data?.message || 'Failed to save EMI option');
    }
  };

  const handleEdit = (emi) => {
    setFormData({
      months: emi.months,
      interestRate: emi.interestRate,
      minAmount: emi.minAmount,
      isActive: emi.isActive
    });
    setEditMode(true);
    setCurrentEmiId(emi._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this EMI option?')) {
      try {
        await emiManagementApi.deleteEmiOption(id);
        toast.success('EMI option deleted successfully');
        fetchEmiOptions();
      } catch (error) {
        console.error('Error deleting EMI option:', error);
        toast.error('Failed to delete EMI option');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      months: '',
      interestRate: '',
      minAmount: '',
      isActive: true
    });
    setEditMode(false);
    setCurrentEmiId(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">EMI Management</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">{editMode ? 'Edit EMI Option' : 'Create New EMI Option'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Tenure (Months)</label>
              <input
                type="number"
                name="months"
                value={formData.months}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                min="1"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2">Interest Rate (%)</label>
              <input
                type="number"
                name="interestRate"
                value={formData.interestRate}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div>
              <label className="block mb-2">Minimum Amount (₹)</label>
              <input
                type="number"
                name="minAmount"
                value={formData.minAmount}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                min="0"
                required
              />
            </div>
            
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="mr-2"
              />
              <label>Active</label>
            </div>
          </div>
          
          <div className="flex mt-6">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
            >
              {editMode ? 'Update EMI Option' : 'Create EMI Option'}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">All EMI Options</h2>
        
        {loading ? (
          <p>Loading EMI options...</p>
        ) : emiOptions.length === 0 ? (
          <p>No EMI options found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Tenure (Months)</th>
                  <th className="py-2 px-4 text-left">Interest Rate</th>
                  <th className="py-2 px-4 text-left">Minimum Amount</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {emiOptions.map(emi => (
                  <tr key={emi._id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{emi.months}</td>
                    <td className="py-2 px-4">{emi.interestRate}%</td>
                    <td className="py-2 px-4">₹{emi.minAmount}</td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${emi.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {emi.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <button
                        onClick={() => handleEdit(emi)}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(emi._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
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

export default EmiManagement;