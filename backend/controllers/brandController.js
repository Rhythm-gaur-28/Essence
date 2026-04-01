const Brand = require('../models/Brand');

// Get all brands
const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll();
    res.status(200).json(brands);
  } catch (error) {
    console.error('GetAllBrands error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create brand (admin)
const createBrand = async (req, res) => {
  try {
    const { name, description, country } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ message: 'Brand name is required' });
    }

    // Handle image upload
    let logo_url = null;
    if (req.file) {
      logo_url = `/uploads/${req.file.filename}`;
    }

    const brand = await Brand.create({
      name,
      description,
      country,
      logo_url,
    });

    res.status(201).json({
      message: 'Brand added successfully',
      brand,
    });
  } catch (error) {
    console.error('CreateBrand error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update brand (admin)
const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find brand
    const brand = await Brand.findByPk(id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    // Handle image upload
    if (req.file) {
      updates.logo_url = `/uploads/${req.file.filename}`;
    }

    // Update brand
    await brand.update(updates);

    res.status(200).json({ message: 'Brand updated successfully' });
  } catch (error) {
    console.error('UpdateBrand error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete brand (admin)
const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findByPk(id);
    if (!brand) {
      return res.status(404).json({ message: 'Brand not found' });
    }

    await brand.destroy();

    res.status(200).json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('DeleteBrand error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getAllBrands, createBrand, updateBrand, deleteBrand };
