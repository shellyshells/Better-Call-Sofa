const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// GET cart
router.get('/', cartController.getCart);

// POST add item to cart
router.post('/add', cartController.addItem);

// PUT update item quantity
router.put('/update/:itemId', cartController.updateItem);

// DELETE remove item from cart
router.delete('/remove/:itemId', cartController.removeItem);

// DELETE clear cart
router.delete('/clear', cartController.clearCart);

// POST checkout
router.post('/checkout', cartController.checkout);

module.exports = router;