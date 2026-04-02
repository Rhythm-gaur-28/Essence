/**
 * Creates the addresses table.
 * Usage: node migrate_addresses.js
 */
require("dotenv").config();
const db = require("./config/db");

const sql = `
  CREATE TABLE IF NOT EXISTS addresses (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    receiver_name VARCHAR(255) NOT NULL,
    phone       VARCHAR(20)  NOT NULL,
    street      VARCHAR(500) NOT NULL,
    city        VARCHAR(100) NOT NULL,
    state       VARCHAR(100) NOT NULL,
    pincode     VARCHAR(10)  NOT NULL,
    is_default  TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`;

db.query(sql, (err) => {
  if (err) { console.error("Migration failed:", err); process.exit(1); }
  console.log("✓ addresses table ready.");
  process.exit(0);
});
