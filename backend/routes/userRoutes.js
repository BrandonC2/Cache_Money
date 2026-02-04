const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const auth = require("../middleware/auth");
const uploadCloud = require("../middleware/cloudinaryConfig");
const router = express.Router();
// -------------------------
// Multer setup
// -------------------------


// =========================
// PUBLIC ROUTES
// =========================

// Sign in
router.post("/signin", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile || "",
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sign up
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const exists = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (exists) {
      return res
        .status(409)
        .json({ message: "User with that email or username already exists" });
    }

    const user = new User({
      username,
      email: email.toLowerCase(),
      password,
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profile: user.profile || "",
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================
// PROTECTED ROUTES
// =========================
router.use(auth); // everything below requires token

// Get profile
router.get("/profile", async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("username profile");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      username: user.username,
      profile: user.profile || "",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------
// Profile picture upload
// -------------------------
router.post("/upload-profile", uploadCloud.single("image"), async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // req.file.path is the permanent Cloudinary URL
    const imageUrl = req.file.path; 

    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: imageUrl },
      { new: true }
    );

    res.json({ message: "Profile updated!", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update username
router.put("/profile/username", async (req, res) => {
  const { newUsername } = req.body;

  if (!newUsername || newUsername.trim().length < 3) {
    return res
      .status(400)
      .json({ message: "Username must be at least 3 characters" });
  }

  try {
    const exists = await User.findOne({ username: newUsername });
    if (exists) return res.status(409).json({ message: "Username already taken" });

    const user = await User.findByIdAndUpdate(
      req.userId,
      { username: newUsername },
      { new: true }
    ).select("-password");

    res.json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update password
router.put("/profile/password", async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Current and new password are required" });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters" });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await user.comparePassword(currentPassword);
    if (!valid)
      return res.status(401).json({ message: "Current password is incorrect" });

    user.password = newPassword;
    await user.save();

    res.json({ ok: true, message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete account
router.post("/profile/delete", async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res
      .status(400)
      .json({ message: "Password is required to delete account" });
  }

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: "Password is incorrect" });

    await User.findByIdAndDelete(req.userId);

    res.json({ ok: true, message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
