require('dotenv').config();
const db = require('./config/db');

db.query("SHOW COLUMNS FROM products LIKE 'is_best_seller'", (err, rows) => {
  if (err) { console.error('Error checking column:', err); process.exit(1); }

  if (rows && rows.length > 0) {
    console.log('✓ is_best_seller column already exists');
    process.exit(0);
  }

  db.query(
    "ALTER TABLE products ADD COLUMN is_best_seller TINYINT DEFAULT 0 AFTER is_new_arrival",
    (err2) => {
      if (err2) { console.error('Migration failed:', err2); process.exit(1); }
      console.log('✓ is_best_seller column added to products table');
      process.exit(0);
    }
  );
});
