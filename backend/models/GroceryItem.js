const mongoose = require("mongoose");

const GrocerySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unit: { type: String },
  status: { type: String, enum: ['pending', 'bought'], default: 'pending' },
}, { timestamps: true });

// Ensure a user doesn't have the same item twice in "pending" status
GrocerySchema.index({ userId: 1, name: 1, status: 1 }, { unique: true });

module.exports = mongoose.model("GroceryItem", GrocerySchema);