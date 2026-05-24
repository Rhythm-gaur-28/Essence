const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");


// GET REVIEWS FOR PRODUCT
router.get("/:productId", (req, res) => {
  const query = `
    SELECT r.*, u.name as user_name
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE product_id = ?
    ORDER BY r.created_at DESC
  `;

  db.query(query, [req.params.productId], (err, result) => {
    res.json(result);
  });
});


// ADD REVIEW — returns insertId so frontend can delete without refresh
router.post("/:productId", auth, (req, res) => {
  const { rating, comment } = req.body;

  db.query(
    "INSERT INTO reviews (user_id,product_id,rating,comment) VALUES (?,?,?,?)",
    [req.user.id, req.params.productId, rating, comment],
    (err, result) => {
      if (err) return res.status(500).json({ msg: "DB error" });
      res.json({ message: "Review added", id: result.insertId });
    }
  );
});


// DELETE REVIEW — owner or admin
router.delete("/:reviewId", auth, (req, res) => {
  db.query(
    "SELECT user_id FROM reviews WHERE id=?",
    [req.params.reviewId],
    (err, rows) => {
      if (err) return res.status(500).json({ msg: "DB error" });
      if (!rows || rows.length === 0) return res.status(404).json({ msg: "Review not found" });

      const review = rows[0];
      if (Number(review.user_id) !== Number(req.user.id) && req.user.role !== "admin") {
        return res.status(403).json({ msg: "Not authorized" });
      }

      db.query("DELETE FROM reviews WHERE id=?", [req.params.reviewId], (err2) => {
        if (err2) return res.status(500).json({ msg: "DB error" });
        res.json({ message: "Review deleted" });
      });
    }
  );
});


module.exports = router;
