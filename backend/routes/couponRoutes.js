const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/validate', verifyToken, couponController.validateCoupon);

module.exports = router;
