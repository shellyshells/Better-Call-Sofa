const fs = require('fs');
const path = require('path');
const Product = require('./Product');

const wishlistPath = path.join(__dirname, '../config/wishlist.json');

class Wishlist {
  constructor() {
    this.items = this.loadWishlist();
  }

  loadWishlist() {
    try {
      if (fs.existsSync(wishlistPath)) {
        const rawData = fs.readFileSync(wishlistPath, 'utf8');
        return JSON.parse(rawData || '[]');
      }
      // Initialize empty wishlist if file doesn't exist
      this.saveWishlist([]);
      return [];
    } catch (error) {
      console.error('Error loading wishlist:', error);
      return [];
    }
  }

  saveWishlist() {
    try {
      fs.writeFileSync(wishlistPath, JSON.stringify(this.items || [], null, 2));
      return true;
    } catch (error) {
      console.error('Error saving wishlist:', error);
      return false;
    }
  }

  getWishlist() {
    return this.items;
  }

  addItem(productId) {
    const product = Product.getProductById(productId);
    
    if (!product) {
      return { success: false, message: 'Product not found' };
    }
    
    // Check if product already exists in wishlist
    const existingItem = this.items.find(item => item.productId === productId);
    
    if (existingItem) {
      return { success: false, message: 'Product already in wishlist' };
    }
    
    // Add new item to wishlist
    this.items.push({
      id: Date.now().toString(),
      productId,
      name: product.name,
      price: product.price,
      discount: product.discount,
      image: product.images[0],
      priority: this.items.length + 1 // Default priority based on order added
    });
    
    this.saveWishlist();
    return { success: true, wishlist: this.items };
  }
  
  removeItem(itemId) {
    const initialLength = this.items.length;
    this.items = this.items.filter(item => item.id !== itemId);
    
    if (initialLength === this.items.length) {
      return { success: false, message: 'Item not found in wishlist' };
    }
    
    this.saveWishlist();
    return { success: true, wishlist: this.items };
  }
  
  updatePriority(itemId, priority) {
    const item = this.items.find(item => item.id === itemId);
    
    if (!item) {
      return { success: false, message: 'Item not found in wishlist' };
    }
    
    item.priority = priority;
    this.saveWishlist();
    
    return { success: true, wishlist: this.items };
  }
  
  sortByPriority() {
    this.items.sort((a, b) => a.priority - b.priority);
    this.saveWishlist();
    return { success: true, wishlist: this.items };
  }
  
  clearWishlist() {
    this.items = [];
    this.saveWishlist();
    return { success: true, wishlist: this.items };
  }
}

module.exports = new Wishlist();