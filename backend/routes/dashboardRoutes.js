const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.get("/stats", auth, (req, res) => {
  db.query("SELECT COALESCE(SUM(total_amount),0) AS revenue FROM orders", (e1, rev) => {
    if (e1) return res.status(500).json(e1);

    db.query("SELECT COUNT(*) AS orders FROM orders", (e2, ord) => {
      if (e2) return res.status(500).json(e2);

      db.query("SELECT COUNT(*) AS products FROM products", (e3, prod) => {
        if (e3) return res.status(500).json(e3);

        db.query("SELECT COUNT(*) AS users FROM users", (e4, usr) => {
          if (e4) return res.status(500).json(e4);

          res.json({
            revenue: Number(rev[0].revenue || 0),
            orders: Number(ord[0].orders || 0),
            products: Number(prod[0].products || 0),
            users: Number(usr[0].users || 0),
          });
        });
      });
    });
  });
});

router.get("/recent-orders", auth, (req, res) => {
  db.query(
    "SELECT id, total_amount, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5",
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// Products with >= 10 orders but not yet marked as best seller — admin notification
router.get("/best-seller-candidates", auth, admin, (req, res) => {
  const query = `
    SELECT p.id, p.name, p.brand_name, p.image_url,
           COUNT(DISTINCT oi.order_id) AS order_count
    FROM products p
    JOIN order_items oi ON oi.product_id = p.id
    WHERE p.is_best_seller = 0
    GROUP BY p.id
    HAVING order_count >= 10
    ORDER BY order_count DESC
  `;
  db.query(query, (err, rows) => {
    if (err) return res.status(500).json({ msg: "DB error" });
    res.json(rows || []);
  });
});

module.exports = router;
