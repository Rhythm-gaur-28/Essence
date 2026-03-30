const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Get wishlist for logged-in user
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlistItems = await Wishlist.findAll({
      where: { user_id: userId },
      include: [{
        model: Product,
        attributes: ['id', 'name', 'price', 'discount_price', 'image_url'],
      }],
    });

    const formattedWishlist = wishlistItems.map(item => ({
      id: item.id,
      product: item.Product,
    }));

    res.status(200).json(formattedWishlist);
  } catch (error) {
    console.error('GetWishlist error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add product to wishlist
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    // Validation
    if (!product_id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Check if product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({ where: { user_id: userId, product_id } });
    if (existing) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    await Wishlist.create({
      user_id: userId,
      product_id,
    });

    res.status(201).json({ message: 'Added to wishlist' });
  } catch (error) {
    console.error('AddToWishlist error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const wishlistItem = await Wishlist.findOne({
      where: { user_id: userId, product_id: productId },
    });

    if (!wishlistItem) {
      return res.status(404).json({ message: 'Item not in wishlist' });
    }

    await wishlistItem.destroy();

    res.status(200).json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('RemoveFromWishlist error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getWishlist, addToWishlist, removeFromWishlist };
