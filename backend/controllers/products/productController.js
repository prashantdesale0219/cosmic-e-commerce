const Product = require('../../models/products/product');
const Category = require('../../models/category/category');
const path = require('path');
const slugify = require('slugify');
const mongoose = require('mongoose');

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      stock, 
      categoryId,
      sku,
      features,
      highlights,
      oldPrice,
      mrp,
      tags,
      technical,
      installation,
      legal,
      offers,
      applications,
      warrantyDetails,
      documentation,
      size,
      availableSizes,
      defaultQuantity,
      maxOrderQuantity
    } = req.body;

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Process uploaded images
    let productImages = [];
    if (req.files && req.files.length > 0) {
      const uploadUrl = process.env.UPLOAD_URL || 'http://localhost:5000';
      productImages = req.files.map(file => `/uploads/products/${file.filename}`);
    }

    // Generate slug from name
    const slug = slugify(name, { lower: true, strict: true });

    // Parse JSON strings if they exist
    const parsedTechnical = technical ? (typeof technical === 'string' ? JSON.parse(technical) : technical) : undefined;
    const parsedInstallation = installation ? (typeof installation === 'string' ? JSON.parse(installation) : installation) : undefined;
    const parsedLegal = legal ? (typeof legal === 'string' ? JSON.parse(legal) : legal) : undefined;
    const parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : undefined;
    const parsedHighlights = highlights ? (typeof highlights === 'string' ? JSON.parse(highlights) : highlights) : undefined;
    const parsedOffers = offers ? (typeof offers === 'string' ? JSON.parse(offers) : offers) : undefined;
    const parsedApplications = applications ? (typeof applications === 'string' ? JSON.parse(applications) : applications) : undefined;
    const parsedWarrantyDetails = warrantyDetails ? (typeof warrantyDetails === 'string' ? JSON.parse(warrantyDetails) : warrantyDetails) : undefined;
    const parsedDocumentation = documentation ? (typeof documentation === 'string' ? JSON.parse(documentation) : documentation) : undefined;

    // Calculate discount percentage if oldPrice is provided
    let discountPercent;
    if (oldPrice && price && oldPrice > price) {
      discountPercent = Math.round(((oldPrice - price) / oldPrice) * 100);
    }

    // Create product
    const product = await Product.create({
      name,
      slug,
      sku: sku || `PROD-${Date.now()}`,
      description,
      features,
      highlights: parsedHighlights,
      price,
      oldPrice,
      mrp,
      discountPercent,
      stock,
      categoryId,
      tags: parsedTags,
      images: productImages,
      technical: parsedTechnical,
      installation: parsedInstallation,
      legal: parsedLegal,
      offers: parsedOffers,
      applications: parsedApplications,
      warrantyDetails: parsedWarrantyDetails,
      documentation: parsedDocumentation || {
        dataSheet: null,
        installationGuide: null,
        warrantyCard: null
      },
      isOutOfStock: stock <= 0,
      // Size and quantity fields
      size: size || 'Pack of 1',
      availableSizes: availableSizes ? (Array.isArray(availableSizes) ? availableSizes : JSON.parse(availableSizes)) : ['Pack of 1'],
      defaultQuantity: defaultQuantity ? Number(defaultQuantity) : 1,
      maxOrderQuantity: maxOrderQuantity ? Number(maxOrderQuantity) : 100
    });

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all products with filtering and pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const { 
      search, 
      category, 
      minPrice, 
      maxPrice,
      tags,
      systemCapacity,
      installationType,
      size,
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build query
    const query = {};
    
    // Add search functionality if provided
    if (search) {
      query.$text = { $search: search };
    }
    
    // Filter by category
    if (category) {
      query.categoryId = category;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Filter by tags
    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    // Filter by system capacity
    if (systemCapacity) {
      query['technical.systemCapacityKw'] = parseFloat(systemCapacity);
    }

    // Filter by installation type
    if (installationType) {
      query['installation.installationType'] = installationType;
    }
    
    // Filter by size (Pack of X)
    if (size) {
      query.size = size;
    }
    
    // Count total documents for pagination
    const total = await Product.countDocuments(query);
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find products
    const products = await Product.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .populate('categoryId', 'name');
    
    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    // Check if the parameter is a valid ObjectId or a slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    
    let product;
    if (isObjectId) {
      product = await Product.findById(req.params.id).populate('categoryId', 'name');
    } else {
      // If not an ObjectId, try to find by slug
      product = await Product.findOne({ slug: req.params.id }).populate('categoryId', 'name');
    }
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { 
      name, 
      description, 
      price, 
      stock, 
      categoryId,
      images,
      sku,
      features,
      highlights,
      oldPrice,
      mrp,
      tags,
      technical,
      installation,
      legal,
      offers,
      applications,
      warrantyDetails,
      documentation,
      size,
      availableSizes,
      defaultQuantity,
      maxOrderQuantity
    } = req.body;
    
    // Find product
    let product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if category exists if provided
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Process uploaded images
    let productImages = images || product.images;
    if (req.files && req.files.length > 0) {
      const uploadUrl = process.env.UPLOAD_URL || 'http://localhost:5000';
      const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
      productImages = [...productImages, ...newImages];
    }

    // Generate slug from name if name is provided
    const slug = name ? slugify(name, { lower: true, strict: true }) : product.slug;

    // Parse JSON strings if they exist
    const parsedTechnical = technical ? (typeof technical === 'string' ? JSON.parse(technical) : technical) : product.technical;
    const parsedInstallation = installation ? (typeof installation === 'string' ? JSON.parse(installation) : installation) : product.installation;
    const parsedLegal = legal ? (typeof legal === 'string' ? JSON.parse(legal) : legal) : product.legal;
    const parsedTags = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : product.tags;
    const parsedHighlights = highlights ? (typeof highlights === 'string' ? JSON.parse(highlights) : highlights) : product.highlights;
    const parsedOffers = offers ? (typeof offers === 'string' ? JSON.parse(offers) : offers) : product.offers;
    const parsedApplications = applications ? (typeof applications === 'string' ? JSON.parse(applications) : applications) : product.applications;
    const parsedWarrantyDetails = warrantyDetails ? (typeof warrantyDetails === 'string' ? JSON.parse(warrantyDetails) : warrantyDetails) : product.warrantyDetails;
    const parsedDocumentation = documentation ? (typeof documentation === 'string' ? JSON.parse(documentation) : documentation) : product.documentation;

    // Calculate discount percentage if price and oldPrice are provided
    let discountPercent;
    if (oldPrice !== undefined && price !== undefined && oldPrice > price) {
      discountPercent = Math.round(((oldPrice - price) / oldPrice) * 100);
    } else if (product.oldPrice && (price !== undefined ? price : product.price) && product.oldPrice > (price !== undefined ? price : product.price)) {
      discountPercent = Math.round(((product.oldPrice - (price !== undefined ? price : product.price)) / product.oldPrice) * 100);
    } else {
      discountPercent = product.discountPercent;
    }
    
    // Update product
    product = await Product.findByIdAndUpdate(
      productId,
      { 
        name: name || product.name, 
        slug,
        sku: sku || product.sku,
        description: description || product.description, 
        features: features !== undefined ? features : product.features,
        highlights: parsedHighlights,
        price: price !== undefined ? price : product.price, 
        oldPrice: oldPrice !== undefined ? oldPrice : product.oldPrice,
        mrp: mrp !== undefined ? mrp : product.mrp,
        discountPercent,
        stock: stock !== undefined ? stock : product.stock, 
        categoryId: categoryId || product.categoryId, 
        tags: parsedTags,
        images: productImages,
        technical: parsedTechnical,
        installation: parsedInstallation,
        legal: parsedLegal,
        offers: parsedOffers,
        applications: parsedApplications,
        warrantyDetails: parsedWarrantyDetails,
        documentation: parsedDocumentation,
        isOutOfStock: stock !== undefined ? stock <= 0 : product.isOutOfStock,
        size: size || product.size,
        availableSizes: availableSizes ? (Array.isArray(availableSizes) ? availableSizes : JSON.parse(availableSizes)) : product.availableSizes,
        defaultQuantity: defaultQuantity !== undefined ? Number(defaultQuantity) : product.defaultQuantity,
        maxOrderQuantity: maxOrderQuantity !== undefined ? Number(maxOrderQuantity) : product.maxOrderQuantity,
        updatedAt: Date.now() 
      },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name');
    
    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    // Find and delete product
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
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

// @desc    Get products by tag
// @route   GET /api/products/tags/:tag
// @access  Public
exports.getProductsByTag = async (req, res) => {
  try {
    const { tag } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const query = { tags: tag };
    
    // Count total documents for pagination
    const total = await Product.countDocuments(query);
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Find products
    const products = await Product.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .populate('categoryId', 'name');
    
    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
exports.getRelatedProducts = async (req, res) => {
  try {
    const productId = req.params.id;
    const { limit = 4 } = req.query;
    
    // Find the current product to get its category
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Find related products from the same category, excluding the current product
    const relatedProducts = await Product.find({
      _id: { $ne: productId },
      categoryId: product.categoryId
    })
    .limit(parseInt(limit))
    .sort({ averageRating: -1, reviewCount: -1 })
    .populate('categoryId', 'name');
    
    res.status(200).json({
      success: true,
      count: relatedProducts.length,
      data: relatedProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get product rating summary
// @route   GET /api/products/:id/rating-summary
// @access  Public
exports.getProductRatingSummary = async (req, res) => {
  try {
    const productId = req.params.id;
    const mongoose = require('mongoose');
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Get rating distribution using aggregation
    const Review = require('../../models/review/review');
    const ratingDistribution = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId), status: 'approved' } },
      { $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);
    
    // Format the distribution for frontend
    const formattedDistribution = [5, 4, 3, 2, 1].map(rating => {
      const found = ratingDistribution.find(item => item._id === rating);
      return {
        rating,
        count: found ? found.count : 0
      };
    });
    
    // Calculate percentages
    const totalReviews = product.reviewCount || 0;
    const distributionWithPercentage = formattedDistribution.map(item => ({
      ...item,
      percentage: totalReviews > 0 ? Math.round((item.count / totalReviews) * 100) : 0
    }));
    
    res.status(200).json({
      success: true,
      data: {
        averageRating: product.averageRating || 0,
        totalReviews,
        distribution: distributionWithPercentage
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

// @desc    Get product details with all related data for frontend
// @route   GET /api/products/:id/details
// @access  Public
exports.getProductDetails = async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Check if the parameter is a valid ObjectId or a slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(productId);
    
    let product;
    if (isObjectId) {
      // Use mongoose.Types.ObjectId to ensure proper ObjectId creation
      const objectId = new mongoose.Types.ObjectId(productId);
      product = await Product.findById(objectId).populate('categoryId', 'name');
    } else {
      // If not an ObjectId, try to find by slug
      product = await Product.findOne({ slug: productId }).populate('categoryId', 'name');
    }
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Get reviews for this product
    const Review = require('../../models/review/review');
    const reviews = await Review.find({ 
      productId: product._id,
      status: 'approved'
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('userId', 'name email');
    
    // Get related products
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      categoryId: product.categoryId
    })
    .limit(4)
    .sort({ averageRating: -1, reviewCount: -1 });
    
    // Get recommended products (could be based on tags or other criteria)
    const recommendedProducts = await Product.find({
      _id: { $ne: product._id },
      tags: { $in: product.tags }
    })
    .limit(4)
    .sort({ reviewCount: -1 });
    
    // Get rating distribution
    const mongoose = require('mongoose');
    const ratingDistribution = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(product._id), status: 'approved' } },
      { $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);
    
    // Format the distribution for frontend
    const formattedDistribution = [5, 4, 3, 2, 1].map(rating => {
      const found = ratingDistribution.find(item => item._id === rating);
      return {
        rating,
        count: found ? found.count : 0,
        percentage: product.reviewCount > 0 
          ? Math.round(((found ? found.count : 0) / product.reviewCount) * 100) 
          : 0
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        product,
        reviews,
        relatedProducts,
        recommendedProducts,
        ratingDistribution: formattedDistribution
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

// @desc    Get product applications (for filtering)
// @route   GET /api/products/applications
// @access  Public
exports.getProductApplications = async (req, res) => {
  try {
    // Extract unique applications from products
    const applications = await Product.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags" } },
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      data: applications.map(app => app._id)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get recently viewed products for a customer
// @route   GET /api/products/customer/recent
// @access  Private
exports.getRecentlyViewedProducts = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get user's recently viewed products from user model
    const User = require('../../models/auth/user');
    const user = await User.findById(userId).select('recentlyViewed');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // If user has no recently viewed products
    if (!user.recentlyViewed || user.recentlyViewed.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: []
      });
    }
    
    // Get recently viewed products
    const recentProducts = await Product.find({
      _id: { $in: user.recentlyViewed }
    })
    .populate('categoryId', 'name')
    .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: recentProducts.length,
      data: recentProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get recommended products for a customer based on purchase history and preferences
// @route   GET /api/products/customer/recommended
// @access  Private
exports.getRecommendedProducts = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10 } = req.query;
    
    // Get user's order history
    const Order = require('../../models/orders/order');
    const userOrders = await Order.find({ 
      userId: userId,
      status: { $in: ['delivered', 'completed'] }
    }).select('items');
    
    // Extract product IDs from orders
    let purchasedProductIds = [];
    if (userOrders && userOrders.length > 0) {
      userOrders.forEach(order => {
        if (order.items && order.items.length > 0) {
          order.items.forEach(item => {
            purchasedProductIds.push(item.productId);
          });
        }
      });
    }
    
    // Get categories of purchased products
    let recommendationQuery = {};
    
    if (purchasedProductIds.length > 0) {
      // Get purchased products to extract categories and tags
      const purchasedProducts = await Product.find({
        _id: { $in: purchasedProductIds }
      }).select('categoryId tags');
      
      // Extract categories and tags
      const categories = purchasedProducts.map(product => product.categoryId);
      const tags = purchasedProducts.flatMap(product => product.tags || []);
      
      // Build recommendation query based on similar categories and tags
      recommendationQuery = {
        $or: [
          { categoryId: { $in: categories } },
          { tags: { $in: tags } }
        ],
        _id: { $nin: purchasedProductIds } // Exclude already purchased products
      };
    } else {
      // If no purchase history, recommend popular products
      recommendationQuery = {
        reviewCount: { $gt: 0 }
      };
    }
    
    // Get recommended products
    const recommendedProducts = await Product.find(recommendationQuery)
      .limit(parseInt(limit))
      .sort({ averageRating: -1, reviewCount: -1 })
      .populate('categoryId', 'name');
    
    res.status(200).json({
      success: true,
      count: recommendedProducts.length,
      data: recommendedProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};