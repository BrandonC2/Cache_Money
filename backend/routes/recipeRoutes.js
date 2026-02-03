const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const createUpload = require("../utils/upload");
const uploadDirs = require("../utils/uploadDirs"); // import folder paths

const uploadRecipe = createUpload(uploadDirs.recipes, "recipe");
router.get("/", (req, res) => {
  res.json([]);
});
// ===================
// Create Recipe
// ===================
router.post("/", uploadRecipe.single("image"), async (req, res) => {
  try {
    const { name, description, ingredients, createdBy } = req.body;

    if (!name || !createdBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parsedIngredients = ingredients ? JSON.parse(ingredients) : [];

    const recipe = new Recipe({
      userId: createdBy, // make sure you pass actual user ID
      name,
      description,
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
    const { name, description, ingredients } = req.body;

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (name) recipe.name = name;
    if (description !== undefined) recipe.description = description;
    if (ingredients) recipe.ingredients = JSON.parse(ingredients);

    // Update image only if a new one is uploaded
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

    const formatted = recipes.map((recipe) => ({
      ...recipe.toObject(),
      fullImageUrl: recipe.image
        ? `/uploads/recipes/${recipe.image}`
        : null,
    }));

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
