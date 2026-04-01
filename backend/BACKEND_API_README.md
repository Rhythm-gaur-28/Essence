# 🌸 Brand Essence — Backend API Documentation

> A multi-brand perfume e-commerce platform. Built with Node.js, Express, MySQL, and Sequelize.

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MySQL |
| ORM | Sequelize |
| Auth | JWT (jsonwebtoken) |
| Password Hashing | bcryptjs |
| File Uploads | Multer |
| Env Config | dotenv |

---

## 🚀 Quick Start (with Docker)

### Prerequisites
- Docker & Docker Compose installed
- Node.js 16+ (for running the Node.js server locally)

### Setup Steps

1. **Start MySQL Container**
   ```bash
   docker-compose up -d
   ```
   This starts:
   - **MySQL**: Port 3306 (accessible at `127.0.0.1:3306`)
   - **phpMyAdmin**: Port 8081 (accessible at `http://localhost:8081`)

2. **Login to phpMyAdmin** (optional, for database visualization)
   - URL: `http://localhost:8081`
   - User: `essence_user`
   - Password: `essence_password`

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Seed Database with Dummy Data** (Optional but recommended)
   ```bash
   npm run seed
   ```
   This populates 15 products, 5 brands, test users, reviews, coupons, and banners.
   See [SEEDING_GUIDE.md](./SEEDING_GUIDE.md) for details.

5. **Run the Backend Server**
   ```bash
   npm run dev
   ```
   Server runs at `http://localhost:5000`

6. **Verify Connection**
   - Check that the server starts without database errors
   - Make a test request: `GET http://localhost:5000/api/products`

### Stop Containers
```bash
docker-compose down
```

### Reset Database (Remove Volumes)
```bash
docker-compose down -v
```

### Database Connection Details
| Property | Value |
|----------|-------|
| Host | `127.0.0.1` |
| Port | `3306` |
| User | `essence_user` |
| Password | `essence_password` |
| Database | `essence_db` |

⚠️ **Local Only**: These containers are configured for localhost access only (port binding only on 127.0.0.1).

---

## ⚙️ Environment Variables (.env)

