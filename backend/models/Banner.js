const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Banner = sequelize.define('Banner', {
  id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title:     { type: DataTypes.STRING(150) },
  subtitle:  { type: DataTypes.STRING(255) },
  image_url: { type: DataTypes.STRING(255) },
  link:      { type: DataTypes.STRING(255) },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'banners',
  timestamps: false,
});

module.exports = Banner;
