import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsApi } from '../services/api';

// Import product images for fallback/loading state
import solarModule1 from '../assets/images/power1.webp';
import solarModule2 from '../assets/images/power2.webp';
import solarModule3 from '../assets/images/power3.webp';
import solarModule4 from '../assets/images/power4.webp';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();

  // Fallback products in case API fails or for initial state
  const fallbackProducts = [
    {
      id: 1,
      name: 'WAAREE 540Wp 144 Cells Mono PERC Solar Module',
      image: solarModule1,
      link: '/product/waaree-540wp-solar-module',
      category: 'solar module',
      price: '₹12,500'
    },
    {
      id: 2,
      name: 'WAAREE 10Wp Small Solar Module',
      image: solarModule2,
      link: '/product/waaree-10wp-small-solar-module',
      category: 'solar module',
      price: '₹1,200'
    },
    {
      id: 3,
      name: 'WAAREE 3 Kw On Grid Single Phase Bifacial DCR Solar System',
      image: solarModule3,
      link: '/product/waaree-3kw-on-grid-solar-system',
      category: 'solar system',
      price: '₹1,45,000'
    },
    {
      id: 4,
      name: 'WAAREE 580Wp 144Cells 24 Volts TOPCON N-Type Framed Dual Glass Bifacial Non-DCR Solar Module',
      image: solarModule4,
      link: '/product/waaree-580wp-topcon-solar-module',
      category: 'solar module',
      price: '₹14,500'
    }
  ];

  // Fetch recommended products when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRecommendedProducts();
    }
  }, [isOpen]);

  // Fetch recommended products (only 6 products)
  const fetchRecommendedProducts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch only 8 products for recommendations
      const response = await productsApi.getAllProducts(1, 8);
      
      console.log('API Response:', response); // Debug log
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        // Transform API data to match our UI format
        const formattedProducts = response.data.data.map(product => ({
          id: product._id,
          name: product.name,
          image: product.images && product.images.length > 0 
            ? product.images[0] 
            : solarModule1, // Fallback image
          link: `/product/${product.slug || product._id}`,
          category: product.categoryId?.name || 'solar product',
          price: `₹${product.price?.toLocaleString('en-IN') || '0'}`
        }));
        
        setFilteredProducts(formattedProducts);
      } else {
        console.log('No products found in API response, using fallback'); // Debug log
        setFilteredProducts(fallbackProducts.slice(0, 6)); // Limit fallback to 6 products
      }
    } catch (err) {
      console.error('Error fetching recommended products:', err);
      setError('Failed to load recommended products');
      setFilteredProducts(fallbackProducts.slice(0, 6)); // Limit fallback to 6 products
    } finally {
      setIsLoading(false);
    }
  };

  // Search products based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Show recommended products when search is empty
      fetchRecommendedProducts();
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);
    setSelectedIndex(-1);
    setError(null);
    
    // Debounce search to avoid too many API calls
    const timer = setTimeout(async () => {
      try {
        const response = await productsApi.getAllProducts(1, 12, { search: searchTerm });
        console.log('Search API Response:', response); // Debug log
        
        if (response.data && response.data.data && response.data.data.length > 0) {
          // Transform API data to match our UI format
          const formattedProducts = response.data.data.map(product => ({
            id: product._id,
            name: product.name,
            image: product.images && product.images.length > 0 
              ? product.images[0] 
              : solarModule1, // Fallback image
            link: `/product/${product.slug || product._id}`,
            category: product.categoryId?.name || 'solar product',
            price: `₹${product.price?.toLocaleString('en-IN') || '0'}`
          }));
          
          console.log('Search Formatted Products:', formattedProducts); // Debug log
          setFilteredProducts(formattedProducts);
        } else {
          // If no products found or unexpected response format
          console.log('No search results found'); // Debug log
          setFilteredProducts([]);
        }
      } catch (err) {
        console.error('Error searching products:', err);
        setError('Failed to search products');
        setFilteredProducts([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // Debounce delay
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset search when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(-1);
      setError(null);
      // Focus the search input when modal opens
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (filteredProducts.length === 0) return;
    
    // Arrow down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredProducts.length - 1 ? prev + 1 : prev
      );
    }
    
    // Arrow up
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
    }
    
    // Enter key
    else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selectedProduct = filteredProducts[selectedIndex];
      navigate(selectedProduct.link);
      onClose();
    }
    
    // Escape key
    else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start pt-4 sm:pt-10 md:pt-20 px-2 sm:px-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[95%] sm:max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
        <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-semibold">Search Products</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="text-xl sm:text-2xl font-bold">×</span>
          </button>
        </div>
        
        <div className="p-3 sm:p-4">
          <div className="relative">
            <div className="flex items-center border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-main focus-within:border-transparent overflow-hidden">
              <div className="pl-3 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 sm:h-5 w-4 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products by name or category..."
                className="w-full py-1.5 sm:py-2 px-2 text-sm focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="px-3 text-gray-500 hover:text-gray-700"
                >
                  <span className="text-xl font-bold">×</span>
                </button>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1 ml-1">
              Press ↑↓ to navigate, Enter to select, Esc to close
            </div>
          </div>
        </div>
        
        <div className="p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">
            {searchTerm ? 'Search Results' : 'Recommended Products'}
            {searchTerm && <span className="text-sm font-normal text-gray-500 ml-2">({filteredProducts.length} products found)</span>}
          </h3>
          
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-main mb-2"></div>
              <p className="text-sm text-gray-500">{searchTerm ? 'Searching products...' : 'Loading recommended products...'}</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 bg-red-50 rounded-lg">
              <p className="text-red-500">{error}</p>
              <p className="text-sm text-gray-600 mt-2">Please try again later or contact support if the problem persists</p>
              <button 
                onClick={fetchRecommendedProducts} 
                className="mt-3 px-4 py-2 bg-main text-white rounded-md text-sm hover:bg-main/90 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
              {filteredProducts.map((product, index) => (
                <Link 
                  key={product.id} 
                  to={product.link}
                  onClick={onClose}
                  className={`border ${index === selectedIndex ? 'border-main ring-2 ring-main' : 'border-gray-200'} rounded-lg p-2 sm:p-3 hover:shadow-md transition-all duration-200`}
                >
                  <div className="aspect-square overflow-hidden mb-1 sm:mb-2 bg-gray-50">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = solarModule1; // Fallback image if loading fails
                      }}
                    />
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2">{product.name}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-xs text-gray-500">{product.category}</p>
                    <p className="text-xs font-semibold text-main">{product.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No products found matching "{searchTerm}"</p>
              <p className="text-sm text-gray-400 mt-2">Try a different search term or browse our categories</p>
              <button 
                onClick={() => setSearchTerm('')} 
                className="mt-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors"
              >
                Show Recommended Products
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;