import React, { useState, useEffect, useRef } from 'react';
import { FaEdit, FaTrash, FaSearch, FaUserPlus, FaTimes, FaSave, FaSpinner, FaFilter, FaUserShield, FaUser, FaUserCheck, FaUserTimes, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { userManagementApi } from '../../services/adminApi';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { useAdminAuth } from '../../context/AdminAuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', role: 'customer' });
  const [otpData, setOtpData] = useState({ email: '', otp: '', userId: '' });
  const [profileData, setProfileData] = useState({ 
    userId: '',
    firstName: '',
    lastName: '',
    mobileNumber: '',
    addressLine1: '',
    suburb: '',
    state: '',
    zipCode: '',
    country: 'Australia'
  });
  const [editUser, setEditUser] = useState({ _id: null, firstName: '', lastName: '', email: '', role: '', status: 'active' });
  const [filters, setFilters] = useState({
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    adminUsers: 0,
    customerUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0
  });
  
  const { adminToken } = useAdminAuth();
  
  // Load users from API with pagination and filters
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Fix: Pass individual parameters instead of the params object
        const response = await userManagementApi.getAllUsers(
          pagination.page,
          pagination.limit,
          {
            search: searchTerm,
            status: filters.status,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder
          }
        );
        
        // Check if we have data and set it
        if (response && response.data && response.data.data) {
          setUsers(response.data.data);
          setPagination({
            page: response.data.pagination.page,
            limit: response.data.pagination.limit,
            total: response.data.pagination.total,
            pages: response.data.pagination.pages
          });
          setError(null);
        } else {
          console.error('Invalid response format:', response);
          setError('Failed to load users. Invalid response format.');
        }
      } catch (err) {
        setError('Failed to load users. Please try again.');
        console.error('Error fetching users:', err);
        toast.error('Failed to load users: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch users immediately when component mounts or dependencies change
    fetchUsers();
    
  }, [pagination.page, pagination.limit, searchTerm, filters]);
  
  // Load user statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Only fetch stats if admin is authenticated
        if (adminToken) {
          const response = await userManagementApi.getUserStats();
          if (response.data && response.data.data) {
            setStats(response.data.data);
          }
        }
      } catch (err) {
        console.error('Error fetching user stats:', err);
        // Don't show error toast for stats as it's not critical
      }
    };
    
    if (adminToken) {
      fetchStats();
    }
  }, [adminToken]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({...prev, page: 1})); // Reset to first page on search
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({...prev, [name]: value}));
    setPagination(prev => ({...prev, page: 1})); // Reset to first page on filter change
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({...prev, page: newPage}));
    }
  };

  const handleEditClick = async (user) => {
    try {
      const response = await userManagementApi.getUserById(user._id);
      // Capture all user details including address and contact information
      setEditUser({
        ...response.data.data,
        mobileNumber: response.data.data.mobileNumber,
        phoneNumber: response.data.data.phoneNumber,
        addressLine1: response.data.data.addressLine1,
        suburb: response.data.data.suburb,
        state: response.data.data.state,
        zipCode: response.data.data.zipCode,
        country: response.data.data.country
      });
      setShowEditModal(true);
    } catch (err) {
      toast.error('Failed to load user details');
      console.error('Error fetching user details:', err);
    }
  };

  const handleEditUser = async () => {
    try {
      // Send all user details to the backend
      await userManagementApi.updateUser(editUser._id, {
        firstName: editUser.firstName,
        lastName: editUser.lastName,
        email: editUser.email,
        role: editUser.role,
        status: editUser.status,
        mobileNumber: editUser.mobileNumber,
        phoneNumber: editUser.phoneNumber,
        addressLine1: editUser.addressLine1,
        suburb: editUser.suburb,
        state: editUser.state,
        zipCode: editUser.zipCode,
        country: editUser.country
      });
      
      // Refresh user list
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };
      
      const response = await userManagementApi.getAllUsers(params);
      setUsers(response.data.data);
      
      toast.success('User updated successfully');
      setShowEditModal(false);
    } catch (err) {
      toast.error('Failed to update user');
      console.error('Error updating user:', err);
    }
  };

  const handleToggleStatus = async (id, status) => {
    try {
      await userManagementApi.toggleUserStatus(id, status);
      
      // Refresh user list
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      };
      
      const response = await userManagementApi.getAllUsers(params);
      setUsers(response.data.data);
      
      toast.success(`User ${status === 'active' ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      toast.error(`Failed to ${status === 'active' ? 'activate' : 'deactivate'} user`);
      console.error('Error toggling user status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userManagementApi.deleteUser(id);
        
        // Refresh user list
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          status: filters.status,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder
        };
        
        const response = await userManagementApi.getAllUsers(params);
        setUsers(response.data.data);
        
        toast.success('User deleted successfully');
      } catch (err) {
        toast.error('Failed to delete user');
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleAddUser = async () => {
    try {
      // Validate form
      if (!newUser.firstName || !newUser.lastName || !newUser.email) {
        toast.error('Please fill all required fields');
        return;
      }
      
      // Generate a temporary password (will be changed after verification)
      const tempPassword = Math.random().toString(36).slice(-8);
      
      // Create initial user with email verification
      const response = await userManagementApi.createUser({
        ...newUser,
        password: tempPassword
      });
      
      if (response.data.success) {
        toast.success('Verification email sent to user');
        
        // Set up OTP verification data
        setOtpData({
          email: newUser.email,
          otp: '',
          userId: response.data.data.user._id
        });
        
        // Close add modal and open OTP modal
        setShowAddModal(false);
        setShowOtpModal(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add user');
      console.error('Error adding user:', err);
    }
  };
  
  // OTP input refs
  const otpInputRefs = useRef([]);
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  
  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);
    
    // Auto focus to next input if value is entered
    if (value && index < 3) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  // Handle key down for OTP inputs
  const handleKeyDown = (index, e) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  // Handle paste for OTP inputs
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
      otpInputRefs.current[lastFilledIndex + 1].focus();
    }
  };
  
  // Handle OTP verification
  const handleVerifyOtp = async () => {
    try {
      const otpString = otpValues.join('');
      
      // Validate 4-digit OTP
      if (otpString.length !== 4) {
        toast.error('Please enter a valid 4-digit OTP');
        return;
      }
      
      console.log('Sending OTP verification data:', { email: otpData.email, userId: otpData.userId, otp: otpString });
      
      // Make sure we're sending both userId and email for verification
      const verificationData = {
        userId: otpData.userId,
        email: otpData.email,
        otp: otpString // Send the joined OTP string
      };
      
      const response = await userManagementApi.verifyUserOtp(verificationData);
      
      if (response.data.success) {
        toast.success('OTP verified successfully');
        
        // Set up profile completion data
        setProfileData({
          ...profileData,
          userId: otpData.userId,
          firstName: newUser.firstName,
          lastName: newUser.lastName
        });
        
        // Reset OTP values
        setOtpValues(['', '', '', '']);
        
        // Close OTP modal and open profile completion modal
        setShowOtpModal(false);
        setShowProfileModal(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to verify OTP');
      console.error('Error verifying OTP:', err);
    }
  };
  
  // Handle profile completion
  const handleCompleteProfile = async () => {
    try {
      // Validate required fields
      if (!profileData.mobileNumber || !profileData.addressLine1 || !profileData.suburb || 
          !profileData.state || !profileData.zipCode) {
        toast.error('Please fill all required fields');
        return;
      }
      
      const response = await userManagementApi.completeUserProfile(profileData);
      
      if (response.data.success) {
        toast.success('User profile completed successfully');
        
        // Refresh user list
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          status: filters.status,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder
        };
        
        const usersResponse = await userManagementApi.getAllUsers(params);
        setUsers(usersResponse.data.data);
        
        // Reset form and close modal
        setNewUser({ firstName: '', lastName: '', email: '', role: 'customer' });
        setOtpData({ email: '', otp: '', userId: '' });
        setProfileData({
          userId: '',
          firstName: '',
          lastName: '',
          mobileNumber: '',
          addressLine1: '',
          suburb: '',
          state: '',
          zipCode: '',
          country: 'Australia'
        });
        setShowProfileModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete user profile');
      console.error('Error completing user profile:', err);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#92c51b] hover:bg-[#7ba515] text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaUserPlus className="mr-2" /> Add User
        </button>
      </div>
      
      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
              <FaUser className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Users</p>
              <p className="text-2xl font-bold">{stats.totalUsers || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
              <FaUserCheck className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Active Users</p>
              <p className="text-2xl font-bold">{stats.activeUsers || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-500 mr-4">
              <FaUserTimes className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Inactive Users</p>
              <p className="text-2xl font-bold">{stats.inactiveUsers || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
              <FaUserShield className="text-xl" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Admin Users</p>
              <p className="text-2xl font-bold">{stats.adminUsers || 0}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* New Users Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-700 mb-2">New Users Today</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.newUsersToday || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-700 mb-2">New Users This Week</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.newUsersThisWeek || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-700 mb-2">New Users This Month</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.newUsersThisMonth || 0}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search users..."
          className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex">
                  <button
                    onClick={() => handleEditClick(user)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                    title="Edit User"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(user._id, user.status === 'active' ? 'inactive' : 'active')}
                    className={`mr-3 ${user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                    title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                  >
                    {user.status === 'active' ? <FaUserTimes /> : <FaUserCheck />}
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete User"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Add New User</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">First Name*</label>
              <input
                type="text"
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                value={newUser.firstName}
                onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Last Name*</label>
              <input
                type="text"
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                value={newUser.lastName}
                onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Email*</label>
              <input
                type="email"
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
              <select
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                value={newUser.role}
                onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md mr-2 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="bg-[#92c51b] text-white px-4 py-2 rounded-md hover:bg-[#7ea617] transition"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Verify OTP</h2>
              <button onClick={() => setShowOtpModal(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            <p className="mb-4 text-gray-600">
              A verification code has been sent to {otpData.email}. Please enter the code below.
            </p>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">OTP Code*</label>
              <div className="flex justify-between gap-2">
                {[0, 1, 2, 3].map((index) => (
                  <input
                    key={index}
                    type="text"
                    className="border rounded-md w-full py-2 px-3 text-center focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                    maxLength={1}
                    value={otpValues[index]}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    required
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter the 4-digit verification code</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowOtpModal(false);
                  setOtpValues(['', '', '', '']);
                }}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md mr-2 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOtp}
                className="bg-[#92c51b] text-white px-4 py-2 rounded-md hover:bg-[#7ea617] transition"
                disabled={otpValues.join('').length !== 4}
              >
                Verify OTP
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Profile Completion Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Complete User Profile</h2>
              <button onClick={() => setShowProfileModal(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Mobile Number*</label>
              <input
                type="tel"
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                value={profileData.mobileNumber}
                onChange={(e) => setProfileData({...profileData, mobileNumber: e.target.value})}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Address Line 1*</label>
              <input
                type="text"
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                value={profileData.addressLine1}
                onChange={(e) => setProfileData({...profileData, addressLine1: e.target.value})}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Suburb*</label>
              <input
                type="text"
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                value={profileData.suburb}
                onChange={(e) => setProfileData({...profileData, suburb: e.target.value})}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">State*</label>
              <input
                type="text"
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                value={profileData.state}
                onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Zip Code*</label>
              <input
                type="text"
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                value={profileData.zipCode}
                onChange={(e) => setProfileData({...profileData, zipCode: e.target.value})}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Country</label>
              <input
                type="text"
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                value={profileData.country}
                onChange={(e) => setProfileData({...profileData, country: e.target.value})}
              />
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowProfileModal(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md mr-2 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteProfile}
                className="bg-[#92c51b] text-white px-4 py-2 rounded-md hover:bg-[#7ea617] transition"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit User</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
              <input
                type="text"
                value={editUser.firstName || ''}
                onChange={(e) => setEditUser({...editUser, firstName: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
              <input
                type="text"
                value={editUser.lastName || ''}
                onChange={(e) => setEditUser({...editUser, lastName: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                value={editUser.email || ''}
                onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                disabled={editUser.isVerified}
              />
              {editUser.isVerified && (
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed for verified users</p>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Mobile Number</label>
              <input
                type="tel"
                value={editUser.mobileNumber || ''}
                onChange={(e) => setEditUser({...editUser, mobileNumber: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
              <input
                type="tel"
                value={editUser.phoneNumber || ''}
                onChange={(e) => setEditUser({...editUser, phoneNumber: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Address Line 1</label>
              <input
                type="text"
                value={editUser.addressLine1 || ''}
                onChange={(e) => setEditUser({...editUser, addressLine1: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Suburb</label>
              <input
                type="text"
                value={editUser.suburb || ''}
                onChange={(e) => setEditUser({...editUser, suburb: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">State</label>
              <input
                type="text"
                value={editUser.state || ''}
                onChange={(e) => setEditUser({...editUser, state: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Zip Code</label>
              <input
                type="text"
                value={editUser.zipCode || ''}
                onChange={(e) => setEditUser({...editUser, zipCode: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Country</label>
              <input
                type="text"
                value={editUser.country || ''}
                onChange={(e) => setEditUser({...editUser, country: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
              <select
                value={editUser.role || 'customer'}
                onChange={(e) => setEditUser({...editUser, role: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
              <select
                value={editUser.status || 'active'}
                onChange={(e) => setEditUser({...editUser, status: e.target.value})}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;