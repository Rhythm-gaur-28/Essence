const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Review = require('../models/Review');
const User = require('../models/User');
const { Op } = require('sequelize');

// Get all products with filters
const getAllProducts = async (req, res) => {
  try {
    const {
      brand_id,
      category_id,
      scent_family,
      min_price,
      max_price,
      is_featured,
      is_new_arrival,
      sort,
      search,
      page = 1,
      limit = 12,
    } = req.query;

    // Build where clause
    const where = {};
    if (brand_id) where.brand_id = brand_id;
    if (category_id) where.category_id = category_id;
    if (scent_family) where.scent_family = scent_family;
    if (is_featured !== undefined) where.is_featured = is_featured === 'true';
    if (is_new_arrival !== undefined) where.is_new_arrival = is_new_arrival === 'true';

    // Price filter
    if (min_price || max_price) {
      where.price = {};
      if (min_price) where.price[Op.gte] = parseFloat(min_price);
      if (max_price) where.price[Op.lte] = parseFloat(max_price);
    }

    // Search
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    // Sort
    let order = [];
    if (sort === 'price_asc') order.push(['price', 'ASC']);
    else if (sort === 'price_desc') order.push(['price', 'DESC']);
    else if (sort === 'newest') order.push(['created_at', 'DESC']);

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Query
    const { rows: products, count: total } = await Product.findAndCountAll({
      where,
      include: [
        { model: Brand, attributes: ['id', 'name'] },
        { model: Category, attributes: ['id', 'name'] },
      ],
      order,
      offset,
      limit: parseInt(limit),
    });

    // Calculate average rating for each product
    const productsWithRating = await Promise.all(
      products.map(async (product) => {
        const reviews = await Review.findAll({ where: { product_id: product.id } });
        const avgRating =
          reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0;

        return {
          ...product.toJSON(),
          rating_avg: parseFloat(avgRating),
        };
      })
    );

    res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      products: productsWithRating,
    });
  } catch (error) {
    console.error('GetAllProducts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        { model: Brand, attributes: { exclude: ['created_at', 'updated_at'] } },
        { model: Category, attributes: { exclude: ['created_at', 'updated_at'] } },
      ],
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Get reviews
    const reviews = await Review.findAll({
      where: { product_id: id },
      include: [{ model: User, attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
    });

    // Calculate average rating
    const avgRating =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    res.status(200).json({
      ...product.toJSON(),
      reviews,
      rating_avg: parseFloat(avgRating),
    });
  } catch (error) {
    console.error('GetProductById error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create product (admin)
const createProduct = async (req, res) => {
  try {
    const {
      name,
      brand_id,
      category_id,
      description,
      scent_family,
      top_notes,
      middle_notes,
      base_notes,
      price,
      discount_price,
      stock,
      size_ml,
      is_featured,
      is_new_arrival,
    } = req.body;

    // Validation
    if (!name || !brand_id || !category_id || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const parsedPrice = parseFloat(price);
    const parsedDiscountPrice = discount_price ? parseFloat(discount_price) : null;
    const parsedStock = stock !== undefined && stock !== '' ? parseInt(stock, 10) : 0;
    const parsedSizeMl = size_ml ? parseInt(size_ml, 10) : null;

    if (!Number.isFinite(parsedPrice)) {
      return res.status(400).json({ message: 'Invalid price value' });
    }
    if (parsedDiscountPrice !== null && !Number.isFinite(parsedDiscountPrice)) {
      return res.status(400).json({ message: 'Invalid discount price value' });
    }
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      return res.status(400).json({ message: 'Invalid stock value' });
    }
    if (parsedSizeMl !== null && (!Number.isInteger(parsedSizeMl) || parsedSizeMl <= 0)) {
      return res.status(400).json({ message: 'Invalid size value' });
    }

    // Check if brand and category exist
    const brand = await Brand.findByPk(brand_id);
    const category = await Category.findByPk(category_id);
    if (!brand || !category) {
      return res.status(400).json({ message: 'Invalid brand or category' });
    }

    // Handle image upload
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    const product = await Product.create({
      name,
      brand_id,
      category_id,
      description,
      scent_family,
      top_notes,
      middle_notes,
      base_notes,
      price: parsedPrice,
      discount_price: parsedDiscountPrice,
      stock: parsedStock,
      size_ml: parsedSizeMl,
      image_url,
      is_featured: is_featured === 'true',
      is_new_arrival: is_new_arrival === 'true',
    });

    res.status(201).json({
      message: 'Product added successfully',
      product,
    });
  } catch (error) {
    console.error('CreateProduct error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update product (admin)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find product
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle image upload
    if (req.file) {
      updates.image_url = `/uploads/${req.file.filename}`;
    }

    // Update product
    await product.update(updates);

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('UpdateProduct error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete product (admin)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.destroy();

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('DeleteProduct error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct };
