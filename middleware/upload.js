// middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set the upload path based on environment
const uploadPath = process.env.NODE_ENV === 'production'
  ? '/data/uploads'
  : path.join(__dirname, '../uploads');

// Ensure the folder exists
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });
module.exports = upload;