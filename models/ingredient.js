const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Ingredient = sequelize.define('Ingredient', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: false
});

module.exports = Ingredient;