// app.js
const express = require('express');
const path = require('path');
const recipeRoutes = require('./routes/recipes');
const expressLayouts = require('express-ejs-layouts');


const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(expressLayouts);
app.set('layout', 'layout');

app.use('/', recipeRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
