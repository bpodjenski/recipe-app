// app.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const recipeRoutes = require('./routes/recipes');
const expressLayouts = require('express-ejs-layouts');

const app = express();

// ✅ Ensure critical folders exist
fs.mkdirSync('/data', { recursive: true });
fs.mkdirSync('/data/uploads', { recursive: true });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// Routes
app.use('/', recipeRoutes);

// ✅ Initialize database
const { sequelize } = require('./models');
sequelize.sync().then(() => { // { alter: true } for changes to schema
  console.log('✅ All models synced to the database');
}).catch(err => {
  console.error('❌ Failed to sync database:', err);
});

// Serve uploaded images
const uploadDir = process.env.NODE_ENV === 'production'
  ? '/data/uploads'
  : path.join(__dirname, 'uploads');

app.use('/uploads', express.static(uploadDir));

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
