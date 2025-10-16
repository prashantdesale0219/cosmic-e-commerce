// Simple test controller
const testFunction = (req, res) => {
  res.status(200).json({ message: 'Test successful' });
};

module.exports = {
  testFunction
};