const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Recipe = require("../models/Recipe");
const MealPlan = require("../models/MealPlan");
const User = require("../models/User");
const auth = require("../middleware/auth");
const uploadCloud = require('../middleware/cloudinaryConfig');
const { optionalSingleImage } = require('../middleware/cloudinaryConfig');

function utcDayBounds(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

function recipeDailyLimit() {
  const n = parseInt(process.env.RECIPE_DAILY_LIMIT ?? "20", 10);
  return Number.isFinite(n) && n >= 1 ? n : 20;
}

// GET /api/recipes/daily-quota — today's create count vs limit (must be before GET /:id)
router.get("/daily-quota", auth, async (req, res) => {
  try {
    const uid = req.userId;
    const user = await User.findById(uid).select("isAdmin").lean();
    const dailyLimit = recipeDailyLimit();
    const { start, end } = utcDayBounds();

    if (user?.isAdmin) {
      return res.json({
        isAdmin: true,
        limit: dailyLimit,
        usedToday: 0,
        remaining: null,
        limitReached: false,
        windowStartUtc: start.toISOString(),
        windowEndUtc: end.toISOString(),
        resetAt: end.toISOString(),
      });
    }

    const usedToday = await Recipe.countDocuments({
      createdAt: { $gte: start, $lt: end },
      userId: uid,
    });

    const remaining = Math.max(0, dailyLimit - usedToday);
    const limitReached = usedToday >= dailyLimit;

    res.json({
      isAdmin: false,
      limit: dailyLimit,
      usedToday,
      remaining,
      limitReached,
      windowStartUtc: start.toISOString(),
      windowEndUtc: end.toISOString(),
      resetAt: end.toISOString(),
    });
  } catch (err) {
    console.error("daily-quota error:", err);
    res.status(500).json({ message: "Could not load recipe quota" });
  }
});

// ❌ DELETE THESE LINES (They use the old local system)
// const uploadRecipe = createUpload(uploadDirs.recipes, "recipe"); 

// ===================
// Create Recipe (authenticated — daily limit per user)
// ===================
router.post("/", auth, uploadCloud.single("image"), async (req, res) => {
  try {
    const uid = req.userId;
    const user = await User.findById(uid).select("isAdmin").lean();
    const dailyLimit = recipeDailyLimit();

    if (!user?.isAdmin) {
      const { start, end } = utcDayBounds();
      const createdToday = await Recipe.countDocuments({
        createdAt: { $gte: start, $lt: end },
        userId: uid,
      });
      if (createdToday >= dailyLimit) {
        return res.status(429).json({
          message: `You can create up to ${dailyLimit} recipes per day. Try again tomorrow.`,
          limit: dailyLimit,
          resetAt: end.toISOString(),
        });
      }
    }

    const { name, description, foodGroup, ingredients, instructions } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "Recipe name is required." });
    }
    
    let parsedIngredients = [];
    if (ingredients) {
      try {
        parsedIngredients = JSON.parse(ingredients)
          .map((ing) => ({
            name: ing.name ?? "",
            foodGroup: ing.foodGroup ?? "Other",
            quantity: Number(ing.quantity) || 0,
            unit: ing.unit ?? "",
            notes: ing.notes ?? "",
            ...(ing.inventoryItemId && { inventoryItemId: ing.inventoryItemId }),
          }))
          .filter((ing) => !Number.isNaN(ing.quantity) && ing.quantity > 0);
      } catch (e) {
        return res.status(400).json({ message: "Invalid ingredients format (must be JSON)." });
      }
    }
    let parsedInstructions = [];
    if (instructions) {
      try {
        parsedInstructions = JSON.parse(instructions);
      } catch (e) {
        return res.status(400).json({ message: "Invalid instructions format (must be JSON)." });
      }
    }

    const newRecipe = new Recipe({
      name: String(name).trim(),
      description,
      foodGroup,
      userId: uid,
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
router.put("/:id", auth, optionalSingleImage("image"), async (req, res) => {
  try {
    const { name, description, ingredients, foodGroup, instructions } = req.body;

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    if (name) recipe.name = name;
    if (description !== undefined) recipe.description = description;
    if (foodGroup) recipe.foodGroup = foodGroup;
    if (ingredients) {
      let parsed;
      try {
        parsed = JSON.parse(ingredients)
          .map((ing) => ({
            name: ing.name ?? "",
            foodGroup: ing.foodGroup ?? "Other",
            quantity: Number(ing.quantity) || 0,
            unit: ing.unit ?? "",
            notes: ing.notes ?? "",
            ...(ing.inventoryItemId && { inventoryItemId: ing.inventoryItemId }),
          }))
          .filter((ing) => !Number.isNaN(ing.quantity) && ing.quantity > 0);
      } catch (e) {
        return res.status(400).json({ message: "Invalid ingredients format (must be JSON)." });
      }
      recipe.ingredients = parsed;
    }
    if (instructions !== undefined) {
      let parsed;
      try {
        parsed = JSON.parse(instructions);
      } catch (e) {
        return res.status(400).json({ message: "Invalid instructions format (must be JSON)." });
      }
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
router.delete("/:id", auth, async (req, res) => {
  try {
    const rawId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(rawId)) {
      return res.status(400).json({ message: "Invalid recipe id" });
    }
    const objectId = new mongoose.Types.ObjectId(rawId);
    const recipe = await Recipe.findById(objectId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    // Match meal plans whether recipeId was stored as ObjectId or string
    await MealPlan.deleteMany({
      $or: [{ recipeId: rawId }, { recipeId: objectId }],
    });
    await Recipe.findByIdAndDelete(objectId);
    res.json({ message: "Recipe removed successfully" });
  } catch (err) {
    console.error("Recipe delete error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/:id", auth, async (req, res) => {
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