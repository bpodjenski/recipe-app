const { Sequelize } = require('sequelize');

// Use SQLite and store data in local file
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'recipes.sqlite',
  logging: false // optional: hides SQL logs
});

module.exports = sequelize;