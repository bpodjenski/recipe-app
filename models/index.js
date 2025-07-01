const sequelize = require('../database');
const Recipe = require('./recipe');
const Ingredient = require('./ingredient');
const Comment = require('./comment');
const Image = require('./image');
const Rating = require('./rating')



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

Recipe.hasMany(Image, { 
  foreignKey: 'recipeId', 
  onDelete: 'CASCADE'});
Image.belongsTo(Recipe, { foreignKey: 'recipeId' });

Rating.hasMany(Recipe, {
  foreignKey: 'recipeId',
  onDelete: 'CASCADE'
})
Rating.belongsTo(Recipe, { foreignKey: 'recipeId' });

module.exports = {
  sequelize,
  Recipe,
  Ingredient,
  Comment,
  Image,
  Rating
};