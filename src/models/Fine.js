const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Fine = sequelize.define('Fine', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  paid_at: { type: DataTypes.DATE, allowNull: true },
});

module.exports = Fine;
