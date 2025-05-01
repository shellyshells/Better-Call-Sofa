const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET all products
router.get('/', productController.getAllProducts);

// GET a product by ID
router.get('/:id', productController.getProductById);

// GET search products
router.get('/search/query', productController.searchProducts);

// GET filter products
router.get('/filter/options', productController.filterProducts);

// GET sort products
router.get('/sort/options', productController.sortProducts);

// GET similar products
router.get('/:id/similar', productController.getSimilarProducts);

module.exports = router;