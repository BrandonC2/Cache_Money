const express = require("express");
const router = express.Router();
const Item = require("../models/Item");

// Add new item
router.post("/add", async (req, res) => {
  try {
    const { name, description, foodGroup, expirationDate, room, addedBy } = req.body;

    // Validate required fields
    if (!name || !foodGroup || !room || !addedBy) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const item = new Item({
      name,
      description,
      foodGroup,
      expirationDate,
      room,
      addedBy,
    });

    await item.save();
    res.status(201).json({ message: "Item added successfully!", item });
  } catch (err) {
    console.error("❌ Error adding item:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// remove item


router.get("/room/:roomName", async (req, res) => {
  try {
    const { roomName } = req.params;

    if (!roomName) {
      return res.status(400).json({ message: "Missing room name" });
    }

    const items = await Item.find({ room: roomName }).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (err) {
    console.error("❌ Error fetching room items:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});



module.exports = router;
