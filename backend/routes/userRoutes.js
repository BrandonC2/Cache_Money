const express = require("express");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const auth = require("../middleware/auth");
const uploadCloud = require("../middleware/cloudinaryConfig");
const router = express.Router();
// =========================
// PUBLIC ROUTES
// =========================
router.get("/me/:username", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      username: user.username,
      // Provide a fallback empty string if the field is missing
      profilePicture: user.profilePicture || "" 
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

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
/*
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
});*/
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (exists) return res.status(409).json({ message: "User exists" });

    const user = new User({ 
      username, 
      email: email.toLowerCase(), 
      password,
      profilePicture: "" // <--- Initialize this field as an empty string
    });

    await user.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(201).json({ token, user: { id: user._id, username: user.username } });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});

// =========================
// PROTECTED ROUTES
// =========================
router.use(auth); // everything below requires token

// Get profile
// backend/routes/userRoutes.js

router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json({
      username: user.username,
      profile: user.profilePicture || "", // CHANGE: Map profilePicture to 'profile'
      profilePicture: user.profilePicture || "" // Keep this for other screens
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});

// -------------------------
// Profile picture upload
// -------------------------
router.post("/upload-profile", auth, uploadCloud.single("image"), async (req, res) => {
  try {
    console.log("FILE RECEIVED:", req.file); // Check if Cloudinary sent back a file

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const imageUrl = req.file.path; 
    console.log("URL TO SAVE:", imageUrl); 

    const user = await User.findByIdAndUpdate(
      req.userId,
      { profile: imageUrl }, // Make sure this matches the Schema field
      { new: true }
    );

    console.log("DATABASE AFTER UPDATE:", user); // Look at the profile field here

    res.json({ ok: true, url: user.profile });
  } catch (err) {
    console.error("UPLOAD ROUTE ERROR:", err);
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

// backend/routes/userRoutes.js
router.get("/me", async (req, res) => {
  const user = await User.findById(req.user.id);
  // user.profilePicture should ALREADY be the https:// cloudinary link
  res.json({ profilePicture: user.profilePicture }); 
});


module.exports = router;
