import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaTimes, FaSave, FaSpinner, FaLayerGroup, FaArrowLeft } from 'react-icons/fa';
import { categoryManagementApi } from '../../services/adminApi';
import { toast } from 'react-toastify';
import { fixImageUrl } from '../../utils/imageUtils';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'main', 'sub'
  const [currentParentId, setCurrentParentId] = useState(null);
  const [currentParentName, setCurrentParentName] = useState('');
  
  const [newCategory, setNewCategory] = useState({ 
    name: '', 
    description: '', 
    image: null,
    status: 'Active',
    parent: '' 
  });
  
  const [editCategory, setEditCategory] = useState({
    _id: null,
    name: '', 
    description: '', 
    image: null,
    status: '',
    parent: ''
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  // Load categories function
  const fetchCategories = async () => {
    try {
      setLoading(true);
      let response;
      
      if (viewMode === 'all') {
        response = await categoryManagementApi.getAllCategories();
      } else if (viewMode === 'main') {
        response = await categoryManagementApi.getMainCategories();
      } else if (viewMode === 'sub' && currentParentId) {
        response = await categoryManagementApi.getSubcategories(currentParentId);
      }
      
      const categoryData = response.data.data || response.data;
      setCategories(Array.isArray(categoryData) ? categoryData : []);
      
      // If we're viewing subcategories, store the parent name
      if (viewMode === 'sub' && response.data.parentCategory) {
        setCurrentParentName(response.data.parentCategory.name);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load categories. Please try again.');
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  // Load main categories for dropdown
  const fetchMainCategories = async () => {
    try {
      const response = await categoryManagementApi.getMainCategories();
      const mainCategoryData = response.data.data || response.data;
      setMainCategories(Array.isArray(mainCategoryData) ? mainCategoryData : []);
    } catch (err) {
      console.error('Error fetching main categories:', err);
    }
  };

  // Load categories on component mount and when viewMode changes
  useEffect(() => {
    fetchCategories();
  }, [viewMode, currentParentId]);

  // Load main categories for dropdowns
  useEffect(() => {
    fetchMainCategories();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCategory({ ...newCategory, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditCategory({ ...editCategory, image: file });
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddCategory = async () => {
    try {
      if (!newCategory.name.trim()) {
        toast.error('Category name is required');
        return;
      }

      // Create form data for file upload
      const formData = new FormData();
      
      // Always append name with proper trimming
      formData.append('name', newCategory.name.trim());
      
      // Add description if available
      if (newCategory.description) {
        formData.append('description', newCategory.description.trim());
      }
      
      // Add status
      formData.append('status', newCategory.status || 'Active');
      
      // Add parent if selected
      if (newCategory.parent) {
        formData.append('parent', newCategory.parent);
      }
      
      // Handle image if available
      if (newCategory.image) {
        // Check if image is a File object or string
        if (newCategory.image instanceof File) {
          formData.append('image', newCategory.image);
        } else {
          formData.append('image', newCategory.image);
        }
      }

      console.log('Sending category data:', {
        name: newCategory.name.trim(),
        description: newCategory.description ? newCategory.description.trim() : '',
        status: newCategory.status || 'Active',
        parent: newCategory.parent || 'None',
        image: newCategory.image ? 'Image present' : 'No image'
      });

      const response = await categoryManagementApi.createCategory(formData);
      console.log('Category added response:', response);
      
      // Reload categories after adding
      await fetchCategories();
      
      // Also refresh main categories list for dropdowns
      await fetchMainCategories();
      
      toast.success('Category added successfully');
      setNewCategory({ name: '', description: '', image: null, status: 'Active', parent: '' });
      setImagePreview(null);
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding category:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add category';
      toast.error(errorMessage);
    }
  };

  const handleEditClick = async (categoryId) => {
    try {
      const response = await categoryManagementApi.getCategoryById(categoryId);
      const category = response.data.data || response.data;
      
      setEditCategory({ 
        _id: category._id,
        name: category.name, 
        description: category.description || '',
        image: null,
        status: category.status || 'Active',
        parent: category.parent || ''
      });
      
      // Set image preview with correct URL
      let imageUrl = null;
      if (category.image) {
        imageUrl = category.image;
      } else if (category.imageUrl) {
        imageUrl = category.imageUrl;
      }
      
      // Store the original URL for preview
      setEditImagePreview(imageUrl);
      
      setShowEditModal(true);
    } catch (err) {
      toast.error('Failed to load category details');
      console.error('Error loading category details:', err);
    }
  };

  const handleEditCategory = async () => {
    try {
      if (!editCategory.name.trim()) {
        toast.error('Category name is required');
        return;
      }

      const formData = new FormData();
      formData.append('name', editCategory.name.trim());
      if (editCategory.description) {
        formData.append('description', editCategory.description.trim());
      }
      formData.append('status', editCategory.status || 'Active');
      
      // Add parent if selected
      if (editCategory.parent) {
        formData.append('parent', editCategory.parent);
      }
      
      if (editCategory.image) {
        formData.append('image', editCategory.image);
      }

      console.log('Updating category with data:', {
        id: editCategory._id,
        name: editCategory.name.trim(),
        description: editCategory.description ? editCategory.description.trim() : '',
        status: editCategory.status || 'Active',
        parent: editCategory.parent || 'None',
        image: editCategory.image ? 'Image present' : 'No image'
      });

      const response = await categoryManagementApi.updateCategory(editCategory._id, formData);
      console.log('Category updated response:', response);
      
      // Reload categories after updating
      await fetchCategories();
      
      // Also refresh main categories list for dropdowns
      await fetchMainCategories();
      
      toast.success('Category updated successfully');
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating category:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update category';
      toast.error(errorMessage);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoryManagementApi.deleteCategory(id);
        
        // Reload categories after deletion
        await fetchCategories();
        
        // Also refresh main categories list for dropdowns
        await fetchMainCategories();
        
        toast.success('Category deleted successfully');
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to delete category';
        toast.error(errorMessage);
        console.error('Error deleting category:', err);
      }
    }
  };

  const handleViewSubcategories = (categoryId, categoryName) => {
    setCurrentParentId(categoryId);
    setCurrentParentName(categoryName);
    setViewMode('sub');
  };

  const handleBackToAllCategories = () => {
    setViewMode('all');
    setCurrentParentId(null);
    setCurrentParentName('');
  };

  const handleBackToMainCategories = () => {
    setViewMode('main');
    setCurrentParentId(null);
    setCurrentParentName('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-[#92c51b]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          {viewMode === 'sub' && (
            <button 
              onClick={handleBackToMainCategories}
              className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-md flex items-center"
            >
              <FaArrowLeft className="mr-1" /> Back
            </button>
          )}
          <h1 className="text-2xl font-bold">
            {viewMode === 'all' ? 'Category Management' : 
             viewMode === 'main' ? 'Main Categories' : 
             `Subcategories of ${currentParentName}`}
          </h1>
        </div>
        <div className="flex">
          {viewMode === 'all' && (
            <button 
              onClick={() => setViewMode('main')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center mr-2"
            >
              <FaLayerGroup className="mr-2" /> View Main Categories
            </button>
          )}
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-[#92c51b] hover:bg-[#7ba515] text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaPlus className="mr-2" /> Add Category
          </button>
        </div>
      </div>
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search categories..."
            className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>
      
      {/* Categories Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCategories.map((category) => (
              <tr key={category._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {category.imageUrl || category.image ? (
                    <img 
                      src={fixImageUrl(category.imageUrl || category.image)} 
                      alt={category.name} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-500">{category.name.charAt(0)}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {category.description ? (
                    category.description.length > 50 
                      ? `${category.description.substring(0, 50)}...` 
                      : category.description
                  ) : 'No description'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    category.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {category.status || 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    category.isMainCategory ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {category.isMainCategory ? 'Main' : 'Sub'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {category.isMainCategory && (
                    <button 
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      onClick={() => handleViewSubcategories(category._id, category.name)}
                      title="View Subcategories"
                    >
                      <FaLayerGroup />
                    </button>
                  )}
                  <button 
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                    onClick={() => handleEditClick(category._id)}
                    title="Edit Category"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleDeleteCategory(category._id)}
                    title="Delete Category"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add New Category</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Category Name</label>
              <input
                type="text"
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
              <textarea
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                value={newCategory.description}
                onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                rows="3"
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Parent Category (Optional)</label>
              <select
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                value={newCategory.parent}
                onChange={(e) => setNewCategory({...newCategory, parent: e.target.value})}
              >
                <option value="">None (Main Category)</option>
                {mainCategories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Image</label>
              <input
                type="file"
                accept="image/*"
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-20 w-20 object-cover rounded"
                  />
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
              <select
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                value={newCategory.status}
                onChange={(e) => setNewCategory({...newCategory, status: e.target.value})}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md mr-2"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-[#92c51b] hover:bg-[#7ba515] text-white px-4 py-2 rounded-md flex items-center"
                onClick={handleAddCategory}
              >
                <FaSave className="mr-2" /> Add Category
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Category Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Category</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Category Name</label>
              <input
                type="text"
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                value={editCategory.name}
                onChange={(e) => setEditCategory({...editCategory, name: e.target.value})}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
              <textarea
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                value={editCategory.description}
                onChange={(e) => setEditCategory({...editCategory, description: e.target.value})}
                rows="3"
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Parent Category (Optional)</label>
              <select
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                value={editCategory.parent || ''}
                onChange={(e) => setEditCategory({...editCategory, parent: e.target.value})}
              >
                <option value="">None (Main Category)</option>
                {mainCategories.map(category => (
                  // Don't allow a category to be its own parent
                  category._id !== editCategory._id && (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  )
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Image</label>
              <input
                type="file"
                accept="image/*"
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                onChange={handleEditImageChange}
              />
              {editImagePreview && (
                <div className="mt-2">
                  <img 
                    src={fixImageUrl(editImagePreview)} 
                    alt="Preview" 
                    className="h-20 w-20 object-cover rounded"
                  />
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
              <select
                className="border rounded-md w-full py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#92c51b]"
                value={editCategory.status}
                onChange={(e) => setEditCategory({...editCategory, status: e.target.value})}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
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
                onClick={handleEditCategory}
              >
                <FaSave className="mr-2" /> Update Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;