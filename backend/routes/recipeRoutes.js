const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const MealPlan = require("../models/MealPlan");
const uploadCloud = require('../middleware/cloudinaryConfig');

// ❌ DELETE THESE LINES (They use the old local system)
// const uploadRecipe = createUpload(uploadDirs.recipes, "recipe"); 

// ===================
// Create Recipe
// ===================
router.post("/", uploadCloud.single("image"), async (req, res) => {
  try {
    const { name, description, foodGroup, createdBy, ingredients, instructions } = req.body;
    
    const parsedIngredients = ingredients
      ? JSON.parse(ingredients)
          .map((ing) => ({
            name: ing.name ?? "",
            foodGroup: ing.foodGroup ?? "Other",
            quantity: Number(ing.quantity) || 0,
            unit: ing.unit ?? "",
            notes: ing.notes ?? "",
            ...(ing.inventoryItemId && { inventoryItemId: ing.inventoryItemId }),
          }))
          .filter((ing) => !Number.isNaN(ing.quantity) && ing.quantity > 0)
      : [];
    const parsedInstructions = instructions ? JSON.parse(instructions) : [];

    const newRecipe = new Recipe({
      name,
      description,
      foodGroup,
      createdBy,
      ingredients: parsedIngredients,
      instructions: parsedInstructions.map((step) => ({
        description: step.description ?? "",
        image: step.image || step.imageUri || "",
      })),
      image: req.file ? req.file.path : null,
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
    const { name, description, ingredients, foodGroup, instructions } = req.body;

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (name) recipe.name = name;
    if (description !== undefined) recipe.description = description;
    if (foodGroup) recipe.foodGroup = foodGroup;
    if (ingredients) {
      const parsed = JSON.parse(ingredients)
        .map((ing) => ({
          name: ing.name ?? "",
          foodGroup: ing.foodGroup ?? "Other",
          quantity: Number(ing.quantity) || 0,
          unit: ing.unit ?? "",
          notes: ing.notes ?? "",
          ...(ing.inventoryItemId && { inventoryItemId: ing.inventoryItemId }),
        }))
        .filter((ing) => !Number.isNaN(ing.quantity) && ing.quantity > 0);
      recipe.ingredients = parsed;
    }
    if (instructions !== undefined) {
      const parsed = JSON.parse(instructions);
      recipe.instructions = parsed.map((step) => ({
        description: step.description ?? "",
        image: step.image || step.imageUri || "",
      }));
    }

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
// Delete Recipe
// ===================
router.delete("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    await MealPlan.deleteMany({ recipeId: req.params.id });
    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: "Recipe removed successfully" });
  } catch (err) {
    console.error("Recipe delete error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      console.log("Recipe not found in DB for ID:", req.params.id);
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json(recipe);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Invalid ID format or Server Error" });
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