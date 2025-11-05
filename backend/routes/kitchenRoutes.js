import express from "express";
import ChatRoom from "../models/Kitchen.js";

const router = express.Router();

// Create room
router.post("/create", async (req, res) => {
  const { name, password } = req.body;
  try {
    const existing = await ChatRoom.findOne({ name });
    if (existing) return res.status(400).json({ message: "Kitchen already exists" });
    const room = new ChatRoom({ name, password });
    await room.save();
    res.status(201).json({ message: "Kitchen created" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Join room
router.post("/join", async (req, res) => {
  const { name, password } = req.body;
  try {
    const room = await ChatRoom.findOne({ name });
    if (!room) return res.status(404).json({ message: "Kitchen not found" });
    const valid = await room.comparePassword(password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });
    res.json({ message: "Joined Kitchen" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export default router;