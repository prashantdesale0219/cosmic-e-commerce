const Product = require('../../models/products/product');
const Category = require('../../models/category/category');
const { logError } = require('../notifications/notificationController');
const slugify = require('slugify');
const fs = require('fs');
const path = require('path');

// Get all products with filtering and pagination
exports.getAllProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category,
      status,
      search,
      tags,
      systemCapacity,
      installationType,
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
    
    // Search by name, description, or features
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { features: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
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
    
    // Check if the parameter is a valid ObjectId or a slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let product;
    if (isObjectId) {
      product = await Product.findById(id).populate('categoryId');
    } else {
      // If not an ObjectId, try to find by slug
      product = await Product.findOne({ slug: id }).populate('categoryId');
    }
    
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
      sku,
      features,
      highlights,
      oldPrice,
      mrp,
      tags,
      technical,
      installation,
      legal,
      isActive,
      offers,
      applications,
      warrantyDetails,
      documentation,
      // New fields for size and quantity
      size,
      availableSizes,
      defaultQuantity,
      maxOrderQuantity
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
        imageUrls.push(`http://localhost:8000/uploads/products/${file.filename}`);
      });
    }

    // Generate slug from name
    const slug = slugify(name, { lower: true, strict: true });

    // Parse JSON strings if they exist
    let parsedTechnical, parsedInstallation, parsedLegal, parsedTags, parsedHighlights, parsedOffers, parsedApplications, parsedWarrantyDetails, parsedDocumentation;
    
    try {
      // Handle technical data - could be string, object, or "[object Object]"
      if (technical) {
        if (typeof technical === 'string') {
          if (technical === '[object Object]') {
            parsedTechnical = {};
          } else {
            try {
              parsedTechnical = JSON.parse(technical);
            } catch (e) {
              parsedTechnical = {};
            }
          }
        } else {
          parsedTechnical = technical;
        }
      } else {
        parsedTechnical = {};
      }
      
      // Handle installation data
      if (installation) {
        if (typeof installation === 'string') {
          if (installation === '[object Object]') {
            parsedInstallation = {};
          } else {
            try {
              parsedInstallation = JSON.parse(installation);
            } catch (e) {
              parsedInstallation = {};
            }
          }
        } else {
          parsedInstallation = installation;
        }
      } else {
        parsedInstallation = {};
      }
      
      // Handle legal data
      if (legal) {
        if (typeof legal === 'string') {
          if (legal === '[object Object]') {
            parsedLegal = {};
          } else {
            try {
              parsedLegal = JSON.parse(legal);
            } catch (e) {
              parsedLegal = {};
            }
          }
        } else {
          parsedLegal = legal;
        }
      } else {
        parsedLegal = {};
      }
      
      // Handle tags - could be string, array, or comma-separated values
      if (tags) {
        if (typeof tags === 'string') {
          if (tags === '[object Object]') {
            parsedTags = [];
          } else if (tags.startsWith('[') && tags.endsWith(']')) {
            try {
              parsedTags = JSON.parse(tags);
            } catch (e) {
              parsedTags = tags.split(',').map(tag => tag.trim());
            }
          } else {
            parsedTags = tags.split(',').map(tag => tag.trim());
          }
        } else if (Array.isArray(tags)) {
          parsedTags = tags;
        } else {
          parsedTags = [];
        }
      } else {
        parsedTags = [];
      }
      
      // Handle new fields
      if (highlights) {
        parsedHighlights = typeof highlights === 'string' ? JSON.parse(highlights) : highlights;
      }
      
      if (offers) {
        parsedOffers = typeof offers === 'string' ? JSON.parse(offers) : offers;
      }
      
      if (applications) {
        parsedApplications = typeof applications === 'string' ? JSON.parse(applications) : applications;
      }
      
      if (warrantyDetails) {
        parsedWarrantyDetails = typeof warrantyDetails === 'string' ? JSON.parse(warrantyDetails) : warrantyDetails;
      }
      
      if (documentation) {
        parsedDocumentation = typeof documentation === 'string' ? JSON.parse(documentation) : documentation;
      }
    } catch (error) {
      console.error('Error parsing JSON data:', error);
      return res.status(400).json({ success: false, message: 'Invalid JSON data in request' });
    }
    
    // Calculate discount percentage if oldPrice is provided
    let discountPercent;
    if (oldPrice && price && Number(oldPrice) > Number(price)) {
      discountPercent = Math.round(((Number(oldPrice) - Number(price)) / Number(oldPrice)) * 100);
    }
    
    const product = new Product({
      name,
      slug,
      sku: sku || `PROD-${Date.now()}`,
      description,
      features,
      highlights: parsedHighlights,
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      mrp: mrp ? Number(mrp) : undefined,
      discountPercent,
      stock: Number(stock),
      categoryId,
      tags: parsedTags,
      images: imageUrls.length > 0 ? imageUrls : (images || []),
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
      isActive: isActive !== undefined ? isActive : true,
      // Add new size and quantity fields
      size: size || 'Pack of 1',
      availableSizes: availableSizes ? (Array.isArray(availableSizes) ? availableSizes : JSON.parse(availableSizes)) : ['Pack of 1'],
      defaultQuantity: defaultQuantity ? Number(defaultQuantity) : 1,
      maxOrderQuantity: maxOrderQuantity ? Number(maxOrderQuantity) : 100
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
      sku,
      features,
      highlights,
      oldPrice,
      mrp,
      tags,
      technical,
      installation,
      legal,
      isActive,
      offers,
      applications,
      warrantyDetails,
      documentation,
      // New fields for size and quantity
      size,
      availableSizes,
      defaultQuantity,
      maxOrderQuantity
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

    // Generate slug if name is provided
    if (name) {
      updateData.name = name;
      updateData.slug = slugify(name, { lower: true, strict: true });
    }

    if (sku) updateData.sku = sku;
    if (description) updateData.description = description;
    if (features) updateData.features = features;
    if (price) updateData.price = Number(price);
    if (oldPrice) updateData.oldPrice = Number(oldPrice);
    if (mrp) updateData.mrp = Number(mrp);
    if (stock !== undefined) updateData.stock = Number(stock);
    
    // Add size and quantity fields if provided
    if (size) updateData.size = size;
    if (availableSizes) {
      updateData.availableSizes = typeof availableSizes === 'string' ? JSON.parse(availableSizes) : availableSizes;
    }
    if (defaultQuantity) updateData.defaultQuantity = Number(defaultQuantity);
    if (maxOrderQuantity) updateData.maxOrderQuantity = Number(maxOrderQuantity);
    
    // Parse JSON strings if they exist
    if (technical) {
      updateData.technical = typeof technical === 'string' ? JSON.parse(technical) : technical;
    }
    
    if (installation) {
      updateData.installation = typeof installation === 'string' ? JSON.parse(installation) : installation;
    }
    
    if (legal) {
      updateData.legal = typeof legal === 'string' ? JSON.parse(legal) : legal;
    }
    
    if (tags) {
      updateData.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    }
    
    // Handle new fields
    if (highlights) {
      updateData.highlights = typeof highlights === 'string' ? JSON.parse(highlights) : highlights;
    }
    
    if (offers) {
      updateData.offers = typeof offers === 'string' ? JSON.parse(offers) : offers;
    }
    
    if (applications) {
      updateData.applications = typeof applications === 'string' ? JSON.parse(applications) : applications;
    }
    
    if (warrantyDetails) {
      updateData.warrantyDetails = typeof warrantyDetails === 'string' ? JSON.parse(warrantyDetails) : warrantyDetails;
    }
    
    if (documentation) {
      updateData.documentation = typeof documentation === 'string' ? JSON.parse(documentation) : documentation;
    }
    
    // Process uploaded images if any
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        // Add full URL prefix to make it a valid URL for the model validation
        imageUrls.push(`http://localhost:8000/uploads/products/${file.filename}`);
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
    
    // Calculate discount percentage if oldPrice and price are provided
    if (oldPrice && price && Number(oldPrice) > Number(price)) {
      updateData.discountPercent = Math.round(((Number(oldPrice) - Number(price)) / Number(oldPrice)) * 100);
    }
    
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
          _id: '$categoryId',
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

    // Get products by system capacity
    const productsByCapacity = await Product.aggregate([
      {
        $match: { 'technical.systemCapacityKw': { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: '$technical.systemCapacityKw',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          capacity: '$_id',
          count: 1
        }
      },
      {
        $sort: { capacity: 1 }
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
        productsByCategory,
        productsByCapacity
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

// Toggle active status of a product
exports.toggleActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Toggle the active status
    product.isActive = !product.isActive;
    await product.save();
    
    res.status(200).json({
      success: true,
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
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
    const products = await Product.find().populate('categoryId');
    
    if (!products || products.length === 0) {
      return res.status(404).json({ success: false, message: 'No products found to export' });
    }
    
    // Format products for export
    const formattedProducts = products.map(product => ({
      ID: product._id,
      SKU: product.sku || '',
      Name: product.name,
      Slug: product.slug || '',
      Description: product.description,
      Price: product.price,
      OldPrice: product.oldPrice || '',
      MRP: product.mrp || '',
      Stock: product.stock,
      Category: product.categoryId ? product.categoryId.name : 'Uncategorized',
      Tags: product.tags ? product.tags.join(', ') : '',
      SystemCapacity: product.technical && product.technical.systemCapacityKw ? product.technical.systemCapacityKw + ' kW' : '',
      InstallationType: product.installation && product.installation.installationType ? product.installation.installationType : '',
      Status: product.isActive ? 'Active' : 'Inactive',
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

// Upload product documentation (Installation Guide or Data Sheet)
exports.uploadDocumentation = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType } = req.query; // 'installationGuide' or 'dataSheet'
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    if (!['installationGuide', 'dataSheet'].includes(documentType)) {
      return res.status(400).json({ success: false, message: 'Invalid document type. Must be installationGuide or dataSheet' });
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Initialize documentation object if it doesn't exist
    if (!product.documentation) {
      product.documentation = {
        installationGuide: null,
        dataSheet: null
      };
    }
    
    // Set the file path in the product model
    product.documentation[documentType] = `/uploads/documents/${req.file.filename}`;
    await product.save();
    
    res.status(200).json({
      success: true,
      message: `${documentType === 'installationGuide' ? 'Installation Guide' : 'Data Sheet'} uploaded successfully`,
      data: {
        documentUrl: product.documentation[documentType]
      }
    });
  } catch (error) {
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Download product documentation
exports.downloadDocumentation = async (req, res) => {
  try {
    const { id } = req.params;
    const { documentType } = req.query; // 'installationGuide' or 'dataSheet'
    
    if (!['installationGuide', 'dataSheet'].includes(documentType)) {
      return res.status(400).json({ success: false, message: 'Invalid document type. Must be installationGuide or dataSheet' });
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    if (!product.documentation || !product.documentation[documentType]) {
      return res.status(404).json({ 
        success: false, 
        message: `No ${documentType === 'installationGuide' ? 'Installation Guide' : 'Data Sheet'} found for this product` 
      });
    }
    
    // Get the file path from the product model
    const filePath = product.documentation[documentType];
    // Remove the leading slash if present
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    // Get the absolute path to the file
    const absolutePath = path.join(process.cwd(), cleanPath);
    
    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ 
        success: false, 
        message: `${documentType === 'installationGuide' ? 'Installation Guide' : 'Data Sheet'} file not found` 
      });
    }
    
    // Set the appropriate content type for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${product.name}-${documentType === 'installationGuide' ? 'Installation-Guide' : 'Data-Sheet'}.pdf`);
    
    // Stream the file to the response
    const fileStream = fs.createReadStream(absolutePath);
    fileStream.pipe(res);
    
  } catch (error) {
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get products by tag
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
    await logError(error, req);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};