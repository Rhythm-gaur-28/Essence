const User = require('../models/User');

const isAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized.' });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'role'],
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    // Keep req.user role synced with database state for downstream handlers.
    req.user.role = user.role;
    return next();
  } catch (error) {
    console.error('isAdmin middleware error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { isAdmin };