```env
PORT=5000
DB_HOST=127.0.0.1
DB_USER=essence_user
DB_PASSWORD=essence_password
DB_NAME=essence_db
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

**Note**: When using Docker Compose, these values match the `docker-compose.yml` configuration. For production, change `JWT_SECRET` and database credentials.

---

## 🗄️ Database Schema

### Table: `users`
| Column | Type | Notes |
|--------|------|-------|
| id | INT (PK, AI) | |
| name | VARCHAR(100) | |
| email | VARCHAR(150) | UNIQUE |
| password | VARCHAR(255) | bcrypt hashed |
| role | ENUM('user','admin') | default: 'user' |
| created_at | TIMESTAMP | |

### Table: `brands`
| Column | Type | Notes |
|--------|------|-------|
| id | INT (PK, AI) | |
| name | VARCHAR(100) | |
| logo_url | VARCHAR(255) | |
| description | TEXT | |
| country | VARCHAR(100) | e.g. India, France |

### Table: `categories`
| Column | Type | Notes |
|--------|------|-------|
| id | INT (PK, AI) | |
| name | VARCHAR(100) | e.g. Men, Women, Unisex |
| image_url | VARCHAR(255) | |

### Table: `products`
| Column | Type | Notes |
|--------|------|-------|
| id | INT (PK, AI) | |
| name | VARCHAR(150) | |
| brand_id | INT (FK → brands) | |
| category_id | INT (FK → categories) | |
| description | TEXT | |
| scent_family | ENUM('floral','woody','oriental','fresh','gourmand') | |
| top_notes | VARCHAR(255) | |
| middle_notes | VARCHAR(255) | |
| base_notes | VARCHAR(255) | |
| price | DECIMAL(10,2) | in ₹ |
| discount_price | DECIMAL(10,2) | nullable |
| stock | INT | |
| size_ml | INT | e.g. 50, 100, 200 |
| image_url | VARCHAR(255) | |
| is_featured | BOOLEAN | default: false |
| is_new_arrival | BOOLEAN | default: false |
| created_at | TIMESTAMP | |

### Table: `cart`
| Column | Type | Notes |
|--------|------|-------|
| id | INT (PK, AI) | |
| user_id | INT (FK → users) | |
| product_id | INT (FK → products) | |
| quantity | INT | |

### Table: `wishlist`
| Column | Type | Notes |
|--------|------|-------|
| id | INT (PK, AI) | |
| user_id | INT (FK → users) | |
| product_id | INT (FK → products) | |

### Table: `orders`
| Column | Type | Notes |
|--------|------|-------|
| id | INT (PK, AI) | |
| user_id | INT (FK → users) | |
| total_amount | DECIMAL(10,2) | in ₹ |
| status | ENUM('pending','confirmed','shipped','delivered','cancelled') | |
| payment_method | ENUM('cod','upi','card') | |
| payment_status | ENUM('pending','paid','failed') | |
| shipping_address | TEXT | JSON string |
| created_at | TIMESTAMP | |

### Table: `order_items`
| Column | Type | Notes |
|--------|------|-------|
| id | INT (PK, AI) | |
| order_id | INT (FK → orders) | |
| product_id | INT (FK → products) | |
| quantity | INT | |
| price_at_purchase | DECIMAL(10,2) | |

### Table: `reviews`
| Column | Type | Notes |
|--------|------|-------|
| id | INT (PK, AI) | |
| user_id | INT (FK → users) | |
| product_id | INT (FK → products) | |
| rating | INT | 1–5 |
| comment | TEXT | |
| created_at | TIMESTAMP | |

### Table: `coupons`
| Column | Type | Notes |
|--------|------|-------|
| id | INT (PK, AI) | |
| code | VARCHAR(50) | UNIQUE |
| discount_percent | INT | |
| max_uses | INT | |
| used_count | INT | default: 0 |
| expiry_date | DATE | |
| is_active | BOOLEAN | default: true |

### Table: `banners`
| Column | Type | Notes |
|--------|------|-------|
| id | INT (PK, AI) | |
| title | VARCHAR(150) | |
| subtitle | VARCHAR(255) | |
| image_url | VARCHAR(255) | |
| link | VARCHAR(255) | |
| is_active | BOOLEAN | |

---

## 📁 Recommended File Structure

```
backend/
├── config/
│   └── db.js              # Sequelize MySQL connection
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Brand.js
│   ├── Category.js
│   ├── Cart.js
│   ├── Wishlist.js
│   ├── Order.js
│   ├── OrderItem.js
│   ├── Review.js
│   ├── Coupon.js
│   └── Banner.js
├── middleware/
│   ├── authMiddleware.js   # verifyToken
│   └── adminMiddleware.js  # isAdmin
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── brandRoutes.js
│   ├── categoryRoutes.js
│   ├── cartRoutes.js
│   ├── wishlistRoutes.js
│   ├── orderRoutes.js
│   ├── reviewRoutes.js
│   ├── couponRoutes.js
│   ├── bannerRoutes.js
│   └── adminRoutes.js
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── brandController.js
│   ├── categoryController.js
│   ├── cartController.js
│   ├── wishlistController.js
│   ├── orderController.js
│   ├── reviewController.js
│   ├── couponController.js
│   ├── bannerController.js
│   └── adminController.js
├── uploads/               # local image storage
├── .env
├── server.js
└── package.json
```

---

## 🔐 Auth APIs

Base URL: `/api/auth`

---

### POST `/api/auth/register`
Register a new user.

**Request Body:**
```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "password": "securePass123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "<jwt_token>",
  "user": {
    "id": 1,
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "role": "user"
  }
}
```

---

### POST `/api/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "priya@example.com",
  "password": "securePass123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "<jwt_token>",
  "user": {
    "id": 1,
    "name": "Priya Sharma",
    "role": "user"
  }
}
```

---

### GET `/api/auth/me`
Get currently logged in user. 🔒 Requires Auth Token.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": 1,
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "role": "user"
}
```

---

## 🛍️ Product APIs

Base URL: `/api/products`

---

