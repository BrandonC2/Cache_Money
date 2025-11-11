// Example in Express: kitchenRoutes.js
const express = require('express');
const router = express.Router();
const Kitchen = require('../models/Kitchen');

// Create room
router.post('/create', async (req, res) => {
  const { name, password, createdBy } = req.body;
  if (!name || !password || !createdBy)
    return res.status(400).json({ message: 'Missing fields' });

  try {
    const existing = await Kitchen.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Room already exists' });

    const kitchen = await Kitchen.create({
      name,
      password,
      messages: [],
      members: [createdBy], // ✅ creator becomes first member
    });

    res.json({ message: 'Room created successfully', kitchen });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Join room
router.post('/join', async (req, res) => {
  const { name, password, username } = req.body;
  if (!name || !password || !username)
    return res.status(400).json({ message: 'Missing fields' });

  try {
    const kitchen = await Kitchen.findOne({ name });
    if (!kitchen) return res.status(404).json({ message: 'Room not found' });

    // Trim passwords to avoid whitespace issues
    const inputPassword = password.trim();
    const storedPassword = kitchen.password.trim();

    // If user is not already a member, check password
    if (!kitchen.members.includes(username)) {
      if (inputPassword !== storedPassword) {
        return res.status(401).json({ message: 'Invalid password' });
      }
      kitchen.members.push(username);
      await kitchen.save();
    }

    res.json({ message: 'Joined room successfully', kitchen });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;
