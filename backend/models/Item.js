const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  foodGroup: { type: String, required: true },
  expirationDate: { type: Date },
  room: { type: String, required: true },      
  addedBy: { type: String, required: true },   
}, { timestamps: true });

module.exports = mongoose.model("Item", itemSchema);
