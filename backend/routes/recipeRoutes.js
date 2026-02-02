const express = require('express');
const router = express.Router();
const multer = require('multer');
const Recipe = require('../models/Recipe');
const User = require('../models/User');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Create recipe
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, description, ingredients, createdBy } = req.body;

    // Validate required fields
    if (!name || !createdBy) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find user
    const user = await User.findOne({ username: createdBy });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Parse ingredients
    let parsedIngredients = [];
    if (ingredients) {
      parsedIngredients = JSON.parse(ingredients).map((ing) => ({
        name: ing.name,
        quantity: 1,
        unit: ing.unit || '',
        notes: ing.description || '',
      }));
    }

    // Create recipe
    const recipe = new Recipe({
      userId: user._id,
      name,
      description,
      ingredients: parsedIngredients,
      image: req.file ? req.file.filename : null,
    });

    await recipe.save();

    res.json({ message: 'Recipe created successfully', data: recipe });
  } catch (err) {
    console.error('Recipe creation error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }

  router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('userId', 'username'); // optional: include username
    res.status(200).json(recipes);
  } catch (err) {
    console.error('Recipe load error:', err);
    res.status(500).json({ message: 'Failed to load recipes' });
  }
});

});

module.exports = router;