### GET `/api/products`
Get all products with optional filters.

**Query Params:**
| Param | Type | Example |
|-------|------|---------|
| brand_id | number | `?brand_id=2` |
| category_id | number | `?category_id=1` |
| scent_family | string | `?scent_family=floral` |
| min_price | number | `?min_price=500` |
| max_price | number | `?max_price=5000` |
| is_featured | boolean | `?is_featured=true` |
| is_new_arrival | boolean | `?is_new_arrival=true` |
| sort | string | `?sort=price_asc` / `price_desc` / `newest` |
| search | string | `?search=rose` |
| page | number | `?page=1` |
| limit | number | `?limit=12` |

**Response (200):**
```json
{
  "total": 40,
  "page": 1,
  "products": [
    {
      "id": 1,
      "name": "Rose Elixir",
      "brand": { "id": 1, "name": "Forest Essentials" },
      "category": { "id": 2, "name": "Women" },
      "price": 2499,
      "discount_price": 1999,
      "size_ml": 100,
      "image_url": "/uploads/rose-elixir.jpg",
      "rating_avg": 4.5,
      "is_featured": true
    }
  ]
}
```

---

### GET `/api/products/:id`
Get single product details.

**Response (200):**
```json
{
  "id": 1,
  "name": "Rose Elixir",
  "brand": { "id": 1, "name": "Forest Essentials", "country": "India" },
  "category": { "id": 2, "name": "Women" },
  "description": "A rich floral fragrance...",
  "scent_family": "floral",
  "top_notes": "Rose, Bergamot",
  "middle_notes": "Jasmine, Iris",
  "base_notes": "Sandalwood, Musk",
  "price": 2499,
  "discount_price": 1999,
  "stock": 25,
  "size_ml": 100,
  "image_url": "/uploads/rose-elixir.jpg",
  "is_new_arrival": true,
  "reviews": [
    {
      "id": 1,
      "user": { "name": "Priya" },
      "rating": 5,
      "comment": "Amazing fragrance!",
      "created_at": "2024-12-01"
    }
  ],
  "rating_avg": 4.5
}
```

---

### POST `/api/admin/products` 🔒 Admin Only
Add a new product.

**Headers:** `Authorization: Bearer <admin_token>`

**Request Body (multipart/form-data):**
```
name: "Oud Noir"
brand_id: 2
category_id: 1
description: "Deep dark oud fragrance..."
scent_family: "woody"
top_notes: "Oud, Saffron"
middle_notes: "Rose"
base_notes: "Amber, Musk"
price: 4999
discount_price: 3999
stock: 15
size_ml: 50
is_featured: false
is_new_arrival: true
image: [file upload]
```

**Response (201):**
```json
{
  "message": "Product added successfully",
  "product": { "id": 12, "name": "Oud Noir", ... }
}
```

---

### PUT `/api/admin/products/:id` 🔒 Admin Only
Update an existing product.

**Request Body:** Same fields as POST (all optional).

**Response (200):**
```json
{ "message": "Product updated successfully" }
```

---

### DELETE `/api/admin/products/:id` 🔒 Admin Only
Delete a product.

**Response (200):**
```json
{ "message": "Product deleted successfully" }
```

---

## 🏷️ Brand APIs

### GET `/api/brands`
Get all brands.

**Response (200):**
```json
[
  { "id": 1, "name": "Forest Essentials", "logo_url": "/uploads/fe.jpg", "country": "India" },
  { "id": 2, "name": "Tom Ford", "logo_url": "/uploads/tf.jpg", "country": "USA" }
]
```

---

### POST `/api/admin/brands` 🔒 Admin Only
Add a new brand.

**Request Body (multipart/form-data):**
```
name: "Nykaa Perfumes"
description: "Indian beauty brand"
country: "India"
logo: [file upload]
```

**Response (201):**
```json
{ "message": "Brand added", "brand": { "id": 5, "name": "Nykaa Perfumes" } }
```

---

### PUT `/api/admin/brands/:id` 🔒 Admin Only
Update brand.

### DELETE `/api/admin/brands/:id` 🔒 Admin Only
Delete brand.

---

