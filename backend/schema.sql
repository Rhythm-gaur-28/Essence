-- ============================================================
-- Essence E-commerce Database Schema
-- Run this in MySQL: mysql -u root -p < schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS essence;
USE essence;

-- ─── USERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(150)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,
  role       ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── BRANDS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brands (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  country     VARCHAR(100) NOT NULL DEFAULT '',
  description TEXT,
  logo_url    VARCHAR(500) DEFAULT '',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── CATEGORIES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  image_url VARCHAR(500) DEFAULT ''
);

-- ─── PRODUCTS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(200)  NOT NULL,
  brand_id       INT,
  brand_name     VARCHAR(100)  NOT NULL DEFAULT '',
  category_id    INT,
  description    TEXT,
  scent_family   ENUM('floral','woody','oriental','fresh','citrus','gourmand','aquatic','spicy') DEFAULT 'floral',
  top_notes      VARCHAR(300) DEFAULT '',
  middle_notes   VARCHAR(300) DEFAULT '',
  base_notes     VARCHAR(300) DEFAULT '',
  price          DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2) DEFAULT NULL,
  stock          INT           NOT NULL DEFAULT 0,
  size_ml        INT           DEFAULT NULL,
  image_url      VARCHAR(500)  DEFAULT '',
  is_featured    TINYINT(1)    NOT NULL DEFAULT 0,
  is_new_arrival TINYINT(1)    NOT NULL DEFAULT 0,
  rating         DECIMAL(3,2)  DEFAULT 0.00,
  review_count   INT           DEFAULT 0,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (brand_id)    REFERENCES brands(id)     ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- ─── ORDERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT           NOT NULL,
  full_name       VARCHAR(100)  NOT NULL,
  phone           VARCHAR(20)   NOT NULL,
  street          VARCHAR(300)  NOT NULL,
  city            VARCHAR(100)  NOT NULL,
  state           VARCHAR(100)  NOT NULL,
  pincode         VARCHAR(10)   NOT NULL,
  payment_method  ENUM('cod','upi','card') NOT NULL DEFAULT 'cod',
  total_amount    DECIMAL(10,2) NOT NULL,
  coupon_code     VARCHAR(50)   DEFAULT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  status          ENUM('pending','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── ALTER for existing databases (run if table already exists) ───
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50) DEFAULT NULL;
-- ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0;

