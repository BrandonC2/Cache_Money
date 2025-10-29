const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// for now we have:
// signin, and signup
// /me route later
// 

// Sign in route
// POST /api/users/signin
router.post('/signin', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Signup route
// POST /api/users/signup
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ message: 'Missing required fields' });
  try {
    // check duplicates
    const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (exists) return res.status(409).json({ message: 'User with that email or username already exists' });

    const user = new User({ username, email: email.toLowerCase(), password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    const safeUser = { id: user._id, username: user.username, email: user.email };
    res.status(201).json({ token, user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id (protected)
// Only allow the authenticated user to delete their own account, or an admin.
router.delete('/:id', auth, async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const requesterId = req.userId;

    // If the requester is not the same as the target, check admin flag on requester
    if (requesterId !== targetUserId) {
      // load requester to check admin privileges
      const requester = await User.findById(requesterId).select('+isAdmin');
      if (!requester || !requester.isAdmin) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    const deleted = await User.findByIdAndDelete(targetUserId);
    if (!deleted) return res.status(404).json({ message: 'User not found' });

    res.json({ ok: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
