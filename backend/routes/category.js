const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category/categoryController');

// Public routes
router.get('/', categoryController.getCategories);
router.get('/slug/:slug', categoryController.getCategoryBySlug);
router.get('/:id', categoryController.getCategory);

// Routes for main categories and subcategories
router.get('/main', (req, res) => {
  req.query.mainOnly = 'true';
  categoryController.getCategories(req, res);
});
router.get('/sub/:parentId', (req, res) => {
  req.query.parent = req.params.parentId;
  categoryController.getCategories(req, res);
});

module.exports = router;