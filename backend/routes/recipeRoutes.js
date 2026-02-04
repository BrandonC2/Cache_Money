const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const uploadCloud = require('../middleware/cloudinaryConfig');

// ❌ DELETE THESE LINES (They use the old local system)
// const uploadRecipe = createUpload(uploadDirs.recipes, "recipe"); 

// ===================
// Create Recipe
// ===================
router.post("/", uploadCloud.single("image"), async (req, res) => {
  try {
    const { name, description, foodGroup, createdBy, ingredients } = req.body;
    
    // Parse ingredients if sent as a JSON string from Frontend
    const parsedIngredients = ingredients ? JSON.parse(ingredients) : [];

    const newRecipe = new Recipe({
      name,
      description,
      foodGroup,
      createdBy,
      ingredients: parsedIngredients,
      image: req.file ? req.file.path : null, // Cloudinary URL
    });

    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create recipe" });
  }
});

// ===================
// Update Recipe
// ===================
// ✅ CHANGE: Use uploadCloud.single("image") here too!
router.put("/:id", uploadCloud.single("image"), async (req, res) => {
  try {
    const { name, description, ingredients, foodGroup } = req.body;

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (name) recipe.name = name;
    if (description !== undefined) recipe.description = description;
    if (foodGroup) recipe.foodGroup = foodGroup;
    if (ingredients) recipe.ingredients = JSON.parse(ingredients);

    // Update image if a new one is uploaded to Cloudinary
    if (req.file) recipe.image = req.file.path;

    await recipe.save();
    res.json({ message: "Recipe updated successfully", data: recipe });
  } catch (err) {
    console.error("Recipe update error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ===================
// Get All Recipes
// ===================
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find().sort({ createdAt: -1 });
    // Cloudinary gives full URLs, so we just send them as-is
    res.json(recipes);
  } catch (err) {
    console.error("Recipes fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;