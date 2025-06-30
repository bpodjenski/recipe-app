const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Image = sequelize.define('Image', {
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    recipeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    timestamps: false
  });
  
  module.exports = Image;