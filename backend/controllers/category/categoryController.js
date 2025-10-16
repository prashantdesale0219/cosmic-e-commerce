const Category = require('../../models/category/category');
const Product = require('../../models/products/product');
const path = require('path');

// Helper function to check for cycles in category hierarchy
const checkForCycles = async (categoryId, newParentId) => {
  let currentParent = newParentId;
  const visited = new Set();
  
  while (currentParent) {
    // If we've seen this parent before or it's the original category, we have a cycle
    if (visited.has(currentParent) || currentParent.toString() === categoryId.toString()) {
      return true;
    }
    
    visited.add(currentParent);
    
    // Get the next parent up the chain
    const parentCategory = await Category.findById(currentParent);
    if (!parentCategory) break;
    
    currentParent = parentCategory.parent;
  }
  
  return false;
};

// Helper function to update levels of all descendants
const updateDescendantLevels = async (categoryId, parentLevel) => {
  const children = await Category.find({ parent: categoryId });
  
  for (const child of children) {
    const newLevel = parentLevel + 1;
    await Category.findByIdAndUpdate(child._id, { level: newLevel });
    
    // Recursively update children's children
    await updateDescendantLevels(child._id, newLevel);
  }
};

// @desc    Create new category
// @route   POST /api/admin/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const { name, description, status, image, parent } = req.body;
    
    // Get image file path if uploaded
    let imagePath = image;
    if (req.file) {
      const uploadUrl = process.env.UPLOAD_URL || 'http://localhost:5000';
      imagePath = `${uploadUrl}/uploads/categories/${req.file.filename}`;
    }

    // Create category with validation
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Prepare category data
    const categoryData = {
      name,
      description,
      status,
      image: imagePath,
      isMainCategory: !parent
    };

    // Handle parent category if provided
    if (parent) {
      // Check if parent category exists
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found'
        });
      }
      
      categoryData.parent = parent;
      categoryData.level = parentCategory.level + 1;
    } else {
      // This is a main category
      categoryData.level = 0;
      categoryData.isMainCategory = true;
    }

    // Create category
    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all categories with optional search and pagination
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, parent, mainOnly = false } = req.query;
    
    // Build query
    const query = {};
    
    // Add search functionality if provided
    if (search) {
      query.$text = { $search: search };
    }
    
    // Filter by parent category if provided
    if (parent) {
      query.parent = parent;
    }
    
    // Filter main categories only if requested
    if (mainOnly === 'true') {
      query.isMainCategory = true;
    }
    
    // Count total documents for pagination
    const total = await Category.countDocuments(query);
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find categories
    const categories = await Category.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: categories.length,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get category by ID
// @route   GET /api/category/:id
// @access  Public
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Get subcategories if any
    const subcategories = await Category.find({ parent: category._id }).sort({ name: 1 });
    
    // Get parent category if any
    let parentCategory = null;
    if (category.parent) {
      parentCategory = await Category.findById(category.parent);
    }
    
    res.status(200).json({
      success: true,
      data: {
        ...category.toObject(),
        subcategories,
        parentCategory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
exports.getCategoryBySlug = async (req, res) => {
  try {
    console.log('Searching for category with slug:', req.params.slug);
    
    // Direct search by slug (assuming slug is stored in the database)
    let category = await Category.findOne({ slug: req.params.slug });
    
    // If not found by slug, try by name (case insensitive)
    if (!category) {
      // Try direct match with name
      category = await Category.findOne({
        name: { $regex: new RegExp('^' + req.params.slug + '$', 'i') }
      });
      
      // If still not found, try converting slug to name format
      if (!category) {
        const nameFromSlug = req.params.slug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        category = await Category.findOne({
          name: { $regex: new RegExp('^' + nameFromSlug + '$', 'i') }
        });
      }
    }
    
    if (!category) {
      console.log('Category not found for slug:', req.params.slug);
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    console.log('Found category:', category);
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error in getCategoryBySlug:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    const { name, description, status, parent } = req.body;
    
    // Find category
    let category = await Category.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Prepare update data
    const updateData = {
      name: name ? name.trim() : category.name,
      description: description ? description.trim() : category.description,
      status: status || category.status,
      updatedAt: Date.now()
    };
    
    // Handle image if uploaded
    if (req.file) {
      const uploadUrl = process.env.UPLOAD_URL || 'http://localhost:5000';
      updateData.image = `${uploadUrl}/uploads/categories/${req.file.filename}`;
    } else if (req.body.image) {
      updateData.image = req.body.image;
    }
    
    // Handle parent category update
    if (parent !== undefined) {
      // Check if trying to set itself as parent
      if (parent && parent.toString() === req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be its own parent'
        });
      }
      
      // Check if trying to set one of its descendants as parent (would create a cycle)
      if (parent) {
        const wouldCreateCycle = await checkForCycles(req.params.id, parent);
        if (wouldCreateCycle) {
          return res.status(400).json({
            success: false,
            message: 'Cannot set a descendant as parent (would create a cycle)'
          });
        }
        
        // Check if parent exists
        const parentCategory = await Category.findById(parent);
        if (!parentCategory) {
          return res.status(400).json({
            success: false,
            message: 'Parent category not found'
          });
        }
        
        updateData.parent = parent;
        updateData.level = parentCategory.level + 1;
        updateData.isMainCategory = false;
      } else {
        // Setting as main category
        updateData.parent = null;
        updateData.level = 0;
        updateData.isMainCategory = true;
      }
    }
    
    // Update category
    category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    // If parent changed, update all descendant levels
    if (parent !== undefined && parent !== category.parent) {
      await updateDescendantLevels(category._id, category.level);
    }
    
    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get main categories only
// @route   GET /api/admin/main-categories
// @access  Private/Admin
exports.getMainCategories = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    // Build query for main categories only
    const query = { isMainCategory: true };
    
    // Add search functionality if provided
    if (search) {
      query.$text = { $search: search };
    }
    
    // Count total documents for pagination
    const total = await Category.countDocuments(query);
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find main categories
    const categories = await Category.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: categories.length,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get subcategories by parent ID
// @route   GET /api/admin/subcategories/:parentId
// @access  Private/Admin
// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    // Check if category has linked products
    const productsCount = await Product.countDocuments({ categoryId: req.params.id });
    
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${productsCount} linked products`
      });
    }
    
    // Check if category has subcategories
    const subcategoriesCount = await Category.countDocuments({ parent: req.params.id });
    
    if (subcategoriesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${subcategoriesCount} subcategories`
      });
    }
    
    // Find and delete category
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

exports.getSubcategories = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const parentId = req.params.parentId;
    
    // Check if parent category exists
    const parentCategory = await Category.findById(parentId);
    if (!parentCategory) {
      return res.status(404).json({
        success: false,
        message: 'Parent category not found'
      });
    }
    
    // Build query for subcategories
    const query = { parent: parentId };
    
    // Add search functionality if provided
    if (search) {
      query.$text = { $search: search };
    }
    
    // Count total documents for pagination
    const total = await Category.countDocuments(query);
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find subcategories
    const subcategories = await Category.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: subcategories.length,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      parentCategory: {
        _id: parentCategory._id,
        name: parentCategory.name
      },
      data: subcategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};