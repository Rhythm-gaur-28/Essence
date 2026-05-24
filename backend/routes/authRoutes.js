const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodemailer");
const admin = require("../config/firebaseAdmin");


router.post("/send-otp", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    db.query(
      "SELECT * FROM users WHERE email=?",
      [email],
      async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ msg: "Database error" });
        }

        if (result.length > 0) {
          return res.status(400).json({ msg: "Email already exists" });
        }

        const otp = Math.floor(
          100000 + Math.random() * 900000
        ).toString();

        const hashed = await bcrypt.hash(password, 10);

        const expires = new Date(
          Date.now() + 5 * 60 * 1000
        );

        db.query(
          "INSERT INTO otp_verifications (name,email,password,otp,expires_at) VALUES (?,?,?,?,?)",
          [name, email, hashed, otp, expires],
          async (err2) => {
            if (err2) {
              console.error(err2);
              return res.status(500).json({
                msg: "OTP save failed"
              });
            }

            try {
              await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Essence OTP Verification",
                html: `
                  <h2>Your OTP Code</h2>
                  <h1>${otp}</h1>
                  <p>This OTP expires in 5 minutes.</p>
                `
              });

              res.json({
                msg: "OTP sent successfully"
              });

            } catch (mailErr) {
              console.error(mailErr);

              return res.status(500).json({
                msg: "Email sending failed"
              });
            }
          }
        );
      }
    );
  } catch (err) {
    console.error(err);

    res.status(500).json({
      msg: "Server error"
    });
  }
});

router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  db.query(
    "SELECT * FROM otp_verifications WHERE email=? AND otp=? ORDER BY id DESC LIMIT 1",
    [email, otp],
    (err, result) => {
      if (err) return res.status(500).json(err);

      if (result.length === 0) {
        return res.status(400).json({ msg: "Invalid OTP" });
      }

      const data = result[0];

      if (new Date() > new Date(data.expires_at)) {
        return res.status(400).json({ msg: "OTP expired" });
      }

      db.query(
        "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
        [data.name, data.email, data.password, "user"],
        (err2) => {
          if (err2) return res.status(500).json(err2);

          db.query(
            "DELETE FROM otp_verifications WHERE email=?",
            [email]
          );

          res.json({ msg: "Account created successfully" });
        }
      );
    }
  );
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    db.query(
      "SELECT * FROM users WHERE email=?",
      [email],
      async (err, result) => {

        if (err) {
          console.error(err);
          return res.status(500).json(err);
        }

        if (result.length === 0) {
          return res.status(400).json({
            msg: "User not found"
          });
        }

        const otp = Math.floor(
          100000 + Math.random() * 900000
        ).toString();

        const expires = new Date(
          Date.now() + 5 * 60 * 1000
        );

        db.query(
          "INSERT INTO password_reset_otps (email,otp,expires_at) VALUES (?,?,?)",
          [email, otp, expires],
          async (err2) => {

            if (err2) {
              console.error(err2);
              return res.status(500).json(err2);
            }

            await transporter.sendMail({
              from: process.env.EMAIL_USER,
              to: email,
              subject: "Password Reset OTP",
              html: `
                <h2>Password Reset OTP</h2>
                <h1>${otp}</h1>
                <p>This OTP expires in 5 minutes.</p>
              `
            });

            res.json({
              msg: "Reset OTP sent"
            });
          }
        );
      }
    );

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    db.query(
      "SELECT * FROM password_reset_otps WHERE email=? AND otp=? ORDER BY id DESC LIMIT 1",
      [email, otp],
      async (err, result) => {

        if (err) {
          console.error(err);
          return res.status(500).json(err);
        }

        if (result.length === 0) {
          return res.status(400).json({
            msg: "Invalid OTP"
          });
        }

        const otpData = result[0];

        if (new Date() > new Date(otpData.expires_at)) {
          return res.status(400).json({
            msg: "OTP expired"
          });
        }

        const hashed = await bcrypt.hash(
          newPassword,
          10
        );

        db.query(
          "UPDATE users SET password=? WHERE email=?",
          [hashed, email],
          (err2) => {

            if (err2) {
              console.error(err2);
              return res.status(500).json(err2);
            }

            db.query(
              "DELETE FROM password_reset_otps WHERE email=?",
              [email]
            );

            res.json({
              msg: "Password reset successful"
            });
          }
        );
      }
    );

  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.post("/resend-otp", async (req, res) => {

  const { email } = req.body;

  try {

    db.query(
      "SELECT * FROM otp_verifications WHERE email=? ORDER BY id DESC LIMIT 1",
      [email],
      async (err, result) => {

        // DATABASE ERROR

        if (err) {

          console.error(err);

          return res.status(500).json({
            msg: "Database error",
            error: err
          });
        }

        // OTP NOT FOUND

        if (result.length === 0) {

          return res.status(400).json({
            msg: "No OTP request found"
          });
        }

        const userData = result[0];

        // GENERATE NEW OTP

        const newOtp = Math.floor(
          100000 + Math.random() * 900000
        ).toString();

        // OTP EXPIRY (5 MINUTES)

        const expires = new Date(
          Date.now() + 5 * 60 * 1000
        );

        // INSERT NEW OTP

        db.query(
          "INSERT INTO otp_verifications (name,email,password,otp,expires_at) VALUES (?,?,?,?,?)",
          [
            userData.name,
            userData.email,
            userData.password,
            newOtp,
            expires
          ],
          async (err2) => {

            // INSERT ERROR

            if (err2) {

              console.error(err2);

              return res.status(500).json({
                msg: "Failed to save OTP",
                error: err2
              });
            }

            try {

              // SEND EMAIL

              await transporter.sendMail({

                from: process.env.EMAIL_USER,

                to: email,

                subject: "Your New OTP",

                html: `
                  <div style="font-family: Arial, sans-serif; padding: 20px;">
                    
                    <h2>OTP Verification</h2>

                    <p>Your new OTP code is:</p>

                    <h1 style="
                      letter-spacing: 5px;
                      color: #000;
                    ">
                      ${newOtp}
                    </h1>

                    <p>
                      This OTP will expire in 5 minutes.
                    </p>

                  </div>
                `
              });

              // SUCCESS

              res.json({
                msg: "OTP resent successfully"
              });

            } catch (mailErr) {

              console.error(mailErr);

              return res.status(500).json({
                msg: "Failed to send email",
                error: mailErr
              });
            }
          }
        );
      }
    );

  } catch (err) {

    console.error(err);

    res.status(500).json({
      msg: "Server error",
      error: err
    });
  }
});

router.post("/google-login", async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    const { email, name } = decoded;

    db.query(
      "SELECT * FROM users WHERE email=?",
      [email],
      (err, result) => {
        if (err) return res.status(500).json(err);

        if (result.length > 0) {
          const user = result[0];

          const jwtToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
          );

          return res.json({
            token: jwtToken,
            user
          });
        }

        db.query(
          "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
          [name, email, "", "user"],
          (err2, insertResult) => {
            if (err2) return res.status(500).json(err2);

            const jwtToken = jwt.sign(
              {
                id: insertResult.insertId,
                role: "user"
              },
              process.env.JWT_SECRET,
              { expiresIn: "7d" }
            );

            res.json({
              token: jwtToken,
              user: {
                id: insertResult.insertId,
                name,
                email,
                role: "user"
              }
            });
          }
        );
      }
    );
  } catch (err) {
    res.status(401).json({ msg: "Invalid Google token" });
  }
});


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