const app = require('./app');
const fs = require('fs');
const path = require('path');

// Create config directory if it doesn't exist
const configDir = path.join(__dirname, 'config');
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir);
}

// Ensure cart.json and wishlist.json exist
const cartPath = path.join(configDir, 'cart.json');
if (!fs.existsSync(cartPath)) {
  fs.writeFileSync(cartPath, '[]');
}

const wishlistPath = path.join(configDir, 'wishlist.json');
if (!fs.existsSync(wishlistPath)) {
  fs.writeFileSync(wishlistPath, '[]');
}

// Copy db.json from project root if it doesn't exist in config
const dbSourcePath = path.join(__dirname, 'db.json');
const dbDestPath = path.join(configDir, 'db.json');
if (!fs.existsSync(dbDestPath) && fs.existsSync(dbSourcePath)) {
  fs.copyFileSync(dbSourcePath, dbDestPath);
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the website`);
});