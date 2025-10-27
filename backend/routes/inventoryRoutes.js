const express = require('express');
const InventoryItem = require('../models/InventoryItem');
const router = express.Router();
const auth = require('../middleware/auth');

// GET /api/inventory - list all
router.get('/', auth,  async (req, res) => {
  try {
    const items = await InventoryItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/inventory - create (protected)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, quantity, expiresAt } = req.body;
    const item = new InventoryItem({ name, description, quantity, expiresAt, user: req.user.id });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/inventory/:id - update (protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await InventoryItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/inventory/:id (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await InventoryItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
