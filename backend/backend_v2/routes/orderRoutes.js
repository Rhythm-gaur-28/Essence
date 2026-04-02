const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");


/* ===============================
   PLACE ORDER
================================ */
router.post("/", auth, (req, res) => {
  const { address, paymentMethod, items, total, couponCode, discountAmount } = req.body;

  const orderQuery = `
    INSERT INTO orders
    (user_id, full_name, phone, street, city, state, pincode,
     payment_method, total_amount, coupon_code, discount_amount,
     payment_status, paid_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

  const initialPaymentStatus = paymentMethod === "cod" ? "yet_to_be_paid" : "yet_to_be_paid";

  db.query(
    orderQuery,
    [
      req.user.id,
      address.full_name,
      address.phone,
      address.street,
      address.city,
      address.state,
      address.pincode,
      paymentMethod,
      total,
      couponCode || null,
      discountAmount || 0,
      initialPaymentStatus,
      null
    ],
    (err, result) => {
      if (err) return res.status(500).json({ msg: "DB error", error: err });

      const orderId = result.insertId;

      // Auto-save address (fire-and-forget, non-blocking)
      db.query(
        "SELECT id FROM addresses WHERE user_id=? AND receiver_name=? AND phone=? AND street=? AND city=? AND state=? AND pincode=?",
        [req.user.id, address.full_name, address.phone, address.street, address.city, address.state, address.pincode],
        (aerr, existing) => {
          if (!aerr && (!existing || existing.length === 0)) {
            db.query("SELECT COUNT(*) AS cnt FROM addresses WHERE user_id=?", [req.user.id], (cerr, cnt) => {
              const isFirst = !cerr && cnt[0].cnt === 0;
              db.query(
                "INSERT INTO addresses (user_id, receiver_name, phone, street, city, state, pincode, is_default) VALUES (?,?,?,?,?,?,?,?)",
                [req.user.id, address.full_name, address.phone, address.street, address.city, address.state, address.pincode, isFirst ? 1 : 0]
              );
            });
          }
        }
      );

      // Insert all order items
      const itemQuery =
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?,?,?,?)";

      let pending = items.length;
      if (pending === 0) {
        if (couponCode) {
          db.query(
            "UPDATE coupons SET used_count = used_count + 1 WHERE code = ? AND is_active = 1",
            [couponCode.toUpperCase()]
          );
        }
        return res.json({ message: "Order placed", orderId });
      }

      items.forEach(item => {
        db.query(
          itemQuery,
          [orderId, item.id, item.quantity, item.effectivePrice],
          (itemErr) => {
            if (itemErr) console.error("Item insert error:", itemErr);
            pending--;
            if (pending === 0) {
              if (couponCode) {
                db.query(
                  "UPDATE coupons SET used_count = used_count + 1 WHERE code = ? AND is_active = 1",
                  [couponCode.toUpperCase()]
                );
              }
              res.json({ message: "Order placed", orderId });
            }
          }
        );
      });
    }
  );
});


/* ===============================
   GET USER ORDERS
================================ */
router.get("/my-orders", auth, (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT
      o.id, o.created_at, o.status, o.payment_method,
      o.total_amount, o.coupon_code, o.discount_amount,
      o.payment_status, o.paid_at,
      oi.product_id, oi.quantity, oi.price,
      p.name as product_name
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON p.id = oi.product_id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `;

  db.query(query, [userId], (err, result) => {
    if (err) return res.status(500).json({ msg: "DB error", error: err });

    const orders = {};

    result.forEach(row => {
      if (!orders[row.id]) {
        orders[row.id] = {
          id: row.id,
          created_at: row.created_at,
          status: row.status,
          payment_method: row.payment_method,
          total_amount: row.total_amount,
          coupon_code: row.coupon_code,
          discount_amount: row.discount_amount,
          payment_status: row.payment_status,
          paid_at: row.paid_at,
          items: []
        };
      }

      orders[row.id].items.push({
        product_name: row.product_name,
        quantity: row.quantity,
        price_at_purchase: row.price
      });
    });

    res.json(Object.values(orders));
  });
});


/* ===============================
   ADMIN - GET ALL ORDERS
================================ */
router.get("/all", auth, admin, (req, res) => {
  db.query(
    "SELECT * FROM orders ORDER BY created_at DESC",
    (err, result) => {
      if (err) return res.status(500).json({ msg: "DB error", error: err });
      res.json(result);
    }
  );
});


/* ===============================
   ADMIN - GET SINGLE ORDER DETAIL
================================ */
router.get("/:id/detail", auth, admin, (req, res) => {
  const orderId = req.params.id;

  db.query(
    `SELECT o.*, u.name AS customer_name, u.email AS customer_email
     FROM orders o
     JOIN users u ON u.id = o.user_id
     WHERE o.id = ?`,
    [orderId],
    (err, orderRows) => {
      if (err) return res.status(500).json({ msg: "DB error" });
      if (!orderRows || orderRows.length === 0)
        return res.status(404).json({ msg: "Order not found" });

      const order = orderRows[0];

      db.query(
        `SELECT oi.quantity, oi.price, p.name AS product_name
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = ?`,
        [orderId],
        (err2, items) => {
          if (err2) return res.status(500).json({ msg: "DB error" });
          res.json({ ...order, items: items || [] });
        }
      );
    }
  );
});


/* ===============================
   ADMIN - UPDATE ORDER STATUS
================================ */
router.patch("/:id/status", auth, admin, (req, res) => {
  const { status } = req.body;

  db.query(
    "UPDATE orders SET status=? WHERE id=?",
    [status, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ msg: "DB error", error: err });
      res.json({ message: "Status updated" });
    }
  );
});


/* ===============================
   ADMIN - UPDATE PAYMENT STATUS
================================ */
router.patch("/:id/payment-status", auth, admin, (req, res) => {
  const { payment_status, paid_at } = req.body;
  const orderId = req.params.id;

  let query, queryParams;

  if (payment_status === "paid") {
    if (paid_at) {
      // Admin provided a manual datetime
      query = "UPDATE orders SET payment_status=?, paid_at=? WHERE id=?";
      queryParams = [payment_status, new Date(paid_at), orderId];
    } else {
      // Auto-set paid_at only if not already set
      query = "UPDATE orders SET payment_status=?, paid_at = CASE WHEN paid_at IS NULL THEN NOW() ELSE paid_at END WHERE id=?";
      queryParams = [payment_status, orderId];
    }
  } else {
    query = "UPDATE orders SET payment_status=? WHERE id=?";
    queryParams = [payment_status, orderId];
  }

  db.query(query, queryParams, (err) => {
    if (err) return res.status(500).json({ msg: "DB error" });

    db.query(
      "SELECT payment_status, paid_at FROM orders WHERE id=?",
      [orderId],
      (err2, rows) => {
        if (err2 || !rows.length) return res.json({ message: "Updated" });
        res.json({
          message: "Updated",
          payment_status: rows[0].payment_status,
          paid_at: rows[0].paid_at
        });
      }
    );
  });
});


module.exports = router;
