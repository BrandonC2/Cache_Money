const express = require("express");
const router = express.Router();
const MealPlan = require("../models/MealPlan");
const Recipe = require("../models/Recipe");
const InventoryItem = require("../models/InventoryItem");
const auth = require("../middleware/auth");
const { consumeRecipeInventory } = require("../services/recipeInventoryConsume");

router.use(auth);

// GET /api/mealplans/inventory - Get all inventory items for the user (for meal prep check)
router.get("/inventory", async (req, res) => {
  try {
    const items = await InventoryItem.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.json(items);
  } catch (err) {
    console.error("Error fetching inventory for meal prep:", err);
    res.status(500).json({ message: "Could not fetch inventory" });
  }
});

// GET /api/mealplans - Get all meal plans for the user
router.get("/", async (req, res) => {
  try {
    const plans = await MealPlan.find({ userId: req.userId })
      .sort({ date: 1 })
      .lean();
    res.json(plans);
  } catch (err) {
    console.error("Error fetching meal plans:", err);
    res.status(500).json({ message: "Could not fetch meal plans" });
  }
});

// POST /api/mealplans - Create a new meal plan
router.post("/", async (req, res) => {
  try {
    const { recipeId, recipeName, date } = req.body;
    if (!recipeId || !date) {
      return res.status(400).json({ message: "Recipe ID and date are required" });
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const plan = new MealPlan({
      userId: req.userId,
      recipeId,
      recipeName: recipeName || recipe.name,
      date: String(date).slice(0, 10), // YYYY-MM-DD
      status: "planned",
    });
    await plan.save();
    res.status(201).json(plan);
  } catch (err) {
    console.error("Error creating meal plan:", err);
    res.status(500).json({ message: "Could not create meal plan" });
  }
});

// PATCH /api/mealplans/complete/:id - Mark meal as cooked (deduct inventory)
router.patch("/complete/:id", async (req, res) => {
  try {
    const plan = await MealPlan.findById(req.params.id).populate("recipeId");
    if (!plan) {
      return res.status(404).json({ message: "Meal plan not found" });
    }
    if (plan.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (plan.status === "completed") {
      return res.status(400).json({ message: "Meal is already completed" });
    }

    const recipe = plan.recipeId;
    if (!recipe || !recipe.ingredients) {
      plan.status = "completed";
      await plan.save();
      return res.json(plan);
    }

    const result = await consumeRecipeInventory(req.userId, recipe.ingredients);
    if (!result.ok) {
      return res.status(400).json({
        message: "Cannot complete meal: missing key ingredients in inventory.",
        missing: result.missing,
      });
    }

    plan.status = "completed";
    await plan.save();
    res.json(plan);
  } catch (err) {
    console.error("Error completing meal plan:", err);
    res.status(500).json({ message: "Could not complete meal plan" });
  }
});

// DELETE /api/mealplans/:id - Delete meal plan (owner only)
router.delete("/:id", async (req, res) => {
  try {
    const plan = await MealPlan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ message: "Meal plan not found" });
    }
    if (plan.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await MealPlan.findByIdAndDelete(req.params.id);
    res.json({ message: "Meal plan deleted successfully" });
  } catch (err) {
    console.error("Error deleting meal plan:", err);
    res.status(500).json({ message: "Could not delete meal plan" });
  }
});

module.exports = router;