-- ─── ORDER ITEMS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  order_id   INT           NOT NULL,
  product_id INT           NOT NULL,
  quantity   INT           NOT NULL DEFAULT 1,
  price      DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ─── WISHLIST ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlist (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_wishlist (user_id, product_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ─── REVIEWS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  product_id INT NOT NULL,
  rating     TINYINT NOT NULL DEFAULT 5,
  comment    TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ─── COUPONS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  code             VARCHAR(50)   NOT NULL UNIQUE,
  discount_percent DECIMAL(5,2)  NOT NULL,
  max_uses         INT           NOT NULL DEFAULT 100,
  used_count       INT           NOT NULL DEFAULT 0,
  expiry_date      DATE          NOT NULL,
  is_active        TINYINT(1)    NOT NULL DEFAULT 1,
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── BANNERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  title     VARCHAR(200) NOT NULL,
  subtitle  VARCHAR(300) DEFAULT '',
  image_url VARCHAR(500) DEFAULT '',
  link      VARCHAR(500) DEFAULT '',
  is_active TINYINT(1)   NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin user (password: admin123)
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Admin', 'admin@brandessence.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Brands
INSERT IGNORE INTO brands (id, name, country, description) VALUES
(1, 'Forest Essentials', 'India',  'Luxury Ayurvedic fragrances from India'),
(2, 'Ajmal',             'India',  'Heritage perfumery since 1951'),
(3, 'Chanel',            'France', 'Iconic French luxury house'),
(4, 'Tom Ford',          'USA',    'Bold, modern luxury fragrances'),
(5, 'Jo Malone',         'UK',     'British elegance in every bottle');

-- Categories
INSERT IGNORE INTO categories (id, name) VALUES
(1, 'Men'),
(2, 'Women'),
(3, 'Unisex');

-- Coupons
INSERT IGNORE INTO coupons (code, discount_percent, max_uses, used_count, expiry_date, is_active) VALUES
('FIRST10',  10, 100, 0, '2026-12-31', 1),
('LUXURY20', 20,  50, 0, '2026-12-31', 1);

-- Banners
INSERT IGNORE INTO banners (title, subtitle, link, is_active) VALUES
('New Arrivals', 'Discover the latest fragrances from top brands', '/shop?is_new_arrival=true', 1);

-- Sample products
INSERT IGNORE INTO products
  (id, name, brand_id, brand_name, category_id, description, scent_family,
   top_notes, middle_notes, base_notes,
   price, discount_price, stock, size_ml, is_featured, is_new_arrival, rating, review_count)
VALUES
(1, 'Mysore Sandalwood Eau de Parfum', 1, 'Forest Essentials', 3,
 'A rich, creamy sandalwood fragrance capturing Indian heritage. Warm and deeply comforting.',
 'woody', 'Bergamot, Cardamom', 'Sandalwood, Rose', 'Musk, Amber',
 4500, 3825, 25, 50, 1, 0, 4.5, 28),

(2, 'Oudh Mukhallat', 2, 'Ajmal', 1,
 'An opulent oriental blend featuring precious oudh with warm spices and amber.',
 'oriental', 'Saffron, Pink Pepper', 'Oudh, Rose Absolute', 'Amber, Sandalwood, Musk',
 6200, NULL, 15, 100, 1, 1, 4.8, 42),

(3, 'Chance Eau Tendre', 3, 'Chanel', 2,
 'A delicate and radiant floral fragrance with a tender and sparkling trail.',
 'floral', 'Grapefruit, Quince', 'Jasmine, Hyacinth', 'White Musk, Iris, Amber',
 12500, 10625, 10, 100, 1, 0, 4.7, 95),

(4, 'Oud Wood', 4, 'Tom Ford', 3,
 'Exotic rosewood and Eastern spices wrapped in sensual oud and sandalwood.',
 'woody', 'Rosewood, Chinese Pepper', 'Oud, Sandalwood', 'Tonka Bean, Amber',
 18999, NULL, 8, 50, 1, 0, 4.9, 67),

(5, 'English Pear & Freesia', 5, 'Jo Malone', 2,
 'The sensuous freshness of just-ripe pears wrapped in a bouquet of white freesias.',
 'fresh', 'King William Pear', 'Freesia', 'Patchouli, Amber',
 9800, 8330, 20, 100, 0, 1, 4.6, 53),

(6, 'Nargis Eau de Toilette', 1, 'Forest Essentials', 2,
 'Inspired by the delicate narcissus flowers of Kashmir.',
 'floral', 'Green Leaves, Bergamot', 'Narcissus, Jasmine Sambac', 'Vetiver, White Musk',
 3800, NULL, 30, 50, 0, 1, 4.3, 19),

(7, 'Dahn Al Oudh Moattaq', 2, 'Ajmal', 1,
 'An aged oudh fragrance with deep woody and leathery notes.',
 'oriental', 'Oudh, Spices', 'Leather, Amber', 'Sandalwood, Musk',
 8500, 7225, 12, 60, 0, 0, 4.7, 35),

(8, 'Bleu de Chanel', 3, 'Chanel', 1,
 'A woody aromatic fragrance for the man who defies convention.',
 'fresh', 'Citrus, Mint', 'Ginger, Nutmeg, Jasmine', 'Incense, Cedar, Sandalwood',
 11000, NULL, 18, 100, 1, 0, 4.8, 112),

(9, 'Black Orchid', 4, 'Tom Ford', 2,
 'A luxurious and sensual fragrance of rich dark accords and black orchids.',
 'gourmand', 'Black Truffle, Ylang Ylang', 'Black Orchid, Spicy Notes', 'Patchouli, Vanilla, Chocolate',
 16500, 14025, 6, 50, 0, 1, 4.6, 78),

(10, 'Peony & Blush Suede', 5, 'Jo Malone', 2,
 'The irresistible charm of flirtatious peonies and the seductiveness of soft blush suede.',
 'floral', 'Red Apple', 'Peony, Jasmine, Rose', 'Suede',
 9500, NULL, 22, 100, 0, 0, 4.5, 41);
