const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Coupon = require('../models/Coupon');
const { Op } = require('sequelize');

// Place a new order
const placeOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, payment_method, shipping_address, coupon_code } = req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }
    if (!payment_method) {
      return res.status(400).json({ message: 'Payment method is required' });
    }
    if (!shipping_address) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Calculate total amount
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product_id} not found` });
      }

      const priceAtPurchase = product.discount_price || product.price;
      totalAmount += priceAtPurchase * item.quantity;
      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: priceAtPurchase,
      });
    }

    // Apply coupon if provided
    let discountAmount = 0;
    if (coupon_code) {
      const coupon = await Coupon.findOne({ where: { code: coupon_code, is_active: true } });
      if (coupon) {
        if (new Date(coupon.expiry_date) < new Date()) {
          return res.status(400).json({ message: 'Coupon has expired' });
        }
        if (coupon.used_count >= coupon.max_uses) {
          return res.status(400).json({ message: 'Coupon usage limit exceeded' });
        }
        discountAmount = (totalAmount * coupon.discount_percent) / 100;
        totalAmount -= discountAmount;
      }
    }

    // Create order
    const order = await Order.create({
      user_id: userId,
      total_amount: totalAmount,
      payment_method,
      shipping_address: typeof shipping_address === 'string' ? shipping_address : JSON.stringify(shipping_address),
    });

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({
        order_id: order.id,
        ...item,
      });
    }

    // Update coupon usage if applicable
    if (coupon_code) {
      const coupon = await Coupon.findOne({ where: { code: coupon_code } });
      if (coupon) {
        coupon.used_count += 1;
        await coupon.save();
      }
    }

    // Clear user's cart
    await Cart.destroy({ where: { user_id: userId } });

    res.status(201).json({
      message: 'Order placed successfully',
      order_id: order.id,
      total_amount: totalAmount,
    });
  } catch (error) {
    console.error('PlaceOrder error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user's orders
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [{
        model: OrderItem,
        include: [{ model: Product, attributes: ['id', 'name', 'price'] }],
      }],
      order: [['created_at', 'DESC']],
    });

    const formattedOrders = orders.map(order => ({
      id: order.id,
      total_amount: order.total_amount,
      status: order.status,
      payment_method: order.payment_method,
      created_at: order.created_at,
      items: order.OrderItems.map(item => ({
        product_name: item.Product.name,
        quantity: item.quantity,
        price_at_purchase: item.price_at_purchase,
      })),
    }));

    res.status(200).json(formattedOrders);
  } catch (error) {
    console.error('GetMyOrders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get single order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findByPk(id, {
      include: [{
        model: OrderItem,
        include: [{ model: Product }],
      }],
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check authorization (user can only see their orders)
    if (order.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('GetOrderById error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const where = {};
    if (status) where.status = status;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { rows: orders, count: total } = await Order.findAndCountAll({
      where,
      include: [{
        model: OrderItem,
        include: [{ model: Product, attributes: ['id', 'name'] }],
      }],
      offset,
      limit: parseInt(limit),
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      orders,
    });
  } catch (error) {
    console.error('GetAllOrders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update order status (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validation
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ message: 'Order status updated' });
  } catch (error) {
    console.error('UpdateOrderStatus error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { placeOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };
