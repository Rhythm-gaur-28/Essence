const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get cart for logged-in user
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await Cart.findAll({
      where: { user_id: userId },
      include: [{
        model: Product,
        attributes: ['id', 'name', 'price', 'discount_price', 'image_url', 'stock'],
      }],
    });

    const formattedCart = cartItems.map(item => ({
      id: item.id,
      product: item.Product,
      quantity: item.quantity,
    }));

    res.status(200).json(formattedCart);
  } catch (error) {
    console.error('GetCart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, quantity = 1 } = req.body;

    // Validation
    if (!product_id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    // Check if product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if item already exists in cart
    let cartItem = await Cart.findOne({ where: { user_id: userId, product_id } });

    if (cartItem) {
      // Update quantity
      cartItem.quantity += parseInt(quantity);
      await cartItem.save();
    } else {
      // Create new cart item
      cartItem = await Cart.create({
        user_id: userId,
        product_id,
        quantity: parseInt(quantity),
      });
    }

    res.status(200).json({ message: 'Added to cart' });
  } catch (error) {
    console.error('AddToCart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // Validation
    if (quantity === undefined || quantity <= 0) {
      return res.status(400).json({ message: 'Valid quantity is required' });
    }

    const cartItem = await Cart.findByPk(id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Check authorization
    if (cartItem.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    cartItem.quantity = parseInt(quantity);
    await cartItem.save();

    res.status(200).json({ message: 'Cart updated' });
  } catch (error) {
    console.error('UpdateCartItem error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cartItem = await Cart.findByPk(id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    // Check authorization
    if (cartItem.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await cartItem.destroy();

    res.status(200).json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('RemoveFromCart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
