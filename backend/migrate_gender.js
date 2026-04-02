/**
 * Run this script once to add the gender column to the products table.
 * Usage: node migrate_gender.js
 */
require("dotenv").config();
const db = require("./config/db");

db.query("SHOW COLUMNS FROM products LIKE 'gender'", (err, rows) => {
  if (err) { console.error("Error:", err); process.exit(1); }

  if (rows.length > 0) {
    console.log("✓ gender column already exists. Nothing to do.");
    process.exit(0);
  }

  db.query(
    "ALTER TABLE products ADD COLUMN gender VARCHAR(20) DEFAULT 'unisex' AFTER is_new_arrival",
    (err2) => {
      if (err2) { console.error("Migration failed:", err2); process.exit(1); }
      console.log("✓ gender column added successfully.");
      process.exit(0);
    }
  );
});
