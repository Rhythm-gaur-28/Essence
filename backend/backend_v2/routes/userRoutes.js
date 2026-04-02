const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");
const adminMw = require("../middleware/admin");

// GET CURRENT USER
router.get("/me", auth, (req, res) => {
  db.query(
    "SELECT id,name,email,role FROM users WHERE id=?",
    [req.user.id],
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows[0]);
    }
  );
});

// GET ALL USERS (ADMIN)
router.get("/", auth, adminMw, (req, res) => {
  db.query(
    "SELECT id,name,email,role,created_at FROM users ORDER BY created_at DESC",
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// UPDATE ROLE (ADMIN)
router.patch("/:id/role", auth, adminMw, (req, res) => {
  db.query(
    "UPDATE users SET role=? WHERE id=?",
    [req.body.role, req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Role updated" });
    }
  );
});

// DELETE USER (ADMIN) — cannot delete yourself
router.delete("/:id", auth, adminMw, (req, res) => {
  if (Number(req.params.id) === req.user.id) {
    return res.status(400).json({ msg: "You cannot delete your own account." });
  }

  db.query("DELETE FROM users WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "User deleted" });
  });
});

module.exports = router;
