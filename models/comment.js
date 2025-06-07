const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Comment = sequelize.define('Comment', {
  person: {
    type: DataTypes.STRING,
    allowNull: false
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: false
});

module.exports = Comment;