import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { adminShippingApi } from '../../services/api';

const AdminShippingPanel = () => {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [waitingConfirmationOrders, setWaitingConfirmationOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shippingCharges, setShippingCharges] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [pendingRes, waitingRes] = await Promise.all([
        adminShippingApi.getPendingReviewOrders(),
        adminShippingApi.getWaitingConfirmationOrders()
      ]);
      
      setPendingOrders(pendingRes.data.data);
      setWaitingConfirmationOrders(waitingRes.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    setShippingCharges(order.shippingCharges || '');
    setAdminNotes(order.adminNotes || '');
  };

  const handleAddShippingCharges = async (e) => {
    e.preventDefault();
    
    if (!selectedOrder) return;
    
    if (!shippingCharges || isNaN(shippingCharges) || Number(shippingCharges) <= 0) {
      toast.error('Please enter valid shipping charges');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await adminShippingApi.addShippingCharges(selectedOrder._id, {
        shippingCharges: Number(shippingCharges),
        adminNotes
      });
      
      toast.success('Shipping charges added successfully');
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      console.error('Error adding shipping charges:', error);
      toast.error(error.response?.data?.message || 'Failed to add shipping charges');
    } finally {
      setSubmitting(false);
    }
  };

  const renderOrderList = (orders) => {
    if (orders.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No orders found
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left">Order ID</th>
              <th className="py-2 px-4 text-left">Customer</th>
              <th className="py-2 px-4 text-left">Date</th>
              <th className="py-2 px-4 text-right">Amount</th>
              <th className="py-2 px-4 text-center">Status</th>
              <th className="py-2 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr 
                key={order._id} 
                className={`border-b hover:bg-gray-50 ${selectedOrder?._id === order._id ? 'bg-blue-50' : ''}`}
              >
                <td className="py-2 px-4">{order._id.substring(0, 8)}...</td>
                <td className="py-2 px-4">{order.shippingAddress?.fullName}</td>
                <td className="py-2 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="py-2 px-4 text-right">₹{order.totalAmount}</td>
                <td className="py-2 px-4 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.orderStatus === 'pending_admin_review' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {order.orderStatus === 'pending_admin_review' ? 'Pending Review' : 'Waiting Confirmation'}
                  </span>
                </td>
                <td className="py-2 px-4 text-center">
                  <button
                    onClick={() => handleOrderSelect(order)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {order.orderStatus === 'pending_admin_review' ? 'Add Charges' : 'View Details'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>
      
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'pending' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Review ({pendingOrders.length})
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'waiting' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('waiting')}
        >
          Waiting Confirmation ({waitingConfirmationOrders.length})
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            activeTab === 'pending' 
              ? renderOrderList(pendingOrders)
              : renderOrderList(waitingConfirmationOrders)
          )}
        </div>
        
        <div>
          {selectedOrder && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Order Details</h2>
              
              <div className="mb-4">
                <p className="text-gray-600">Order ID:</p>
                <p className="font-medium">{selectedOrder._id}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600">Customer:</p>
                <p className="font-medium">{selectedOrder.shippingAddress?.fullName}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600">Shipping Address:</p>
                <div className="text-sm">
                  <p>{selectedOrder.shippingAddress?.addressLine1}</p>
                  {selectedOrder.shippingAddress?.addressLine2 && <p>{selectedOrder.shippingAddress?.addressLine2}</p>}
                  <p>
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}
                  </p>
                  <p>{selectedOrder.shippingAddress?.country}</p>
                  <p>Phone: {selectedOrder.shippingAddress?.phone}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600">Items:</p>
                <ul className="text-sm">
                  {selectedOrder.items?.map((item, index) => (
                    <li key={index} className="flex justify-between py-1">
                      <span>{item.name} x {item.quantity}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600">Subtotal:</p>
                <p className="font-medium">₹{selectedOrder.totalAmount}</p>
              </div>
              
              {selectedOrder.orderStatus === 'pending_admin_review' ? (
                <form onSubmit={handleAddShippingCharges}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="shippingCharges">
                      Shipping Charges (₹)
                    </label>
                    <input
                      type="number"
                      id="shippingCharges"
                      value={shippingCharges}
                      onChange={(e) => setShippingCharges(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="adminNotes">
                      Notes (Optional)
                    </label>
                    <textarea
                      id="adminNotes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {submitting ? 'Processing...' : 'Add Shipping Charges'}
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="mb-4">
                    <p className="text-gray-600">Shipping Charges:</p>
                    <p className="font-medium">₹{selectedOrder.shippingCharges}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-gray-600">Total:</p>
                    <p className="font-medium">₹{selectedOrder.totalAmount + selectedOrder.shippingCharges}</p>
                  </div>
                  
                  {selectedOrder.adminNotes && (
                    <div className="mb-4">
                      <p className="text-gray-600">Admin Notes:</p>
                      <p className="text-sm">{selectedOrder.adminNotes}</p>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <p className="text-sm text-blue-600">
                      Waiting for customer confirmation...
                    </p>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminShippingPanel;