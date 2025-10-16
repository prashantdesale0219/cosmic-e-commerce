import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaTimes, FaSave, FaCloudUploadAlt, FaEye, FaImage, FaInfoCircle, FaMoneyBillWave, FaTag, FaCog, FaTools, FaWrench, FaGavel, FaFileUpload, FaStar } from 'react-icons/fa';
import { productManagementApi, categoryManagementApi, offerManagementApi } from '../../services/adminApi';
import { toast } from 'react-toastify';
import { fixImageUrl } from '../../utils/imageUtils';
import IconSelector from '../common/IconSelector';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState(null);
  const [offers, setOffers] = useState([]);
  const [emiOptions, setEmiOptions] = useState([]);
  const [categoryHierarchy, setCategoryHierarchy] = useState({});

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [protectionInput, setProtectionInput] = useState('');
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    category: '', 
    mainCategoryId: '',
    subcategoryId: '',
    description: '',
    features: '',
    price: '', 
    oldPrice: '',
    mrp: '',
    stock: '', 
    sku: '',
    status: 'Active',
    tags: [],
    images: [],
    highlights: [],
    offers: [],
    emiOffers: [],
    customOffers: [
      { type: '', title: '', discountPercent: '', description: '' }
    ],
    applications: [
      { name: '', icon: '' }
    ],
    technical: {
      systemCapacityKw: '',
      phase: '',
      moduleType: '',
      modulePowerW: '',
      moduleCount: '',
      inverterType: '',
      inverterCapacityW: '',
      dcVoltageRange: '',
      acOutput: '',
      efficiencyPercent: '',
      temperatureCoefficient: '',
      operatingTemp: '',
      protections: [],
      warranty: {
        moduleYears: '',
        powerOutputYears: '',
        inverterYears: '',
        others: ''
      },
      weightKg: '',
      dimensions: {
        length: '',
        width: '',
        height: '',
        unit: 'mm'
      }
    },
    installation: {
      kitComponents: [],
      notIncluded: [],
      notes: '',
      installationType: ''
    },
    legal: {
      manufacturer: { name: '', address: '' },
      importer: { name: '', address: '' },
      packingInfo: '',
      countryOfOrigin: ''
    },
    warrantyDetails: {
      warrantyPeriod: '',
      warrantyType: '',
      warrantyDescription: '',
      warrantyTerms: ''
    },
    documentation: {
      datasheet: '',
      installationGuide: ''
    }
  });
  const [editProduct, setEditProduct] = useState({
    id: null,
    name: '', 
    category: '', 
    description: '',
    features: '',
    price: '', 
    oldPrice: '',
    mrp: '',
    stock: '', 
    sku: '',
    status: '',
    tags: [],
    images: [],
    highlights: [],
    offers: [],
    emiOffers: [],
    customOffers: [
      { type: '', title: '', discountPercent: '', description: '' }
    ],
    applications: [
      { name: '', icon: '' }
    ],
    technical: {
      systemCapacityKw: '',
      phase: '',
      moduleType: '',
      modulePowerW: '',
      moduleCount: '',
      inverterType: '',
      inverterCapacityW: '',
      dcVoltageRange: '',
      acOutput: '',
      efficiencyPercent: '',
      temperatureCoefficient: '',
      operatingTemp: '',
      protections: [],
      warranty: {
        moduleYears: '',
        powerOutputYears: '',
        inverterYears: '',
        others: ''
      },
      weightKg: '',
      dimensions: {
        length: '',
        width: '',
        height: '',
        unit: 'mm'
      }
    },
    installation: {
      kitComponents: [],
      notIncluded: [],
      notes: '',
      installationType: ''
    },
    legal: {
      manufacturer: { name: '', address: '' },
      importer: { name: '', address: '' },
      packingInfo: '',
      countryOfOrigin: ''
    },
    warrantyDetails: {
      warrantyPeriod: '',
      warrantyType: '',
      warrantyDescription: '',
      warrantyTerms: ''
    },
    documentation: {
      datasheet: '',
      installationGuide: ''
    }
  });
  const [viewProduct, setViewProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);

  // Load products, categories, offers and EMI options from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsResponse, mainCategoriesResponse, offersResponse, emiResponse] = await Promise.all([
          productManagementApi.getAllProducts(),
          categoryManagementApi.getMainCategories(),
          offerManagementApi.getAllOffers(1, 100, { status: 'active', type: 'brand' }),
          offerManagementApi.getAllOffers(1, 100, { status: 'active', type: 'emi' })
        ]);
        
        setProducts(productsResponse.data.data || productsResponse.data);
        
        // Handle main categories data
        const mainCategoryData = mainCategoriesResponse.data.data || mainCategoriesResponse.data;
        if (Array.isArray(mainCategoryData)) {
          const formattedMainCategories = mainCategoryData.map(cat => ({
            id: cat._id || cat.id,
            name: cat.name,
            isMainCategory: true,
            level: cat.level || 0
          }));
          console.log('Formatted main categories:', formattedMainCategories);
          setMainCategories(formattedMainCategories);
          
          // Also fetch all categories for the dropdown
          const allCategoriesResponse = await categoryManagementApi.getAllCategories();
          const allCategoryData = allCategoriesResponse.data.data || allCategoriesResponse.data;
          
          if (Array.isArray(allCategoryData)) {
            const formattedAllCategories = allCategoryData.map(cat => ({
              id: cat._id || cat.id,
              name: cat.name,
              isMainCategory: cat.isMainCategory || false,
              level: cat.level || 0,
              parent: cat.parent || null,
              parentName: cat.parentName || null
            }));
            
            // Build category hierarchy for better display
            const hierarchy = {};
            formattedAllCategories.forEach(cat => {
              if (cat.isMainCategory) {
                hierarchy[cat.id] = {
                  ...cat,
                  subcategories: []
                };
              } else if (cat.parent) {
                if (!hierarchy[cat.parent]) {
                  hierarchy[cat.parent] = { subcategories: [] };
                }
                hierarchy[cat.parent].subcategories.push(cat);
              }
            });
            
            setCategoryHierarchy(hierarchy);
            setCategories(formattedAllCategories);
          }
        } else {
          console.error('Unexpected category data format:', mainCategoriesResponse.data);
          // Fallback categories
          setCategories([
            { id: 'electronics', name: 'Electronics', isMainCategory: true, level: 0 },
            { id: 'fashion', name: 'Fashion', isMainCategory: true, level: 0 },
            { id: 'footwear', name: 'Footwear', isMainCategory: true, level: 0 },
            { id: 'home-appliances', name: 'Home Appliances', isMainCategory: true, level: 0 },
            { id: 'books', name: 'Books', isMainCategory: true, level: 0 },
            { id: 'sports', name: 'Sports', isMainCategory: true, level: 0 }
          ]);
          setMainCategories([
            { id: 'electronics', name: 'Electronics', isMainCategory: true, level: 0 },
            { id: 'fashion', name: 'Fashion', isMainCategory: true, level: 0 },
            { id: 'footwear', name: 'Footwear', isMainCategory: true, level: 0 },
            { id: 'home-appliances', name: 'Home Appliances', isMainCategory: true, level: 0 },
            { id: 'books', name: 'Books', isMainCategory: true, level: 0 },
            { id: 'sports', name: 'Sports', isMainCategory: true, level: 0 }
          ]);
        }
        
        // Set offers and EMI options
        if (offersResponse && offersResponse.data) {
          setOffers(offersResponse.data.data || offersResponse.data || []);
        } else {
          // Fallback offers
          setOffers([
            { _id: 'offer1', title: 'Diwali Sale', type: 'brand', discount: '10%', description: 'Special Diwali discount', details: 'Get 10% off on all products', isActive: true },
            { _id: 'offer2', title: 'Summer Sale', type: 'brand', discount: '5%', description: 'Summer season discount', details: 'Get 5% off on selected products', isActive: true }
          ]);
        }
        
        if (emiResponse && emiResponse.data) {
          setEmiOptions(emiResponse.data.data || emiResponse.data || []);
        } else {
          // Fallback EMI options
          setEmiOptions([
            { _id: 'emi1', title: '3 Months EMI', type: 'emi', discount: '0%', description: 'No-cost EMI for 3 months', details: 'Pay in 3 equal installments', isActive: true },
            { _id: 'emi2', title: '6 Months EMI', type: 'emi', discount: '0%', description: 'No-cost EMI for 6 months', details: 'Pay in 6 equal installments', isActive: true },
            { _id: 'emi3', title: '9 Months EMI', type: 'emi', discount: '5%', description: 'Low-cost EMI for 9 months', details: '5% interest on 9 monthly installments', isActive: true }
          ]);
        }
        
        setError(null);
      } catch (err) {
        setError('Failed to load data. Please try again.');
        console.error('Error fetching data:', err);
        toast.error('Failed to load products');
        // Fallback categories
        setCategories([
          { id: 'electronics', name: 'Electronics' },
          { id: 'fashion', name: 'Fashion' },
          { id: 'footwear', name: 'Footwear' },
          { id: 'home-appliances', name: 'Home Appliances' },
          { id: 'books', name: 'Books' },
          { id: 'sports', name: 'Sports' }
        ]);
        
        // Fallback offers and EMI options
        setOffers([
          { _id: 'offer1', title: 'Diwali Sale', type: 'brand', discount: '10%', description: 'Special Diwali discount', details: 'Get 10% off on all products', isActive: true },
          { _id: 'offer2', title: 'Summer Sale', type: 'brand', discount: '5%', description: 'Summer season discount', details: 'Get 5% off on selected products', isActive: true }
        ]);
        
        setEmiOptions([
          { _id: 'emi1', title: '3 Months EMI', type: 'emi', discount: '0%', description: 'No-cost EMI for 3 months', details: 'Pay in 3 equal installments', isActive: true },
          { _id: 'emi2', title: '6 Months EMI', type: 'emi', discount: '0%', description: 'No-cost EMI for 6 months', details: 'Pay in 6 equal installments', isActive: true },
          { _id: 'emi3', title: '9 Months EMI', type: 'emi', discount: '5%', description: 'Low-cost EMI for 9 months', details: '5% interest on 9 monthly installments', isActive: true }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Function to fetch subcategories when a main category is selected
  const fetchSubcategories = async (parentId) => {
    try {
      setLoading(true);
      const response = await categoryManagementApi.getSubcategories(parentId);
      const subcategoryData = response.data.data || response.data;
      
      if (Array.isArray(subcategoryData)) {
        const formattedSubcategories = subcategoryData.map(cat => ({
          id: cat._id || cat.id,
          name: cat.name,
          isMainCategory: false,
          level: cat.level || 1,
          parent: cat.parent || parentId,
          parentName: cat.parentName || mainCategories.find(mc => mc.id === parentId)?.name
        }));
        setSubcategories(formattedSubcategories);
      } else {
        setSubcategories([]);
      }
    } catch (err) {
      console.error('Error fetching subcategories:', err);
      toast.error('Failed to load subcategories');
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    // Get category name regardless of structure
    const getCategoryName = (product) => {
      if (product.category) {
        return typeof product.category === 'object' ? product.category.name : product.category;
      } else if (product.categoryId) {
        return typeof product.categoryId === 'object' ? product.categoryId.name : product.categoryId;
      }
      return 'Uncategorized';
    };
    
    const categoryName = getCategoryName(product);
    
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'All' || categoryName === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = async () => {
    try {
      // Handle category ID correctly
      const productData = {...newProduct};
      
      // Check if main category and subcategory are selected
      if (!productData.mainCategoryId) {
        toast.error('Please select a main category');
        return;
      }
      
      // Create a new FormData object
      const formData = new FormData();
      
      // Append all text fields except images, category, offers, and emiOffers
      Object.keys(productData).forEach(key => {
        if (key !== 'images' && key !== 'category' && key !== 'offers' && key !== 'emiOffers') {
          // Check if the value is an object and convert it to JSON string
          if (typeof productData[key] === 'object' && productData[key] !== null) {
            // Process applications to handle icon format properly
             if (key === 'applications') {
               const processedApplications = productData[key].map(app => {
                 // If icon is in format "Library:IconName", use it directly without modification
                 // The server will handle it as a string
                 return app;
               });
               formData.append(key, JSON.stringify(processedApplications));
               console.log(`Converting applications to JSON:`, JSON.stringify(processedApplications));
             } else {
              formData.append(key, JSON.stringify(productData[key]));
              console.log(`Converting object to JSON for ${key}:`, JSON.stringify(productData[key]));
            }
          } else {
            formData.append(key, productData[key]);
          }
        }
      });
      
      // Append mainCategoryId
      formData.append('mainCategoryId', productData.mainCategoryId);
      
      // If subcategory is selected, use it as the categoryId
      // Otherwise use the main category as the categoryId
      if (productData.subcategoryId) {
        formData.append('categoryId', productData.subcategoryId);
      } else {
        formData.append('categoryId', productData.mainCategoryId);
      }
      
      // Append offers and emiOffers as JSON strings
      if (productData.offers && productData.offers.length > 0) {
        // Make sure we're sending a simple array of IDs, not complex objects
        const offerIds = productData.offers.map(offer => typeof offer === 'object' ? offer._id : offer);
        formData.append('offers', JSON.stringify(offerIds));
        console.log('Offers JSON:', JSON.stringify(offerIds));
      }
      
      if (productData.emiOffers && productData.emiOffers.length > 0) {
        // Make sure we're sending a simple array of IDs, not complex objects
        const emiIds = productData.emiOffers.map(emi => typeof emi === 'object' ? emi._id : emi);
        formData.append('emiOffers', JSON.stringify(emiIds));
        console.log('EMI Offers JSON:', JSON.stringify(emiIds));
      }
      
      // Append images if exists
      if (productData.images && productData.images.length > 0) {
        for (let i = 0; i < productData.images.length; i++) {
          formData.append('images', productData.images[i]);
        }
      }
      
      // Use subcategoryId as the primary categoryId, fallback to mainCategoryId if needed
      if (productData.subcategoryId) {
        formData.delete('mainCategoryId'); // Remove mainCategoryId to avoid confusion
        console.log('Sending product data with categoryId (from subcategory):', productData.subcategoryId);
      } else if (productData.mainCategoryId) {
        console.log('Sending product data with categoryId (from main category):', productData.mainCategoryId);
      }
      
      const result = await productManagementApi.createProduct(formData);
      console.log('Product creation result:', result);
      
      // Reload products from API
      const response = await productManagementApi.getAllProducts();
      setProducts(response.data.data || response.data);
      
      toast.success('Product added successfully');
      setNewProduct({ 
        name: '', 
        mainCategoryId: '',
        subcategoryId: '',
        description: '',
        price: '', 
        stock: '', 
        status: 'Active',
        images: [],
        offers: [],
        emiOffers: []
      });
      setShowAddModal(false);
    } catch (err) {
      toast.error('Failed to add product: ' + (err.response?.data?.message || err.message));
      console.error('Error adding product:', err);
    }
  };

  const handleViewClick = (product) => {
    setViewProduct(product);
    setShowViewModal(true);
  };

  const handleEditClick = async (product) => {
    try {
      // Get the product details with proper category information
      let mainCategoryId = '';
      let subcategoryId = '';
      
      // If product has categoryId, use it as subcategoryId or mainCategoryId
      if (product.categoryId) {
        const categoryId = typeof product.categoryId === 'object' ? product.categoryId._id : product.categoryId;
        
        // Check if this is a subcategory by looking at the parent field
        const category = categories.find(cat => cat.id === categoryId || cat._id === categoryId);
        
        if (category && category.parent) {
          // This is a subcategory
          subcategoryId = categoryId;
          mainCategoryId = category.parent;
          // Fetch subcategories for this main category
          await fetchSubcategories(mainCategoryId);
        } else {
          // This is a main category
          mainCategoryId = categoryId;
          subcategoryId = '';
        }
      }
      
      setEditProduct({ 
        ...product,
        mainCategoryId,
        subcategoryId
      });
      
      setShowEditModal(true);
    } catch (error) {
      console.error('Error preparing edit form:', error);
      toast.error('Failed to prepare edit form');
    }
  };

  const handleEditProduct = async () => {
    try {
      if (!editProduct.name.trim()) {
        toast.error('Product name is required');
        return;
      }

      const productId = editProduct._id || editProduct.id;
      if (!productId) {
        toast.error('Product ID is missing');
        return;
      }

      // Check if main category is selected
      if (!editProduct.mainCategoryId) {
        toast.error('Please select a main category');
        return;
      }

      // Create form data for file upload
      const formData = new FormData();
      
      // Add all product data except images, _id, id, category, and categoryId
      for (const key in editProduct) {
        if (key !== 'images' && key !== '_id' && key !== 'id' && key !== 'category' && key !== 'categoryId') {
          // Handle objects and arrays by stringifying them
          if (typeof editProduct[key] === 'object' && editProduct[key] !== null) {
            // Process applications to handle icon format properly
             if (key === 'applications') {
               const processedApplications = editProduct[key].map(app => {
                 // Use icon directly without modification
                 return app;
               });
               formData.append(key, JSON.stringify(processedApplications));
             } else {
              formData.append(key, JSON.stringify(editProduct[key]));
            }
          } else {
            formData.append(key, editProduct[key]);
          }
        }
      }
      
      // Append mainCategoryId
      formData.append('mainCategoryId', editProduct.mainCategoryId);
      
      // If subcategory is selected, use it as the categoryId
      // Otherwise use the main category as the categoryId
      if (editProduct.subcategoryId) {
        formData.append('categoryId', editProduct.subcategoryId);
      } else {
        formData.append('categoryId', editProduct.mainCategoryId);
      }
      
      // Add images if available
      if (editProduct.images) {
        // Check if images is a FileList or an array of existing images
        if (editProduct.images instanceof FileList) {
          for (let i = 0; i < editProduct.images.length; i++) {
            formData.append('images', editProduct.images[i]);
          }
          console.log('Added new images to form data');
        } else if (Array.isArray(editProduct.images) && editProduct.images.length > 0) {
          // Filter out any empty objects from the images array
          const filteredImages = editProduct.images.filter(img => {
            // Check if img is an empty object
            if (typeof img === 'object' && Object.keys(img).length === 0) {
              return false;
            }
            return true;
          });
          
          // For existing images, we need to pass their paths as 'existingImages'
          if (filteredImages.length > 0) {
            formData.append('existingImages', JSON.stringify(filteredImages));
            console.log('Using existing images:', JSON.stringify(filteredImages));
          }
        }
      }

      // Log the final form data for debugging
      console.log('Form data entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }
      
      try {
        // Make the API call with improved error handling
        const result = await productManagementApi.updateProduct(productId, formData);
        console.log('Product update result:', result);
        
        // Reload products from API
        const response = await productManagementApi.getAllProducts();
        setProducts(response.data.data || response.data);
        
        toast.success('Product updated successfully');
        setShowEditModal(false);
      } catch (apiError) {
        // Detailed error logging for debugging
        console.error('API Error Details:', {
          message: apiError.message,
          response: apiError.response?.data,
          status: apiError.response?.status,
          headers: apiError.response?.headers,
          request: apiError.request,
          config: apiError.config
        });
        
        // User-friendly error message
        let errorMessage = 'Failed to update product';
        
        if (apiError.response) {
          // The request was made and the server responded with an error status
          if (apiError.response.status === 400) {
            errorMessage += ': Invalid data format';
            if (apiError.response.data?.message?.includes('ObjectId')) {
              errorMessage += ' - Category ID format is incorrect';
            }
          } else if (apiError.response.status === 404) {
            errorMessage += ': Product not found';
          } else if (apiError.response.status === 500) {
            errorMessage += ': Server error';
          }
          
          // Add specific error message from server if available
          if (apiError.response.data?.message) {
            errorMessage += ` - ${apiError.response.data.message}`;
          }
        } else if (apiError.request) {
          // The request was made but no response was received
          errorMessage += ': No response from server';
        }
        
        toast.error(errorMessage);
      }
    } catch (err) {
      // Catch any other errors that might occur outside the API call
      toast.error('An unexpected error occurred: ' + err.message);
      console.error('Unexpected error:', err);
    }
  };

  // Handle product status toggle
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = !(currentStatus === true || currentStatus === 'true' || currentStatus === 'Active');
      await productManagementApi.toggleActiveStatus(id);
      
      // Reload products from API
      const response = await productManagementApi.getAllProducts();
      setProducts(response.data.data || response.data);
      
      toast.success(`Product ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      console.error('Error toggling product status:', err);
      toast.error('Failed to update product status');
    }
  };
  
  // Handle documentation upload
  const handleDocumentationUpload = async (id, file, documentType) => {
    try {
      await productManagementApi.uploadDocumentation(id, file, documentType);
      toast.success(`${documentType === 'installationGuide' ? 'Installation Guide' : 'Data Sheet'} uploaded successfully`);
      
      // Reload products to reflect changes
      const response = await productManagementApi.getAllProducts();
      setProducts(response.data.data || response.data);
    } catch (err) {
      console.error(`Error uploading ${documentType}:`, err);
      toast.error(`Failed to upload ${documentType === 'installationGuide' ? 'Installation Guide' : 'Data Sheet'}`);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productManagementApi.deleteProduct(id);
        
        // Reload products from API
        const response = await productManagementApi.getAllProducts();
        setProducts(response.data.data || response.data);
        
        toast.success('Product deleted successfully');
      } catch (err) {
        toast.error('Failed to delete product');
        console.error('Error deleting product:', err);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-[#92c51b] hover:bg-[#7ba515] text-white px-4 py-2 rounded-md flex items-center"
        >
          <FaPlus className="mr-2" /> Add Product
        </button>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div>
          <select
            className="border rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category.name}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System Capacity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product, index) => (
              <tr key={product._id || product.id || `product-${index}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={fixImageUrl(product.images[0])} 
                      alt={product.name} 
                      className="h-12 w-12 object-cover rounded-md"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTk5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center">
                      <FaImage className="text-gray-400" />
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.categoryId && typeof product.categoryId === 'object' 
                    ? (product.categoryId.parent 
                        ? `${categoryHierarchy[product.categoryId.parent]?.name || 'Main'} > ${product.categoryId.name}`
                        : product.categoryId.name)
                    : product.category && typeof product.category === 'object'
                      ? (product.category.parent
                          ? `${categoryHierarchy[product.category.parent]?.name || 'Main'} > ${product.category.name}`
                          : product.category.name)
                      : product.category || 'Uncategorized'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.price}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.size || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.technical && product.technical.systemCapacityKw 
                    ? `${product.technical.systemCapacityKw} kW` 
                    : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center ${
                    product.status === true || product.status === 'true' || product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <span className={`h-2 w-2 rounded-full mr-1.5 ${
                      product.status === true || product.status === 'true' || product.status === 'Active' ? 'bg-green-600' : 'bg-red-600'
                    }`}></span>
                    {product.status === true || product.status === 'true' || product.status === 'Active' ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    className="text-blue-600 hover:text-blue-900 mr-3"
                    onClick={() => handleViewClick(product)}
                  >
                    <FaEye />
                  </button>
                  <button 
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                    onClick={() => handleEditClick(product)}
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className={`${product.status === true || product.status === 'true' || product.status === 'Active' ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'} mr-3`}
                    onClick={() => handleToggleStatus(product._id || product.id, product.status)}
                    title={`${product.status === true || product.status === 'true' || product.status === 'Active' ? 'Deactivate' : 'Activate'} product`}
                  >
                    <FaCog />
                  </button>
                  <button 
                    className="text-purple-600 hover:text-purple-900 mr-3"
                    onClick={() => {
                      const fileInput = document.createElement('input');
                      fileInput.type = 'file';
                      fileInput.accept = '.pdf';
                      fileInput.onchange = (e) => {
                        if (e.target.files[0]) {
                          const documentType = window.confirm('Upload as Installation Guide? Click Cancel for Data Sheet') 
                            ? 'installationGuide' 
                            : 'dataSheet';
                          handleDocumentationUpload(product._id || product.id, e.target.files[0], documentType);
                        }
                      };
                      fileInput.click();
                    }}
                    title="Upload Documentation (PDF)"
                  >
                    <FaFileUpload />
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleDeleteProduct(product._id || product.id)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-7xl my-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Column 1 - Basic Information */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold border-b border-gray-200 pb-3 mb-4 text-gray-700 flex items-center">
                    <FaInfoCircle className="mr-2 text-[#92c51b]" /> Basic Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Product Name *</label>
                      <input
                        type="text"
                        className="border border-gray-300 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        placeholder="Enter product name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">SKU</label>
                      <input
                        type="text"
                        className="border border-gray-300 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                        value={newProduct.sku}
                        onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                        placeholder="Enter SKU"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Main Category *</label>
                      <select
                        className="border border-gray-300 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm bg-white"
                        value={newProduct.mainCategoryId || ""}
                        onChange={(e) => {
                          const selectedMainCategoryId = e.target.value;
                          setNewProduct({
                            ...newProduct, 
                            mainCategoryId: selectedMainCategoryId,
                            subcategoryId: ""
                          });
                          if (selectedMainCategoryId) {
                            fetchSubcategories(selectedMainCategoryId);
                          }
                        }}
                      >
                        <option value="">Select Main Category</option>
                        {mainCategories.map((category) => (
                          <option key={category._id || category.id} value={category._id || category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Subcategory</label>
                      <select
                        className="border border-gray-300 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm bg-white"
                        value={newProduct.subcategoryId || ""}
                        onChange={(e) => setNewProduct({...newProduct, subcategoryId: e.target.value})}
                        disabled={!newProduct.mainCategoryId || subcategories.length === 0}
                      >
                        <option value="">Select Subcategory</option>
                        {subcategories.map((subcategory) => (
                          <option key={subcategory._id || subcategory.id} value={subcategory._id || subcategory.id}>
                            {subcategory.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Price (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          className="border border-gray-300 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Sale Price (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="border border-gray-300 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.salePrice || ''}
                          onChange={(e) => setNewProduct({...newProduct, salePrice: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Old Price (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="border border-gray-300 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.oldPrice || ''}
                          onChange={(e) => setNewProduct({...newProduct, oldPrice: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">MRP (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          className="border border-gray-300 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.mrp || ''}
                          onChange={(e) => setNewProduct({...newProduct, mrp: e.target.value})}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Stock *</label>
                      <input
                        type="number"
                        className="border border-gray-300 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Size *</label>
                      <select
                        className="border border-gray-300 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm bg-white"
                        value={newProduct.size || ""}
                        onChange={(e) => setNewProduct({...newProduct, size: e.target.value})}
                      >
                        <option value="">Select Size</option>
                        <option value="Pack of 1">Pack of 1</option>
                        <option value="Pack of 2">Pack of 2</option>
                        <option value="Pack of 4">Pack of 4</option>
                        <option value="Pack of 6">Pack of 6</option>
                        <option value="Pack of 8">Pack of 8</option>
                        <option value="Pack of 10">Pack of 10</option>
                        <option value="Pack of 12">Pack of 12</option>
                        <option value="Pack of 16">Pack of 16</option>
                        <option value="Pack of 18">Pack of 18</option>
                        <option value="Pack of 20">Pack of 20</option>
                        <option value="Pallet Pack of 31">Pallet Pack of 31</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Default Quantity</label>
                        <input
                          type="number"
                          className="border border-gray-300 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.defaultQuantity || 1}
                          onChange={(e) => setNewProduct({...newProduct, defaultQuantity: e.target.value})}
                          placeholder="1"
                          min="1"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Max Order Quantity</label>
                        <input
                          type="number"
                          className="border border-gray-300 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.maxOrderQuantity || 10}
                          onChange={(e) => setNewProduct({...newProduct, maxOrderQuantity: e.target.value})}
                          placeholder="10"
                          min="1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                      <select
                        className="border border-gray-300 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm bg-white"
                        value={newProduct.status}
                        onChange={(e) => setNewProduct({...newProduct, status: e.target.value})}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Tags (comma separated)</label>
                      <input
                        type="text"
                        className="border border-gray-300 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                        value={newProduct.tags ? newProduct.tags.join(', ') : ''}
                        onChange={(e) => setNewProduct({
                          ...newProduct, 
                          tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                        })}
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                  </div>
                </div>

                {/* Highlights Section */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold border-b border-gray-200 pb-3 mb-4 text-gray-700 flex items-center">
                    <FaInfoCircle className="mr-2 text-[#92c51b]" /> Product Highlights
                  </h3>
                  
                  <div className="space-y-4">
                    {newProduct.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          className="border border-gray-300 rounded-lg flex-1 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={highlight}
                          onChange={(e) => {
                            const updatedHighlights = [...newProduct.highlights];
                            updatedHighlights[index] = e.target.value;
                            setNewProduct({...newProduct, highlights: updatedHighlights});
                          }}
                          placeholder="Enter product highlight"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedHighlights = [...newProduct.highlights];
                            updatedHighlights.splice(index, 1);
                            setNewProduct({...newProduct, highlights: updatedHighlights});
                          }}
                          className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => setNewProduct({...newProduct, highlights: [...newProduct.highlights, '']})}
                      className="bg-[#92c51b] text-white py-2 px-4 rounded-lg hover:bg-[#7ba615] w-full flex items-center justify-center"
                    >
                      <FaPlus className="mr-2" /> Add Highlight
                    </button>
                  </div>
                </div>

                {/* Offers Section */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold border-b border-gray-200 pb-3 mb-4 text-gray-700 flex items-center">
                    <FaTag className="mr-2 text-[#92c51b]" /> Offers & EMI
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Brand Offers</label>
                      <div className="border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                        {offers.length > 0 ? (
                          offers.map(offer => (
                            <div key={offer._id} className="flex items-center mb-2">
                              <input
                                type="checkbox"
                                id={`offer-${offer._id}`}
                                checked={newProduct.offers.some(o => o._id === offer._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewProduct({
                                      ...newProduct,
                                      offers: [...newProduct.offers, offer]
                                    });
                                  } else {
                                    setNewProduct({
                                      ...newProduct,
                                      offers: newProduct.offers.filter(o => o._id !== offer._id)
                                    });
                                  }
                                }}
                                className="mr-2"
                              />
                              <label htmlFor={`offer-${offer._id}`} className="flex-1 text-sm">
                                <div className="font-medium">{offer.title} - {offer.discount}</div>
                                <div className="text-xs text-gray-500">{offer.description}</div>
                              </label>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 text-sm text-center">No brand offers available</div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">EMI Options</label>
                      <div className="border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                        {emiOptions.length > 0 ? (
                          emiOptions.map(emi => (
                            <div key={emi._id} className="flex items-center mb-2">
                              <input
                                type="checkbox"
                                id={`emi-${emi._id}`}
                                checked={newProduct.emiOffers.some(e => e._id === emi._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewProduct({
                                      ...newProduct,
                                      emiOffers: [...newProduct.emiOffers, emi]
                                    });
                                  } else {
                                    setNewProduct({
                                      ...newProduct,
                                      emiOffers: newProduct.emiOffers.filter(e => e._id !== emi._id)
                                    });
                                  }
                                }}
                                className="mr-2"
                              />
                              <label htmlFor={`emi-${emi._id}`} className="flex-1 text-sm">
                                <div className="font-medium">{emi.title}</div>
                                <div className="text-xs text-gray-500">{emi.description}</div>
                              </label>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 text-sm text-center">No EMI options available</div>
                        )}
                      </div>
                    </div>

                    {/* Custom Offers */}
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Custom Offers</label>
                      {newProduct.customOffers.map((offer, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3 mb-3">
                          <div className="grid grid-cols-2 gap-3 mb-2">
                            <div>
                              <label className="block text-gray-600 text-xs mb-1">Offer Type</label>
                              <select
                                className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm bg-white"
                                value={offer.type}
                                onChange={(e) => {
                                  const updatedOffers = [...newProduct.customOffers];
                                  updatedOffers[index] = {...updatedOffers[index], type: e.target.value};
                                  setNewProduct({...newProduct, customOffers: updatedOffers});
                                }}
                              >
                                <option value="">Select Type</option>
                                <option value="EMI">EMI</option>
                                <option value="Bank Offer">Bank Offer</option>
                                <option value="Brand Offer">Brand Offer</option>
                                <option value="Seasonal Offer">Seasonal Offer</option>
                                <option value="Cashback">Cashback</option>
                                <option value="Discount">Discount</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-gray-600 text-xs mb-1">Discount (%)</label>
                              <input
                                type="number"
                                className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                                value={offer.discountPercent}
                                onChange={(e) => {
                                  const updatedOffers = [...newProduct.customOffers];
                                  updatedOffers[index] = {...updatedOffers[index], discountPercent: e.target.value};
                                  setNewProduct({...newProduct, customOffers: updatedOffers});
                                }}
                                placeholder="0"
                                min="0"
                                max="100"
                              />
                            </div>
                          </div>
                          <div className="mb-2">
                            <label className="block text-gray-600 text-xs mb-1">Title</label>
                            <input
                              type="text"
                              className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                              value={offer.title}
                              onChange={(e) => {
                                const updatedOffers = [...newProduct.customOffers];
                                updatedOffers[index] = {...updatedOffers[index], title: e.target.value};
                                setNewProduct({...newProduct, customOffers: updatedOffers});
                              }}
                              placeholder="Offer title"
                            />
                          </div>
                          <div className="mb-2">
                            <label className="block text-gray-600 text-xs mb-1">Description</label>
                            <textarea
                              className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                              value={offer.description}
                              onChange={(e) => {
                                const updatedOffers = [...newProduct.customOffers];
                                updatedOffers[index] = {...updatedOffers[index], description: e.target.value};
                                setNewProduct({...newProduct, customOffers: updatedOffers});
                              }}
                              placeholder="Offer description"
                              rows="2"
                            ></textarea>
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const updatedOffers = [...newProduct.customOffers];
                                updatedOffers.splice(index, 1);
                                setNewProduct({...newProduct, customOffers: updatedOffers});
                              }}
                              className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 text-sm"
                            >
                              <FaTrash className="mr-1 inline-block" /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setNewProduct({
                          ...newProduct, 
                          customOffers: [...newProduct.customOffers, { type: '', title: '', discountPercent: '', description: '' }]
                        })}
                        className="bg-[#92c51b] text-white py-2 px-4 rounded-lg hover:bg-[#7ba615] w-full flex items-center justify-center"
                      >
                        <FaPlus className="mr-2" /> Add Custom Offer
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Applications Section */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold border-b border-gray-200 pb-3 mb-4 text-gray-700 flex items-center">
                    <FaCog className="mr-2 text-[#92c51b]" /> Applications
                  </h3>
                  
                  <div className="space-y-4">
                    {newProduct.applications.map((application, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3 mb-3">
                        <div className="mb-2">
                          <label className="block text-gray-600 text-xs mb-1">Application Name</label>
                          <input
                            type="text"
                            className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                            value={application.name}
                            onChange={(e) => {
                              const updatedApplications = [...newProduct.applications];
                              updatedApplications[index] = {...updatedApplications[index], name: e.target.value};
                              setNewProduct({...newProduct, applications: updatedApplications});
                            }}
                            placeholder="Application name"
                          />
                        </div>
                        <div className="mb-2">
                          <label className="block text-gray-600 text-xs mb-1">Select Icon</label>
                          <IconSelector
                            selectedIcon={application.icon}
                            onSelectIcon={(selectedIcon) => {
                              const updatedApplications = [...newProduct.applications];
                              updatedApplications[index] = {...updatedApplications[index], icon: selectedIcon};
                              setNewProduct({...newProduct, applications: updatedApplications});
                            }}
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              const updatedApplications = [...newProduct.applications];
                              updatedApplications.splice(index, 1);
                              setNewProduct({...newProduct, applications: updatedApplications});
                            }}
                            className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 text-sm"
                          >
                            <FaTrash className="mr-1 inline-block" /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setNewProduct({
                        ...newProduct, 
                        applications: [...newProduct.applications, { name: '', icon: '' }]
                      })}
                      className="bg-[#92c51b] text-white py-2 px-4 rounded-lg hover:bg-[#7ba615] w-full flex items-center justify-center"
                    >
                      <FaPlus className="mr-2" /> Add Application
                    </button>
                  </div>
                </div>
                
                {/* Warranty Details Section */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold border-b border-gray-200 pb-3 mb-4 text-gray-700 flex items-center">
                    <FaGavel className="mr-2 text-[#92c51b]" /> Warranty Details
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Warranty Period</label>
                        <input
                          type="text"
                          className="border border-gray-300 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.warrantyDetails.warrantyPeriod}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            warrantyDetails: {
                              ...newProduct.warrantyDetails,
                              warrantyPeriod: e.target.value
                            }
                          })}
                          placeholder="e.g., 2 years, 36 months"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Warranty Type</label>
                        <select
                          className="border border-gray-300 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm bg-white"
                          value={newProduct.warrantyDetails.warrantyType}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            warrantyDetails: {
                              ...newProduct.warrantyDetails,
                              warrantyType: e.target.value
                            }
                          })}
                        >
                          <option value="">Select Type</option>
                          <option value="Manufacturer Warranty">Manufacturer Warranty</option>
                          <option value="Seller Warranty">Seller Warranty</option>
                          <option value="Brand Warranty">Brand Warranty</option>
                          <option value="No Warranty">No Warranty</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Warranty Description</label>
                      <textarea
                        className="border border-gray-300 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                        value={newProduct.warrantyDetails.warrantyDescription}
                        onChange={(e) => setNewProduct({
                          ...newProduct, 
                          warrantyDetails: {
                            ...newProduct.warrantyDetails,
                            warrantyDescription: e.target.value
                          }
                        })}
                        placeholder="Describe the warranty coverage"
                        rows="3"
                      ></textarea>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Warranty Terms & Conditions</label>
                      <textarea
                        className="border border-gray-300 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                        value={newProduct.warrantyDetails.warrantyTerms}
                        onChange={(e) => setNewProduct({
                          ...newProduct, 
                          warrantyDetails: {
                            ...newProduct.warrantyDetails,
                            warrantyTerms: e.target.value
                          }
                        })}
                        placeholder="Enter warranty terms and conditions"
                        rows="3"
                      ></textarea>
                    </div>
                  </div>
                </div>
                
                {/* Documentation Section */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold border-b border-gray-200 pb-3 mb-4 text-gray-700 flex items-center">
                    <FaFileUpload className="mr-2 text-[#92c51b]" /> Documentation
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Datasheet (PDF)</label>
                      <div className="flex items-center">
                        <input
                          type="file"
                          id="datasheet"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              setNewProduct({
                                ...newProduct,
                                documentation: {
                                  ...newProduct.documentation,
                                  datasheet: e.target.files[0]
                                }
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor="datasheet"
                          className="bg-white border border-gray-300 rounded-lg py-2 px-4 cursor-pointer flex items-center hover:bg-gray-50 flex-1"
                        >
                          <FaCloudUploadAlt className="mr-2 text-[#92c51b]" />
                          {newProduct.documentation.datasheet 
                            ? (typeof newProduct.documentation.datasheet === 'string' 
                              ? newProduct.documentation.datasheet.split('/').pop() 
                              : newProduct.documentation.datasheet.name)
                            : "Choose file"}
                        </label>
                        {newProduct.documentation.datasheet && (
                          <button
                            type="button"
                            onClick={() => setNewProduct({
                              ...newProduct,
                              documentation: {
                                ...newProduct.documentation,
                                datasheet: ''
                              }
                            })}
                            className="ml-2 bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200"
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Installation Guide (PDF)</label>
                      <div className="flex items-center">
                        <input
                          type="file"
                          id="installationGuide"
                          accept=".pdf"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              setNewProduct({
                                ...newProduct,
                                documentation: {
                                  ...newProduct.documentation,
                                  installationGuide: e.target.files[0]
                                }
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor="installationGuide"
                          className="bg-white border border-gray-300 rounded-lg py-2 px-4 cursor-pointer flex items-center hover:bg-gray-50 flex-1"
                        >
                          <FaCloudUploadAlt className="mr-2 text-[#92c51b]" />
                          {newProduct.documentation.installationGuide 
                            ? (typeof newProduct.documentation.installationGuide === 'string' 
                              ? newProduct.documentation.installationGuide.split('/').pop() 
                              : newProduct.documentation.installationGuide.name)
                            : "Choose file"}
                        </label>
                        {newProduct.documentation.installationGuide && (
                          <button
                            type="button"
                            onClick={() => setNewProduct({
                              ...newProduct,
                              documentation: {
                                ...newProduct.documentation,
                                installationGuide: ''
                              }
                            })}
                            className="ml-2 bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200"
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2 - Images & Description */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold border-b border-gray-200 pb-3 mb-4 text-gray-700 flex items-center">
                    <FaImage className="mr-2 text-[#92c51b]" /> Images & Media
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Product Images</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#92c51b] transition-colors">
                        <input
                          type="file"
                          multiple
                          className="hidden"
                          id="new-product-images"
                          onChange={(e) => setNewProduct({...newProduct, images: e.target.files})}
                        />
                        <label htmlFor="new-product-images" className="cursor-pointer flex flex-col items-center justify-center">
                          <FaCloudUploadAlt className="text-4xl text-gray-400 mb-2" />
                          <span className="text-gray-600 font-medium">Click to upload images</span>
                          <span className="text-xs text-gray-500 mt-1">or drag and drop</span>
                          <span className="text-xs text-gray-400 mt-2">PNG, JPG, JPEG up to 10MB</span>
                        </label>
                      </div>
                    </div>
                    
                    {newProduct.images && newProduct.images.length > 0 && (
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Selected Images</label>
                        <div className="grid grid-cols-3 gap-2">
                          {Array.from(newProduct.images).map((file, index) => (
                            <div key={index} className="relative group">
                              <img 
                                src={URL.createObjectURL(file)} 
                                alt={`Preview ${index}`}
                                className="h-20 w-full object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  const newFiles = Array.from(newProduct.images);
                                  newFiles.splice(index, 1);
                                  setNewProduct({
                                    ...newProduct,
                                    images: newFiles
                                  });
                                }}
                              >
                                <FaTimes size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold border-b border-gray-200 pb-3 mb-4 text-gray-700 flex items-center">
                    <FaInfoCircle className="mr-2 text-[#92c51b]" /> Description & Features
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                      <textarea
                        className="border border-gray-300 rounded-lg w-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        rows="5"
                        placeholder="Enter product description"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Features</label>
                      <div className="space-y-2">
                        {newProduct.features && Array.isArray(newProduct.features) && newProduct.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <input
                              type="text"
                              className="border border-gray-300 rounded-lg flex-grow py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                              value={feature}
                              onChange={(e) => {
                                const updatedFeatures = [...newProduct.features];
                                updatedFeatures[index] = e.target.value;
                                setNewProduct({...newProduct, features: updatedFeatures});
                              }}
                              placeholder="Enter feature"
                            />
                            <button 
                              type="button"
                              className="text-red-500 hover:text-red-700 p-2"
                              onClick={() => {
                                const updatedFeatures = [...newProduct.features];
                                updatedFeatures.splice(index, 1);
                                setNewProduct({...newProduct, features: updatedFeatures});
                              }}
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                        
                        <button 
                          type="button"
                          className="flex items-center text-[#92c51b] hover:text-[#7ea618] font-medium text-sm"
                          onClick={() => {
                            const features = Array.isArray(newProduct.features) ? newProduct.features : [];
                            setNewProduct({...newProduct, features: [...features, '']});
                          }}
                        >
                          <FaPlus className="mr-1" /> Add Feature
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3 - Technical & Specifications */}
              <div className="space-y-6">
                {/* Technical Specifications */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold border-b border-gray-200 pb-3 mb-4 text-gray-700 flex items-center">
                    <FaTools className="mr-2 text-[#92c51b]" /> Technical Specifications
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">System Capacity (kW)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.technical?.systemCapacityKw || ''}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            technical: {
                              ...(newProduct.technical || {}),
                              systemCapacityKw: e.target.value
                            }
                          })}
                          placeholder="Enter system capacity"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Phase</label>
                        <select
                          className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm bg-white"
                          value={newProduct.technical?.phase || ''}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            technical: {
                              ...(newProduct.technical || {}),
                              phase: e.target.value
                            }
                          })}
                        >
                          <option value="">Select Phase</option>
                          <option value="Single Phase">Single Phase</option>
                          <option value="Three Phase">Three Phase</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Module Type</label>
                        <input
                          type="text"
                          className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.technical?.moduleType || ''}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            technical: {
                              ...(newProduct.technical || {}),
                              moduleType: e.target.value
                            }
                          })}
                          placeholder="Enter module type"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Module Power (W)</label>
                        <input
                          type="number"
                          className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.technical?.modulePowerW || ''}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            technical: {
                              ...(newProduct.technical || {}),
                              modulePowerW: e.target.value
                            }
                          })}
                          placeholder="Enter module power"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Module Count</label>
                        <input
                          type="number"
                          className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.technical?.moduleCount || ''}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            technical: {
                              ...(newProduct.technical || {}),
                              moduleCount: e.target.value
                            }
                          })}
                          placeholder="Enter module count"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Inverter Type</label>
                        <input
                          type="text"
                          className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.technical?.inverterType || ''}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            technical: {
                              ...(newProduct.technical || {}),
                              inverterType: e.target.value
                            }
                          })}
                          placeholder="Enter inverter type"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Inverter Capacity (W)</label>
                        <input
                          type="number"
                          className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.technical?.inverterCapacityW || ''}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            technical: {
                              ...(newProduct.technical || {}),
                              inverterCapacityW: e.target.value
                            }
                          })}
                          placeholder="Enter inverter capacity"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">DC Voltage Range</label>
                        <input
                          type="text"
                          className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.technical?.dcVoltageRange || ''}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            technical: {
                              ...(newProduct.technical || {}),
                              dcVoltageRange: e.target.value
                            }
                          })}
                          placeholder="Enter DC voltage range"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">AC Output</label>
                        <input
                          type="text"
                          className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.technical?.acOutput || ''}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            technical: {
                              ...(newProduct.technical || {}),
                              acOutput: e.target.value
                            }
                          })}
                          placeholder="Enter AC output"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Efficiency (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.technical?.efficiencyPercent || ''}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            technical: {
                              ...(newProduct.technical || {}),
                              efficiencyPercent: e.target.value
                            }
                          })}
                          placeholder="Enter efficiency percentage"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Temperature Coefficient</label>
                        <input
                          type="text"
                          className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.technical?.temperatureCoefficient || ''}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            technical: {
                              ...(newProduct.technical || {}),
                              temperatureCoefficient: e.target.value
                            }
                          })}
                          placeholder="Enter temperature coefficient"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Operating Temperature</label>
                        <input
                          type="text"
                          className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.technical?.operatingTemp || ''}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            technical: {
                              ...(newProduct.technical || {}),
                              operatingTemp: e.target.value
                            }
                          })}
                          placeholder="Enter operating temperature range"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Protections</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {newProduct.technical?.protections?.map((protection, index) => (
                            <div key={index} className="bg-gray-100 rounded-full px-3 py-1 flex items-center">
                              <span className="text-sm text-gray-700">{protection}</span>
                              <button
                                type="button"
                                className="ml-2 text-gray-500 hover:text-red-500"
                                onClick={() => {
                                  const updatedProtections = [...(newProduct.technical?.protections || [])];
                                  updatedProtections.splice(index, 1);
                                  setNewProduct({
                                    ...newProduct,
                                    technical: {
                                      ...(newProduct.technical || {}),
                                      protections: updatedProtections
                                    }
                                  });
                                }}
                              >
                                <FaTimes size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex">
                          <input
                            type="text"
                            className="border border-gray-300 rounded-l-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                            placeholder="Add protection feature"
                            value={protectionInput}
                            onChange={(e) => setProtectionInput(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && protectionInput.trim()) {
                                e.preventDefault();
                                const updatedProtections = [...(newProduct.technical?.protections || []), protectionInput.trim()];
                                setNewProduct({
                                  ...newProduct,
                                  technical: {
                                    ...(newProduct.technical || {}),
                                    protections: updatedProtections
                                  }
                                });
                                setProtectionInput('');
                              }
                            }}
                          />
                          <button
                            type="button"
                            className="bg-[#92c51b] text-white px-4 rounded-r-lg hover:bg-[#7ea617] focus:outline-none"
                            onClick={() => {
                              if (protectionInput.trim()) {
                                const updatedProtections = [...(newProduct.technical?.protections || []), protectionInput.trim()];
                                setNewProduct({
                                  ...newProduct,
                                  technical: {
                                    ...(newProduct.technical || {}),
                                    protections: updatedProtections
                                  }
                                });
                                setProtectionInput('');
                              }
                            }}
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </div>
                      
                      {/* Physical Specifications */}
                      <div className="col-span-2 mt-4 border-t pt-4">
                        <h4 className="text-gray-700 font-semibold mb-3">Physical Specifications</h4>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Weight (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.technical?.weightKg || ''}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            technical: {
                              ...(newProduct.technical || {}),
                              weightKg: e.target.value
                            }
                          })}
                          placeholder="Enter weight"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Length (mm)</label>
                        <input
                          type="number"
                          className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.technical?.dimensions?.length || ''}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            technical: {
                              ...(newProduct.technical || {}),
                              dimensions: {
                                ...(newProduct.technical?.dimensions || {}),
                                length: e.target.value,
                                unit: 'mm'
                              }
                            }
                          })}
                          placeholder="Enter length"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Width (mm)</label>
                        <input
                          type="number"
                          className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.technical?.dimensions?.width || ''}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            technical: {
                              ...(newProduct.technical || {}),
                              dimensions: {
                                ...(newProduct.technical?.dimensions || {}),
                                width: e.target.value,
                                unit: 'mm'
                              }
                            }
                          })}
                          placeholder="Enter width"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Height (mm)</label>
                        <input
                          type="number"
                          className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.technical?.dimensions?.height || ''}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            technical: {
                              ...(newProduct.technical || {}),
                              dimensions: {
                                ...(newProduct.technical?.dimensions || {}),
                                height: e.target.value,
                                unit: 'mm'
                              }
                            }
                          })}
                          placeholder="Enter height"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Module Type</label>
                        <input
                          type="text"
                          className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.technical?.moduleType || ''}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            technical: {
                              ...(newProduct.technical || {}),
                              moduleType: e.target.value
                            }
                          })}
                          placeholder="e.g., Bifacial Topcon DCR"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Module Power (W)</label>
                        <input
                          type="number"
                          className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                          value={newProduct.technical?.modulePowerW || ''}
                          onChange={(e) => setNewProduct({
                            ...newProduct, 
                            technical: {
                              ...(newProduct.technical || {}),
                              modulePowerW: e.target.value
                            }
                          })}
                          placeholder="e.g., 545"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Inverter Type</label>
                      <input
                        type="text"
                        className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                        value={newProduct.technical?.inverterType || ''}
                        onChange={(e) => setNewProduct({
                          ...newProduct, 
                          technical: {
                            ...(newProduct.technical || {}),
                            inverterType: e.target.value
                          }
                        })}
                        placeholder="e.g., On-grid inverter"
                      />
                    </div>
                  </div>
                </div>

                {/* Installation Information */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold border-b border-gray-200 pb-3 mb-4 text-gray-700 flex items-center">
                    <FaWrench className="mr-2 text-[#92c51b]" /> Installation Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Installation Type</label>
                      <select
                        className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm bg-white"
                        value={newProduct.installation?.installationType || ''}
                        onChange={(e) => setNewProduct({
                          ...newProduct, 
                          installation: {
                            ...(newProduct.installation || {}),
                            installationType: e.target.value
                          }
                        })}
                      >
                        <option value="">Select Installation Type</option>
                        <option value="Roof Mount">Roof Mount</option>
                        <option value="Ground Mount">Ground Mount</option>
                        <option value="Wall Mount">Wall Mount</option>
                        <option value="Pole Mount">Pole Mount</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Not Included Items</label>
                      <textarea
                        className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                        value={newProduct.installation?.notIncluded ? newProduct.installation.notIncluded.join(', ') : ''}
                        onChange={(e) => setNewProduct({
                          ...newProduct, 
                          installation: {
                            ...(newProduct.installation || {}),
                            notIncluded: e.target.value.split(',').map(item => item.trim()).filter(item => item)
                          }
                        })}
                        rows="3"
                        placeholder="Enter items not included, separated by commas"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Installation Notes</label>
                      <textarea
                        className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                        value={newProduct.installation?.notes || ''}
                        onChange={(e) => setNewProduct({
                          ...newProduct, 
                          installation: {
                            ...(newProduct.installation || {}),
                            notes: e.target.value
                          }
                        })}
                        rows="3"
                        placeholder="Enter installation notes or special instructions"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Kit Components</label>
                      <textarea
                        className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                        value={newProduct.installation?.kitComponents ? 
                          (Array.isArray(newProduct.installation.kitComponents) ? 
                            newProduct.installation.kitComponents.map(item => 
                              typeof item === 'object' ? item.name + ' (Qty: ' + item.quantity + ')' : item
                            ).join(', ') : 
                            ''
                          ) : ''}
                        onChange={(e) => {
                          // Convert comma-separated text to array of objects with name and quantity
                          const components = e.target.value.split(',').map(item => item.trim()).filter(item => item)
                            .map(item => ({
                              name: item,
                              quantity: 1,
                              spec: ''
                            }));
                          
                          setNewProduct({
                            ...newProduct, 
                            installation: {
                              ...(newProduct.installation || {}),
                              kitComponents: components
                            }
                          });
                        }}
                        rows="3"
                        placeholder="Enter kit components, separated by commas"
                      />
                    </div>
                  </div>
                </div>

                {/* Legal & Manufacturer Information */}
                <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold border-b border-gray-200 pb-3 mb-4 text-gray-700 flex items-center">
                    <FaGavel className="mr-2 text-[#92c51b]" /> Legal & Manufacturer Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Manufacturer Name</label>
                      <input
                        type="text"
                        className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                        value={newProduct.legal?.manufacturer?.name || ''}
                        onChange={(e) => setNewProduct({
                          ...newProduct, 
                          legal: {
                            ...(newProduct.legal || {}),
                            manufacturer: {
                              ...(newProduct.legal?.manufacturer || {}),
                              name: e.target.value
                            }
                          }
                        })}
                        placeholder="Enter manufacturer name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Country of Origin</label>
                      <input
                        type="text"
                        className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                        value={newProduct.legal?.countryOfOrigin || ''}
                        onChange={(e) => setNewProduct({
                          ...newProduct, 
                          legal: {
                            ...(newProduct.legal || {}),
                            countryOfOrigin: e.target.value
                          }
                        })}
                        placeholder="Enter country of origin"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-6 py-3 rounded-lg shadow-sm transition-colors flex items-center"
                onClick={() => setShowAddModal(false)}
              >
                <FaTimes className="mr-2" /> Cancel
              </button>
              <button
                className="bg-[#92c51b] hover:bg-[#7ba515] text-white font-medium px-6 py-3 rounded-lg shadow-sm transition-colors flex items-center"
                onClick={handleAddProduct}
              >
                <FaSave className="mr-2" /> Add Product
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Product Modal - Similar structure to Add Modal but with editProduct state */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-7xl my-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800">Edit Product</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                <FaTimes />
              </button>
            </div>
            
            {/* Edit form content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Product Name</label>
                    <input
                      type="text"
                      className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                      value={editProduct.name || ''}
                      onChange={(e) => setEditProduct({...editProduct, name: e.target.value})}
                      placeholder="Enter product name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Main Category</label>
                    <select
                      className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                      value={editProduct.mainCategoryId || ''}
                      onChange={(e) => {
                        const mainCatId = e.target.value;
                        setEditProduct({...editProduct, mainCategoryId: mainCatId, subcategoryId: ''});
                        if (mainCatId) {
                          fetchSubcategories(mainCatId);
                        }
                      }}
                    >
                      <option value="">Select Main Category</option>
                      {mainCategories.map((category) => (
                        <option key={category._id || category.id} value={category._id || category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Subcategory</label>
                    <select
                      className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                      value={editProduct.subcategoryId || ''}
                      onChange={(e) => setEditProduct({...editProduct, subcategoryId: e.target.value})}
                      disabled={!subcategories.length}
                    >
                      <option value="">Select Subcategory</option>
                      {subcategories.map((category) => (
                        <option key={category._id || category.id} value={category._id || category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                    <textarea
                      className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                      value={editProduct.description || ''}
                      onChange={(e) => setEditProduct({...editProduct, description: e.target.value})}
                      placeholder="Enter product description"
                      rows="4"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Features</label>
                    <textarea
                      className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                      value={editProduct.features || ''}
                      onChange={(e) => setEditProduct({...editProduct, features: e.target.value})}
                      placeholder="Enter product features"
                      rows="4"
                    ></textarea>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-4 mt-8 text-gray-700">Pricing & Inventory</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Price (₹)</label>
                      <input
                        type="number"
                        className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                        value={editProduct.price || ''}
                        onChange={(e) => setEditProduct({...editProduct, price: e.target.value})}
                        placeholder="Enter price"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Old Price (₹)</label>
                      <input
                        type="number"
                        className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                        value={editProduct.oldPrice || ''}
                        onChange={(e) => setEditProduct({...editProduct, oldPrice: e.target.value})}
                        placeholder="Enter old price"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">MRP (₹)</label>
                      <input
                        type="number"
                        className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                        value={editProduct.mrp || ''}
                        onChange={(e) => setEditProduct({...editProduct, mrp: e.target.value})}
                        placeholder="Enter MRP"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Stock</label>
                      <input
                        type="number"
                        className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                        value={editProduct.stock || ''}
                        onChange={(e) => setEditProduct({...editProduct, stock: e.target.value})}
                        placeholder="Enter stock quantity"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">SKU</label>
                    <input
                      type="text"
                      className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                      value={editProduct.sku || ''}
                      onChange={(e) => setEditProduct({...editProduct, sku: e.target.value})}
                      placeholder="Enter SKU"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
                    <select
                      className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                      value={editProduct.status || 'Active'}
                      onChange={(e) => setEditProduct({...editProduct, status: e.target.value})}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Images</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Product Images</label>
                    <div className="flex flex-wrap gap-4 mb-4">
                      {editProduct.images && Array.isArray(editProduct.images) && editProduct.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={typeof image === 'string' ? image : URL.createObjectURL(image)} 
                            alt={`Product ${index + 1}`} 
                            className="w-24 h-24 object-cover rounded-md border border-gray-300" 
                          />
                          <button 
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                            onClick={() => {
                              const newImages = [...editProduct.images];
                              newImages.splice(index, 1);
                              setEditProduct({...editProduct, images: newImages});
                            }}
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                      onChange={(e) => {
                        const newImages = [...(editProduct.images || [])];
                        for (let i = 0; i < e.target.files.length; i++) {
                          newImages.push(e.target.files[i]);
                        }
                        setEditProduct({...editProduct, images: newImages});
                      }}
                    />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-4 mt-8 text-gray-700">Product Applications</h3>
                <div className="space-y-4">
                  {editProduct.applications && editProduct.applications.map((app, index) => (
                    <div key={index} className="border border-gray-200 p-4 rounded-lg">
                      <div className="flex justify-between mb-2">
                        <h4 className="font-medium">Application #{index + 1}</h4>
                        <button 
                          className="text-red-500"
                          onClick={() => {
                            const newApplications = [...editProduct.applications];
                            newApplications.splice(index, 1);
                            setEditProduct({...editProduct, applications: newApplications});
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-700 text-xs font-bold mb-1">Application Name</label>
                          <input
                            type="text"
                            className="border border-gray-300 rounded-lg w-full py-1 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent"
                            value={app.name || ''}
                            onChange={(e) => {
                              const newApplications = [...editProduct.applications];
                              newApplications[index] = {...newApplications[index], name: e.target.value};
                              setEditProduct({...editProduct, applications: newApplications});
                            }}
                            placeholder="e.g., Residential, Commercial"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 text-xs font-bold mb-1">Select Icon</label>
                          <IconSelector
                            selectedIcon={app.icon || ''}
                            onSelectIcon={(selectedIcon) => {
                              const newApplications = [...editProduct.applications];
                              newApplications[index] = {...newApplications[index], icon: selectedIcon};
                              setEditProduct({...editProduct, applications: newApplications});
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button 
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm flex items-center"
                    onClick={() => {
                      const newApplications = [...(editProduct.applications || []), { name: '', icon: '' }];
                      setEditProduct({...editProduct, applications: newApplications});
                    }}
                  >
                    <FaPlus className="mr-2" /> Add Application
                  </button>
                </div>
                
                <h3 className="text-lg font-semibold mb-4 mt-8 text-gray-700">Warranty Details</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Warranty Type</label>
                      <select
                        className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                        value={editProduct.warrantyDetails?.warrantyType || ''}
                        onChange={(e) => setEditProduct({
                          ...editProduct, 
                          warrantyDetails: {
                            ...(editProduct.warrantyDetails || {}),
                            warrantyType: e.target.value
                          }
                        })}
                      >
                        <option value="">Select Warranty Type</option>
                        <option value="Seller Warranty">Seller Warranty</option>
                        <option value="Brand Warranty">Brand Warranty</option>
                        <option value="No Warranty">No Warranty</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2">Warranty Duration</label>
                      <input
                        type="text"
                        className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                        value={editProduct.warrantyDetails?.warrantyDuration || ''}
                        onChange={(e) => setEditProduct({
                          ...editProduct, 
                          warrantyDetails: {
                            ...(editProduct.warrantyDetails || {}),
                            warrantyDuration: e.target.value
                          }
                        })}
                        placeholder="e.g., 5 years"
                      />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-4 mt-8 text-gray-700">Installation Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Kit Components (one per line)</label>
                    <textarea
                      className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                      value={editProduct.installation?.kitComponents ? 
                        (Array.isArray(editProduct.installation.kitComponents) ? 
                          editProduct.installation.kitComponents.map(comp => 
                            typeof comp === 'object' ? comp.name : comp
                          ).join('\n') : 
                          editProduct.installation.kitComponents) : 
                        ''}
                      onChange={(e) => {
                        const kitComponentsArray = e.target.value.split('\n')
                          .map(item => item.trim())
                          .filter(item => item)
                          .map(item => ({
                            name: item,
                            quantity: "1",
                            spec: "Standard"
                          }));
                        
                        setEditProduct({
                          ...editProduct,
                          installation: {
                            ...(editProduct.installation || {}),
                            kitComponents: kitComponentsArray
                          }
                        });
                      }}
                      placeholder="Enter kit components, one per line"
                      rows="4"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Installation Time</label>
                    <input
                      type="text"
                      className="border border-gray-300 rounded-lg w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b] focus:border-transparent shadow-sm"
                      value={editProduct.installation?.installationTime || ''}
                      onChange={(e) => setEditProduct({
                        ...editProduct, 
                        installation: {
                          ...(editProduct.installation || {}),
                          installationTime: e.target.value
                        }
                      })}
                      placeholder="e.g., 2-3 hours"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-8 pt-4 border-t border-gray-200">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium px-6 py-3 rounded-lg mr-4 shadow-sm transition-colors flex items-center"
                onClick={() => setShowEditModal(false)}
              >
                <FaTimes className="mr-2" /> Cancel
              </button>
              <button
                className="bg-[#92c51b] hover:bg-[#7ba515] text-white font-medium px-6 py-3 rounded-lg shadow-sm transition-colors flex items-center"
                onClick={handleEditProduct}
              >
                <FaSave className="mr-2" /> Update Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {showViewModal && viewProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Product Details</h2>
              <button 
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            
            {/* View modal content */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-gray-700 font-bold">Product Name</h3>
                  <p className="text-gray-600">{viewProduct.name}</p>
                </div>
                <div>
                  <h3 className="text-gray-700 font-bold">SKU</h3>
                  <p className="text-gray-600">{viewProduct.sku || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-gray-700 font-bold">Description</h3>
                <p className="text-gray-600">{viewProduct.description || 'No description available'}</p>
              </div>
              
              {/* Add more view details as needed */}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                onClick={() => setShowViewModal(false)}
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

export default ProductManagement;