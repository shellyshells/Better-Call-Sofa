const Wishlist = require('../models/Wishlist');

// Get wishlist
exports.getWishlist = (req, res) => {
  const wishlist = Wishlist.getWishlist();
  res.status(200).json(wishlist);
};

// Add item to wishlist
exports.addItem = (req, res) => {
  const { productId } = req.body;
  
  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }
  
  const result = Wishlist.addItem(productId);
  
  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }
  
  res.status(200).json({
    message: 'Item added to wishlist',
    wishlist: result.wishlist
  });
};

// Remove item from wishlist
exports.removeItem = (req, res) => {
  const { itemId } = req.params;
  
  const result = Wishlist.removeItem(itemId);
  
  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }
  
  res.status(200).json({
    message: 'Item removed from wishlist',
    wishlist: result.wishlist
  });
};

// Update item priority
exports.updatePriority = (req, res) => {
  const { itemId } = req.params;
  const { priority } = req.body;
  
  if (!priority || isNaN(priority)) {
    return res.status(400).json({ message: 'Valid priority number is required' });
  }
  
  const result = Wishlist.updatePriority(itemId, Number(priority));
  
  if (!result.success) {
    return res.status(400).json({ message: result.message });
  }
  
  res.status(200).json({
    message: 'Wishlist priority updated',
    wishlist: result.wishlist
  });
};

// Sort wishlist by priority
exports.sortByPriority = (req, res) => {
  const result = Wishlist.sortByPriority();
  
  res.status(200).json({
    message: 'Wishlist sorted by priority',
    wishlist: result.wishlist
  });
};

// Clear wishlist
exports.clearWishlist = (req, res) => {
  const result = Wishlist.clearWishlist();
  
  res.status(200).json({
    message: 'Wishlist cleared',
    wishlist: result.wishlist
  });
};