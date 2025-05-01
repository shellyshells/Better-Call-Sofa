const fs = require('fs');
const path = require('path');
const Product = require('./Product');

const cartPath = path.join(__dirname, '../config/cart.json');

class Cart {
  constructor() {
    this.items = this.loadCart();
  }

  loadCart() {
    try {
      if (fs.existsSync(cartPath)) {
        const rawData = fs.readFileSync(cartPath, 'utf8');
        return JSON.parse(rawData || '[]');
      }
      // Initialize empty cart if file doesn't exist
      this.saveCart([]);
      return [];
    } catch (error) {
      console.error('Error loading cart:', error);
      return [];
    }
  }

  saveCart() {
    try {
      fs.writeFileSync(cartPath, JSON.stringify(this.items || [], null, 2));
      return true;
    } catch (error) {
      console.error('Error saving cart:', error);
      return false;
    }
  }

  getCart() {
    return this.items;
  }

  addItem(productId, quantity = 1, selectedColor, selectedSize) {
    const product = Product.getProductById(productId);
    
    if (!product || product.stock < quantity) {
      return { success: false, message: 'Product not available in this quantity' };
    }
    
    // Check if product already exists in cart
    const existingItem = this.items.find(item => 
      item.productId === productId && 
      item.color === selectedColor && 
      item.size === selectedSize
    );
    
    if (existingItem) {
      // Update quantity if product already in cart
      existingItem.quantity += quantity;
    } else {
      // Add new item to cart
      this.items.push({
        id: Date.now().toString(),
        productId,
        name: product.name,
        price: product.price,
        discount: product.discount,
        image: product.images[0],
        quantity,
        color: selectedColor || product.colors[0],
        size: selectedSize || product.sizes[0]
      });
    }
    
    this.saveCart();
    return { success: true, cart: this.items };
  }
  
  updateItem(itemId, quantity) {
    const itemIndex = this.items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      return { success: false, message: 'Item not found in cart' };
    }
    
    const productId = this.items[itemIndex].productId;
    const product = Product.getProductById(productId);
    
    if (!product || product.stock < quantity) {
      return { success: false, message: 'Requested quantity not available' };
    }
    
    this.items[itemIndex].quantity = quantity;
    this.saveCart();
    
    return { success: true, cart: this.items };
  }
  
  removeItem(itemId) {
    const initialLength = this.items.length;
    this.items = this.items.filter(item => item.id !== itemId);
    
    if (initialLength === this.items.length) {
      return { success: false, message: 'Item not found in cart' };
    }
    
    this.saveCart();
    return { success: true, cart: this.items };
  }
  
  clearCart() {
    this.items = [];
    this.saveCart();
    return { success: true, cart: this.items };
  }
  
  checkout(shippingAddress) {
    // In a real app, this would process payment and create an order
    // For this project, we'll just update stock and clear the cart
    
    // Check if all items are available in requested quantities
    for (const item of this.items) {
      const product = Product.getProductById(item.productId);
      if (!product || product.stock < item.quantity) {
        return { 
          success: false, 
          message: `Not enough stock for ${item.name}`
        };
      }
    }
    
    // Update stock for all products
    for (const item of this.items) {
      Product.updateStock(item.productId, item.quantity);
    }
    
    // Clear cart after successful checkout
    this.clearCart();
    
    return { 
      success: true, 
      message: 'Order placed successfully',
      shippingAddress
    };
  }
  
  getTotal() {
    return this.items.reduce((total, item) => {
      const discountedPrice = item.price * (1 - item.discount / 100);
      return total + (discountedPrice * item.quantity);
    }, 0);
  }
}

module.exports = new Cart();