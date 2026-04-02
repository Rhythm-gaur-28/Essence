const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");


// GET USER WISHLIST
router.get("/", auth, (req, res) => {
  const query = `
    SELECT p.* FROM wishlist w
    JOIN products p ON p.id = w.product_id
    WHERE w.user_id = ?
  `;

  db.query(query, [req.user.id], (err, result) => {
    res.json(result);
  });
});


// ADD TO WISHLIST
router.post("/:productId", auth, (req, res) => {
  db.query(
    "INSERT INTO wishlist (user_id, product_id) VALUES (?,?)",
    [req.user.id, req.params.productId],
    () => res.json({ message: "Added to wishlist" })
  );
});


// REMOVE FROM WISHLIST
router.delete("/:productId", auth, (req, res) => {
  db.query(
    "DELETE FROM wishlist WHERE user_id=? AND product_id=?",
    [req.user.id, req.params.productId],
    () => res.json({ message: "Removed" })
  );
});

module.exports = router;
