// routes/recipes.js
const express = require('express');
const router = express.Router();
const { Recipe, Ingredient, Comment } = require('../models');
const upload = require('../middleware/upload');
const { Op } = require('sequelize');

const multer = require('multer');
const path = require('path');

// Set storage location and file naming
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'data', 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});




// GET Home - list all recipes
router.get('/', async (req, res) => {
  const recipes = await Recipe.findAll({ order: [['createdAt', 'DESC']] });
  res.render('home', { recipes });
});

// GET Search
router.get('/search', async (req, res) => {
    const query = req.query.q || '';
  
    try {
      const recipes = await Recipe.findAll({
        where: {
          name: {
            [Op.like]: `%${query}%`
          }
        },
        order: [['createdAt', 'DESC']]
      });
      res.render('search', { recipes, query });
    } catch (err) {
      console.error(err);
      res.render('search', { recipes: [], query });
    }
  });

// search live update api 
router.get('/api/search', async (req, res) => {
    const query = req.query.q || '';
  
    try {
      let recipes;
  
      if (query.trim() === '') {
        // Return all recipes if query is empty
        recipes = await Recipe.findAll({
          order: [['createdAt', 'DESC']],
        });
      } else {
        recipes = await Recipe.findAll({
          where: {
            name: {
              [Op.like]: `%${query}%`
            }
          },
          order: [['createdAt', 'DESC']]
        });
      }
  
      res.json(recipes);
    } catch (err) {
      console.error(err);
      res.status(500).json([]);
    }
  });

// GET Create Recipe Form
router.get('/create-recipe', (req, res) => {
  res.render('create-recipe');
});

// POST Create Recipe with Ingredients
router.post('/create-recipe', upload.single('image'), async (req, res) => {
  // test data persistance
  const { name, instructions, cookTime, notes, person, ingredients } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  const recipe = await Recipe.create({ name, instructions, cookTime, notes, person, imagePath });


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

  res.render('recipe', { recipe });
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
