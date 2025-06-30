// routes/recipes.js
const express = require('express');
const router = express.Router();
const { Recipe, Ingredient, Comment, Image, Rating } = require('../models');
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
  const recipes = await Recipe.findAll({ order: [['createdAt', 'DESC']], include: [{ model: Image }, Ingredient] });
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
  res.render('create-recipe', { recipe: {} });
});

// POST Create Recipe with Ingredients
router.post('/create-recipe', upload.array('images', 10), async (req, res) => {
  // test data persistance
  const { name, instructions, notes, person, ingredients,  cookHours, cookMinutes } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  // Convert hours + minutes to total minutes
  const cookTime = (parseInt(cookHours) || 0) * 60 + (parseInt(cookMinutes) || 0);

  const recipe = await Recipe.create({ name, instructions, cookTime, notes, person});

  // if theres files create images 
  if (req.files && req.files.length > 0) {
    const imageRecords = req.files.map(file => ({
      filename: file.filename,
      recipeId: recipe.id
    }));
    await Image.bulkCreate(imageRecords);
  }

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

// GET view edit recipe 
router.get('/recipe/:id/edit', async (req, res) => {
    const recipe = await Recipe.findByPk(req.params.id, {
      include: [Image, Ingredient]
    });
    res.render('edit', { recipe });
});

// PUT edit existing
router.post('/recipe/edit/:id', upload.array('images'), async (req, res) => {
    try {
        const { name, notes, instructions, person, ingredients, cookHours, cookMinutes } = req.body;
        const recipe = await Recipe.findByPk(req.params.id, {
          include: [Ingredient]
        });
        if (!recipe) return res.status(404).send('Recipe not found');
        
        const cookTime = parseInt(cookHours || 0) * 60 + parseInt(cookMinutes || 0);
        // Update recipe fields
        await recipe.update({ name, cookTime, notes, instructions, person });
    
        // Handle new image uploads
        if (req.files && req.files.length > 0) {
          const imageRecords = req.files.map(file => ({
            filename: file.filename,
            recipeId: recipe.id
          }));
          await Image.bulkCreate(imageRecords);
        }
    
        // Ingredients editing logic
        const submittedIngredients = Array.isArray(ingredients)
          ? ingredients
          : ingredients ? [ingredients] : [];
    
        // Normalize submittedIngredients to array of objects (sometimes single object when only 1)
        const parsedIngredients = submittedIngredients.map(ing => ({
          id: ing.id || null,
          name: ing.name.trim(),
          amount: ing.amount.trim()
        })).filter(ing => ing.name && ing.amount); // Remove empty entries
    
        // Get current ingredient IDs for deletion check
        const currentIngredientIds = recipe.Ingredients.map(i => i.id.toString());
        const submittedIds = parsedIngredients.map(i => i.id).filter(id => id);
    
        // Delete ingredients removed by user
        const idsToDelete = currentIngredientIds.filter(id => !submittedIds.includes(id));
        if (idsToDelete.length > 0) {
          await Ingredient.destroy({ where: { id: idsToDelete } });
        }
    
        // Update existing and add new ingredients
        for (const ing of parsedIngredients) {
          if (ing.id) {
            // update existing ingredient
            await Ingredient.update(
              { name: ing.name, amount: ing.amount },
              { where: { id: ing.id, recipeId: recipe.id } }
            );
          } else {
            // create new ingredient
            await Ingredient.create({
              name: ing.name,
              amount: ing.amount,
              recipeId: recipe.id
            });
          }
        }
    
        res.redirect(`/recipe/${recipe.id}`);
      } catch (error) {
        console.error(error);
        res.status(500).send('Failed to update recipe');
      }
});

// GET View Recipe Details with Ingredients and Comments
router.get('/recipe/:id', async (req, res) => {
  const recipe = await Recipe.findByPk(req.params.id, {
    include: [Ingredient, Comment, Image]
  });

  if (!recipe) return res.status(404).send('Recipe not found');

  res.render('recipe', { recipe });
});

// DELETE /recipes/:id
router.post('/recipe/delete/:id', async (req, res) => {
    const recipeId = req.params.id;
    try {
      await Recipe.destroy({ where: { id: recipeId } });
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to delete recipe.');
    }
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

// Upvote a comment
router.post('/comments/:id/upvote', async (req, res) => {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).send('Comment not found');
    comment.upvotes++;
    await comment.save();
    res.json({ upvotes: comment.upvotes, downvotes: comment.downvotes });
  });
  
// Downvote a comment
router.post('/comments/:id/downvote', async (req, res) => {
const comment = await Comment.findByPk(req.params.id);
if (!comment) return res.status(404).send('Comment not found');
comment.downvotes++;
await comment.save();
res.json({ upvotes: comment.upvotes, downvotes: comment.downvotes });
});

module.exports = router;

// GET: Show form to upload a photo
router.get('/:id/add-photo', async (req, res) => {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) return res.status(404).send('Recipe not found');
    res.render('add-photo', { recipe });
});
  
  // POST: Handle file upload + DB update
router.post('/recipe/:id/add-photo', upload.single('image'), async (req, res) => {
    const recipe = await Recipe.findByPk(req.params.id);
    if (!recipe) return res.status(404).send('Recipe not found');
  
    if (!req.file) return res.status(400).send('No image uploaded');
  
    await Image.create({
        filename: req.file.filename,
        recipeId: recipe.id
    });
  
    res.redirect(`/recipe/${recipe.id}`);
});

// POST delete image from edit recipe page
router.post('/recipe/:recipeId/images/:imageId', async (req, res) => {
    try {
      const { recipeId, imageId } = req.params;
      // Optionally check recipe ownership or existence
      const image = await Image.findOne({ where: { id: imageId, recipeId } });
      if (!image) return res.status(404).send('Image not found');
  
      // Delete the file from disk (optional but recommended)
      const fs = require('fs');
      const path = require('path');
      const imagePath = path.join(__dirname, '..', 'uploads', image.filename);
      fs.unlink(imagePath, err => {
        if (err) console.error('Failed to delete image file:', err);
      });
  
      // Delete image record from DB
      await image.destroy();
  
      res.redirect(`/recipe/${recipeId}/edit`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Failed to delete image');
    }
  });

  // POST rating
  router.post('/recipe/:id/rate', async (req, res) => {
    const recipeId = req.params.id;
    const ratingValue = Number(req.body.rating);
  
    if (isNaN(ratingValue) || ratingValue < 0 || ratingValue > 5) {
      return res.status(400).send('Invalid rating value');
    }
  
    try {
      // Create new rating without person
      await Rating.create({
        rating: ratingValue,
        recipeId
      });
  
      // Calculate average rating
      const ratings = await Rating.findAll({ where: { recipeId } });
      const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
  
      // Update Recipe with new average rating
      await Recipe.update({ rating: avgRating }, { where: { id: recipeId } });
  
      res.redirect(`/recipe/${recipeId}`);
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to submit rating');
    }
  });