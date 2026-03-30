const Banner = require('../models/Banner');

// Get all active banners (public)
const getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({ where: { is_active: true } });
    res.status(200).json(banners);
  } catch (error) {
    console.error('GetActiveBanners error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Create banner (admin)
const createBanner = async (req, res) => {
  try {
    const { title, subtitle, link } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({ message: 'Banner title is required' });
    }

    // Handle image upload
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    const banner = await Banner.create({
      title,
      subtitle,
      link,
      image_url,
      is_active: true,
    });

    res.status(201).json({
      message: 'Banner created successfully',
      banner,
    });
  } catch (error) {
    console.error('CreateBanner error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update banner (admin)
const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const banner = await Banner.findByPk(id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    // Handle image upload
    if (req.file) {
      updates.image_url = `/uploads/${req.file.filename}`;
    }

    await banner.update(updates);

    res.status(200).json({ message: 'Banner updated successfully' });
  } catch (error) {
    console.error('UpdateBanner error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete banner (admin)
const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findByPk(id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    await banner.destroy();

    res.status(200).json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('DeleteBanner error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getActiveBanners, createBanner, updateBanner, deleteBanner };
