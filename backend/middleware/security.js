const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

// Security middleware setup
const setupSecurity = (app) => {
  // Set security HTTP headers
  app.use(helmet());
  
  // Enable CORS
  app.use(cors());
  
  // Prevent XSS attacks
  app.use(xss());
  
  // Prevent HTTP Parameter Pollution
  app.use(hpp());
  
  return app;
};

module.exports = { setupSecurity };