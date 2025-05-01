const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../config/db.json');

class Product {
  constructor() {
    this.products = this.loadProducts();
  }

  loadProducts() {
    try {
      const rawData = fs.readFileSync(dbPath);
      return JSON.parse(rawData);
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  }

  saveProducts() {
    try {
      fs.writeFileSync(dbPath, JSON.stringify(this.products, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving products:', error);
      return false;
    }
  }

  getAllProducts() {
    return this.products;
  }

  getProductById(id) {
    return this.products.find(product => product.id === id);
  }

  getProductsByCategory(category) {
    return this.products.filter(product => product.category === category);
  }

  getProductsByRoom(roomType) {
    return this.products.filter(product => product.roomType === roomType);
  }

  getProductsByColor(color) {
    return this.products.filter(product => product.colors.includes(color));
  }

  getProductsBySize(size) {
    return this.products.filter(product => product.sizes.includes(size));
  }

  getProductsOnSale() {
    return this.products.filter(product => product.discount > 0);
  }

  searchProducts(query) {
    query = query.toLowerCase();
    return this.products.filter(product => 
      product.name.toLowerCase().includes(query) || 
      product.description.toLowerCase().includes(query)
    );
  }

  updateStock(id, quantity) {
    const product = this.getProductById(id);
    if (!product) return false;

    if (product.stock >= quantity) {
      product.stock -= quantity;
      this.saveProducts();
      return true;
    }
    return false;
  }
}

module.exports = new Product();