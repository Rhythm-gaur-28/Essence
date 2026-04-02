const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// GET all coupons (admin)
router.get("/", auth, (req, res) => {
  db.query("SELECT * FROM coupons ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ msg: "DB error", error: err });
    res.json(rows);
  });
});

// POST create coupon (admin)
router.post("/", auth, admin, (req, res) => {
  const { code, discount_percent, max_uses, expiry_date } = req.body;
  if (!code || !discount_percent || !max_uses || !expiry_date)
    return res.status(400).json({ msg: "All fields are required." });

  db.query(
    "INSERT INTO coupons (code, discount_percent, max_uses, used_count, expiry_date, is_active) VALUES (?,?,?,0,?,1)",
    [code.toUpperCase(), discount_percent, max_uses, expiry_date],
    (err, result) => {
      if (err) return res.status(500).json({ msg: "DB error", error: err });
      res.json({ id: result.insertId, code: code.toUpperCase(), discount_percent, max_uses, used_count: 0, expiry_date, is_active: 1 });
    }
  );
});

// POST apply/validate coupon (user)
router.post("/apply", auth, (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ msg: "Coupon code is required." });

  db.query(
    "SELECT * FROM coupons WHERE code = ? AND is_active = 1",
    [code.toUpperCase()],
    (err, rows) => {
      if (err) return res.status(500).json({ msg: "DB error", error: err });
      if (rows.length === 0) return res.status(400).json({ msg: "Invalid or inactive coupon code." });

      const coupon = rows[0];

      if (coupon.used_count >= coupon.max_uses)
        return res.status(400).json({ msg: "Coupon usage limit reached." });

      if (new Date(coupon.expiry_date) < new Date())
        return res.status(400).json({ msg: "Coupon has expired." });

      res.json({
        code: coupon.code,
        discount_percent: coupon.discount_percent
      });
    }
  );
});

// PATCH toggle active (admin)
router.patch("/:id/toggle", auth, admin, (req, res) => {
  db.query("UPDATE coupons SET is_active = NOT is_active WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ msg: "DB error", error: err });
    res.json({ message: "Toggled" });
  });
});

// DELETE coupon (admin)
router.delete("/:id", auth, admin, (req, res) => {
  db.query("DELETE FROM coupons WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ msg: "DB error", error: err });
    res.json({ message: "Coupon deleted" });
  });
});

module.exports = router;