import React, { useState, useEffect } from 'react';
import { inventoryManagementApi, productManagementApi } from '../../services/adminApi';
import { format } from 'date-fns';

const InventoryManagement = () => {
  // State for inventory logs
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);
  
  // State for inventory summary
  const [summary, setSummary] = useState({
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    recentAdjustments: 0
  });
  
  // State for inventory adjustment
  const [adjustmentDialog, setAdjustmentDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [action, setAction] = useState('add');
  const [notes, setNotes] = useState('');
  const [products, setProducts] = useState([]);
  const [adjustmentSuccess, setAdjustmentSuccess] = useState(false);
  
  // State for filters
  const [filters, setFilters] = useState({
    productId: '',
    action: '',
    startDate: '',
    endDate: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [filterDialog, setFilterDialog] = useState(false);
  
  // State for log details
  const [logDetailsDialog, setLogDetailsDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Fetch inventory logs
  const fetchInventoryLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await inventoryManagementApi.getAllInventoryLogs(page, limit, filters);
      setInventoryLogs(response.data.logs);
      setTotalLogs(response.data.total);
    } catch (err) {
      setError('Failed to fetch inventory logs. Please try again.');
      console.error('Error fetching inventory logs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch inventory summary
  const fetchInventorySummary = async () => {
    try {
      const response = await inventoryManagementApi.getInventorySummary();
      setSummary(response.data);
    } catch (err) {
      console.error('Error fetching inventory summary:', err);
    }
  };

  // Fetch products for dropdown
  const fetchProducts = async () => {
    try {
      const response = await productManagementApi.getAllProducts(1, 100);
      setProducts(response.data.products);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // Handle inventory adjustment
  const handleInventoryAdjustment = async () => {
    if (!selectedProduct || !quantity) return;
    
    setLoading(true);
    try {
      await inventoryManagementApi.updateInventory(
        selectedProduct._id,
        quantity,
        action,
        notes
      );
      setAdjustmentSuccess(true);
      // Reset form and refresh data
      setSelectedProduct(null);
      setQuantity(1);
      setAction('add');
      setNotes('');
      fetchInventoryLogs();
      fetchInventorySummary();
      
      // Close dialog after short delay
      setTimeout(() => {
        setAdjustmentDialog(false);
        setAdjustmentSuccess(false);
      }, 1500);
    } catch (err) {
      setError('Failed to update inventory. Please try again.');
      console.error('Error updating inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    setPage(1); // Reset to first page when applying filters
    fetchInventoryLogs();
    setFilterDialogOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      productId: '',
      action: '',
      startDate: '',
      endDate: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
  };

  // View log details
  const viewLogDetails = (log) => {
    setSelectedLog(log);
    setLogDetailsDialog(true);
  };

  // Initial data fetch
  useEffect(() => {
    fetchInventoryLogs();
    fetchInventorySummary();
    fetchProducts();
  }, [page, limit]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Inventory Management</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">Total Products</p>
          <p className="text-2xl font-semibold">{summary.totalProducts}</p>
        </div>
        <div className="bg-amber-50 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">Low Stock Products</p>
          <p className="text-2xl font-semibold text-amber-600">{summary.lowStockProducts}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">Out of Stock</p>
          <p className="text-2xl font-semibold text-red-600">{summary.outOfStockProducts}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <p className="text-sm text-gray-500 mb-1">Recent Adjustments</p>
          <p className="text-2xl font-semibold text-blue-600">{summary.recentAdjustments}</p>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap justify-between mb-6">
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          onClick={() => setAdjustmentDialog(true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Adjustment
        </button>
        
        <div className="flex space-x-2">
          <button 
            className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-md flex items-center"
            onClick={() => setFilterDialogOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Filter
          </button>
          <button 
            className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-md flex items-center"
            onClick={() => {
              resetFilters();
              fetchInventoryLogs();
              fetchInventorySummary();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
      
      {/* Error Alert */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Inventory Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : !inventoryLogs || inventoryLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No inventory logs found
                  </td>
                </tr>
              ) : (
                inventoryLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.product?.name || 'Unknown Product'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.action === 'add' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.previousStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.currentStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.updatedBy?.name || 'System'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => viewLogDetails(log)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">
            Showing {inventoryLogs && inventoryLogs.length > 0 ? inventoryLogs.length : 0} of {totalLogs || 0} entries
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            className={`px-3 py-1 rounded ${page === 1 || loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            disabled={page === 1 || loading}
          >
            Previous
          </button>
          <span className="px-3 py-1">
            Page {page}
          </span>
          <button 
            className={`px-3 py-1 rounded ${inventoryLogs && inventoryLogs.length < limit || loading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setPage(prev => prev + 1)}
            disabled={inventoryLogs && inventoryLogs.length < limit || loading}
          >
            Next
          </button>
        </div>
      </div>
      
      {/* Adjustment Dialog */}
      {adjustmentDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="bg-gray-100 px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-semibold">Adjust Inventory</h2>
            </div>
            <div className="p-6">
              {adjustmentSuccess ? (
                <div className="text-center py-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-lg font-medium">Inventory Updated Successfully!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                    <select
                      value={selectedProduct ? selectedProduct._id : ''}
                      onChange={(e) => {
                        const product = products.find(p => p._id === e.target.value);
                        setSelectedProduct(product || null);
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Product</option>
                      {products && products.length > 0 ? products.map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name} (Current Stock: {product.stockQty || 0})
                        </option>
                      )) : <option disabled>Loading products...</option>}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setAction('add')}
                        className={`px-4 py-2 rounded-md ${
                          action === 'add' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        Add Stock
                      </button>
                      <button
                        type="button"
                        onClick={() => setAction('remove')}
                        className={`px-4 py-2 rounded-md ${
                          action === 'remove' 
                            ? 'bg-red-600 text-white' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        Remove Stock
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input 
                      type="number" 
                      min="1" 
                      value={quantity} 
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                    <textarea 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)}
                      rows="3"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add notes about this inventory adjustment..."
                    ></textarea>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
              <button 
                onClick={() => setAdjustmentDialog(false)} 
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={handleInventoryAdjustment} 
                disabled={!selectedProduct || loading}
                className={`px-4 py-2 ml-2 rounded-md ${
                  !selectedProduct || loading
                    ? 'bg-blue-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? 'Updating...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Dialog */}
      {filterDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="bg-gray-100 px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-semibold">Filter Inventory Logs</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">From</label>
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">To</label>
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                  <select
                    value={filters.action}
                    onChange={(e) => setFilters({...filters, action: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Actions</option>
                    <option value="add">Added Stock</option>
                    <option value="remove">Removed Stock</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="createdAt">Date</option>
                      <option value="quantity">Quantity</option>
                    </select>
                    <select
                      value={filters.sortOrder}
                      onChange={(e) => setFilters({...filters, sortOrder: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
              <button 
                onClick={() => {
                  setFilters(defaultFilters);
                  fetchInventoryLogs();
                  setFilterDialog(false);
                }} 
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
              >
                Reset
              </button>
              <button 
                onClick={() => {
                  fetchInventoryLogs();
                  setFilterDialog(false);
                }} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md ml-2"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Details Dialog */}
      {logDetailsDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl">
            <div className="bg-gray-100 px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-semibold">Inventory Log Details</h2>
            </div>
            <div className="p-6">
              {selectedLog && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Product Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Product Name</p>
                          <p className="font-medium">{selectedLog.product?.name || 'Unknown Product'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">SKU</p>
                          <p className="font-medium">{selectedLog.product?.sku || 'N/A'}</p>
                        </div>
                        {selectedLog.product?.images && selectedLog.product.images.length > 0 && (
                          <div>
                            <p className="text-sm text-gray-500">Product Image</p>
                            <img 
                              src={selectedLog.product.images[0]} 
                              alt={selectedLog.product.name} 
                              className="h-24 w-24 object-cover rounded-md mt-1"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Adjustment Details</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-500">Date & Time</p>
                          <p className="font-medium">{format(new Date(selectedLog.createdAt), 'dd/MM/yyyy HH:mm:ss')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Action</p>
                          <p className={`font-medium ${selectedLog.action === 'add' ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedLog.action === 'add' ? 'Added Stock' : 'Removed Stock'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Quantity</p>
                          <p className="font-medium">{selectedLog.quantity}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Previous Stock</p>
                            <p className="font-medium">{selectedLog.previousStock}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Current Stock</p>
                            <p className="font-medium">{selectedLog.currentStock}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Updated By</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="font-medium">{selectedLog.updatedBy?.name || 'System'}</p>
                      {selectedLog.updatedBy?.email && (
                        <p className="text-sm text-gray-500">{selectedLog.updatedBy.email}</p>
                      )}
                    </div>
                  </div>
                  
                  {selectedLog.notes && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p>{selectedLog.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
              <button 
                onClick={() => setLogDetailsDialog(false)} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;