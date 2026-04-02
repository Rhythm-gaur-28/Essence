const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// GET active banners — public (used by homepage carousel)
router.get("/", (req, res) => {
  db.query(
    "SELECT * FROM banners WHERE is_active = 1 ORDER BY id ASC",
    (err, rows) => {
      if (err) return res.status(500).json({ msg: "DB error" });
      res.json(rows || []);
    }
  );
});

// GET all banners — admin only
router.get("/all", auth, admin, (req, res) => {
  db.query(
    "SELECT * FROM banners ORDER BY id DESC",
    (err, rows) => {
      if (err) return res.status(500).json({ msg: "DB error" });
      res.json(rows || []);
    }
  );
});

// POST create banner — admin only
router.post("/", auth, admin, (req, res) => {
  const { image_url, title, subtitle, link } = req.body;
  if (!image_url) return res.status(400).json({ msg: "image_url is required" });

  db.query(
    "INSERT INTO banners (image_url, title, subtitle, link, is_active) VALUES (?,?,?,?,1)",
    [image_url, title || null, subtitle || null, link || null],
    (err, result) => {
      if (err) return res.status(500).json({ msg: "DB error" });
      res.json({
        id: result.insertId,
        image_url,
        title: title || null,
        subtitle: subtitle || null,
        link: link || null,
        is_active: 1,
      });
    }
  );
});

// PUT edit banner — admin only
router.put("/:id", auth, admin, (req, res) => {
  const { image_url, title, subtitle, link } = req.body;
  if (!image_url) return res.status(400).json({ msg: "image_url is required" });

  db.query(
    "UPDATE banners SET image_url=?, title=?, subtitle=?, link=? WHERE id=?",
    [image_url, title || null, subtitle || null, link || null, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ msg: "DB error" });
      res.json({ message: "Updated", image_url, title: title || null, subtitle: subtitle || null, link: link || null });
    }
  );
});

// PATCH toggle active — admin only
router.patch("/:id/toggle", auth, admin, (req, res) => {
  db.query(
    "UPDATE banners SET is_active = NOT is_active WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ msg: "DB error" });
      res.json({ message: "Toggled" });
    }
  );
});

// DELETE banner — admin only
router.delete("/:id", auth, admin, (req, res) => {
  db.query(
    "DELETE FROM banners WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ msg: "DB error" });
      res.json({ message: "Deleted" });
    }
  );
});

module.exports = router;
