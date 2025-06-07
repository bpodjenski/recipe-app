// models/recipe.js
const fs = require('fs');
const path = require('path');
const dataFile = path.join(__dirname, '../data/recipes.json');

function load() {
  if (!fs.existsSync(dataFile)) return [];
  const raw = fs.readFileSync(dataFile);
  return JSON.parse(raw);
}

function save(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

module.exports = {
  getAll: () => load(),
  getById: (id) => load().find(r => r.id === id),
  search: (q) => load().filter(r => r.title.toLowerCase().includes(q.toLowerCase())),
  create: (recipe) => {
    const recipes = load();
    recipe.id = Date.now().toString();
    recipes.push(recipe);
    save(recipes);
  }
};