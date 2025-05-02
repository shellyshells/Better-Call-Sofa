const Product = require('../models/Product');

// Get all products
exports.getAllProducts = (req, res) => {
  const products = Product.getAllProducts();
  res.status(200).json(products);
};

// Get a product by ID
exports.getProductById = (req, res) => {
  const { id } = req.params;
  const product = Product.getProductById(id);
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  res.status(200).json(product);
};

// Search products
exports.searchProducts = (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }
  
  const products = Product.searchProducts(query);
  res.status(200).json(products);
};

// Filter products
exports.filterProducts = (req, res) => {
  const { category, roomType, color, size, onSale } = req.query;
  let filteredProducts = Product.getAllProducts();
  
  if (category) {
    filteredProducts = filteredProducts.filter(product => 
      product.category === category
    );
  }
  
  if (roomType) {
    filteredProducts = filteredProducts.filter(product => 
      product.roomType === roomType
    );
  }
  
  if (color) {
    filteredProducts = filteredProducts.filter(product => 
      product.colors.includes(color)
    );
  }
  
  if (size) {
    filteredProducts = filteredProducts.filter(product => 
      product.sizes.includes(size)
    );
  }
  
  if (onSale === 'true') {
    filteredProducts = filteredProducts.filter(product => 
      product.discount > 0
    );
  }
  
  res.status(200).json(filteredProducts);
};

// Sort products
exports.sortProducts = (req, res) => {
  const { sortBy } = req.query;
  let products = Product.getAllProducts();
  
  if (sortBy === 'price-asc') {
    products.sort((a, b) => {
      const priceA = a.price * (1 - a.discount / 100);
      const priceB = b.price * (1 - b.discount / 100);
      return priceA - priceB;
    });
  } else if (sortBy === 'price-desc') {
    products.sort((a, b) => {
      const priceA = a.price * (1 - a.discount / 100);
      const priceB = b.price * (1 - b.discount / 100);
      return priceB - priceA;
    });
  } else if (sortBy === 'name-asc') {
    products.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'name-desc') {
    products.sort((a, b) => b.name.localeCompare(a.name));
  }
  
  res.status(200).json(products);
};

// Get similar products
exports.getSimilarProducts = (req, res) => {
  const { id } = req.params;
  const product = Product.getProductById(id);
  
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  
  // Find products in the same category or room type
  let similarProducts = Product.getAllProducts().filter(p => 
    (p.id !== id) && (p.category === product.category || p.roomType === product.roomType)
  );
  
  // Limit to 4 similar products
  similarProducts = similarProducts.slice(0, 4);
  
  res.status(200).json(similarProducts);
};