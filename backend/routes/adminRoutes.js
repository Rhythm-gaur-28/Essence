const express = require('express');
const router = express.Router();
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

router.use(verifyToken, isAdmin);

// Products
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Brands
router.post('/brands', brandController.createBrand);
router.put('/brands/:id', brandController.updateBrand);
router.delete('/brands/:id', brandController.deleteBrand);

// Categories
router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);
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
router.post('/banners', bannerController.createBanner);
router.put('/banners/:id', bannerController.updateBanner);
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
