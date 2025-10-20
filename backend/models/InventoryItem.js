const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, default: 1 },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('InventoryItem', inventorySchema);
