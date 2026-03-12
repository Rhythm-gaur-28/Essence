const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:            { type: DataTypes.STRING(150), allowNull: false },
  brand_id:        { type: DataTypes.INTEGER, allowNull: false },
  category_id:     { type: DataTypes.INTEGER, allowNull: false },
  description:     { type: DataTypes.TEXT },
  scent_family:    { type: DataTypes.ENUM('floral', 'woody', 'oriental', 'fresh', 'gourmand') },
  top_notes:       { type: DataTypes.STRING(255) },
  middle_notes:    { type: DataTypes.STRING(255) },
  base_notes:      { type: DataTypes.STRING(255) },
  price:           { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  discount_price:  { type: DataTypes.DECIMAL(10, 2) },
  stock:           { type: DataTypes.INTEGER, defaultValue: 0 },
  size_ml:         { type: DataTypes.INTEGER },
  image_url:       { type: DataTypes.STRING(255) },
  is_featured:     { type: DataTypes.BOOLEAN, defaultValue: false },
  is_new_arrival:  { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

module.exports = Product;
