import React, { useState, useEffect } from 'react';
import { FaUsers, FaShoppingCart, FaBoxOpen, FaChartLine, FaDollarSign, FaSpinner, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { dashboardApi } from '../../services/adminApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';

// Chart.js registration
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const { adminToken } = useAdminAuth();
  
  // Load stats from API
  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const response = await dashboardApi.getDashboardStats();
      
      if (response.data && response.data.success) {
        setDashboardStats(response.data.data);
        setError(null);
        // Removed success toast to avoid UI clutter
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError('Failed to load dashboard stats');
      toast.error('Failed to load dashboard stats: ' + (err.response?.data?.message || err.message));
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300); // Reduced delay for better responsiveness
    }
  };
  
  useEffect(() => {
    setLoading(true);
    // Add a small delay before fetching to ensure loading state is visible
    const timer = setTimeout(() => {
      fetchStats();
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleRefresh = () => {
    fetchStats();
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <FaSpinner className="text-6xl text-main animate-spin mb-4" />
        <p className="text-xl font-semibold text-gray-700">Loading dashboard data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <FaExclamationTriangle className="text-4xl text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-800">{error}</h2>
        <p className="text-gray-600 mt-2">Please try refreshing the page or contact support.</p>
        <button 
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md flex items-center"
        >
          <FaSync className="mr-2" /> Refresh Dashboard
        </button>
      </div>
    );
  }
  
  // Stats cards data
  const stats = [
    { 
      title: 'Total Users', 
      value: dashboardStats?.userStats?.total || '0', 
      icon: <FaUsers className="text-blue-500" />, 
      change: dashboardStats?.userStats?.growth || '0%',
      detail: `${dashboardStats?.userStats?.active || '0'} active users`
    },
    { 
      title: 'Total Orders', 
      value: dashboardStats?.orderStats?.total || '0', 
      icon: <FaShoppingCart className="text-green-500" />, 
      change: dashboardStats?.orderStats?.growth || '0%',
      detail: `${dashboardStats?.orderStats?.pending || '0'} pending orders`
    },
    { 
      title: 'Total Products', 
      value: dashboardStats?.productStats?.total || '0', 
      icon: <FaBoxOpen className="text-yellow-500" />, 
      change: dashboardStats?.productStats?.growth || '0%',
      detail: `${dashboardStats?.productStats?.outOfStock || '0'} out of stock`
    },
    { 
      title: 'Total Revenue', 
      value: `$${(dashboardStats?.revenueStats?.total || 0).toLocaleString()}`, 
      icon: <FaDollarSign className="text-purple-500" />, 
      change: dashboardStats?.revenueStats?.growth || '0%',
      detail: `$${(dashboardStats?.revenueStats?.recent || 0).toLocaleString()} this month`
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button 
          onClick={handleRefresh} 
          className="px-4 py-2 bg-primary text-white rounded-md flex items-center"
          disabled={loading}
        >
          {loading ? (
            <FaSpinner className="mr-2 animate-spin" />
          ) : (
            <FaSync className="mr-2" />
          )}
          Refresh
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className={`text-sm mt-2 ${parseFloat(stat.change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change} from last month
                </p>
                <p className="text-gray-600 text-xs mt-1">{stat.detail}</p>
              </div>
              <div className="text-3xl p-3 bg-gray-100 rounded-full">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Order Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Order Status Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Order Status Distribution</h2>
          <div className="h-64">
            {dashboardStats?.orderStatusData ? (
              <Pie 
                data={{
                  labels: Object.keys(dashboardStats.orderStatusData),
                  datasets: [
                    {
                      data: Object.values(dashboardStats.orderStatusData),
                      backgroundColor: [
                        '#4F46E5', // pending_admin_review
                        '#10B981', // confirmed
                        '#F59E0B', // processing
                        '#3B82F6', // shipped
                        '#6366F1', // delivered
                        '#EF4444', // cancelled
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No order status data available</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Shipping Charges Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Shipping & Revenue Summary</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Avg. Shipping Charges</p>
                <p className="text-xl font-bold">₹{dashboardStats?.shippingStats?.avgShipping || '0'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Total Shipping Revenue</p>
                <p className="text-xl font-bold">₹{dashboardStats?.shippingStats?.totalShipping || '0'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Orders Pending Review</p>
                <p className="text-xl font-bold">{dashboardStats?.orderStats?.pendingReview || '0'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Avg. Order Value</p>
                <p className="text-xl font-bold">₹{dashboardStats?.orderStats?.avgOrderValue || '0'}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-md font-medium mb-2">Recent Orders Requiring Review</h3>
              {dashboardStats?.recentPendingOrders && dashboardStats.recentPendingOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardStats.recentPendingOrders.map((order, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{order.orderId}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{order.customer}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{new Date(order.date).toLocaleDateString()}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            <a 
                              href={`/admin/orders?id=${order._id}`} 
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Review
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No pending orders requiring review</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Sales Overview</h2>
          <div className="h-64">
            <Line 
                data={{
                  labels: dashboardStats?.chartData?.monthlySales?.map(item => `${item.month} ${item.year}`) || 
                    dashboardStats?.monthlySales?.map(item => `${item.month} ${item.year}`) ||
                    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                  datasets: [
                    {
                      label: 'Orders',
                      data: dashboardStats?.chartData?.monthlySales?.map(item => item.count || item.orders) || 
                        dashboardStats?.monthlySales?.map(item => item.count || item.orders) ||
                        [0, 0, 0, 0, 0, 0],
                      borderColor: '#92c51b',
                      backgroundColor: 'rgba(146, 197, 27, 0.1)',
                      tension: 0.4,
                      yAxisID: 'y',
                    },
                    {
                      label: 'Revenue',
                      data: dashboardStats?.chartData?.monthlySales?.map(item => item.revenue) || 
                        dashboardStats?.monthlySales?.map(item => item.revenue) ||
                        [0, 0, 0, 0, 0, 0],
                      borderColor: '#3b82f6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      tension: 0.4,
                      yAxisID: 'y1',
                    }
                  ]
                }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: 'index',
                  intersect: false,
                },
                scales: {
                  y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                      display: true,
                      text: 'Orders'
                    },
                    beginAtZero: true
                  },
                  y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                      display: true,
                      text: 'Revenue (₹)'
                    },
                    beginAtZero: true,
                    grid: {
                      drawOnChartArea: false,
                    },
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Product Inventory Status</h2>
          <div className="h-64">
                <Pie 
                  data={{
                    labels: ['In Stock', 'Out of Stock', 'Low Stock'],
                    datasets: [
                      {
                        data: [
                          dashboardStats?.productStats?.inStockProducts || 0,
                          dashboardStats?.productStats?.outOfStockProducts || 0,
                          dashboardStats?.productStats?.lowStockProducts || 0
                        ],
                        backgroundColor: [
                          'rgba(34, 197, 94, 0.7)',  // Green for in stock
                          'rgba(239, 68, 68, 0.7)',  // Red for out of stock
                          'rgba(234, 179, 8, 0.7)',  // Yellow for low stock
                        ],
                        borderColor: [
                          'rgb(34, 197, 94)',
                          'rgb(239, 68, 68)',
                          'rgb(234, 179, 8)',
                        ],
                        borderWidth: 1,
                      }
                    ]
                  }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${value} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Recent Orders & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <a href="/admin/orders" className="text-primary text-sm hover:underline">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardStats?.chartData?.recentOrders ? (
                  dashboardStats.chartData.recentOrders.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">#{order._id.substring(0, 8)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">₹{order.totalAmount.toLocaleString()}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                            order.status === 'pending' ? 'bg-indigo-100 text-indigo-800' : 
                            'bg-red-100 text-red-800'}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-3 text-sm text-center text-gray-500">No recent orders</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Top Selling Products</h2>
            <a href="/admin/products" className="text-primary text-sm hover:underline">View All Products</a>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardStats?.chartData?.topSellingProducts ? (
                  dashboardStats.chartData.topSellingProducts.map((product, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex items-center">
                          {product.image && (
                            <img 
                              src={`http://localhost:8000/uploads/products/${product.image}`} 
                              alt={product.name} 
                              className="h-8 w-8 mr-3 object-cover rounded"
                            />
                          )}
                          <span className="truncate max-w-[150px]">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{product.totalSold}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">₹{product.revenue.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-3 text-sm text-center text-gray-500">No product data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Low Stock Products */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Low Stock Products</h2>
          <a href="/admin/products?stock=low" className="text-primary text-sm hover:underline">View All Low Stock</a>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardStats?.chartData?.lowStockProducts ? (
                dashboardStats.chartData.lowStockProducts.map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center">
                        {product.image && (
                          <img 
                            src={`http://localhost:8000/uploads/products/${product.image}`} 
                            alt={product.name} 
                            className="h-8 w-8 mr-3 object-cover rounded"
                          />
                        )}
                        <span className="truncate max-w-[150px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{product.stock}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${product.stock > 5 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {product.stock > 5 ? 'Low Stock' : 'Critical Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <a href={`/admin/products/${product._id}/edit`} className="text-primary hover:underline">Update Stock</a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-3 text-sm text-center text-gray-500">No low stock products</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;