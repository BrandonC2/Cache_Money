const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  room: {
    type: String,
    required: true, // Room name for scoping items
  },

  name: { type: String, required: true },
  description: { type: String },
  foodGroup: { type: String, default: 'Other' }, // Protein, Grain, Dairy, Fruit, Vegetable, Spice
  quantity: { type: Number, default: 1 },
  expirationDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('InventoryItem', inventorySchema);
