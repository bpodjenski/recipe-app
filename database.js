const multer = require('multer');
const { Sequelize } = require('sequelize');
const path = require('path');
const isProd = process.env.NODE_ENV === 'production';

const storagePath = isProd
  ? '/data/recipes.sqlite'
  : path.join(__dirname, '../data/recipes.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagePath,
  logging: false
});

module.exports = sequelize;