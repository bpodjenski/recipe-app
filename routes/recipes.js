// routes/recipes.js
const express = require('express');
const router = express.Router();
const recipeModel = require('../models/recipe');

router.get('/', (req, res) => {
  const recipes = recipeModel.getAll();
  res.render('home', { recipes });
});

router.get('/search', (req, res) => {
  const query = req.query.q;
  const results = query ? recipeModel.search(query) : [];
  res.render('search', { results, query });
});

router.get('/create-recipe', (req, res) => {
  res.render('create-recipe');
});

router.post('/create-recipe', (req, res) => {
  recipeModel.create(req.body);
  res.redirect('/');
});

router.get('/recipe/:id', (req, res) => {
  const recipe = recipeModel.getById(req.params.id);
  if (!recipe) return res.status(404).send('Not Found');
  res.render('recipe', { recipe });
});

module.exports = router;