const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// GET all brands (public)
router.get("/", (req, res) => {
  db.query("SELECT * FROM brands ORDER BY name ASC", (err, rows) => {
    if (err) return res.status(500).json({ msg: "DB error", error: err });
    res.json(rows);
  });
});

// POST create brand (admin)
router.post("/", auth, admin, (req, res) => {
  const { name, country, description } = req.body;
  if (!name || !country) return res.status(400).json({ msg: "Name and country are required." });

  db.query(
    "INSERT INTO brands (name, country, description) VALUES (?, ?, ?)",
    [name, country, description || ""],
    (err, result) => {
      if (err) return res.status(500).json({ msg: "DB error", error: err });
      res.json({ id: result.insertId, name, country, description: description || "" });
    }
  );
});

// DELETE brand (admin)
router.delete("/:id", auth, admin, (req, res) => {
  db.query("DELETE FROM brands WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ msg: "DB error", error: err });
    res.json({ message: "Brand deleted" });
  });
});

module.exports = router;