const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const User = require('../models/User');
const { Op, sequelize } = require('sequelize');

// Get analytics summary
const getAnalyticsSummary = async (req, res) => {
  try {
    // Total revenue
    const orders = await Order.findAll({ where: { status: { [Op.ne]: 'cancelled' } } });
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

    // Total orders
    const totalOrders = orders.length;

    // Total users
    const totalUsers = await User.count();

    // Total products
    const totalProducts = await Product.count();

    res.status(200).json({
      total_revenue: parseFloat(totalRevenue.toFixed(2)),
      total_orders: totalOrders,
      total_users: totalUsers,
      total_products: totalProducts,
    });
  } catch (error) {
    console.error('GetAnalyticsSummary error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get revenue by month (last 6 months)
const getRevenueByMonth = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const orders = await Order.findAll({
      where: {
        created_at: { [Op.gte]: sixMonthsAgo },
        status: { [Op.ne]: 'cancelled' },
      },
      raw: true,
    });

    // Group by month
    const revenueByMonth = {};
    orders.forEach(order => {
      const date = new Date(order.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!revenueByMonth[monthKey]) revenueByMonth[monthKey] = 0;
      revenueByMonth[monthKey] += parseFloat(order.total_amount);
    });

    // Convert to array and format
    const result = Object.entries(revenueByMonth).map(([month, revenue]) => {
      const [year, monthNum] = month.split('-');
      const date = new Date(year, parseInt(monthNum) - 1);
      return {
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        revenue: parseFloat(revenue.toFixed(2)),
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('GetRevenueByMonth error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get top 5 selling products
const getTopProducts = async (req, res) => {
  try {
    const topProducts = await OrderItem.findAll({
      attributes: [
        [sequelize.col('Product.name'), 'product_name'],
        [sequelize.fn('SUM', sequelize.col('quantity')), 'total_sold'],
        [sequelize.fn('SUM', sequelize.literal('quantity * price_at_purchase')), 'revenue'],
      ],
      include: [{ model: Product, attributes: [] }],
      group: ['product_id'],
      order: [[sequelize.literal('total_sold'), 'DESC']],
      limit: 5,
      subQuery: false,
      raw: true,
    });

    const result = topProducts.map(item => ({
      product_name: item.product_name,
      total_sold: parseInt(item.total_sold),
      revenue: parseFloat(item.revenue),
    }));

    res.status(200).json(result);
  } catch (error) {
    console.error('GetTopProducts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user signups by month
const getUserSignups = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const users = await User.findAll({
      where: { created_at: { [Op.gte]: sixMonthsAgo } },
      raw: true,
    });

    // Group by month
    const signupsByMonth = {};
    users.forEach(user => {
      const date = new Date(user.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!signupsByMonth[monthKey]) signupsByMonth[monthKey] = 0;
      signupsByMonth[monthKey] += 1;
    });

    // Convert to array and format
    const result = Object.entries(signupsByMonth).map(([month, count]) => {
      const [year, monthNum] = month.split('-');
      const date = new Date(year, parseInt(monthNum) - 1);
      return {
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        new_users: count,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('GetUserSignups error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { rows: users, count: total } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      offset,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      users,
    });
  } catch (error) {
    console.error('GetAllUsers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user by ID with order history
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: Order,
        include: [{ model: OrderItem }],
      }],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('GetUserById error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user (change role or status)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validation
    const validRoles = ['user', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (role) {
      user.role = role;
      await user.save();
    }

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('UpdateUser error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAnalyticsSummary,
  getRevenueByMonth,
  getTopProducts,
  getUserSignups,
  getAllUsers,
  getUserById,
  updateUser,
};
