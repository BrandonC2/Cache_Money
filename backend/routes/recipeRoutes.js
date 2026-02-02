const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const createUpload = require("../utils/upload");

const uploadRecipe = createUpload(uploadDirs.recipes, "recipe");

// ===================
// Create Recipe
// ===================
router.post('/', uploadRecipe.single('image'), async (req, res) => {
  try {
    const { name, description, ingredients, createdBy } = req.body;

    if (!name || !createdBy) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findOne({ username: createdBy });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let parsedIngredients = [];
    if (ingredients) {
      parsedIngredients = JSON.parse(ingredients).map(ing => ({
        name: ing.name,
        quantity: ing.quantity || 1,
        unit: ing.unit || '',
        notes: ing.notes || '',
      }));
    }

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
      imageUrl: req.file ? `/uploads/recipes/${req.file.filename}` : null,
    });
  } catch (err) {
    console.error('Recipe creation error:', err);
    res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
});

// ===================
// Update Recipe
// ===================
router.put("/:id", uploadRecipe.single("image"), async (req, res) => {
  try {
    const { name, description, ingredients } = req.body;

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (name) recipe.name = name;
    if (description !== undefined) recipe.description = description;

    if (ingredients) recipe.ingredients = ingredients ? JSON.parse(ingredients) : [];

    if (req.file) {
      // Recipe image like profile
      const imageUrl = `/uploads/recipes/${req.file.filename}`;
      recipe.image = req.file.filename;
      console.log("Image uploaded:", imageUrl);
    }

    await recipe.save();

    res.json({
      message: "Recipe updated successfully",
      data: recipe,
      imageUrl: recipe.image ? `/uploads/recipes/${recipe.image}` : null,
    });
  } catch (err) {
    console.error("Recipe update error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


// GET /api/recipes/:id - fetch a single recipe by ID
router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate("userId", "username");

    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    res.json({
      ...recipe.toObject(),
      fullImageUrl: recipe.image
        ? `/uploads/recipes/${recipe.image}`
        : null,
    });
  } catch (err) {
    console.error("Recipe fetch error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;

