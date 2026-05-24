const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const createTransporter = require("../config/nodemailer");
const admin = require("../config/firebaseAdmin");


// SEND OTP
router.post("/send-otp", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    db.query(
      "SELECT * FROM users WHERE email=?",
      [email],
      async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            msg: "Database error"
          });
        }

        if (result.length > 0) {
          return res.status(400).json({
            msg: "Email already exists"
          });
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
              const transporter = await createTransporter();

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
              console.error("MAIL ERROR:", mailErr);

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


// VERIFY OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  db.query(
    "SELECT * FROM otp_verifications WHERE email=? AND otp=? ORDER BY id DESC LIMIT 1",
    [email, otp],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          msg: "Database error"
        });
      }

      if (result.length === 0) {
        return res.status(400).json({
          msg: "Invalid OTP"
        });
      }

      const data = result[0];

      if (new Date() > new Date(data.expires_at)) {
        return res.status(400).json({
          msg: "OTP expired"
        });
      }

      db.query(
        "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
        [data.name, data.email, data.password, "user"],
        (err2) => {
          if (err2) {
            console.error(err2);
            return res.status(500).json({
              msg: "User creation failed"
            });
          }

          db.query(
            "DELETE FROM otp_verifications WHERE email=?",
            [email]
          );

          res.json({
            msg: "Account created successfully"
          });
        }
      );
    }
  );
});


// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    db.query(
      "SELECT * FROM users WHERE email=?",
      [email],
      async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            msg: "Database error"
          });
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
              return res.status(500).json({
                msg: "OTP save failed"
              });
            }

            try {
              const transporter = await createTransporter();

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

            } catch (mailErr) {
              console.error("MAIL ERROR:", mailErr);

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


// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    db.query(
      "SELECT * FROM password_reset_otps WHERE email=? AND otp=? ORDER BY id DESC LIMIT 1",
      [email, otp],
      async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            msg: "Database error"
          });
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

        const hashed = await bcrypt.hash(newPassword, 10);

        db.query(
          "UPDATE users SET password=? WHERE email=?",
          [hashed, email],
          (err2) => {
            if (err2) {
              console.error(err2);
              return res.status(500).json({
                msg: "Password update failed"
              });
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

    res.status(500).json({
      msg: "Server error"
    });
  }
});


// RESEND OTP
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;

  try {
    db.query(
      "SELECT * FROM otp_verifications WHERE email=? ORDER BY id DESC LIMIT 1",
      [email],
      async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            msg: "Database error"
          });
        }

        if (result.length === 0) {
          return res.status(400).json({
            msg: "No OTP request found"
          });
        }

        const userData = result[0];

        const newOtp = Math.floor(
          100000 + Math.random() * 900000
        ).toString();

        const expires = new Date(
          Date.now() + 5 * 60 * 1000
        );

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
            if (err2) {
              console.error(err2);
              return res.status(500).json({
                msg: "Failed to save OTP"
              });
            }

            try {
              const transporter = await createTransporter();

              await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Your New OTP",
                html: `
                  <h2>OTP Verification</h2>
                  <h1>${newOtp}</h1>
                  <p>This OTP expires in 5 minutes.</p>
                `
              });

              res.json({
                msg: "OTP resent successfully"
              });

            } catch (mailErr) {
              console.error("MAIL ERROR:", mailErr);

              return res.status(500).json({
                msg: "Failed to send email"
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


// GOOGLE LOGIN
router.post("/google-login", async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    const { email, name } = decoded;

    db.query(
      "SELECT * FROM users WHERE email=?",
      [email],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({
            msg: "Database error"
          });
        }

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
            if (err2) {
              console.error(err2);
              return res.status(500).json({
                msg: "User creation failed"
              });
            }

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
    console.error(err);

    res.status(401).json({
      msg: "Invalid Google token"
    });
  }
});


// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
    [name, email, hashed, "user"],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          msg: "Registration failed"
        });
      }

      res.json({
        message: "User created"
      });
    }
  );
});


// LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=?",
    [email],
    async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          msg: "Database error"
        });
      }

      if (!result || result.length === 0) {
        return res.status(400).json({
          msg: "User not found"
        });
      }

      const user = result[0];

      const valid = await bcrypt.compare(
        password,
        user.password
      );

      if (!valid) {
        return res.status(400).json({
          msg: "Wrong password"
        });
      }

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


// UPDATE PROFILE
router.put("/update-profile", require("../middleware/auth"), (req, res) => {
  const { name, email } = req.body;
  const userId = req.user.id;

  if (!name || !email) {
    return res.status(400).json({
      msg: "Name and email are required"
    });
  }

  db.query(
    "UPDATE users SET name=?, email=? WHERE id=?",
    [name, email, userId],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          msg: "Profile update failed"
        });
      }

      res.json({
        msg: "Profile updated successfully"
      });
    }
  );
});


// UPDATE PASSWORD
router.put("/update-password", require("../middleware/auth"), async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  db.query(
    "SELECT * FROM users WHERE id=?",
    [userId],
    async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({
          msg: "Database error"
        });
      }

      if (result.length === 0) {
        return res.status(404).json({
          msg: "User not found"
        });
      }

      const user = result[0];

      const valid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!valid) {
        return res.status(400).json({
          msg: "Current password incorrect"
        });
      }

      const hashed = await bcrypt.hash(
        newPassword,
        10
      );

      db.query(
        "UPDATE users SET password=? WHERE id=?",
        [hashed, userId],
        (err2) => {
          if (err2) {
            console.error(err2);
            return res.status(500).json({
              msg: "Password update failed"
            });
          }

          res.json({
            msg: "Password updated successfully"
          });
        }
      );
    }
  );
});

module.exports = router;