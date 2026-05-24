require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:5173",
  "https://essence-black-eta.vercel.app",
  "https://essence-production.up.railway.app/"
  
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Backend API running");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/brands", require("./routes/brandRoutes"));
app.use("/api/coupons", require("./routes/couponRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/banners", require("./routes/bannerRoutes"));
app.use("/api/addresses", require("./routes/addressRoutes"));

const transporter = require("./config/nodemailer.js");

app.get("/mail-debug", async (req, res) => {
  try {
    await transporter.verify();
    res.send("SMTP OK");
  } catch (err) {
    console.error("SMTP ERROR:", err);
    res.status(500).json({
      error: err.message,
      code: err.code
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});