/**
 * Adds payment_status and paid_at columns to orders table.
 * Usage: node migrate_orders_payment.js
 */
require("dotenv").config();
const db = require("./config/db");

function addColumnIfMissing(col, definition, cb) {
  db.query(`SHOW COLUMNS FROM orders LIKE '${col}'`, (err, rows) => {
    if (err) { console.error(err); return cb(err); }
    if (rows.length > 0) { console.log(`✓ '${col}' already exists`); return cb(); }
    db.query(`ALTER TABLE orders ADD COLUMN ${col} ${definition}`, (err2) => {
      if (err2) { console.error(`Failed to add '${col}':`, err2); return cb(err2); }
      console.log(`✓ Added '${col}'`);
      cb();
    });
  });
}

addColumnIfMissing("payment_status", "VARCHAR(20) NOT NULL DEFAULT 'yet_to_be_paid'", (e1) => {
  if (e1) process.exit(1);
  addColumnIfMissing("paid_at", "DATETIME DEFAULT NULL", (e2) => {
    if (e2) process.exit(1);
    console.log("✓ orders table migration complete.");
    process.exit(0);
  });
});
