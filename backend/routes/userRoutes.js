const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcryptjs = require('bcryptjs');
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
    const safeUser = { id: user._id, username: user.username, email: user.email };
    res.json({ token, user: safeUser });
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

// GET /api/users/profile (protected)
// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/profile/username (protected)
// Change username
router.put('/profile/username', async (req, res) => {
  try {
    const { newUsername } = req.body;

    if (!newUsername || newUsername.trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    // Check if username already exists
    const existing = await User.findOne({ username: newUsername });
    if (existing) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { username: newUsername },
      { new: true }
    ).select('-password');

    res.json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/users/profile/password (protected)
// Change password
router.put('/profile/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify current password
    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ ok: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/profile/delete (protected)
// Delete account (requires password confirmation)
router.post('/profile/delete', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify password
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ message: 'Password is incorrect' });
    }

    // Delete user
    await User.findByIdAndDelete(req.userId);

    res.json({ ok: true, message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id (protected)
// Only allow the authenticated user to delete their own account, or an admin.
router.delete('/:id', async (req, res) => {
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
