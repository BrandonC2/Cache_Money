// Example in Express: kitchenRoutes.js
const express = require('express');
const router = express.Router();
const Kitchen = require('../models/Kitchen');

// Create room
router.post('/create', async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) return res.status(400).json({ message: 'Missing name or password' });
  try {
    const existing = await Kitchen.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Room already exists' });
    const kitchen = await Kitchen.create({ name, password, messages: [] });
    res.json({ message: 'Room created successfully', kitchen });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Join room
router.post('/join', async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) return res.status(400).json({ message: 'Missing name or password' });
  try {
    const kitchen = await Kitchen.findOne({ name });
    if (!kitchen) return res.status(404).json({ message: 'Room not found' });
    if (kitchen.password !== password) return res.status(401).json({ message: 'Invalid password' });
    res.json({ message: 'Joined room successfully', kitchen });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