## 📂 Category APIs

### GET `/api/categories`
Get all categories.

**Response (200):**
```json
[
  { "id": 1, "name": "Men", "image_url": "/uploads/men.jpg" },
  { "id": 2, "name": "Women", "image_url": "/uploads/women.jpg" },
  { "id": 3, "name": "Unisex", "image_url": "/uploads/unisex.jpg" }
]
```

---

### POST `/api/admin/categories` 🔒 Admin Only
Add category.

### PUT `/api/admin/categories/:id` 🔒 Admin Only
Update category.

### DELETE `/api/admin/categories/:id` 🔒 Admin Only
Delete category.

---

## 🛒 Cart APIs

Base URL: `/api/cart` — All 🔒 Require Auth

---

### GET `/api/cart`
Get all cart items for logged-in user.

**Response (200):**
```json
[
  {
    "id": 1,
    "product": {
      "id": 3,
      "name": "Rose Elixir",
      "price": 1999,
      "image_url": "/uploads/rose.jpg"
    },
    "quantity": 2
  }
]
```

---

### POST `/api/cart`
Add item to cart.

**Request Body:**
```json
{ "product_id": 3, "quantity": 1 }
```

**Response (200):**
```json
{ "message": "Added to cart" }
```

---

### PUT `/api/cart/:id`
Update quantity of a cart item.

**Request Body:**
```json
{ "quantity": 3 }
```

---

### DELETE `/api/cart/:id`
Remove item from cart.

**Response (200):**
```json
{ "message": "Item removed from cart" }
```

---

## 💖 Wishlist APIs

Base URL: `/api/wishlist` — All 🔒 Require Auth

---

### GET `/api/wishlist`
Get user's wishlist.

**Response (200):**
```json
[
  {
    "id": 1,
    "product": {
      "id": 5,
      "name": "Oud Noir",
      "price": 3999,
      "image_url": "/uploads/oud.jpg"
    }
  }
]
```

---

### POST `/api/wishlist`
Add product to wishlist.

**Request Body:**
```json
{ "product_id": 5 }
```

---

### DELETE `/api/wishlist/:productId`
Remove from wishlist.

---

## 📦 Order APIs

Base URL: `/api/orders` — All 🔒 Require Auth

---

### POST `/api/orders`
Place a new order.

**Request Body:**
```json
{
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 4, "quantity": 1 }
  ],
  "payment_method": "cod",
  "shipping_address": {
    "full_name": "Priya Sharma",
    "phone": "9876543210",
    "street": "123 MG Road",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560001"
  },
  "coupon_code": "SAVE10"
}
```

**Response (201):**
```json
{
  "message": "Order placed successfully",
  "order_id": 45,
  "total_amount": 5597
}
```

---

### GET `/api/orders/my-orders`
Get all orders for logged-in user.

**Response (200):**
```json
[
  {
    "id": 45,
    "total_amount": 5597,
    "status": "confirmed",
    "payment_method": "cod",
    "created_at": "2024-12-15",
    "items": [
      { "product_name": "Rose Elixir", "quantity": 2, "price": 1999 }
    ]
  }
]
```

---

### GET `/api/orders/:id`
Get single order details.

---

### PUT `/api/admin/orders/:id/status` 🔒 Admin Only
Update order status.

**Request Body:**
```json
{ "status": "shipped" }
```

**Response (200):**
```json
{ "message": "Order status updated" }
```

---

### GET `/api/admin/orders` 🔒 Admin Only
Get all orders with filters.

**Query Params:** `?status=pending`, `?page=1`, `?limit=10`

---

## ⭐ Review APIs

---

### POST `/api/reviews` 🔒 Require Auth
Submit a review.

**Request Body:**
```json
{
  "product_id": 3,
  "rating": 5,
  "comment": "Absolutely love this perfume!"
}
```

---

### GET `/api/reviews/:productId`
Get all reviews for a product (public).

**Response (200):**
```json
[
  {
    "id": 1,
    "user": { "name": "Priya" },
    "rating": 5,
    "comment": "Smells divine!",
    "created_at": "2024-11-20"
  }
]
```

---

