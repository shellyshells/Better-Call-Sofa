
# 🛋️ Better Call Sofa - E-commerce Furniture Store

---

A full-stack e-commerce platform for modern furniture, built with **Node.js/Express** backend and **vanilla HTML/CSS/JS** frontend.  
Features a product catalog, cart, wishlist, and checkout flow.

---

## 🚀 Getting Started

### Prerequisites

- Update your system (Linux recommended):  
  sudo apt update && sudo apt upgrade -y
- Install a code editor (e.g., VS Code).
- Install Git (Linux):  
  sudo apt install git  
  Verify installation: git --version

---

### Setup

1. Clone the repository:  
   git clone https://github.com/shellyshells/Better-Call-Sofa.git
   cd Better-Call-Sofa

2. Navigate to backend:  
   cd backend

3. Start the server (Node modules are pre-installed):  
   npm start

4. Open in your browser:  
   Visit 👉 http://localhost:3000

---

## 🛋️ Features

- **Product Catalog:** Filter/sort 20+ furniture items.
- **Shopping Cart:** Add/remove items with quantity control.
- **Wishlist:** Save favorites with priority sorting.
- **Checkout Flow:** Address selection and order confirmation.
- **Responsive Design:** Optimized for mobile, tablet, and desktop.

---


## Project Structure

```
better-call-sofa/
├── backend/
│   ├── config/
│   │   ├── cart.json
│   │   ├── db.json
│   │   └── wishlist.json
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
        ├── index.html
        ├── assets/
        │   ├── css/
        │   │   ├── cart.css
        │   │   ├── main.css
        │   │   ├── product.css
        │   │   ├── responsive.css
        │   │   └── wishlist.css
        │   └── js/
        │       ├── api.js
        │       ├── cart.js
        │       ├── main.js
        │       ├── product-details.js
        │       ├── products.js
        │       └── wishlist.js
        └── pages/
            ├── cart.html
            ├── product-details.html
            └── wishlist.html
```

---

### Error Handling

| Code | Status        | Response Format                         |
|:----:|:--------------|:----------------------------------------|
| 200  | OK            | { success: true, data: {} }             |
| 400  | Bad Request   | { success: false, message: "Error" }    |
| 500  | Server Error  | { success: false, message: "Error" }    |

---

## 🛠️ Troubleshooting

| Issue                    | Solution                                 |
|---------------------------|-----------------------------------------|
| Port 3000 in use          | kill -9 $(lsof -t -i:3000)               |
| Missing JSON data         | Check backend/data/ file permissions    |
| API returns 404           | Ensure server is running (npm start)    |
| Page not loading properly | Clear browser cache (Ctrl+Shift+R)      |

---

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

---

## 📄 License

This project is not licensed.

---