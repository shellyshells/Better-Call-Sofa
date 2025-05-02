
const Cart = require('../models/Cart');

// Get cart
exports.getCart = (req, res) => {
  const cart = Cart.getCart();
  const total = Cart.getTotal();
  
  res.status(200).json({
    items: cart,
    total: total
  });
};

// Add item to cart
exports.addItem = (req, res) => {
  const { productId, quantity, color, size } = req.body;
  
  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }
  
  const result = Cart.addItem(productId, quantity || 1, color, size);
  
  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }
  
  res.status(200).json({
    message: 'Item added to cart',
    cart: result.cart,
    total: Cart.getTotal()
  });
};

// Update item quantity
exports.updateItem = (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  
  if (!quantity || quantity < 1) {
    return res.status(400).json({ message: 'Valid quantity is required' });
  }
  
  const result = Cart.updateItem(itemId, quantity);
  
  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }
  
  res.status(200).json({
    message: 'Cart updated',
    cart: result.cart,
    total: Cart.getTotal()
  });
};

// Remove item from cart
exports.removeItem = (req, res) => {
  const { itemId } = req.params;
  
  const result = Cart.removeItem(itemId);
  
  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }
  
  res.status(200).json({
    message: 'Item removed from cart',
    cart: result.cart,
    total: Cart.getTotal()
  });
};

// Clear cart
exports.clearCart = (req, res) => {
  const result = Cart.clearCart();
  
  res.status(200).json({
    message: 'Cart cleared',
    cart: result.cart,
    total: 0
  });
};

// Checkout
exports.checkout = (req, res) => {
  const { shippingAddress } = req.body;
  
  if (!shippingAddress) {
    return res.status(400).json({ message: 'Shipping address is required' });
  }
  
  const result = Cart.checkout(shippingAddress);
  
  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }
  
  res.status(200).json({
    message: result.message,
    order: {
      shippingAddress: result.shippingAddress,
      date: new Date().toISOString()
    }
  });
};