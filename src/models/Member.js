const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Member = sequelize.define('Member', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  membership_number: { type: DataTypes.STRING, unique: true, allowNull: false },
  status: {
    type: DataTypes.ENUM('active', 'suspended'),
    defaultValue: 'active',
  },
});

module.exports = Member;
