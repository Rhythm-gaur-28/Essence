const Coupon = require('../models/Coupon');

// Validate a coupon code
const validateCoupon = async (req, res) => {
  try {
    const { code, cart_total } = req.body;

    // Validation
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ where: { code, is_active: true } });

    if (!coupon) {
      return res.status(400).json({ valid: false, message: 'Invalid coupon code' });
    }

    // Check expiry
    if (new Date(coupon.expiry_date) < new Date()) {
      return res.status(400).json({ valid: false, message: 'Coupon has expired' });
    }

    // Check usage limit
    if (coupon.used_count >= coupon.max_uses) {
      return res.status(400).json({ valid: false, message: 'Coupon usage limit exceeded' });
    }

    // Calculate discount
    const discountAmount = Math.round((cart_total * coupon.discount_percent) / 100);
    const newTotal = cart_total - discountAmount;

    res.status(200).json({
      valid: true,
      discount_percent: coupon.discount_percent,
      discount_amount: discountAmount,
      new_total: newTotal,
    });
  } catch (error) {
    console.error('ValidateCoupon error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all coupons (admin)
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll();
    res.status(200).json(coupons);
  } catch (error) {
    console.error('GetAllCoupons error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create coupon (admin)
const createCoupon = async (req, res) => {
  try {
    const { code, discount_percent, max_uses, expiry_date } = req.body;

    // Validation
    if (!code || !discount_percent) {
      return res.status(400).json({ message: 'Code and discount percent are required' });
    }

    // Check if coupon code already exists
    const existing = await Coupon.findOne({ where: { code } });
    if (existing) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discount_percent: parseInt(discount_percent),
      max_uses: parseInt(max_uses) || 100,
      expiry_date,
    });

    res.status(201).json({
      message: 'Coupon created successfully',
      coupon,
    });
  } catch (error) {
    console.error('CreateCoupon error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update coupon (admin)
const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    if (updates.code) {
      updates.code = updates.code.toUpperCase();
    }

    await coupon.update(updates);

    res.status(200).json({ message: 'Coupon updated successfully' });
  } catch (error) {
    console.error('UpdateCoupon error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete coupon (admin)
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    await coupon.destroy();

    res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('DeleteCoupon error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { validateCoupon, getAllCoupons, createCoupon, updateCoupon, deleteCoupon };
