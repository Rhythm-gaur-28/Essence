const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Brand = sequelize.define('Brand', {
  id:          { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING(100), allowNull: false },
  logo_url:    { type: DataTypes.STRING(255) },
  description: { type: DataTypes.TEXT },
  country:     { type: DataTypes.STRING(100) },
}, {
  tableName: 'brands',
  timestamps: false,
});

module.exports = Brand;
