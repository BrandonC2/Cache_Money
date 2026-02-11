const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const InventoryItem = require("../models/InventoryItem");
const GroceryItem = require("../models/GroceryItem"); // Assume you have this model

// GET /api/grocery/check/:recipeId
// Checks if the user has enough ingredients in inventory for a specific recipe
router.get("/check/:recipeId", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    // 1. Fetch all user inventory items to compare
    const inventory = await InventoryItem.find({ userId: req.userId });

    const status = recipe.ingredients.map(reqIng => {
      // Find matching item in inventory (case-insensitive name match)
      const invItem = inventory.find(inv => 
        inv.name.toLowerCase() === reqIng.name.toLowerCase()
      );

      const hasEnough = invItem ? invItem.quantity >= reqIng.quantity : false;
      const missingAmount = invItem ? Math.max(0, reqIng.quantity - invItem.quantity) : reqIng.quantity;

      return {
        name: reqIng.name,
        required: reqIng.quantity,
        current: invItem ? invItem.quantity : 0,
        unit: reqIng.unit,
        isMissing: !hasEnough,
        missingAmount: missingAmount
      };
    });

    const canCook = status.every(item => !item.isMissing);

    res.json({
      recipeName: recipe.name,
      canCook,
      ingredientsStatus: status
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/grocery/add-missing
// Adds specific missing items to the grocery list
router.post("/add-missing", async (req, res) => {
  try {
    const { items } = req.body; // Expecting array: [{ name, quantity, unit }]
    
    const groceryPromises = items.map(item => {
      return GroceryItem.findOneAndUpdate(
        { userId: req.userId, name: item.name, status: 'pending' },
        { 
          $inc: { quantity: item.quantity }, 
          $set: { unit: item.unit, updatedAt: new Date() } 
        },
        { upsert: true, new: true }
      );
    });

    await Promise.all(groceryPromises);
    res.json({ message: "Missing items added to grocery list!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/grocery/purchase/:id
router.put("/purchase/:id", async (req, res) => {
  try {
    const item = await GroceryItem.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.status = 'bought';
    await item.save();

    // OPTIONAL: Auto-add to Inventory
    await InventoryItem.findOneAndUpdate(
      { userId: req.userId, name: item.name },
      { $inc: { quantity: item.quantity } },
      { upsert: true } // Create if it doesn't exist
    );

    res.json({ message: "Item purchased and inventory updated!", item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;