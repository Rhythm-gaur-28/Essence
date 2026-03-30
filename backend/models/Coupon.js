const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Coupon = sequelize.define('Coupon', {
  id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  code:             { type: DataTypes.STRING(50), allowNull: false, unique: true },
  discount_percent: { type: DataTypes.INTEGER, allowNull: false },
  max_uses:         { type: DataTypes.INTEGER },
  used_count:       { type: DataTypes.INTEGER, defaultValue: 0 },
  expiry_date:      { type: DataTypes.DATEONLY },
  is_active:        { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'coupons',
  timestamps: false,
});

module.exports = Coupon;