### DELETE `/api/admin/reviews/:id` 🔒 Admin Only
Delete a review.

---

## 🎟️ Coupon APIs

---

### POST `/api/coupons/validate` 🔒 Require Auth
Validate a coupon code.

**Request Body:**
```json
{ "code": "SAVE10", "cart_total": 4000 }
```

**Response (200):**
```json
{
  "valid": true,
  "discount_percent": 10,
  "discount_amount": 400,
  "new_total": 3600
}
```

---

### GET `/api/admin/coupons` 🔒 Admin Only
Get all coupons.

---

### POST `/api/admin/coupons` 🔒 Admin Only
Create a coupon.

**Request Body:**
```json
{
  "code": "FESTIVE20",
  "discount_percent": 20,
  "max_uses": 100,
  "expiry_date": "2025-03-31"
}
```

---

### PUT `/api/admin/coupons/:id` 🔒 Admin Only
Update coupon.

### DELETE `/api/admin/coupons/:id` 🔒 Admin Only
Delete coupon.

---

## 🖼️ Banner APIs

---

### GET `/api/banners`
Get all active banners (public).

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Discover Your Signature Scent",
    "subtitle": "New collection now live",
    "image_url": "/uploads/banner1.jpg",
    "link": "/shop"
  }
]
```

---

### POST `/api/admin/banners` 🔒 Admin Only
Add a banner.

**Request Body (multipart/form-data):**
```
title: "Festive Sale"
subtitle: "Up to 40% off"
link: "/shop?sale=true"
image: [file upload]
```

---

### PUT `/api/admin/banners/:id` 🔒 Admin Only
Update banner.

### DELETE `/api/admin/banners/:id` 🔒 Admin Only
Delete banner.

---

## 📊 Admin Analytics APIs

Base URL: `/api/admin/analytics` — All 🔒 Admin Only

---

### GET `/api/admin/analytics/summary`
Dashboard KPIs.

**Response (200):**
```json
{
  "total_revenue": 284500,
  "total_orders": 124,
  "total_users": 89,
  "total_products": 45
}
```

---

### GET `/api/admin/analytics/revenue`
Revenue by month (last 6 months).

**Response (200):**
```json
[
  { "month": "Oct 2024", "revenue": 42000 },
  { "month": "Nov 2024", "revenue": 58000 },
  { "month": "Dec 2024", "revenue": 91000 }
]
```

---

### GET `/api/admin/analytics/top-products`
Top 5 selling products.

**Response (200):**
```json
[
  { "product_name": "Rose Elixir", "total_sold": 48, "revenue": 95952 },
  { "product_name": "Oud Noir", "total_sold": 32, "revenue": 127968 }
]
```

---

### GET `/api/admin/analytics/users`
New user signups over time.

**Response (200):**
```json
[
  { "month": "Nov 2024", "new_users": 12 },
  { "month": "Dec 2024", "new_users": 31 }
]
```

---

## 👥 Admin User APIs

Base URL: `/api/admin/users` — All 🔒 Admin Only

---

### GET `/api/admin/users`
Get all users.

**Query Params:** `?search=priya`, `?page=1`

---

### GET `/api/admin/users/:id`
Get user profile with order history.

---

### PUT `/api/admin/users/:id`
Update user role or status.

**Request Body:**
```json
{ "role": "admin" }
```

---

## 🔒 Auth Middleware

### `authMiddleware.js`
```js
// Attach to any route that needs authentication
// Checks: Authorization: Bearer <token>
// Decodes JWT and sets req.user
```

### `adminMiddleware.js`
```js
// Use after authMiddleware
// Checks req.user.role === 'admin'
// Returns 403 if not admin
```

---

## 📝 HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (not admin) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install express sequelize mysql2 bcryptjs jsonwebtoken multer dotenv cors

# Setup database
mysql -u root -p
CREATE DATABASE brand_essence;

# Run server
node server.js
# or with nodemon:
npx nodemon server.js
```

---

## 🌐 Base URL

```
http://localhost:5000/api
```

---

*All currency values are in Indian Rupees (₹). Built with ❤️ for Brand Essence.*
