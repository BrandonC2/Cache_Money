// models/MealPlan.js
const mongoose = require("mongoose");

const MealPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipeId: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe", required: true },
  recipeName: String,
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  status: { type: String, enum: ['planned', 'completed'], default: 'planned' }
});

module.exports = mongoose.model("MealPlan", MealPlanSchema);