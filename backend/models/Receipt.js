const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  imageUri: {
    type: String,
    required: true,
  },
  rawText: {
    type: String, // Raw OCR output from image
  },
  items: [
    {
      name: String,
      quantity: { type: Number, default: 1 },
      category: String,
      price: Number,
      originalText: String, // original OCR text before cleaning
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'processing', 'reviewed', 'imported'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: Date,
  importedAt: Date,
});

module.exports = mongoose.model('Receipt', receiptSchema);
