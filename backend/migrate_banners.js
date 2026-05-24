/**
 * Run once to create the banners table.
 * Usage: node migrate_banners.js
 */
require("dotenv").config();
const db = require("./config/db");

const sql = `
  CREATE TABLE IF NOT EXISTS banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL,
    title VARCHAR(255) DEFAULT NULL,
    subtitle VARCHAR(500) DEFAULT NULL,
    link VARCHAR(500) DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

db.query(sql, (err) => {
  if (err) { console.error("Migration failed:", err); process.exit(1); }
  console.log("✓ banners table ready.");
  process.exit(0);
});
