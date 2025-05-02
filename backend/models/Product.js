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

  getProductsByMaterial(material) {
    return this.products.filter(product => product.material === material);
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

  getFilteredProducts(filters) {
    let filteredProducts = this.products;
    
    // Category filter
    if (filters.category) {
      filteredProducts = filteredProducts.filter(product => 
        product.category === filters.category
      );
    }
    
    // Room type filter
    if (filters.roomType) {
      filteredProducts = filteredProducts.filter(product => 
        product.roomType === filters.roomType || 
        (typeof product.roomType === 'string' && product.roomType.includes(filters.roomType))
      );
    }
    
    // Color filter
    if (filters.color) {
      filteredProducts = filteredProducts.filter(product => 
        product.colors && product.colors.includes(filters.color)
      );
    }
    
    // Size filter
    if (filters.size) {
      filteredProducts = filteredProducts.filter(product => 
        product.sizes && product.sizes.includes(filters.size)
      );
    }
    
    // Material filter
    if (filters.material) {
      filteredProducts = filteredProducts.filter(product => 
        product.material === filters.material
      );
    }
    
    // Price filter
    if (filters.maxPrice) {
      filteredProducts = filteredProducts.filter(product => {
        const discountedPrice = product.price * (1 - product.discount / 100);
        return discountedPrice <= parseFloat(filters.maxPrice);
      });
    }
    
    // On sale filter
    if (filters.onSale === 'true') {
      filteredProducts = filteredProducts.filter(product => 
        product.discount > 0
      );
    }
    
    return filteredProducts;
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