const EmiOption = require('../../models/emi/emiOption');

// Get all EMI options
exports.getEmiOptions = async (req, res) => {
  try {
    const emiOptions = await EmiOption.find();
    res.status(200).json({ success: true, count: emiOptions.length, data: emiOptions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create a new EMI option
exports.createEmiOption = async (req, res) => {
  try {
    const { months, interestRate, minAmount, isActive } = req.body;
    
    const emiOption = new EmiOption({
      months,
      interestRate,
      minAmount,
      isActive: isActive !== undefined ? isActive : true
    });
    
    await emiOption.save();
    
    res.status(201).json({ success: true, data: emiOption });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get a single EMI option
exports.getEmiOption = async (req, res) => {
  try {
    const emiOption = await EmiOption.findById(req.params.id);
    
    if (!emiOption) {
      return res.status(404).json({ success: false, message: 'EMI option not found' });
    }
    
    res.status(200).json({ success: true, data: emiOption });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update an EMI option
exports.updateEmiOption = async (req, res) => {
  try {
    const { months, interestRate, minAmount, isActive } = req.body;
    
    let emiOption = await EmiOption.findById(req.params.id);
    
    if (!emiOption) {
      return res.status(404).json({ success: false, message: 'EMI option not found' });
    }
    
    // Update fields
    if (months !== undefined) emiOption.months = months;
    if (interestRate !== undefined) emiOption.interestRate = interestRate;
    if (minAmount !== undefined) emiOption.minAmount = minAmount;
    if (isActive !== undefined) emiOption.isActive = isActive;
    
    await emiOption.save();
    
    res.status(200).json({ success: true, data: emiOption });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete an EMI option
exports.deleteEmiOption = async (req, res) => {
  try {
    const emiOption = await EmiOption.findById(req.params.id);
    
    if (!emiOption) {
      return res.status(404).json({ success: false, message: 'EMI option not found' });
    }
    
    await emiOption.deleteOne();
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};