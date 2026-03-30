const Category = require('../models/Category');

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.status(200).json(categories);
  } catch (error) {
    console.error('GetAllCategories error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create category (admin)
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Handle image upload
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    const category = await Category.create({
      name,
      image_url,
    });

    res.status(201).json({
      message: 'Category added successfully',
      category,
    });
  } catch (error) {
    console.error('CreateCategory error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update category (admin)
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find category
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Handle image upload
    if (req.file) {
      updates.image_url = `/uploads/${req.file.filename}`;
    }

    // Update category
    await category.update(updates);

    res.status(200).json({ message: 'Category updated successfully' });
  } catch (error) {
    console.error('UpdateCategory error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete category (admin)
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.destroy();

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('DeleteCategory error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getAllCategories, createCategory, updateCategory, deleteCategory };
