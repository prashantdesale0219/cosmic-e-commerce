import React, { useState, useEffect } from 'react';
import { reportsApi } from '../../services/adminApi';
import { toast } from 'react-toastify';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ReportsManagement = () => {
  // State for different reports
  const [salesReport, setSalesReport] = useState([]);
  const [inventoryReport, setInventoryReport] = useState({
    summary: {},
    lowStockProducts: [],
    outOfStockProducts: [],
    inventoryMovement: [],
    topProductsByTurnover: []
  });
  const [customerReport, setCustomerReport] = useState({
    summary: {},
    customerGrowth: [],
    topCustomers: []
  });
  const [productPerformance, setProductPerformance] = useState([]);
  
  // State for loading indicators
  const [loading, setLoading] = useState({
    sales: false,
    inventory: false,
    customer: false,
    product: false
  });
  
  // State for date filters
  const [dateFilters, setDateFilters] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    groupBy: 'day'
  });
  
  // State for active tab
  const [activeTab, setActiveTab] = useState('sales');

  // Fetch reports on component mount and when filters change
  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSalesReport();
    } else if (activeTab === 'inventory') {
      fetchInventoryReport();
    } else if (activeTab === 'customer') {
      fetchCustomerReport();
    } else if (activeTab === 'product') {
      fetchProductPerformance();
    }
  }, [activeTab]);

  // Fetch sales report
  const fetchSalesReport = async () => {
    setLoading(prev => ({ ...prev, sales: true }));
    try {
      const response = await reportsApi.getSalesReport({
        startDate: dateFilters.startDate,
        endDate: dateFilters.endDate,
        groupBy: dateFilters.groupBy
      });
      
      if (response.data && response.data.data) {
        const { timeSeries, statusDistribution, summary } = response.data.data;
        setSalesReport({
          timeSeries: timeSeries || [],
          statusDistribution: statusDistribution || [],
          summary: summary || {}
        });
      } else {
        setSalesReport({
          timeSeries: [],
          statusDistribution: [],
          summary: {}
        });
      }
    } catch (error) {
      console.error('Error fetching sales report:', error);
      toast.error('Failed to fetch sales report');
    } finally {
      setLoading(prev => ({ ...prev, sales: false }));
    }
  };

  // Fetch inventory report
  const fetchInventoryReport = async () => {
    setLoading(prev => ({ ...prev, inventory: true }));
    try {
      const response = await reportsApi.getInventoryReport();
      if (response.data && response.data.data) {
        setInventoryReport(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching inventory report:', error);
      toast.error('Failed to fetch inventory report');
    } finally {
      setLoading(prev => ({ ...prev, inventory: false }));
    }
  };

  // Fetch customer report
  const fetchCustomerReport = async () => {
    setLoading(prev => ({ ...prev, customer: true }));
    try {
      const response = await reportsApi.getCustomerReport({
        startDate: dateFilters.startDate,
        endDate: dateFilters.endDate
      });
      if (response.data && response.data.data) {
        setCustomerReport(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching customer report:', error);
      toast.error('Failed to fetch customer report');
    } finally {
      setLoading(prev => ({ ...prev, customer: false }));
    }
  };

  // Fetch product performance
  const fetchProductPerformance = async () => {
    setLoading(prev => ({ ...prev, product: true }));
    try {
      const response = await reportsApi.getProductPerformance({
        startDate: dateFilters.startDate,
        endDate: dateFilters.endDate,
        limit: 10
      });
      if (response.data && response.data.data) {
        setProductPerformance(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching product performance:', error);
      toast.error('Failed to fetch product performance');
    } finally {
      setLoading(prev => ({ ...prev, product: false }));
    }
  };

  // Handle date filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle apply filters
  const handleApplyFilters = () => {
    if (activeTab === 'sales') fetchSalesReport();
    else if (activeTab === 'inventory') fetchInventoryReport();
    else if (activeTab === 'customer') fetchCustomerReport();
    else if (activeTab === 'product') fetchProductPerformance();
  };

  // Prepare sales chart data
  const salesChartData = {
    labels: salesReport.timeSeries ? salesReport.timeSeries.map(item => item.date || `${item.year}-${item.month}`) : [],
    datasets: [
      {
        label: 'Revenue',
        data: salesReport.timeSeries ? salesReport.timeSeries.map(item => item.totalSales || 0) : [],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.2)',
        fill: true,
      },
      {
        label: 'Orders',
        data: salesReport.timeSeries ? salesReport.timeSeries.map(item => item.count || 0) : [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        fill: true,
      }
    ],
  };

  // Prepare inventory chart data
  const inventoryChartData = {
    labels: inventoryReport.topProductsByTurnover ? inventoryReport.topProductsByTurnover.map(item => item.title) : [],
    datasets: [
      {
        label: 'Units Sold',
        data: inventoryReport.topProductsByTurnover ? inventoryReport.topProductsByTurnover.map(item => item.totalSold) : [],
        backgroundColor: 'rgba(79, 70, 229, 0.7)',
        borderColor: '#4F46E5',
        borderWidth: 1,
      }
    ]
  };

  // Prepare customer chart data
  const customerChartData = {
    labels: customerReport.customerGrowth ? customerReport.customerGrowth.map(item => item.date || `${item.year}-${item.month}`) : [],
    datasets: [
      {
        label: 'New Customers',
        data: customerReport.customerGrowth ? customerReport.customerGrowth.map(item => item.count) : [],
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        fill: true,
      }
    ]
  };

  // Prepare product performance chart data
  const productChartData = {
    labels: productPerformance.topProducts ? productPerformance.topProducts.map(item => item.title) : [],
    datasets: [
      {
        label: 'Revenue',
        data: productPerformance.topProducts ? productPerformance.topProducts.map(item => item.revenue) : [],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: '#10B981',
        borderWidth: 1,
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: activeTab === 'sales' ? 'Sales Report' : 
              activeTab === 'inventory' ? 'Inventory Status' :
              activeTab === 'customer' ? 'Customer Activity' : 'Product Performance',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Reports Management</h1>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'sales' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
          onClick={() => setActiveTab('sales')}
        >
          Sales Report
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'inventory' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory Status
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'customer' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
          onClick={() => setActiveTab('customer')}
        >
          Customer Activity
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'product' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-indigo-500'}`}
          onClick={() => setActiveTab('product')}
        >
          Product Performance
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={dateFilters.startDate}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={dateFilters.endDate}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {activeTab === 'sales' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
              <select
                name="groupBy"
                value={dateFilters.groupBy}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>
          )}
          <div className="flex items-end">
            <button
              onClick={handleApplyFilters}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
      
      {/* Report Content */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        {/* Sales Report */}
        {activeTab === 'sales' && (
          <div>
            {loading.sales ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : salesReport.timeSeries && salesReport.timeSeries.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                    <h3 className="text-lg font-medium text-gray-700">Total Revenue</h3>
                    <p className="text-2xl font-bold text-indigo-600">
                      ₹{salesReport.summary && salesReport.summary.totalRevenue ? salesReport.summary.totalRevenue.toLocaleString() : '0'}
                    </p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                    <h3 className="text-lg font-medium text-gray-700">Total Orders</h3>
                    <p className="text-2xl font-bold text-indigo-600">
                      {salesReport.summary && salesReport.summary.totalOrders ? salesReport.summary.totalOrders.toLocaleString() : '0'}
                    </p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                    <h3 className="text-lg font-medium text-gray-700">Average Order Value</h3>
                    <p className="text-2xl font-bold text-indigo-600">
                      ₹{salesReport.summary && salesReport.summary.avgOrderValue ? salesReport.summary.avgOrderValue.toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>
                <div className="h-80">
                  <Line data={salesChartData} options={chartOptions} />
                </div>
                
                {salesReport.statusDistribution && salesReport.statusDistribution.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Order Status Distribution</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-64">
                        <Pie 
                          data={{
                            labels: salesReport.statusDistribution.map(item => item.status),
                            datasets: [{
                              data: salesReport.statusDistribution.map(item => item.count),
                              backgroundColor: [
                                'rgba(79, 70, 229, 0.7)',
                                'rgba(16, 185, 129, 0.7)',
                                'rgba(245, 158, 11, 0.7)',
                                'rgba(239, 68, 68, 0.7)',
                                'rgba(107, 114, 128, 0.7)'
                              ]
                            }]
                          }}
                          options={{
                            plugins: {
                              title: {
                                display: true,
                                text: 'Orders by Status'
                              }
                            }
                          }}
                        />
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {salesReport.statusDistribution.map((item, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.status}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.count}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{item.totalAmount ? item.totalAmount.toLocaleString() : '0'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No sales data available for the selected period.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Inventory Report */}
        {activeTab === 'inventory' && (
          <div>
            {loading.inventory ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : inventoryReport.summary ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                    <h3 className="text-lg font-medium text-gray-700">Total Products</h3>
                    <p className="text-2xl font-bold text-indigo-600">
                      {inventoryReport.summary.totalProducts || 0}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <h3 className="text-lg font-medium text-gray-700">Out of Stock</h3>
                    <p className="text-2xl font-bold text-red-600">
                      {inventoryReport.summary.outOfStockCount || 0}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <h3 className="text-lg font-medium text-gray-700">Low Stock</h3>
                    <p className="text-2xl font-bold text-yellow-600">
                      {inventoryReport.summary.lowStockCount || 0}
                    </p>
                  </div>
                </div>
                
                {inventoryReport.topProductsByTurnover && inventoryReport.topProductsByTurnover.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Top Products by Turnover</h3>
                    <div className="h-80">
                      <Bar data={inventoryChartData} options={chartOptions} />
                    </div>
                  </div>
                )}
                
                {inventoryReport.lowStockProducts && inventoryReport.lowStockProducts.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Low Stock Products</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Qty</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {inventoryReport.lowStockProducts.map((product, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.title}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stockQty === 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                  {product.stockQty}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No inventory data available.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Customer Report */}
        {activeTab === 'customer' && (
          <div>
            {loading.customer ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : customerReport.summary ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                    <h3 className="text-lg font-medium text-gray-700">Total Customers</h3>
                    <p className="text-2xl font-bold text-indigo-600">
                      {customerReport.summary.totalCustomers || 0}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <h3 className="text-lg font-medium text-gray-700">New Customers (Last 30 Days)</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {customerReport.summary.newCustomers || 0}
                    </p>
                  </div>
                </div>
                
                {customerReport.customerGrowth && customerReport.customerGrowth.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Customer Growth</h3>
                    <div className="h-80">
                      <Line data={customerChartData} options={chartOptions} />
                    </div>
                  </div>
                )}
                
                {customerReport.topCustomers && customerReport.topCustomers.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-700 mb-4">Top Customers by Spend</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Order Value</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {customerReport.topCustomers.map((customer, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.orderCount}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{customer.totalSpent.toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{customer.avgOrderValue.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No customer data available for the selected period.</p>
              </div>
            )}
          </div>
        )}
        
        {/* Product Performance */}
        {activeTab === 'product' && (
          <div>
            {loading.product ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : productPerformance.topProducts && productPerformance.topProducts.length > 0 ? (
              <div>
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Top Performing Products</h3>
                  <div className="h-80">
                    <Bar data={productChartData} options={chartOptions} />
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {productPerformance.topProducts.map((product, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.title}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.unitsSold}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{product.revenue.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.conversionRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No product performance data available for the selected period.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsManagement;