const express = require('express');
const router = express.Router();
const Receipt = require('../models/Receipt');
const InventoryItem = require('../models/InventoryItem');
const auth = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// Helper: Clean item names (remove brand prefixes like "hz", "del", "campbells", etc.)
const cleanItemName = (text) => {
  // Remove common brand prefixes and store identifiers
  const brands = [
    'hz', 'del', 'campbells', 'heinz', 'kraft', 'pepsi', 'coca-cola', 'coca', 'coke',
    'nestle', 'general mills', 'kelloggs', 'quaker', 'pillsbury', 'tyson', 'perdue',
    'cargill', 'sysco', 'unilever', 'danone', 'lactalis', 'borden', 'frito-lay',
    'mondelez', 'mars', 'ferrero', 'hershey', 'lindt', 'ghirardelli', 'toblerone',
    'bahlsen', 'nabisco', 'oreo', 'ritz', 'cheez', 'doritos', 'lay', 'pringles',
    'fanta', 'sprite', 'minute maid', 'tropicana', 'orange juice', 'apple juice',
    'store brand', 'great value', 'market pantry', 'house brand', 'private label'
  ];

  let cleaned = text.trim().toLowerCase();

  // Remove brand prefixes at the start
  for (const brand of brands) {
    const regex = new RegExp(`^${brand}\\s+`, 'i');
    cleaned = cleaned.replace(regex, '');
  }

  // Remove numbers at the start (e.g., "1 lb", "2x", "12 pack")
  cleaned = cleaned.replace(/^\d+\s*(?:pack|lb|oz|g|ml|ct|x|\+)?\s*/i, '');

  // Remove weight/size indicators at the end
  cleaned = cleaned.replace(/\s*(\d+\.?\d*\s*(?:oz|lb|g|ml|ct|pack|count))\s*$/i, '');

  // Capitalize first letter
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);

  return cleaned.length > 2 ? cleaned : text;
};

// Helper: Parse extracted text into items
const parseReceiptText = (text) => {
  if (!text) return [];

  // Split by newlines and filter empty lines
  const lines = text.split('\n').filter(line => line.trim().length > 0);

  const items = [];

  for (const line of lines) {
    const cleaned = line.trim();

    // Skip header/footer lines
    if (
      cleaned.match(/^(total|subtotal|tax|amount|change|card|visa|mastercard|amex|paid|signature|date|time|store|receipt)/i) ||
      cleaned.match(/^\d+\/\d+/) || // dates
      cleaned.match(/^\d{2}:\d{2}/) || // times
      cleaned.length < 3
    ) {
      continue;
    }

    // Try to extract item name and optional quantity/price
    // Pattern: "item name ... price" or "item name ... qty"
    const match = cleaned.match(/^([^$\d]+?)(?:\s+(\d+)\s*(?:x|@))?\s*(?:\$?([\d.]+))?$/i);

    if (match) {
      const itemName = match[1].trim();
      const qty = match[2] ? parseInt(match[2]) : 1;
      const price = match[3] ? parseFloat(match[3]) : undefined;

      if (itemName.length > 2) {
        items.push({
          name: cleanItemName(itemName),
          quantity: qty,
          price,
          originalText: cleaned,
          category: 'Other', // Will be categorized later
        });
      }
    } else {
      // Fallback: just treat the whole line as an item name
      const itemName = cleaned.replace(/[\$\d.]+/g, '').trim();
      if (itemName.length > 2) {
        items.push({
          name: cleanItemName(itemName),
          quantity: 1,
          originalText: cleaned,
          category: 'Other',
        });
      }
    }
  }

  return items;
};

// Helper: Auto-categorize items
const categorizeItems = (items) => {
  const categories = {
    'Produce': ['tomato', 'lettuce', 'carrot', 'apple', 'banana', 'orange', 'grape', 'melon', 'pepper', 'onion', 'garlic', 'potato', 'spinach', 'broccoli', 'cauliflower', 'celery'],
    'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'sour cream', 'egg', 'ice cream'],
    'Meat': ['chicken', 'beef', 'pork', 'ham', 'turkey', 'bacon', 'sausage', 'ground'],
    'Bakery': ['bread', 'bun', 'bagel', 'croissant', 'donut', 'cake', 'pastry', 'muffin'],
    'Beverages': ['juice', 'soda', 'water', 'coffee', 'tea', 'milk', 'smoothie', 'drink', 'beer', 'wine'],
    'Pantry': ['rice', 'pasta', 'beans', 'cereal', 'flour', 'sugar', 'salt', 'oil', 'sauce', 'soup', 'broth', 'ketchup', 'mustard', 'mayo'],
    'Frozen': ['frozen', 'ice cream', 'pizza', 'dinners'],
    'Snacks': ['chips', 'cookie', 'candy', 'granola', 'bar', 'cracker', 'popcorn', 'pretzel'],
  };

  return items.map(item => {
    let assignedCategory = 'Other';
    const itemNameLower = item.name.toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => itemNameLower.includes(keyword))) {
        assignedCategory = category;
        break;
      }
    }

    return { ...item, category: assignedCategory };
  });
};

// POST /api/receipts/upload
// Upload image and extract text (mock OCR for now)
router.post('/upload', auth, async (req, res) => {
  try {
    const { imageUri, rawText } = req.body;

    if (!imageUri) {
      return res.status(400).json({ message: 'Image URI is required' });
    }

    // Parse extracted text into items
    const parsedItems = parseReceiptText(rawText);
    const categorizedItems = categorizeItems(parsedItems);

    // Create receipt record
    const receipt = new Receipt({
      userId: req.userId,
      imageUri,
      rawText: rawText || '',
      items: categorizedItems,
      status: 'pending',
    });

    await receipt.save();

    res.status(201).json({
      ok: true,
      receiptId: receipt._id,
      items: receipt.items,
      message: 'Receipt processed successfully',
    });
  } catch (err) {
    console.error('Receipt upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/receipts/:id
// Get receipt details
router.get('/:id', auth, async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    // Check authorization
    if (receipt.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(receipt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/receipts/:id
// Update receipt items (user edits names, quantities, categories)
router.put('/:id', auth, async (req, res) => {
  try {
    const { items } = req.body;

    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    if (receipt.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    receipt.items = items;
    receipt.status = 'reviewed';
    receipt.processedAt = new Date();

    await receipt.save();

    res.json({ ok: true, receipt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/receipts/:id/import
// Import receipt items to user's inventory
router.post('/:id/import', auth, async (req, res) => {
  try {
    const { room } = req.body;
    
    if (!room) {
      return res.status(400).json({ message: 'Room name is required' });
    }

    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    if (receipt.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Create inventory items from receipt items
    const inventoryItems = receipt.items.map(item => ({
      userId: req.userId,
      room: room,
      name: item.name,
      quantity: item.quantity,
      foodGroup: item.category || 'Other',
      description: `From receipt (${item.originalText})`,
      createdAt: new Date(),
    }));

    // Save all items
    const saved = await InventoryItem.insertMany(inventoryItems);

    receipt.status = 'imported';
    receipt.importedAt = new Date();
    await receipt.save();

    res.json({
      ok: true,
      message: `Imported ${saved.length} items to inventory`,
      items: saved,
    });
  } catch (err) {
    console.error('Import error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/receipts/:id
// Delete receipt
router.delete('/:id', auth, async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    if (receipt.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Receipt.findByIdAndDelete(req.params.id);

    res.json({ ok: true, message: 'Receipt deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
