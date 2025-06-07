// routes/recipes.js
const express = require('express');
const router = express.Router();
const { Recipe, Ingredient, Comment } = require('../models');
const { Op } = require('sequelize');

// GET Home - list all recipes
router.get('/', async (req, res) => {
  const recipes = await Recipe.findAll({ order: [['createdAt', 'DESC']] });
  res.render('home', { recipes });
});

// GET Search
router.get('/search', async (req, res) => {
  const query = req.query.q || '';
  const results = await Recipe.findAll({
    where: {
      name: { [Op.like]: `%${query}%` }
    }
  });
  res.render('search', { results, query });
});

// GET Create Recipe Form
router.get('/create-recipe', (req, res) => {
  res.render('create-recipe');
});

// POST Create Recipe with Ingredients
router.post('/create-recipe', async (req, res) => {
  const { name, instructions, cookTime, notes, person, ingredients } = req.body;

  const recipe = await Recipe.create({ name, instructions, cookTime, notes, person });

  // `ingredients` is expected to be an array of { name, amount }
  if (Array.isArray(ingredients)) {
    for (const ing of ingredients) {
      if (ing.name && ing.amount) {
        await Ingredient.create({
          name: ing.name,
          amount: ing.amount,
          recipeId: recipe.id
        });
      }
    }
  }

  res.redirect(`/recipe/${recipe.id}`);
});

// GET View Recipe Details with Ingredients and Comments
router.get('/recipe/:id', async (req, res) => {
  const recipe = await Recipe.findByPk(req.params.id, {
    include: [Ingredient, Comment]
  });

  if (!recipe) return res.status(404).send('Recipe not found');

  res.render('view', { recipe });
});

// POST Add a Comment to a Recipe
router.post('/recipe/:id/comments', async (req, res) => {
  const { person, text } = req.body;

  await Comment.create({
    person,
    text,
    recipeId: req.params.id
  });

  res.redirect(`/recipe/${req.params.id}`);
});

module.exports = router;
// const express = require('express');
// const router = express.Router();
// const recipeModel = require('../models/recipe');

// router.get('/', (req, res) => {
//   const recipes = recipeModel.getAll();
//   res.render('home', { recipes });
// });

// router.get('/search', (req, res) => {
//   const query = req.query.q;
//   const results = query ? recipeModel.search(query) : [];
//   res.render('search', { results, query });
// });

// router.get('/create-recipe', (req, res) => {
//   res.render('create-recipe');
// });

// router.post('/create-recipe', (req, res) => {
//   recipeModel.create(req.body);
//   res.redirect('/');
// });

// router.get('/recipe/:id', (req, res) => {
//   const recipe = recipeModel.getById(req.params.id);
//   if (!recipe) return res.status(404).send('Not Found');
//   res.render('recipe', { recipe });
// });

// module.exports = router;