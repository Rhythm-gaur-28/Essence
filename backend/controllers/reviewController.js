const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');

// Get reviews for a product (public)
const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const reviews = await Review.findAll({
      where: { product_id: productId },
      include: [{
        model: User,
        attributes: ['id', 'name'],
      }],
      order: [['created_at', 'DESC']],
    });

    const formattedReviews = reviews.map(review => ({
      id: review.id,
      user: { name: review.User.name },
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
    }));

    res.status(200).json(formattedReviews);
  } catch (error) {
    console.error('GetReviewsByProduct error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Add a review (authenticated)
const addReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { product_id, rating, comment } = req.body;

    // Validation
    if (!product_id || !rating) {
      return res.status(400).json({ message: 'Product ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      where: { product_id, user_id: userId },
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = await Review.create({
      user_id: userId,
      product_id,
      rating: parseInt(rating),
      comment,
    });

    res.status(201).json({
      message: 'Review added successfully',
      review,
    });
  } catch (error) {
    console.error('AddReview error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete review (admin)
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await review.destroy();

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('DeleteReview error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { getReviewsByProduct, addReview, deleteReview };
