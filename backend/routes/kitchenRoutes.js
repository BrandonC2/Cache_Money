// Example in Express: kitchenRoutes.js
const express = require('express');
const router = express.Router();
const Kitchen = require('../models/Kitchen');

// Helper to escape user input for regex
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Create room
router.post('/create', async (req, res) => {
  const { name, password, createdBy } = req.body;
  if (!name || !password || !createdBy)
    return res.status(400).json({ message: 'Missing fields' });

  const trimmedName = name.trim();
  const trimmedPassword = password.trim();
  const creator = String(createdBy).trim();

  try {
    // Case-insensitive lookup to avoid duplicates due to casing
    const existing = await Kitchen.findOne({ name: { $regex: `^${escapeRegExp(trimmedName)}$`, $options: 'i' } });
    if (existing) return res.status(400).json({ message: 'Room already exists' });

    const kitchen = await Kitchen.create({
      name: trimmedName,
      password: trimmedPassword,
      messages: [],
      members: [creator], // ✅ creator becomes first member
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
    const trimmedName = name.trim();
    const trimmedUsername = String(username).trim();
    const kitchen = await Kitchen.findOne({ name: { $regex: `^${escapeRegExp(trimmedName)}$`, $options: 'i' } });
    if (!kitchen) return res.status(404).json({ message: 'Room not found' });

    // Use bcrypt compare helper defined on the model
    const inputPassword = String(password || '').trim();
    const passwordMatches = await kitchen.comparePassword(inputPassword);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // If user is not already a member, add them
    if (!kitchen.members.includes(trimmedUsername)) {
      kitchen.members.push(trimmedUsername);
      await kitchen.save();
    }

    res.json({ message: 'Joined room successfully', kitchen });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;
