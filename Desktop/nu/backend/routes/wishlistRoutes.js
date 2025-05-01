const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');

// GET wishlist
router.get('/', wishlistController.getWishlist);

// POST add item to wishlist
router.post('/add', wishlistController.addItem);

// DELETE remove item from wishlist
router.delete('/remove/:itemId', wishlistController.removeItem);

// PUT update item priority
router.put('/priority/:itemId', wishlistController.updatePriority);

// GET sort wishlist by priority
router.get('/sort', wishlistController.sortByPriority);

// DELETE clear wishlist
router.delete('/clear', wishlistController.clearWishlist);

module.exports = router;