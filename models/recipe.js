// Define the Recipe model
const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Recipe = sequelize.define('Recipe', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  cookTime: {
    type: DataTypes.STRING, // e.g. "45 minutes"
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT
  },
  person: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true
});

module.exports = Recipe;