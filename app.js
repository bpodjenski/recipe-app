// app.js

const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the 'public' folder (e.g., CSS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Route for the home page
app.get('/', (req, res) => {
  res.render('home', { title: 'Home - Recipe Web App' });
});

// Route for the search page
app.get('/search', (req, res) => {
  res.render('search', { title: 'Search Recipes' });
});

// Route for the individual recipe page
app.get('/recipe/:id', (req, res) => {
  const recipeId = req.params.id;
  // Fetch the recipe from database by id (for now, we'll mock it)
  const recipe = { id: recipeId, name: 'Spaghetti', ingredients: 'Pasta, Tomato Sauce', instructions: 'Cook pasta, heat sauce.' };
  res.render('recipe', { title: `Recipe - ${recipe.name}`, recipe });
});

// Route for the create recipe page
app.get('/create-recipe', (req, res) => {
  res.render('create-recipe', { title: 'Create a Recipe' });
});

// Route to handle the creation of a new recipe (post form data)
app.post('/create-recipe', (req, res) => {
  const { name, ingredients, instructions } = req.body;
  // You would save the recipe to the database here.
  console.log('New Recipe:', { name, ingredients, instructions });
  res.redirect('/');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
