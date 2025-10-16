const Product = require('../../models/products/product');
const Category = require('../../models/category/category');
const { logError } = require('../notifications/notificationController');

// Get all products with filtering and pagination
exports.getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const query = {};
    
    // Filter by category if provided
    if (category) {
      query.categoryId = category;
    }
    
    // Filter by status if provided
    if (status) {
      if (status === 'in_stock') {
        query.stock = { $gt: 0 };
      } else if (status === 'out_of_stock') {
        query.stock = 0;
      } else if (status === 'low_stock') {
        query.stock = { $gt: 0, $lte: 10 };
      }
    }
    
    // Search by name or description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Set up sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const options = {
      sort,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      populate: 'categoryId'
    };
    
    const products = await Product.find(query, null, options);
    const total = await Product.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id).populate('categoryId');
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      stock, 
      categoryId,
      images,
      specifications,
      isActive
    } = req.body;
    
    console.log('Creating product with data:', req.body);
    console.log('Creating product with categoryId:', categoryId);
    
    if (!categoryId) {
      return res.status(400).json({ success: false, message: 'Category ID is required' });
    }
    
    // Check if category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      console.error('Category not found with ID:', categoryId);
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    // Process uploaded images if any
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        // Add full URL prefix to make it a valid URL for the model validation
        imageUrls.push(`http://localhost:admin/uploads/products/${file.filename}`);
      });
    }
    
    const product = new Product({
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      categoryId, // Use categoryId field as per model schema
      images: imageUrls.length > 0 ? imageUrls : (images || []),
      specifications: specifications || {},
      isActive: isActive !== undefined ? isActive : true
    });
    
    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      price, 
      stock, 
      categoryId,
      images,
      specifications,
      isActive
    } = req.body;
    
    // Initialize updateData object first
    const updateData = {};
    
    // Check if category exists if provided
    if (categoryId) {
      try {
        // Handle case where categoryId might be an object instead of string
        const catId = typeof categoryId === 'object' ? categoryId.toString() : categoryId;
        const categoryExists = await Category.findById(catId);
        if (!categoryExists) {
          return res.status(404).json({ success: false, message: 'Category not found' });
        }
        // Ensure we use the string version of the ID
        updateData.categoryId = catId;
      } catch (err) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid category ID format', 
          error: err.message 
        });
      }
    }
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (price) updateData.price = Number(price);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (categoryId) updateData.categoryId = categoryId;
    
    // Process uploaded images if any
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        // Add full URL prefix to make it a valid URL for the model validation
        imageUrls.push(`http://localhost:admin/uploads/products/${file.filename}`);
      });
      updateData.images = imageUrls;
    } else if (images) {
      // Check if images is a JSON string and parse it
      if (typeof images === 'string' && images.startsWith('[')) {
        try {
          updateData.images = JSON.parse(images);
        } catch (err) {
          updateData.images = images;
        }
      } else {
        updateData.images = images;
      }
    }
    
    if (specifications) updateData.specifications = specifications;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('categoryId');
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update product stock
exports.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    
    if (stock === undefined) {
      return res.status(400).json({ success: false, message: 'Stock value is required' });
    }
    
    const product = await Product.findByIdAndUpdate(
      id,
      { stock },
      { new: true }
    );
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product stock updated successfully',
      data: product
    });
  } catch (error) {
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get product statistics
exports.getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const inactiveProducts = await Product.countDocuments({ isActive: false });
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });
    const lowStockProducts = await Product.countDocuments({ stock: { $gt: 0, $lte: 10 } });
    
    // Get products by category
    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $project: {
          _id: 0,
          category: '$category.name',
          count: 1
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        activeProducts,
        inactiveProducts,
        outOfStockProducts,
        lowStockProducts,
        productsByCategory
      }
    });
  } catch (error) {
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Toggle featured status of a product
exports.toggleFeaturedStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Toggle the featured status
    product.isFeatured = !product.isFeatured;
    await product.save();
    
    res.status(200).json({
      success: true,
      message: `Product ${product.isFeatured ? 'marked as featured' : 'removed from featured'}`,
      data: product
    });
  } catch (error) {
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Export products to CSV/Excel
exports.exportProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category');
    
    if (!products || products.length === 0) {
      return res.status(404).json({ success: false, message: 'No products found to export' });
    }
    
    // Format products for export
    const formattedProducts = products.map(product => ({
      ID: product._id,
      Name: product.name,
      Description: product.description,
      Price: product.price,
      Stock: product.stock,
      Category: product.category ? product.category.name : 'Uncategorized',
      Status: product.isActive ? 'Active' : 'Inactive',
      Featured: product.isFeatured ? 'Yes' : 'No',
      CreatedAt: product.createdAt
    }));
    
    res.status(200).json({
      success: true,
      message: 'Products exported successfully',
      data: formattedProducts
    });
  } catch (error) {
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};