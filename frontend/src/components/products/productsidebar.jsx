import React, { useState, useEffect } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar, FaCheck, FaTag, FaPercent, FaBoxOpen, FaFilter, FaTimes, FaSearch } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { categoryApi } from '../../services/api';

const ProductSidebar = ({ onFilterChange }) => {
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [inStock, setInStock] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expandedSections, setExpandedSections] = useState({
    search: true,
    price: true,
    rating: true,
    stock: true,
    discount: true,
    category: true
  });
  const [activeFilters, setActiveFilters] = useState([]);
  
  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryApi.getAllCategories();
        if (response && response.data && response.data.success) {
          setCategories(response.data.data || []);
        } else {
          // Fallback to empty array if API fails
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Set empty array on error to prevent UI issues
        setCategories([]);
      }
    };
    
    fetchCategories();
  }, []);

  // Update active filters whenever filter values change
  useEffect(() => {
    const newActiveFilters = [];
    
    if (searchQuery) {
      newActiveFilters.push({
        type: 'search',
        label: `Search: ${searchQuery}`,
        clearFn: () => {
          setSearchQuery('');
          onFilterChange({ type: 'search', value: '' });
        }
      });
    }
    
    if (selectedCategory) {
      const category = categories.find(cat => cat._id === selectedCategory);
      newActiveFilters.push({
        type: 'category',
        label: `Category: ${category ? category.name : selectedCategory}`,
        clearFn: () => {
          setSelectedCategory('');
          onFilterChange({ type: 'category', value: '' });
        }
      });
    }
    
    if (priceRange.min !== '' || priceRange.max !== '') {
      const priceFilter = [];
      if (priceRange.min !== '') priceFilter.push(`Min: ₹${priceRange.min}`);
      if (priceRange.max !== '') priceFilter.push(`Max: ₹${priceRange.max}`);
      newActiveFilters.push({
        type: 'price',
        label: `Price (${priceFilter.join(', ')})`,
        clearFn: () => {
          setPriceRange({ min: '', max: '' });
          onFilterChange({ type: 'price', value: { min: '', max: '' } });
        }
      });
    }
    
    if (inStock) {
      newActiveFilters.push({
        type: 'stock',
        label: 'In Stock Only',
        clearFn: () => {
          setInStock(false);
          onFilterChange({ type: 'stock', value: false });
        }
      });
    }
    
    if (selectedRating) {
      newActiveFilters.push({
        type: 'rating',
        label: `${selectedRating}★ & Up`,
        clearFn: () => {
          setSelectedRating(null);
          onFilterChange({ type: 'rating', value: null });
        }
      });
    }
    
    setActiveFilters(newActiveFilters);
  }, [priceRange, inStock, selectedRating, searchQuery, selectedCategory, categories]);

  const handlePriceChange = (e, type) => {
    const value = e.target.value;
    // Allow empty string or numbers only
    if (value === '' || /^\d+$/.test(value)) {
      const newPriceRange = { ...priceRange, [type]: value };
      setPriceRange(newPriceRange);
    }
  };

  const applyPriceFilter = () => {
    onFilterChange({ type: 'price', value: priceRange });
  };

  const handleStockChange = () => {
    const newValue = !inStock;
    setInStock(newValue);
    onFilterChange({ type: 'stock', value: newValue });
  };

  const handleRatingChange = (rating) => {
    const newRating = selectedRating === rating ? null : rating;
    setSelectedRating(newRating);
    onFilterChange({ type: 'rating', value: newRating });
  };

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  const resetAllFilters = () => {
    setPriceRange({ min: '', max: '' });
    setInStock(false);
    setSelectedRating(null);
    setSearchQuery('');
    setSelectedCategory('');
    onFilterChange({ type: 'price', value: { min: '', max: '' } });
    onFilterChange({ type: 'stock', value: false });
    onFilterChange({ type: 'rating', value: null });
    onFilterChange({ type: 'search', value: '' });
    onFilterChange({ type: 'category', value: '' });
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const applySearch = () => {
    onFilterChange({ type: 'search', value: searchQuery });
  };
  
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    onFilterChange({ type: 'category', value: categoryId });
  };

  // Animation variants
  const sectionVariants = {
    hidden: { height: 0, opacity: 0, overflow: 'hidden' },
    visible: { height: 'auto', opacity: 1, transition: { duration: 0.3 } }
  };

  // Render star ratings
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <span key={i}>
            {i < rating ? <FaStar className="text-yellow-400" /> : <FaRegStar className="text-gray-300" />}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      {/* Header with filter count */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 flex items-center">
          <FaFilter className="mr-2 text-[#92c51b]" />
          Filters
        </h2>
        {activeFilters.length > 0 && (
          <span className="bg-[#e9f5d0] text-[#92c51b] text-xs font-medium px-2 py-1 rounded-full">
            {activeFilters.length}
          </span>
        )}
      </div>
      
      {/* Search Section */}
      <div className="mb-4">
        <div 
          className="flex justify-between items-center mb-2 bg-gray-50 p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => toggleSection('search')}
        >
          <h3 className="text-sm font-semibold text-gray-700 flex items-center">
            <FaSearch className="mr-2 text-[#92c51b]" />
            Search Products
          </h3>
          <button 
            className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              toggleSection('search');
            }}
          >
            {expandedSections.search ? '−' : '+'}
          </button>
        </div>
        
        <AnimatePresence>
          {expandedSections.search && (
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-3 px-1"
            >
              <div className="flex space-x-2">
                <div className="w-full">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full p-2 pl-8 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-main-light focus:border-main transition"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      onKeyPress={(e) => e.key === 'Enter' && applySearch()}
                    />
                    <FaSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
              </div>
              <button
                onClick={applySearch}
                className="w-full bg-main hover:bg-main-dark text-white py-1.5 px-3 rounded text-sm transition-colors"
              >
                Search
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Active Filters</h3>
            <button 
              onClick={resetAllFilters}
              className="text-xs text-main hover:text-main-dark font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <div 
                key={index}
                className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-xs"
              >
                <span className="text-gray-800">{filter.label}</span>
                <button 
                  onClick={filter.clearFn}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  <FaTimes size={10} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Category Filter */}
      <div className="mb-4">
        <div 
          className="flex justify-between items-center mb-2 bg-gray-50 p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => toggleSection('category')}
        >
          <h3 className="text-sm font-semibold text-gray-700 flex items-center">
            <FaBoxOpen className="mr-2 text-[#92c51b]" />
            Categories
          </h3>
          <button 
            className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              toggleSection('category');
            }}
          >
            {expandedSections.category ? '−' : '+'}
          </button>
        </div>
        
        <AnimatePresence>
          {expandedSections.category && (
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-2 px-1 mb-4"
            >
              {categories.length > 0 ? (
                <div className="max-h-40 overflow-y-auto pr-2">
                  {categories.map((category) => (
                    <div key={category._id} className="flex items-center mb-2">
                      <input
                        type="radio"
                        id={`category-${category._id}`}
                        name="category"
                        checked={selectedCategory === category._id}
                        onChange={() => handleCategoryChange(category._id)}
                        className="w-4 h-4 text-main border-gray-300 rounded focus:ring-main"
                      />
                      <label
                        htmlFor={`category-${category._id}`}
                        className="ml-2 text-sm text-gray-700 cursor-pointer"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Loading categories...</p>
              )}
              
              {selectedCategory && (
                <button
                  onClick={() => handleCategoryChange('')}
                  className="text-xs text-green-600 hover:text-green-800 font-medium"
                >
                  Clear Selection
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Price Filter */}
      <div className="mb-4">
        <div 
          className="flex justify-between items-center mb-2 bg-gray-50 p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => toggleSection('price')}
        >
          <h3 className="text-sm font-semibold text-gray-700 flex items-center">
            <FaTag className="mr-2 text-[#92c51b]" />
            Price Range
          </h3>
          <button 
            className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              toggleSection('price');
            }}
          >
            {expandedSections.price ? '−' : '+'}
          </button>
        </div>
        
        <AnimatePresence>
          {expandedSections.price && (
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-3 px-1"
            >
              <div className="flex space-x-2">
                <div className="w-1/2">
                  <label className="text-xs text-gray-500 block mb-1">Min Price</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                    <input
                      type="text"
                      placeholder="0"
                      className="w-full p-2 pl-6 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-main-light focus:border-main transition"
                      value={priceRange.min}
                      onChange={(e) => handlePriceChange(e, 'min')}
                    />
                  </div>
                </div>
                <div className="w-1/2">
                  <label className="text-xs text-gray-500 block mb-1">Max Price</label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₹</span>
                    <input
                      type="text"
                      placeholder="10000"
                      className="w-full p-2 pl-6 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-200 focus:border-green-500 transition"
                      value={priceRange.max}
                      onChange={(e) => handlePriceChange(e, 'max')}
                    />
                  </div>
                </div>
              </div>
              <button 
                className="w-full bg-main text-white py-2 rounded hover:bg-main-dark transition text-sm font-medium flex items-center justify-center"
                onClick={applyPriceFilter}
              >
                Apply
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Rating Filter */}
      <div className="mb-4">
        <div 
          className="flex justify-between items-center mb-2 bg-gray-50 p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => toggleSection('rating')}
        >
          <h3 className="text-sm font-semibold text-gray-700 flex items-center">
            <FaStar className="mr-2 text-yellow-400" />
            Customer Rating
          </h3>
          <button 
            className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              toggleSection('rating');
            }}
          >
            {expandedSections.rating ? '−' : '+'}
          </button>
        </div>
        
        <AnimatePresence>
          {expandedSections.rating && (
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-2 px-1"
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <div 
                  key={rating} 
                  className={`flex items-center p-2 rounded cursor-pointer transition-colors ${selectedRating === rating ? 'bg-main-light border border-main' : 'hover:bg-gray-50'}`}
                  onClick={() => handleRatingChange(rating)}
                >
                  <div className="flex items-center text-sm">
                    {renderStars(rating)}
                    <span className="ml-2 text-xs text-gray-500">& Up</span>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Stock Filter */}
      <div className="mb-4">
        <div 
          className="flex justify-between items-center mb-2 bg-gray-50 p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => toggleSection('stock')}
        >
          <h3 className="text-sm font-semibold text-gray-700 flex items-center">
            <FaBoxOpen className="mr-2 text-green-600" />
            Availability
          </h3>
          <button className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-gray-700">
            {expandedSections.stock ? '−' : '+'}
          </button>
        </div>
        
        <AnimatePresence>
          {expandedSections.stock && (
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="px-1"
            >
              <div 
                className={`flex items-center p-2 rounded cursor-pointer transition-colors ${inStock ? 'bg-main-light border border-main' : 'hover:bg-gray-50'}`}
                onClick={handleStockChange}
              >
                <div className="w-5 h-5 flex items-center justify-center mr-2">
                  {inStock ? (
                    <div className="w-4 h-4 bg-main rounded-sm flex items-center justify-center">
                      <FaCheck className="text-white text-xs" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 border border-gray-300 rounded-sm"></div>
                  )}
                </div>
                <span className="text-sm text-gray-700">In Stock Only</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Discount Filter */}
      <div className="mb-4">
        <div 
          className="flex justify-between items-center mb-2 bg-gray-50 p-2 rounded cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => toggleSection('discount')}
        >
          <h3 className="text-sm font-semibold text-gray-700 flex items-center">
            <FaPercent className="mr-2 text-main" />
            Discount
          </h3>
          <button className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 text-gray-700">
            {expandedSections.discount ? '−' : '+'}
          </button>
        </div>
        
        <AnimatePresence>
          {expandedSections.discount && (
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-2 px-1"
            >
              {['10% or more', '20% or more', '30% or more', '40% or more', '50% or more'].map((discount, index) => (
                <div 
                  key={index} 
                  className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <div className="w-5 h-5 flex items-center justify-center mr-2">
                    <div className="w-4 h-4 border border-gray-300 rounded-sm"></div>
                  </div>
                  <span className="text-sm text-gray-700">{discount}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Reset Filters Button */}
      <button 
        className="w-full border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50 transition text-sm font-medium flex items-center justify-center"
        onClick={resetAllFilters}
      >
        <FaTimes className="mr-2" />
        Reset All Filters
      </button>
    </div>
  );
};

export default ProductSidebar;