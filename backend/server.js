require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded images as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Backend API running");
});

app.use("/api/auth",      require("./routes/authRoutes"));
app.use("/api/products",  require("./routes/productRoutes"));
app.use("/api/reviews",   require("./routes/reviewRoutes"));
app.use("/api/wishlist",  require("./routes/wishlistRoutes"));
app.use("/api/orders",    require("./routes/orderRoutes"));
app.use("/api/users",     require("./routes/userRoutes"));
app.use("/api/brands",    require("./routes/brandRoutes"));
app.use("/api/coupons",   require("./routes/couponRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/upload",    require("./routes/uploadRoutes"));
app.use("/api/banners",   require("./routes/bannerRoutes"));
app.use("/api/addresses", require("./routes/addressRoutes"));

app.listen(5000, () => console.log("Server running on port 5000"));
