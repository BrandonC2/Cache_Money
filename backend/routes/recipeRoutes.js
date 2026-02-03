const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const createUpload = require("../utils/upload");
const uploadDirs = require("../utils/uploadDirs");

const uploadRecipe = createUpload(uploadDirs.recipes, "recipe");

// ===================
// Create Recipe
// ===================
router.post("/", uploadRecipe.single("image"), async (req, res) => {
  try {
    // 1. Extract recipeGroup from req.body so it doesn't get lost
    const { name, description, ingredients, createdBy, recipeGroup } = req.body;

    // 2. Validation: Ensure the required fields from your logic are present
    if (!name || !createdBy) {
      return res.status(400).json({ message: "Missing required fields: name and createdBy are required." });
    }

    // 3. Parse the ingredients string sent via FormData
    const parsedIngredients = ingredients ? JSON.parse(ingredients) : [];

    // 4. Create the new Recipe document mapping frontend keys to Schema keys
    const recipe = new Recipe({
      userId: createdBy, // Maps 'createdBy' from frontend to 'userId' in Schema
      name,
      description,
      recipeGroup: recipeGroup || 'Other', // Saves the "Vegan/Dessert/etc" selection
      ingredients: parsedIngredients,
      image: req.file ? req.file.filename : null,
    });

    await recipe.save();

    res.json({
      message: "Recipe created successfully",
      data: recipe,
      fullImageUrl: recipe.image ? `/uploads/recipes/${recipe.image}` : null,
    });
  } catch (err) {
    console.error("Recipe creation error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ===================
// Update Recipe
// ===================
router.put("/:id", uploadRecipe.single("image"), async (req, res) => {
  try {
    const { name, description, ingredients, recipeGroup } = req.body;

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    // Update fields if they are provided in the request
    if (name) recipe.name = name;
    if (description !== undefined) recipe.description = description;
    if (recipeGroup) recipe.recipeGroup = recipeGroup; // Allow updating the category
    if (ingredients) recipe.ingredients = JSON.parse(ingredients);

    if (req.file) recipe.image = req.file.filename;

    await recipe.save();

    res.json({
      message: "Recipe updated successfully",
      data: recipe,
      fullImageUrl: recipe.image ? `/uploads/recipes/${recipe.image}` : null,
    });
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
    const recipes = await Recipe.find()
      .populate("userId", "username")
      .sort({ createdAt: -1 });

    const formatted = recipes.map((recipe) => {
      const r = recipe.toObject();
      return {
        ...r,
        // Ensure the frontend gets a consistent key name
        recipeGroup: r.foodGroup, 
        fullImageUrl: r.image ? `/uploads/recipes/${r.image}` : null,
      };
    });

    res.json(formatted);
  } catch (err) {
    console.error("Recipes fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ===================
// Get Single Recipe
// ===================
router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate("userId", "username");
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    res.json({
      ...recipe.toObject(),
      fullImageUrl: recipe.image ? `/uploads/recipes/${recipe.image}` : null,
    });
  } catch (err) {
    console.error("Recipe fetch error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;