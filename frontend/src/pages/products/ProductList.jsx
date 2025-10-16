import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { productsApi, cartApi } from '../../services/api';
import { FaHeart, FaChevronLeft, FaChevronRight, FaStar, FaShoppingCart, FaEye, FaTruck, FaCheckCircle, FaFilter, FaTimes } from 'react-icons/fa';
import { fixImageUrl } from '../../utils/imageUtils';
import ProductSidebar from '../../components/products/productsidebar';
import Breadcrumb from '../../components/common/Breadcrumb';

// Product Card Component - Same as in mostLoved.jsx
const ProductCard = ({ product }) => {
  // Calculate discount percentage if both prices are available
  const discountPercentage = product.originalPrice && product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;
  
  // Check if product is on sale
  const isOnSale = discountPercentage > 0;
  
  return (
    <div 
      className="bg-white shadow-sm overflow-hidden flex flex-col h-full relative"
    >
      {/* Bestseller Badge */}
      <div className="absolute top-0 left-0 z-10">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white text-xs font-bold py-1 px-2 rounded-br shadow-sm">
          Bestseller
        </div>
      </div>
      
      {/* On Sale Badge - Only shows if product has a discount */}
      {isOnSale && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-gradient-to-r from-red-500 to-red-700 text-white text-xs font-bold py-1 px-2 rounded-bl shadow-sm">
            On Sale
          </div>
        </div>
      )}
      
      {/* Wishlist Button */}
      <button className="absolute top-2 right-2 z-10 bg-white bg-opacity-90 rounded-full p-1.5 shadow-sm">
        <FaHeart className="text-gray-400 hover:text-red-500 transition-colors" size={14} />
      </button>
      
      {/* Product Image */}
      <Link to={`/product/${product._id}`} className="block">
        <div className="relative pt-[100%] bg-gray-50">
          <img 
            src={product.images && product.images.length > 0 
              ? fixImageUrl(product.images[0])
              : '/src/assets/images/placeholder.jpg'}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/src/assets/images/placeholder.jpg';
            }}
          />
        </div>
      </Link>
      
      {/* Product Info */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Product Name */}
        <Link to={`/product/${product._id}`} className="block">
          <h3 className="text-base font-medium text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors">
            {product.name || "WAAREE 540Wp 144 Cells 24 Volts Mono PERC Solar Module"}
          </h3>
        </Link>
        
        {/* Price */}
        <div className="flex items-baseline mb-3">
          <span className="text-xl font-bold text-gray-900">₹{product.price ? product.price.toLocaleString() : "10,499.07"}</span>
          {product.originalPrice && (
            <span className="ml-2 text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
          )}
          {isOnSale && (
            <span className="ml-2 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              {discountPercentage}% OFF
            </span>
          )}
        </div>
        
        {/* Ratings */}
        <div className="flex items-center mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <FaStar 
                key={i} 
                className={`${i < Math.floor(product.rating || 5) ? 'text-yellow-400' : 'text-gray-200'}`}
                size={16}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">({product.reviewCount || 27})</span>
        </div>
        
        {/* Shipping Info */}
        <div className="flex flex-wrap items-center text-xs text-gray-500 mb-4">
          <div className="flex items-center mr-2 mb-1">
            <FaTruck className="mr-1 flex-shrink-0" />
            <span className="whitespace-nowrap">{product.freeShipping ? 'Free Delivery' : 'Standard Delivery'}</span>
          </div>
          <div className="flex items-center">
            <FaCheckCircle className="mr-1 text-green-500 flex-shrink-0" />
            <span className="whitespace-nowrap">Available in Stock</span>
          </div>
        </div>
        
        {/* Button */}
        <div className="mt-auto">
          <button 
            className="w-full bg-main hover:bg-main-dark text-white font-medium py-3 px-4 rounded-lg text-center flex items-center justify-center gap-2"
            onClick={() => handleAddToCart(product._id)}
          >
            <FaShoppingCart size={16} />
            <span>Add to Basket</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ProductList = () => {
  const { category, subcategory } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [filters, setFilters] = useState({
    category: category || '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    minPrice: '',
    maxPrice: '',
    rating: 0,
    inStock: false
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 12
  });

  useEffect(() => {
    // Only auto-fetch when page or limit changes, not when filters change
    // This allows us to apply filters only when the user clicks the apply button
    fetchProducts();
  }, [pagination.currentPage, pagination.limit]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getAllProducts(
        pagination.currentPage, 
        pagination.limit, 
        filters
      );
      
      if (response.data && response.data.success) {
        setProducts(response.data.data || []);
        setPagination(prev => ({
          ...prev,
          totalPages: Math.ceil(response.data.totalCount / pagination.limit) || 1
        }));
      } else {
        setError('No products found');
        setProducts([]);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch products');
      setLoading(false);
      console.error(err);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await cartApi.addToCart({ productId, quantity: 1 });
      alert('Product added to cart!');
    } catch (err) {
      alert('Failed to add product to cart. Please try again.');
      console.error(err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFilters(prev => ({ ...prev, [name]: newValue }));
    // Reset to page 1 when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };
  
  const applyPriceFilter = () => {
    fetchProducts();
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
      // Smooth scroll to top when page changes
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  if (loading) return <div className="flex justify-center items-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <div className="mb-4 md:mb-0">
          <Breadcrumb 
            items={[
              { label: 'Products', path: '/products' },
              ...(category ? [{ 
                label: category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '), 
                path: `/products/category/${category}` 
              }] : []),
              ...(subcategory ? [{ 
                label: subcategory.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '), 
                path: `/products/category/${category}/${subcategory}` 
              }] : [])
            ]} 
          />
        </div>
        
        {/* Mobile Filter Button */}
        <button 
          className="lg:hidden flex items-center justify-center bg-[#92c51b] text-white p-3 rounded-lg shadow-md hover:bg-[#7ba316] transition-colors"
          onClick={() => setShowMobileFilter(!showMobileFilter)}
        >
          {showMobileFilter ? <FaTimes size={18} /> : <FaFilter size={18} />}
        </button>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filter Overlay */}
        {showMobileFilter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setShowMobileFilter(false)}></div>
        )}
        
        {/* Sidebar with filters */}
        <div className={`${showMobileFilter ? 'fixed inset-y-0 right-0 z-50 w-4/5 max-w-xs overflow-y-auto bg-white' : 'hidden'} lg:block lg:w-1/4 lg:static`}>
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6 h-full">
            <div className="flex justify-between items-center mb-4 lg:hidden">
              <h2 className="text-xl font-bold text-[#92c51b]">Filters</h2>
              <button 
                onClick={() => setShowMobileFilter(false)}
                className="text-[#92c51b] hover:text-[#7ba316] focus:outline-none"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <h2 className="text-xl font-bold text-[#92c51b] mb-4">Refine By</h2>
            
            <div className="flex justify-between mb-6">
              <p className="text-gray-600">{Object.values(filters).some(val => val !== '' && val !== 'createdAt' && val !== 'desc' && val !== 0 && val !== false) ? 'Filters applied' : 'No filters applied'}</p>
              
              {Object.values(filters).some(val => val !== '' && val !== 'createdAt' && val !== 'desc' && val !== 0 && val !== false) && (
                <button 
                  className="text-[#92c51b] hover:text-[#7ba316] font-medium"
                  onClick={() => {
                    setFilters({
                      category: '',
                      search: '',
                      sortBy: 'createdAt',
                      sortOrder: 'desc',
                      minPrice: '',
                      maxPrice: '',
                      rating: 0,
                      inStock: false
                    });
                    fetchProducts();
                  }}
                >
                  Remove Filters
                </button>
              )}
            </div>
            
            {/* Price Filter */}
            <div className="mb-8 border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#92c51b]">Price</h3>
                <button className="text-2xl font-bold text-[#92c51b] focus:outline-none" aria-label="Toggle price filter">−</button>
              </div>
              
              <div className="mb-4">
                <div className="flex gap-4 mb-4">
                  <div className="w-1/2">
                    <input
                      type="text"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      placeholder="Min"
                      className="w-full px-4 py-3 border border-[#92c51b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#92c51b] text-gray-700"
                    />
                  </div>
                  <div className="w-1/2">
                    <input
                      type="text"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      placeholder="Max"
                      className="w-full px-4 py-3 border border-[#92c51b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#92c51b] text-gray-700"
                    />
                  </div>
                </div>
                <button 
                  className="w-full bg-[#92c51b] text-white hover:bg-[#7ba316] transition-colors duration-300 font-bold py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-[#92c51b] shadow-md"
                  onClick={() => {
                    applyPriceFilter();
                    setShowMobileFilter(false);
                  }}
                >
                  Update
                </button>
              </div>
            </div>
            
            {/* Rating Filter */}
            <div className="mb-8 border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#92c51b]">Rating</h3>
                <button 
                  className="text-2xl font-bold text-[#92c51b] focus:outline-none focus:text-[#7ba316]" 
                  aria-label="Toggle rating filter"
                  onClick={() => {
                    // Toggle rating filter visibility logic
                    const ratingSection = document.querySelector('.rating-options');
                    if (ratingSection) {
                      ratingSection.classList.toggle('hidden');
                    }
                  }}
                >+</button>
              </div>
              
              <div className="space-y-4 rating-options hidden">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div key={star} className="flex items-center">
                    <button 
                      className="flex items-center w-full hover:bg-gray-50 p-2 rounded-md transition-colors duration-200"
                      onClick={() => {
                        setFilters(prev => ({...prev, rating: star}));
                        setPagination(prev => ({...prev, currentPage: 1}));
                        fetchProducts();
                        setShowMobileFilter(false);
                      }}
                    >
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={i < star ? 'text-yellow-400' : 'text-gray-300'} 
                            size={22} 
                          />
                        ))}
                      </div>
                      <span className="ml-3 text-gray-700 font-medium">& Up ({star === 5 ? 4 : 26})</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* In Stock Filter */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#92c51b]">In Stock</h3>
                <button 
                  className="text-2xl font-bold text-[#92c51b] focus:outline-none focus:text-[#7ba316]" 
                  aria-label="Toggle in-stock filter"
                  onClick={() => {
                    // Toggle in-stock filter visibility
                    const inStockSection = document.querySelector('.in-stock-option');
                    if (inStockSection) {
                      inStockSection.classList.toggle('hidden');
                    }
                  }}
                >+</button>
              </div>
              
              <div className="flex flex-col in-stock-option hidden">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="inStock"
                    name="inStock"
                    checked={filters.inStock}
                    onChange={(e) => {
                      setFilters(prev => ({...prev, inStock: e.target.checked}));
                      setPagination(prev => ({...prev, currentPage: 1}));
                      fetchProducts();
                      setShowMobileFilter(false);
                    }}
                    className="w-5 h-5 border-[#92c51b] text-[#92c51b] focus:ring-[#92c51b]"
                  />
                  <label htmlFor="inStock" className="ml-3 text-gray-700 font-medium">In Stock</label>
                </div>
              </div>
            </div>
            
            {/* Search - Hidden but kept for functionality */}
            <div className="hidden">
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search products..."
              />
            </div>
            
            {/* Sort By - Hidden but kept for functionality */}
            <div className="hidden">
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
              >
                <option value="createdAt">Newest</option>
                <option value="price">Price</option>
                <option value="rating">Rating</option>
              </select>
            </div>
            
            {/* Sort Order - Hidden but kept for functionality */}
            <div className="hidden">
              <select
                name="sortOrder"
                value={filters.sortOrder}
                onChange={handleFilterChange}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
            
            {/* Mobile Apply Button Removed */}
          </div>
        </div>
        
        {/* Main content */}
        <div className="w-full lg:w-3/4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <p className="text-gray-600">No products found. Try adjusting your filters.</p>
            </div>
          )}
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    pagination.currentPage === 1
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <FaChevronLeft size={14} />
                </button>
                
                {[...Array(pagination.totalPages)].map((_, i) => {
                  // Show limited page numbers to avoid clutter
                  if (
                    i === 0 || // First page
                    i === pagination.totalPages - 1 || // Last page
                    (i >= pagination.currentPage - 2 && i <= pagination.currentPage + 2) // Pages around current
                  ) {
                    return (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`px-3 py-1 rounded-md ${
                          pagination.currentPage === i + 1
                            ? 'bg-main text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  }
                  
                  // Show ellipsis for skipped pages
                  if (
                    (i === 1 && pagination.currentPage > 3) ||
                    (i === pagination.totalPages - 2 && pagination.currentPage < pagination.totalPages - 3)
                  ) {
                    return <span key={i} className="px-1">...</span>;
                  }
                  
                  return null;
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className={`px-3 py-1 rounded-md ${
                    pagination.currentPage === pagination.totalPages
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <FaChevronRight size={14} />
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );

};

export default ProductList;