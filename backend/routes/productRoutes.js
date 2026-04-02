const express = require("express");
const router = express.Router();
const db = require("../config/db");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");


// GET ALL PRODUCTS (SHOP FILTER)
router.get("/", (req, res) => {
  const {
    brands,
    categories,
    scents,
    genders,
    minPrice,
    maxPrice,
    sort,
    search,
    featured,
    newArrival,
    bestSeller
  } = req.query;

  let query = "SELECT * FROM products WHERE 1=1";
  let params = [];

  if (brands) {
    query += ` AND brand_id IN (${brands.split(",").map(() => "?").join(",")})`;
    params.push(...brands.split(","));
  }

  if (categories) {
    query += ` AND category_id IN (${categories.split(",").map(() => "?").join(",")})`;
    params.push(...categories.split(","));
  }

  if (genders) {
    query += ` AND gender IN (${genders.split(",").map(() => "?").join(",")})`;
    params.push(...genders.split(","));
  }

  if (scents) {
    query += ` AND scent_family IN (${scents.split(",").map(() => "?").join(",")})`;
    params.push(...scents.split(","));
  }

  if (minPrice) {
    query += " AND price >= ?";
    params.push(minPrice);
  }

  if (maxPrice) {
    query += " AND price <= ?";
    params.push(maxPrice);
  }

  if (search) {
    query += " AND (name LIKE ? OR brand_name LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  if (featured === "true") query += " AND is_featured = 1";
  if (newArrival === "true") query += " AND is_new_arrival = 1";
  if (bestSeller === "true") query += " AND is_best_seller = 1";

  if (sort === "price_asc") query += " ORDER BY price ASC";
  else if (sort === "price_desc") query += " ORDER BY price DESC";
  else if (sort === "rating") query += " ORDER BY rating DESC";
  else query += " ORDER BY created_at DESC";

  db.query(query, params, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});


// PATCH TOGGLE BEST SELLER — must be before /:id
router.patch("/:id/best-seller", auth, admin, (req, res) => {
  db.query(
    "UPDATE products SET is_best_seller = NOT is_best_seller WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ msg: "DB error" });
      db.query(
        "SELECT is_best_seller FROM products WHERE id=?",
        [req.params.id],
        (e2, rows) => {
          if (e2 || !rows.length) return res.json({ message: "Updated" });
          res.json({ message: "Updated", is_best_seller: rows[0].is_best_seller });
        }
      );
    }
  );
});


// GET SINGLE PRODUCT
router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM products WHERE id=?",
    [req.params.id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      if (!result || result.length === 0) return res.status(404).json({ msg: "Product not found" });
      res.json(result[0]);
    }
  );
});


// ADMIN - ADD PRODUCT
router.post("/", auth, admin, (req, res) => {
  const {
    name,
    brand_name,
    brand_id,
    category_id,
    price,
    discount_price,
    scent_family,
    size_ml,
    stock,
    description,
    top_notes,
    middle_notes,
    base_notes,
    image_url,
    gender,
    is_featured,
    is_new_arrival,
    is_best_seller
  } = req.body;

  const query = `
    INSERT INTO products
    (name, brand_name, brand_id, category_id, price, discount_price,
    scent_family, size_ml, stock, description, top_notes,
    middle_notes, base_notes, image_url, gender, is_featured, is_new_arrival, is_best_seller)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

  db.query(
    query,
    [
      name,
      brand_name,
      brand_id,
      category_id,
      price,
      discount_price || null,
      scent_family,
      size_ml || null,
      stock,
      description,
      top_notes,
      middle_notes,
      base_notes,
      image_url || "",
      gender || "unisex",
      is_featured ? 1 : 0,
      is_new_arrival ? 1 : 0,
      is_best_seller ? 1 : 0
    ],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.json({ message: "Product added", id: result.insertId });
    }
  );
});


// ADMIN - UPDATE PRODUCT
router.put("/:id", auth, admin, (req, res) => {
  const {
    name,
    brand_name,
    brand_id,
    category_id,
    price,
    discount_price,
    scent_family,
    size_ml,
    stock,
    description,
    top_notes,
    middle_notes,
    base_notes,
    image_url,
    gender,
    is_featured,
    is_new_arrival,
    is_best_seller
  } = req.body;

  const query = `
    UPDATE products SET
    name=?, brand_name=?, brand_id=?, category_id=?, price=?,
    discount_price=?, scent_family=?, size_ml=?, stock=?,
    description=?, top_notes=?, middle_notes=?, base_notes=?,
    image_url=?, gender=?, is_featured=?, is_new_arrival=?, is_best_seller=?
    WHERE id=?
  `;

  db.query(
    query,
    [
      name,
      brand_name,
      brand_id,
      category_id,
      price,
      discount_price || null,
      scent_family,
      size_ml || null,
      stock,
      description,
      top_notes,
      middle_notes,
      base_notes,
      image_url || "",
      gender || "unisex",
      is_featured ? 1 : 0,
      is_new_arrival ? 1 : 0,
      is_best_seller ? 1 : 0,
      req.params.id
    ],
    (err) => {
      if (err) return res.status(500).send(err);
      res.json({ message: "Product updated" });
    }
  );
});


// ADMIN - DELETE PRODUCT
router.delete("/:id", auth, admin, (req, res) => {
  db.query(
    "DELETE FROM products WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).send(err);
      res.json({ message: "Product deleted" });
    }
  );
});


module.exports = router;
