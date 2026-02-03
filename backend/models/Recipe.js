const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({

  userId: { type: String, ref: 'User' },

  name: { type: String, required: true },
  description: { type: String },
  foodGroup: { type: String, default: 'Other' }, // Protein, Grain, Dairy, Fruit, Vegetable, Spice
  createdAt: { type: Date, default: Date.now },
  ingredients: [
    {
      // Name of the ingredient (optional if linked to inventory)
      name: { type: String },

      foodGroup: { type: String, default: 'Other' },

      // Quantity and unit
      quantity: { type: Number, required: true },
      unit: { type: String, default: '' }, // e.g., grams, cups, tsp

      // Optional reference to an inventory item
      inventoryItemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InventoryItem', 
      },

      // Optional notes (e.g., "chopped", "fresh")
      notes: { type: String },
    }
    ],
  image: { type: String, default: "" },
});

module.exports = mongoose.model('Recipe', recipeSchema, 'recipes');
