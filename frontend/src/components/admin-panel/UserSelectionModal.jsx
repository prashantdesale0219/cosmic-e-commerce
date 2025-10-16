import React, { useState, useEffect } from 'react';
import { FaSearch, FaSpinner, FaTimes, FaCheck, FaUsers } from 'react-icons/fa';
import axios from 'axios';

const UserSelectionModal = ({ isOpen, onClose, onSubmit, couponName }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState(null);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      // Reset selected users when modal opens
      setSelectedUsers([]);
      setSelectAll(false);
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      // Direct API call to fetch all users - fixed endpoint
      const response = await axios.get(`${import.meta.env.NEXT_PUBLIC_API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      setUsers(response.data.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Reset select all when searching
    setSelectAll(false);
  };

  const toggleUserSelection = (user) => {
    if (selectedUsers.some(u => u._id === user._id)) {
      setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
      setSelectAll(false);
    } else {
      setSelectedUsers([...selectedUsers, user]);
      // Check if all filtered users are now selected
      const filteredUsers = getFilteredUsers();
      if (filteredUsers.length === selectedUsers.length + 1) {
        setSelectAll(true);
      }
    }
  };

  const handleSelectAll = () => {
    const filteredUsers = getFilteredUsers();
    if (selectAll) {
      // Deselect all filtered users
      setSelectedUsers(selectedUsers.filter(user => 
        !filteredUsers.some(filteredUser => filteredUser._id === user._id)
      ));
    } else {
      // Select all filtered users
      const newSelectedUsers = [...selectedUsers];
      filteredUsers.forEach(user => {
        if (!newSelectedUsers.some(u => u._id === user._id)) {
          newSelectedUsers.push(user);
        }
      });
      setSelectedUsers(newSelectedUsers);
    }
    setSelectAll(!selectAll);
  };

  const handleSubmit = () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }
    onSubmit(selectedUsers);
  };

  const getFilteredUsers = () => {
    return users.filter(user => 
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const filteredUsers = getFilteredUsers();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold">Generate Coupon Codes</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="p-4 border-b bg-gray-50">
          <p className="text-gray-600 mb-4">
            {couponName ? 
              `Generate coupon codes for "${couponName}" and send to selected users` : 
              'Select users to generate and send coupon codes'}
          </p>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email or phone"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto flex-grow p-4">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <FaSpinner className="animate-spin text-[#92c51b] text-2xl" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-gray-500 text-center p-4">No users found</div>
          ) : (
            <div className="space-y-2">
              {/* Select All Option */}
              <div 
                className="p-3 border rounded-md cursor-pointer transition-colors bg-gray-50 mb-4 flex items-center justify-between"
                onClick={handleSelectAll}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={() => {}}
                    className="h-4 w-4 text-[#92c51b] focus:ring-[#92c51b] mr-3"
                  />
                  <div className="font-medium flex items-center">
                    <FaUsers className="mr-2 text-[#92c51b]" />
                    {selectAll ? 'Deselect All' : 'Select All'} ({filteredUsers.length} users)
                  </div>
                </div>
                {selectAll && <FaCheck className="text-[#92c51b]" />}
              </div>
              
              {/* User List */}
              {filteredUsers.map(user => (
                <div 
                  key={user._id} 
                  className={`p-3 border rounded-md cursor-pointer transition-colors ${
                    selectedUsers.some(u => u._id === user._id) 
                      ? 'bg-[#f5f9e8] border-[#92c51b]' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleUserSelection(user)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.some(u => u._id === user._id)}
                        onChange={() => {}}
                        className="h-4 w-4 text-[#92c51b] focus:ring-[#92c51b] mr-3"
                      />
                      <div>
                        <div className="font-medium">{user.name || 'Unnamed User'}</div>
                        <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                        {user.phone && <div className="text-sm text-gray-500">{user.phone}</div>}
                      </div>
                    </div>
                    {selectedUsers.some(u => u._id === user._id) && (
                      <FaCheck className="text-[#92c51b]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t flex justify-between items-center bg-gray-50 sticky bottom-0">
          <div className="text-sm">
            Selected Users: <span className="font-medium">{selectedUsers.length}</span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedUsers.length === 0 || loading}
              className={`px-4 py-2 rounded-md text-white ${
                selectedUsers.length === 0 || loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#92c51b] hover:bg-[#82b10b]'
              }`}
            >
              Generate Coupons
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSelectionModal;