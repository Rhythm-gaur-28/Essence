const express = require("express");
const cors = require("cors");
const path = require("path");
const config = require("./config/config");
const sequelize = require("./config/db");

// Import models
const User = require("./models/User");
const Brand = require("./models/Brand");
const Category = require("./models/Category");
const Product = require("./models/Product");
const Cart = require("./models/Cart");
const Wishlist = require("./models/Wishlist");
const Order = require("./models/Order");
const OrderItem = require("./models/OrderItem");
const Review = require("./models/Review");
const Coupon = require("./models/Coupon");
const Banner = require("./models/Banner");

// Route imports
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const brandRoutes = require("./routes/brandRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const couponRoutes = require("./routes/couponRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Setup model associations
Product.belongsTo(Brand, { foreignKey: "brand_id" });
Product.belongsTo(Category, { foreignKey: "category_id" });
Product.hasMany(Review, { foreignKey: "product_id" });
Product.hasMany(Cart, { foreignKey: "product_id" });
Product.hasMany(Wishlist, { foreignKey: "product_id" });
Product.hasMany(OrderItem, { foreignKey: "product_id" });

User.hasMany(Cart, { foreignKey: "user_id" });
User.hasMany(Wishlist, { foreignKey: "user_id" });
User.hasMany(Order, { foreignKey: "user_id" });
User.hasMany(Review, { foreignKey: "user_id" });

Cart.belongsTo(Product, { foreignKey: "product_id" });
Cart.belongsTo(User, { foreignKey: "user_id" });

Wishlist.belongsTo(Product, { foreignKey: "product_id" });
Wishlist.belongsTo(User, { foreignKey: "user_id" });

Order.belongsTo(User, { foreignKey: "user_id" });
Order.hasMany(OrderItem, { foreignKey: "order_id" });

OrderItem.belongsTo(Order, { foreignKey: "order_id" });
OrderItem.belongsTo(Product, { foreignKey: "product_id" });

Review.belongsTo(User, { foreignKey: "user_id" });
Review.belongsTo(Product, { foreignKey: "product_id" });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is running" });
});

// Database connection & server start
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully.");
    // Sync all models with database (creates tables if they don't exist)
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("Database synchronized (tables created/updated).");
    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
    });
  })
  .catch((err) => {
    console.error("Database error:", err.message);
    process.exit(1);
  });