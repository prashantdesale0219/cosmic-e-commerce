const Offer = require('../../models/offers/offer');
const Product = require('../../models/products/product');

// Create a new offer
exports.createOffer = async (req, res) => {
  try {
    const { productId, title, description, discountType, discountValue, startDate, endDate, isActive } = req.body;
    
    // Check if product exists (only if productId is provided)
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
    }
    
    // Create new offer
    const offer = new Offer({
      productId: productId || null, // Allow null for global offers
      title,
      description,
      discountType,
      discountValue,
      startDate: startDate || new Date(),
      endDate,
      isActive: isActive !== undefined ? isActive : true
    });
    
    await offer.save();
    
    res.status(201).json({ success: true, data: offer });
  } catch (error) {
    if (error.message === 'Only one active offer allowed per product') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all offers with filtering options
exports.getOffers = async (req, res) => {
  try {
    const { productId, isActive, startDate, endDate } = req.query;
    
    // Build query based on filters
    const query = {};
    
    if (productId) query.productId = productId;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    // Date range filter
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.endDate = { $lte: new Date(endDate) };
    }
    
    const offers = await Offer.find(query).populate('productId', 'name price images');
    
    res.status(200).json({ success: true, count: offers.length, data: offers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get a single offer
exports.getOffer = async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate('productId', 'name price images');
    
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    
    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get offers for a specific product
exports.getProductOffers = async (req, res) => {
  try {
    const productId = req.params.productId;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Get active offers for the product
    const offers = await Offer.find({ 
      productId, 
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });
    
    res.status(200).json({ success: true, count: offers.length, data: offers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update an offer
exports.updateOffer = async (req, res) => {
  try {
    const { title, description, discountType, discountValue, startDate, endDate, isActive } = req.body;
    
    // Find offer and update
    let offer = await Offer.findById(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    
    // Update fields
    if (title) offer.title = title;
    if (description !== undefined) offer.description = description;
    if (discountType) offer.discountType = discountType;
    if (discountValue) offer.discountValue = discountValue;
    if (startDate) offer.startDate = startDate;
    if (endDate) offer.endDate = endDate;
    if (isActive !== undefined) offer.isActive = isActive;
    
    await offer.save();
    
    res.status(200).json({ success: true, data: offer });
  } catch (error) {
    if (error.message === 'Only one active offer allowed per product') {
      return res.status(400).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete an offer
exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found' });
    }
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get offer statistics
exports.getOfferStats = async (req, res) => {
  try {
    // Get total count of offers
    const totalOffers = await Offer.countDocuments();
    
    // Get count of active offers
    const activeOffers = await Offer.countDocuments({ 
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });
    
    // Get count of expired offers
    const expiredOffers = await Offer.countDocuments({
      endDate: { $lt: new Date() }
    });
    
    // Get count of upcoming offers
    const upcomingOffers = await Offer.countDocuments({
      startDate: { $gt: new Date() }
    });
    
    // Get count of global offers (no productId)
    const globalOffers = await Offer.countDocuments({
      productId: null
    });
    
    // Get count of product-specific offers
    const productSpecificOffers = await Offer.countDocuments({
      productId: { $ne: null }
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalOffers,
        activeOffers,
        expiredOffers,
        upcomingOffers,
        globalOffers,
        productSpecificOffers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};