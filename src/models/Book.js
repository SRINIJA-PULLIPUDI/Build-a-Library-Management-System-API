const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Book = sequelize.define('Book', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  isbn: { type: DataTypes.STRING(20), unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  author: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING(100) },
  status: {
    type: DataTypes.ENUM('available', 'borrowed', 'reserved', 'maintenance'),
    defaultValue: 'available',
  },
  total_copies: { type: DataTypes.INTEGER, allowNull: false },
  available_copies: { type: DataTypes.INTEGER, allowNull: false },
});

module.exports = Book;
