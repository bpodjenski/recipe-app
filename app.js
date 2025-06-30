// app.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const recipeRoutes = require('./routes/recipes');
const expressLayouts = require('express-ejs-layouts');

const app = express();

fs.mkdirSync('/data/uploads', { recursive: true });

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(expressLayouts);
app.set('layout', 'layout');

app.use('/', recipeRoutes);

// initialize sqlite objects
const { sequelize } = require('./models');
sequelize.sync().then(() => {
  console.log('✅ All models synced to the database');
});

const uploadDir = process.env.NODE_ENV === 'production'
  ? '/data/uploads'
  : path.join(__dirname, 'uploads');

app.use('/uploads', express.static(uploadDir));

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
