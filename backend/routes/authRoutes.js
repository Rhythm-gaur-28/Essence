const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// REGISTER USER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
    [name, email, hashed, "user"],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: "User created" });
    }
  );
});


// LOGIN USER / ADMIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=?",
    [email],
    async (err, result) => {
      if (err) return res.status(500).json({ msg: "Database error" });
      if (!result || result.length === 0)
        return res.status(400).json({ msg: "User not found" });

      const user = result[0];

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(400).json({ msg: "Wrong password" });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    }
  );
});


// GET CURRENT USER
router.get("/me", require("../middleware/auth"), (req, res) => {
  res.json(req.user);
});


// UPDATE PROFILE (name & email)
router.put("/update-profile", require("../middleware/auth"), (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.id;

  if (!name || !email)
    return res.status(400).json({ msg: "Name and email are required." });

  db.query(
    "UPDATE users SET name=?, email=? WHERE id=?",
    [name, email, userId],
    (err, result) => {
      if (err) return res.status(500).json({ msg: "Database error.", error: err });
      res.json({ message: "Profile updated successfully." });
    }
  );
});


// UPDATE PASSWORD
router.put("/update-password", require("../middleware/auth"), async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword)
    return res.status(400).json({ msg: "Both current and new password are required." });

  if (newPassword.length < 6)
    return res.status(400).json({ msg: "New password must be at least 6 characters." });

  db.query("SELECT * FROM users WHERE id=?", [userId], async (err, result) => {
    if (err) return res.status(500).json({ msg: "Database error.", error: err });
    if (result.length === 0) return res.status(404).json({ msg: "User not found." });

    const user = result[0];

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ msg: "Current password is incorrect." });

    const hashed = await bcrypt.hash(newPassword, 10);

    db.query("UPDATE users SET password=? WHERE id=?", [hashed, userId], (err2) => {
      if (err2) return res.status(500).json({ msg: "Failed to update password.", error: err2 });
      res.json({ message: "Password updated successfully." });
    });
  });
});


module.exports = router;