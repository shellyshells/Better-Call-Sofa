# Better-Call-Sofa - Furniture E-Commerce Website

Better-Call-Sofa is a fully featured e-commerce website for furniture, built with vanilla JavaScript, HTML, and CSS for the frontend, and Express.js for the backend.

## Project Structure

```
better-call-sofa/
├── backend/
│   ├── config/
│   │   └── db.json
│   ├── controllers/
│   │   ├── cartController.js
│   │   ├── productController.js
│   │   └── wishlistController.js
│   ├── models/
│   │   ├── Cart.js
│   │   ├── Product.js
│   │   └── Wishlist.js
│   ├── public/
│   │   └── images/
│   ├── routes/
│   │   ├── cartRoutes.js
│   │   ├── productRoutes.js
│   │   └── wishlistRoutes.js
│   ├── app.js
│   ├── package.json
│   └── server.js
└── frontend/
    ├── assets/
    │   ├── css/
    │   ├── js/
    │   └── img/
    ├── pages/
    │   ├── cart.html
    │   ├── product-details.html
    │   └── wishlist.html
    └── index.html
```

## Features

- Product browsing with filters and sorting
- Product details page with image carousel
- Shopping cart with quantity management
- Wishlist with priority sorting (drag & drop)
- Checkout process with address search
- Responsive design for all devices
- Local storage for persistent data
- RESTful API for data handling

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Data Storage**: JSON files
- **Additional Libraries**: Font Awesome (for icons)

## Installation and Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd better-call-sofa/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```
   
   The server will run on http://localhost:3000

### Frontend Setup

The frontend is static HTML/CSS/JS and doesn't require installation. Simply open the `frontend/index.html` file in your browser or serve it using a static file server.

For development, you can use the Live Server extension in VS Code or any other static file server.

## API Endpoints

### Products API

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a product by ID
- `GET /api/products/search/query?query={query}` - Search products
- `GET /api/products/filter/options?{params}` - Filter products
- `GET /api/products/sort/options?sortBy={sortBy}` - Sort products
- `GET /api/products/:id/similar` - Get similar products

### Cart API

- `GET /api/cart` - Get cart contents
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:itemId` - Update item quantity
- `DELETE /api/cart/remove/:itemId` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart
- `POST /api/cart/checkout` - Checkout process

### Wishlist API

- `GET /api/wishlist` - Get wishlist contents
- `POST /api/wishlist/add` - Add item to wishlist
- `DELETE /api/wishlist/remove/:itemId` - Remove item from wishlist
- `PUT /api/wishlist/priority/:itemId` - Update item priority
- `GET /api/wishlist/sort` - Sort wishlist by priority
- `DELETE /api/wishlist/clear` - Clear wishlist

## Project Requirements

This project was developed according to the following requirements:

1. Showcase a catalog of at least 20 unique products
2. Each product must have:
   - ID, name, description (200-500 characters)
   - Stock quantity, price, discount percentage, currency
   - At least 2-3 images
   - At least 3 characteristics (including colors, sizes, material, etc.)
3. Display products with name, price, and image
4. Show second image on hover
5. Identify products on sale
6. Filter products by name and characteristics
7. Sort products by price (ascending and descending)
8. Show product details with features:
   - Description truncated to 150 characters with "read more" button
   - Display all product characteristics
   - Allow color selection
   - Image carousel with thumbnails
   - Add to cart functionality
   - Similar products recommendation
9. Stock management system
10. Shopping cart functionality
11. Address search and saving
12. Wishlist with priority sorting

## Notes

- The project uses client-side storage (localStorage) to persist cart and wishlist items between sessions
- No JavaScript frameworks were used as per requirements
- The backend uses Express.js for a lightweight server
- Product data is stored in JSON format on the backend

## License

This project is created for educational purposes only.