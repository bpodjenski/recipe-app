const sequelize = require('../database');
const Recipe = require('./recipe');
const Ingredient = require('./ingredient');
const Comment = require('./comment');

// One-to-Many: Recipe → Ingredients
Recipe.hasMany(Ingredient, {
  foreignKey: 'recipeId',
  onDelete: 'CASCADE'
});
Ingredient.belongsTo(Recipe, { foreignKey: 'recipeId' });

// One-to-Many: Recipe → Comments
Recipe.hasMany(Comment, {
  foreignKey: 'recipeId',
  onDelete: 'CASCADE'
});
Comment.belongsTo(Recipe, { foreignKey: 'recipeId' });

module.exports = {
  sequelize,
  Recipe,
  Ingredient,
  Comment
};