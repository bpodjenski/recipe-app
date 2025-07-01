// const express = require('express');
// const fs = require('fs');
// const path = require('path');
// const expressLayouts = require('express-ejs-layouts');
// const recipeRoutes = require('./routes/recipes');

// // Initialize app
// const app = express();

// // ===== File paths based on environment =====
// const isProd = process.env.NODE_ENV === 'production';
// const uploadDir = isProd
//   ? '/data/uploads'
//   : path.join(__dirname, 'uploads');
// const dbPath = isProd
//   ? '/data/recipes.sqlite'
//   : path.join(__dirname, 'data/recipes.sqlite');
// const seedDbPath = path.join(__dirname, 'seed/recipes.sqlite');

// // ===== Ensure upload and DB files exist =====
// fs.mkdirSync(uploadDir, { recursive: true });

// if (isProd && !fs.existsSync(dbPath)) {
//   console.log('📦 Seeding database from /seed/recipes.sqlite...');
//   fs.copyFileSync(seedDbPath, dbPath);
// } else {
//   console.log('📂 Database found, using existing one.');
// }

// // ===== Middleware =====
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, 'public')));
// app.use('/uploads', express.static(uploadDir));

// // ===== View engine =====
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));
// app.use(expressLayouts);
// app.set('layout', 'layout');

// // ===== Routes =====
// app.use('/', recipeRoutes);

// // ===== Database init =====
// const { sequelize } = require('./models');
// sequelize.sync().then(() => {
//   console.log('✅ All models synced to the database');
// }).catch((err) => {
//   console.error('❌ Sequelize sync failed:', err);
// });

// // ===== Start server =====
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });


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
sequelize.sync({ alter: true }).then(() => {
  console.log('✅ All models synced to the database');
}).catch(err => {
  console.error('❌ Failed to sync database:', err);
});


(async () => {
    try {
      // 1. Create new table with ON DELETE CASCADE
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS Ratings_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          rating INTEGER,
          recipeId INTEGER,
          FOREIGN KEY(recipeId) REFERENCES Recipes(id) ON DELETE CASCADE
        )
      `);
  
      // 2. Copy data from old Ratings table
      await sequelize.query(`
        INSERT INTO Ratings_new (id, rating, recipeId)
        SELECT id, rating, recipeId FROM Ratings
      `);
  
      // 3. Drop old Ratings table
      await sequelize.query(`DROP TABLE Ratings`);
  
      // 4. Rename new table to Ratings
      await sequelize.query(`ALTER TABLE Ratings_new RENAME TO Ratings`);
  
      console.log('✅ Ratings table recreated with ON DELETE CASCADE');
    } catch (err) {
      console.error('❌ Failed to rebuild Ratings table:', err);
    }
  })();

// Serve uploaded images
const uploadDir = process.env.NODE_ENV === 'production'
  ? '/data/uploads'
  : path.join(__dirname, 'uploads');

app.use('/uploads', express.static(uploadDir));

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
