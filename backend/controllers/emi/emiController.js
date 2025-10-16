const EMI = require('../../models/emi/emi');
const Product = require('../../models/products/product');

// Calculate monthly installment
const calculateMonthlyInstallment = (productPrice, durationMonths, interestRate) => {
  // Convert annual interest rate to monthly
  const monthlyInterestRate = interestRate / 12 / 100;
  
  // Calculate total amount with interest
  const totalAmount = productPrice * (1 + (interestRate / 100) * (durationMonths / 12));
  
  // Calculate monthly installment
  return totalAmount / durationMonths;
};

// Create a new EMI plan
exports.createEMI = async (req, res) => {
  try {
    const { productId, durationMonths, interestRate } = req.body;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Calculate monthly installment
    const monthlyInstallment = calculateMonthlyInstallment(
      product.price,
      durationMonths,
      interestRate
    );
    
    // Create new EMI plan
    const emi = new EMI({
      productId,
      durationMonths,
      interestRate,
      monthlyInstallment
    });
    
    await emi.save();
    
    res.status(201).json({ success: true, data: emi });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all EMI plans with filtering options
exports.getEMIs = async (req, res) => {
  try {
    const { productId, isActive } = req.query;
    
    // Build query based on filters
    const query = {};
    
    if (productId) query.productId = productId;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const emis = await EMI.find(query).populate('productId', 'name price images');
    
    res.status(200).json({ success: true, count: emis.length, data: emis });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get a single EMI plan
exports.getEMI = async (req, res) => {
  try {
    const emi = await EMI.findById(req.params.id).populate('productId', 'name price images');
    
    if (!emi) {
      return res.status(404).json({ success: false, message: 'EMI plan not found' });
    }
    
    res.status(200).json({ success: true, data: emi });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get EMI plans for a specific product
exports.getProductEMIs = async (req, res) => {
  try {
    const productId = req.params.productId;
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    // Get active EMI plans for the product
    const emis = await EMI.find({ 
      productId, 
      isActive: true
    });
    
    res.status(200).json({ success: true, count: emis.length, data: emis });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update an EMI plan
exports.updateEMI = async (req, res) => {
  try {
    const { durationMonths, interestRate, isActive } = req.body;
    
    // Find EMI plan and update
    let emi = await EMI.findById(req.params.id);
    
    if (!emi) {
      return res.status(404).json({ success: false, message: 'EMI plan not found' });
    }
    
    // Get product for price calculation if needed
    let product;
    if (durationMonths || interestRate) {
      product = await Product.findById(emi.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: 'Associated product not found' });
      }
    }
    
    // Update fields
    if (durationMonths) emi.durationMonths = durationMonths;
    if (interestRate) emi.interestRate = interestRate;
    if (isActive !== undefined) emi.isActive = isActive;
    
    // Recalculate monthly installment if needed
    if (durationMonths || interestRate) {
      emi.monthlyInstallment = calculateMonthlyInstallment(
        product.price,
        emi.durationMonths,
        emi.interestRate
      );
    }
    
    await emi.save();
    
    res.status(200).json({ success: true, data: emi });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete an EMI plan
exports.deleteEMI = async (req, res) => {
  try {
    const emi = await EMI.findById(req.params.id);
    
    if (!emi) {
      return res.status(404).json({ success: false, message: 'EMI plan not found' });
    }
    
    await emi.deleteOne();
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};