const express = require('express');
const Kitchen = require('../models/Kitchen');
const router = express.Router();

// Create room
router.post('/create', async (req, res) => {
  const { name, password, createdBy } = req.body;
  if (!name || !password || !createdBy)
    return res.status(400).json({ message: 'Missing fields' });

  const exists = await Kitchen.findOne({ name });
  if (exists) return res.status(400).json({ message: 'Room exists' });

  const kitchen = await Kitchen.create({ name, password, members: [createdBy], messages: [] });
  res.status(201).json({ message: 'Room created', kitchen });
});

// Join room
router.post('/join', async (req, res) => {
  const { name, password, username } = req.body;
  if (!name || !password || !username)
    return res.status(400).json({ message: 'Missing fields' });

  const kitchen = await Kitchen.findOne({ name });
  if (!kitchen) return res.status(404).json({ message: 'Room not found' });
  if (kitchen.password !== password) return res.status(401).json({ message: 'Invalid password' });

  if (!kitchen.members.includes(username)) kitchen.members.push(username);
  await kitchen.save();

  res.json({ message: 'Joined room', kitchen });
});

module.exports = router;
