const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifyToken } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const productController = require('../controllers/productController');
const brandController = require('../controllers/brandController');
const categoryController = require('../controllers/categoryController');
const orderController = require('../controllers/orderController');
const reviewController = require('../controllers/reviewController');
const couponController = require('../controllers/couponController');
const bannerController = require('../controllers/bannerController');
const adminController = require('../controllers/adminController');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  },
});

router.use(verifyToken, isAdmin);

// Products
router.post('/products', upload.single('image'), productController.createProduct);
router.put('/products/:id', upload.single('image'), productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Brands
router.post('/brands', upload.single('logo'), brandController.createBrand);
router.put('/brands/:id', upload.single('logo'), brandController.updateBrand);
router.delete('/brands/:id', brandController.deleteBrand);

// Categories
router.post('/categories', upload.single('image'), categoryController.createCategory);
router.put('/categories/:id', upload.single('image'), categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// Orders
router.get('/orders', orderController.getAllOrders);
router.put('/orders/:id/status', orderController.updateOrderStatus);

// Reviews
router.delete('/reviews/:id', reviewController.deleteReview);

// Coupons
router.get('/coupons', couponController.getAllCoupons);
router.post('/coupons', couponController.createCoupon);
router.put('/coupons/:id', couponController.updateCoupon);
router.delete('/coupons/:id', couponController.deleteCoupon);

// Banners
router.post('/banners', upload.single('image'), bannerController.createBanner);
router.put('/banners/:id', upload.single('image'), bannerController.updateBanner);
router.delete('/banners/:id', bannerController.deleteBanner);

// Analytics
router.get('/analytics/summary', adminController.getAnalyticsSummary);
router.get('/analytics/revenue', adminController.getRevenueByMonth);
router.get('/analytics/top-products', adminController.getTopProducts);
router.get('/analytics/users', adminController.getUserSignups);

// Users
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);

module.exports = router;
