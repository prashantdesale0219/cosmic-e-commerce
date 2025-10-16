import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { wishlistAnalyticsApi } from '../../services/adminApi';

// Register ChartJS components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const WishlistAnalytics = () => {
  const [wishlistData, setWishlistData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productChartData, setProductChartData] = useState(null);
  const [categoryChartData, setCategoryChartData] = useState(null);
  const [summary, setSummary] = useState({
    totalWishlists: 0,
    uniqueUsers: 0,
    uniqueProducts: 0
  });

  useEffect(() => {
    fetchWishlistData();
  }, []);

  const fetchWishlistData = async () => {
    setLoading(true);
    try {
      const response = await wishlistAnalyticsApi.getWishlistAnalytics();
      
      const data = response.data.data || [];
      setWishlistData(data);
      
      // Update summary with data from API
      if (response.data.summary) {
        setSummary(response.data.summary);
      }
      
      // Process data for charts
      processData(data);
    } catch (error) {
      console.error('Error fetching wishlist data:', error);
      toast.error('Failed to fetch wishlist analytics');
    } finally {
      setLoading(false);
    }
  };

  const processData = (data) => {
    if (!data || data.length === 0) return;

    // Calculate summary statistics
    const uniqueUsers = new Set(data.map(item => item.userId)).size;
    const uniqueProducts = new Set(data.map(item => item.productId)).size;
    
    setSummary({
      totalWishlists: data.length,
      uniqueUsers,
      uniqueProducts
    });

    // Process product data for chart
    const productCounts = {};
    const productNames = {};
    
    data.forEach(item => {
      const productId = item.productId;
      productCounts[productId] = (productCounts[productId] || 0) + 1;
      productNames[productId] = item.productName || `Product ${productId}`;
    });

    // Sort products by count and take top 5
    const topProducts = Object.keys(productCounts)
      .sort((a, b) => productCounts[b] - productCounts[a])
      .slice(0, 5);

    setProductChartData({
      labels: topProducts.map(id => productNames[id]),
      datasets: [
        {
          label: 'Number of Wishlists',
          data: topProducts.map(id => productCounts[id]),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    });

    // Process category data for chart
    const categoryCounts = {};
    const categoryNames = {};
    
    data.forEach(item => {
      if (item.categoryId) {
        const categoryId = item.categoryId;
        categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
        categoryNames[categoryId] = item.categoryName || `Category ${categoryId}`;
      }
    });

    // Sort categories by count and take top 5
    const topCategories = Object.keys(categoryCounts)
      .sort((a, b) => categoryCounts[b] - categoryCounts[a])
      .slice(0, 5);

    setCategoryChartData({
      labels: topCategories.map(id => categoryNames[id]),
      datasets: [
        {
          label: 'Products by Category',
          data: topCategories.map(id => categoryCounts[id]),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    });
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Most Wishlisted Categories',
      },
    },
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Wishlist Analytics</h1>
      
      {loading ? (
        <p>Loading wishlist analytics...</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700">Total Wishlists</h2>
              <p className="text-3xl font-bold text-blue-600">{summary.totalWishlists}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700">Unique Users</h2>
              <p className="text-3xl font-bold text-green-600">{summary.uniqueUsers}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700">Unique Products</h2>
              <p className="text-3xl font-bold text-purple-600">{summary.uniqueProducts}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Wishlisted Products */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Top Wishlisted Products</h2>
              {productChartData ? (
                <div className="h-64">
                  <Pie data={productChartData} />
                </div>
              ) : (
                <p>No product data available</p>
              )}
            </div>

            {/* Most Wishlisted Categories */}
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Most Wishlisted Categories</h2>
              {categoryChartData ? (
                <div className="h-64">
                  <Bar options={barOptions} data={categoryChartData} />
                </div>
              ) : (
                <p>No category data available</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WishlistAnalytics;