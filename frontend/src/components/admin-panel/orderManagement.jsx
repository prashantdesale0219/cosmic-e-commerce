import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaEdit, FaTrash, FaTimes, FaSave, FaSpinner } from 'react-icons/fa';
import { orderManagementApi } from '../../services/adminApi';
import { toast } from 'react-toastify';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Load orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await orderManagementApi.getAllOrders();
        console.log('Orders response:', response);
        
        // Extract orders data from response
        const ordersData = response.data && response.data.data ? response.data.data : [];
        
        // Transform data for display
        const formattedOrders = ordersData.map(order => {
          // Calculate the final total (product price + shipping charges)
          const shippingCharges = order.shippingCharges || 0;
          const productPrice = order.totalPrice || 0;
          const finalTotal = productPrice + shippingCharges;
          
          return {
            id: order._id,
            orderId: order.orderId,
            customer: order.userId ? (order.userId.name || 'Unknown User') : 'Unknown User',
            email: order.userId ? (order.userId.email || 'No Email') : 'No Email',
            date: new Date(order.createdAt).toLocaleDateString(),
            status: order.orderStatus,
            total: `₹${finalTotal.toFixed(2)}`, // Display the final total (product price + shipping)
            shippingCharges: shippingCharges,
            productPrice: productPrice,
            items: order.items.length,
            rawData: order
          };
        });
        
        setOrders(formattedOrders);
        setError(null);
      } catch (err) {
        setError('Failed to load orders. Please try again.');
        console.error('Error fetching orders:', err);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  
  // Shipping charges form states
  const [shippingCharges, setShippingCharges] = useState(0);
  const [finalPrice, setFinalPrice] = useState(0);
  const [adminNotes, setAdminNotes] = useState('');
  const [submittingShipping, setSubmittingShipping] = useState(false);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // State for advanced filtering
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter orders based on all criteria
  const filteredOrders = orders.filter(order => {
    // Basic search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (order.customer && order.customer.toLowerCase().includes(searchLower)) || 
      (order.orderId && order.orderId.toString().includes(searchLower)) ||
      (order.email && order.email.toLowerCase().includes(searchLower));
    
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    // Date range filter
    if (dateRange.from && new Date(order.date) < new Date(dateRange.from)) return false;
    if (dateRange.to && new Date(order.date) > new Date(dateRange.to)) return false;
    
    // Price range filter
    const orderTotal = parseFloat(order.total.replace(/[₹,]/g, ''));
    if (priceRange.min && orderTotal < parseFloat(priceRange.min)) return false;
    if (priceRange.max && orderTotal > parseFloat(priceRange.max)) return false;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };
  
  const handleEditClick = (order) => {
    setEditOrder({...order});
    setShowEditModal(true);
  };
  
  const handleEditOrder = () => {
    setOrders(orders.map(order => 
      order.id === editOrder.id ? editOrder : order
    ));
    setShowEditModal(false);
  };

  const handleSetShippingCharges = async (orderId) => {
    try {
      setSubmittingShipping(true);
      
      // Calculate final price by adding shipping charges to subtotal
      const subtotal = parseFloat(selectedOrder.total.replace('₹', ''));
      const calculatedFinalPrice = subtotal + parseFloat(shippingCharges);
      
      // Call API to set shipping charges and final price
      await orderManagementApi.setShippingAndFinalPrice(orderId, {
        shippingCharges: parseFloat(shippingCharges),
        finalPrice: calculatedFinalPrice,
        adminNotes
      });
      
      toast.success('Shipping charges and final price sent to customer');
      
      // Reload orders after update
      const response = await orderManagementApi.getAllOrders();
      const ordersData = response.data && response.data.data ? response.data.data : [];
      
      // Transform data for display
      const formattedOrders = ordersData.map(order => {
        // Calculate the final total (product price + shipping charges)
        const shippingCharges = order.shippingCharges || 0;
        const productPrice = order.totalPrice || 0;
        const finalTotal = productPrice + shippingCharges;
        
        return {
          id: order._id,
          orderId: order.orderId,
          customer: order.userId && order.userId.name ? order.userId.name : 'Unknown User',
          email: order.userId && order.userId.email ? order.userId.email : 'No Email',
          date: new Date(order.createdAt).toLocaleDateString(),
          status: order.orderStatus,
          total: `₹${finalTotal.toFixed(2)}`, // Display the final total (product price + shipping)
          shippingCharges: shippingCharges,
          productPrice: productPrice,
          items: order.items.length,
          rawData: order
        };
      });
      
      setOrders(formattedOrders);
      setShowDetailsModal(false);
      
      // Reset form
      setShippingCharges(0);
      setFinalPrice(0);
      setAdminNotes('');
    } catch (error) {
      console.error('Error setting shipping charges:', error);
      toast.error('Failed to set shipping charges');
    } finally {
      setSubmittingShipping(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      console.log('Updating order status:', id, newStatus);
      // Pass the orderStatus parameter correctly
      await orderManagementApi.updateOrderStatus(id, newStatus);
      
      // Reload orders after status update
      const response = await orderManagementApi.getAllOrders();
      const ordersData = response.data && response.data.data ? response.data.data : [];
      
      // Transform data for display
      const formattedOrders = ordersData.map(order => {
        // Calculate the final total (product price + shipping charges)
        const shippingCharges = order.shippingCharges || 0;
        const productPrice = order.totalPrice || 0;
        const finalTotal = productPrice + shippingCharges;
        
        return {
          id: order._id,
          orderId: order.orderId,
          customer: order.userId && typeof order.userId === 'object' && order.userId.name ? order.userId.name : 'Unknown User',
          email: order.userId && typeof order.userId === 'object' && order.userId.email ? order.userId.email : 'No Email',
          date: new Date(order.createdAt).toLocaleDateString(),
          status: order.orderStatus,
          total: `₹${finalTotal.toFixed(2)}`, // Display the final total (product price + shipping)
          shippingCharges: shippingCharges,
          productPrice: productPrice,
          items: order.items.length,
          rawData: order
        };
      });
      console.log('Updated orders:', formattedOrders);
      setOrders(formattedOrders);
      
      toast.success('Order status updated successfully');
      setShowDetailsModal(false);
    } catch (err) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', err);
    }
  };

  const handleDeleteOrder = async (id) => {
    try {
      // Call API to delete the order
      await orderManagementApi.deleteOrder(id);
      
      // Update the UI by removing the deleted order
      setOrders(orders.filter(order => order.id !== id));
      
      toast.success('Order deleted successfully');
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'confirmed': 'bg-blue-100 text-blue-800',
    'shipped': 'bg-blue-100 text-blue-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Order Management</h2>
      
      {/* Search and Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center mb-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by order ID or customer"
              className="pl-10 pr-4 py-2 border rounded-lg w-64"
              value={searchTerm}
              onChange={handleSearch}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          <select 
            className="border rounded-lg px-4 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending_admin_review">Pending Admin Review</option>
          </select>
          
          <div>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center"
            >
              <span>{showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters</span>
              <svg
                className={`ml-2 w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>
        </div>
        
        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-gray-700 mb-3">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₹)</label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Min price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (₹)</label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Max price"
                />
              </div>
            </div>
            
            {/* Filter Actions */}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setDateRange({ from: '', to: '' });
                  setPriceRange({ min: '', max: '' });
                  setStatusFilter('All');
                  setSearchTerm('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md mr-2 hover:bg-gray-100"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-3xl text-blue-500" />
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Order ID</th>
                <th className="py-3 px-4 text-left">Customer</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Total</th>
                <th className="py-3 px-4 text-left">Items</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-4 px-4 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4">{order.orderId}</td>
                    <td className="py-3 px-4">{order.customer}</td>
                    <td className="py-3 px-4">{order.date}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{order.total}</td>
                    <td className="py-3 px-4">{order.items}</td>
                    <td className="py-3 px-4 flex space-x-2">
                      <button 
                        onClick={() => handleViewDetails(order)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button 
                        onClick={() => handleEditClick(order)}
                        className="p-1 text-green-600 hover:text-green-800"
                        title="Edit Order"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete Order"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-xl font-semibold">Order Details</h3>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-gray-600">Order ID</p>
                  <p className="font-medium">{selectedOrder.orderId}</p>
                </div>
                <div>
                  <p className="text-gray-600">Date</p>
                  <p className="font-medium">{selectedOrder.date}</p>
                </div>
                <div>
                  <p className="text-gray-600">Customer</p>
                  <p className="font-medium">{selectedOrder.customer}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium">{selectedOrder.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total</p>
                  <p className="font-medium">{selectedOrder.total}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <div className="flex items-center mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedOrder.status] || 'bg-gray-100'}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Customer Details Section */}
              <div className="mb-6 border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-3">Customer Details</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {selectedOrder.rawData && selectedOrder.rawData.shippingAddress && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600">Full Name</p>
                        <p className="font-medium">{selectedOrder.rawData.shippingAddress.fullName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="font-medium">{selectedOrder.rawData.shippingAddress.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Address</p>
                        <p className="font-medium">{selectedOrder.rawData.shippingAddress.address}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">City</p>
                        <p className="font-medium">{selectedOrder.rawData.shippingAddress.city}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">State</p>
                        <p className="font-medium">{selectedOrder.rawData.shippingAddress.state}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Pincode</p>
                        <p className="font-medium">{selectedOrder.rawData.shippingAddress.pincode}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Order Items Section */}
              <div className="mb-6 border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-3">Order Items</h4>
                <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.rawData && selectedOrder.rawData.items && selectedOrder.rawData.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              {item.image && (
                                <img src={item.image} alt={item.name} className="h-10 w-10 mr-3 object-cover rounded" />
                              )}
                              <div>
                                <p className="font-medium">{item.productId ? (item.productId.name || 'Unknown Product') : 'Unknown Product'}</p>
                                {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">{item.quantity}</td>
                          <td className="px-4 py-3">₹{item.price.toFixed(2)}</td>
                          <td className="px-4 py-3">₹{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-right font-medium">Subtotal:</td>
                        <td className="px-4 py-2 font-medium">
                          ₹{selectedOrder.rawData && selectedOrder.rawData.items ? 
                            selectedOrder.rawData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2) : 
                            '0.00'}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Shipping Charges Form - Only show for pending_admin_review orders */}
              {selectedOrder.status === 'pending_admin_review' && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-blue-800 mb-3">Set Shipping Charges & Final Price</h4>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleSetShippingCharges(selectedOrder.id);
                  }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Shipping Charges (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={shippingCharges}
                          onChange={(e) => setShippingCharges(parseFloat(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">Based on customer's location and order weight</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Final Price (₹)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={finalPrice}
                          onChange={(e) => setFinalPrice(parseFloat(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Subtotal: ₹{selectedOrder.rawData && selectedOrder.rawData.items ? 
                            selectedOrder.rawData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2) : 
                            '0.00'} + Shipping: ₹{shippingCharges || '0'}
                        </p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Notes (Optional)
                      </label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        rows="3"
                      ></textarea>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {submittingShipping ? (
                          <span className="flex items-center">
                            <FaSpinner className="animate-spin mr-2" />
                            Processing...
                          </span>
                        ) : (
                          'Send Final Price to Customer'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              <div className="mb-4">
                <p className="text-gray-600 mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleUpdateStatus(selectedOrder.id, status)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        selectedOrder.status === status 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-gray-600 mb-2">Order Items</p>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">Item</th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">Quantity</th>
                        <th className="py-2 px-3 text-left text-xs font-medium text-gray-500">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.rawData && selectedOrder.rawData.items && selectedOrder.rawData.items.map((item, index) => (
                        <tr key={index}>
                          <td className="py-2 px-3 text-sm">{item.productId ? (item.productId.name || 'Unknown Product') : 'Unknown Product'}</td>
                          <td className="py-2 px-3 text-sm">{item.quantity}</td>
                          <td className="py-2 px-3 text-sm">₹{item.price.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && editOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Order #{editOrder.id}</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Customer Name</label>
              <input
                type="text"
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                value={editOrder.customer}
                onChange={(e) => setEditOrder({...editOrder, customer: e.target.value})}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Order Date</label>
              <input
                type="date"
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                value={editOrder.date}
                onChange={(e) => setEditOrder({...editOrder, date: e.target.value})}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
              <select
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                value={editOrder.status}
                onChange={(e) => setEditOrder({...editOrder, status: e.target.value})}
              >
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="flex justify-end">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md mr-2"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-[#92c51b] hover:bg-[#7ba515] text-white px-4 py-2 rounded-md flex items-center"
                onClick={handleEditOrder}
              >
                <FaSave className="mr-2" /> Update Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;