const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");

// GET user's saved addresses
router.get("/", auth, (req, res) => {
  db.query(
    "SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC",
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ msg: "DB error" });
      res.json(rows || []);
    }
  );
});

// POST create address
router.post("/", auth, (req, res) => {
  const { receiver_name, phone, street, city, state, pincode } = req.body;
  if (!receiver_name || !phone || !street || !city || !state || !pincode)
    return res.status(400).json({ msg: "All fields required" });

  // If user has no addresses yet, make this the default
  db.query(
    "SELECT COUNT(*) AS cnt FROM addresses WHERE user_id = ?",
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ msg: "DB error" });
      const isFirst = rows[0].cnt === 0;

      db.query(
        "INSERT INTO addresses (user_id, receiver_name, phone, street, city, state, pincode, is_default) VALUES (?,?,?,?,?,?,?,?)",
        [req.user.id, receiver_name, phone, street, city, state, pincode, isFirst ? 1 : 0],
        (err2, result) => {
          if (err2) return res.status(500).json({ msg: "DB error" });
          res.json({ id: result.insertId, user_id: req.user.id, receiver_name, phone, street, city, state, pincode, is_default: isFirst ? 1 : 0 });
        }
      );
    }
  );
});

// PUT update address
router.put("/:id", auth, (req, res) => {
  const { receiver_name, phone, street, city, state, pincode } = req.body;
  if (!receiver_name || !phone || !street || !city || !state || !pincode)
    return res.status(400).json({ msg: "All fields required" });

  db.query(
    "UPDATE addresses SET receiver_name=?, phone=?, street=?, city=?, state=?, pincode=? WHERE id=? AND user_id=?",
    [receiver_name, phone, street, city, state, pincode, req.params.id, req.user.id],
    (err, result) => {
      if (err) return res.status(500).json({ msg: "DB error" });
      if (result.affectedRows === 0) return res.status(404).json({ msg: "Not found" });
      res.json({ message: "Updated" });
    }
  );
});

// DELETE address — if it was default, promote the next one
router.delete("/:id", auth, (req, res) => {
  db.query(
    "SELECT is_default FROM addresses WHERE id=? AND user_id=?",
    [req.params.id, req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json({ msg: "DB error" });
      if (!rows.length) return res.status(404).json({ msg: "Not found" });

      const wasDefault = rows[0].is_default;

      db.query("DELETE FROM addresses WHERE id=? AND user_id=?", [req.params.id, req.user.id], (err2) => {
        if (err2) return res.status(500).json({ msg: "DB error" });

        if (wasDefault) {
          // Promote the most recent remaining address to default
          db.query(
            "UPDATE addresses SET is_default=1 WHERE user_id=? ORDER BY created_at DESC LIMIT 1",
            [req.user.id]
          );
        }
        res.json({ message: "Deleted" });
      });
    }
  );
});

// PATCH set as default
router.patch("/:id/default", auth, (req, res) => {
  // Clear all defaults for this user, then set the target
  db.query(
    "UPDATE addresses SET is_default=0 WHERE user_id=?",
    [req.user.id],
    (err) => {
      if (err) return res.status(500).json({ msg: "DB error" });

      db.query(
        "UPDATE addresses SET is_default=1 WHERE id=? AND user_id=?",
        [req.params.id, req.user.id],
        (err2, result) => {
          if (err2) return res.status(500).json({ msg: "DB error" });
          if (result.affectedRows === 0) return res.status(404).json({ msg: "Not found" });
          res.json({ message: "Default updated" });
        }
      );
    }
  );
});

module.exports = router;
