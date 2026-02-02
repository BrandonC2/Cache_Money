const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Recipe = require('../models/Recipe');
const User = require('../models/User');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads/');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// Serve uploads folder publicly
router.use('/uploads', express.static(uploadDir));

// ===================
// Create Recipe
// ===================
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, ingredients, createdBy } = req.body;

    if (!name || !createdBy) return res.status(400).json({ message: 'Missing required fields' });

    const user = await User.findOne({ username: createdBy });
    if (!user) return res.status(404).json({ message: 'User not found' });

    let parsedIngredients = [];
    if (ingredients) {
      parsedIngredients = JSON.parse(ingredients).map(ing => ({
        name: ing.name,
        quantity: ing.quantity || 1,
        unit: ing.unit || '',
        notes: ing.notes || '',
      }));
    }

    // Log uploaded file for debugging
    console.log('Uploaded file:', req.file);

    const recipe = new Recipe({
      userId: user._id,
      name,
      description,
      ingredients: parsedIngredients,
      image: req.file ? req.file.filename : null,
    });

    await recipe.save();

    res.json({
      message: 'Recipe created successfully',
      data: recipe,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });
  } catch (err) {
    console.error('Recipe creation error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

// ===================
// Get all recipes
// ===================
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('userId', 'username');
    res.status(200).json(recipes);
  } catch (err) {
    console.error('Recipe load error:', err);
    res.status(500).json({ message: 'Failed to load recipes' });
  }
});

module.exports = router;
