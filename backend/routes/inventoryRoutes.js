const express = require("express");
const router = express.Router();
const util = require("util");
const InventoryItem = require("../models/InventoryItem");
const auth = require("../middleware/auth");

// TEST ENDPOINT: GET /api/inventory/test/mongo-query
router.get("/test/mongo-query", auth, async (req, res) => {
  try {
    console.log(`\n🧪 TEST ENDPOINT: Checking MongoDB queries`);
    console.log(`   Current userId: ${req.userId}`);
    
    // Test 1: Query with no filters (just userId)
    console.log(`\n   TEST 1: Query with just userId`);
    const allByUser = await InventoryItem.find({ userId: req.userId });
    console.log(`   Result: ${allByUser.length} items`);
    allByUser.forEach((item, i) => {
      console.log(`      [${i}] "${item.name}" room="${item.room || 'UNDEFINED'}"`);
    });
    
    // Test 2: Query for Test room
    console.log(`\n   TEST 2: Query for room="Test"`);
    const testRoom = await InventoryItem.find({ userId: req.userId, room: "Test" });
    console.log(`   Result: ${testRoom.length} items`);
    testRoom.forEach((item, i) => {
      console.log(`      [${i}] "${item.name}"`);
    });
    
    // Test 3: Query for Test2 room
    console.log(`\n   TEST 3: Query for room="Test2"`);
    const test2Room = await InventoryItem.find({ userId: req.userId, room: "Test2" });
    console.log(`   Result: ${test2Room.length} items`);
    test2Room.forEach((item, i) => {
      console.log(`      [${i}] "${item.name}"`);
    });
    
    res.json({
      userId: req.userId,
      allByUser: allByUser.length,
      test: testRoom.length,
      test2: test2Room.length,
      testRoomItems: testRoom.map(i => i.name),
      test2RoomItems: test2Room.map(i => i.name),
    });
  } catch (err) {
    console.error("❌ TEST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// DEBUG: GET /api/inventory/debug/all - Get ALL items for user (for debugging)
router.get("/debug/all", auth, async (req, res) => {
  try {
    console.log(`\n🔍 DEBUG REQUEST: Fetching ALL items for userId: ${req.userId}`);
    
    const items = await InventoryItem.find({ userId: req.userId }).sort({ createdAt: -1 });
    
    console.log(`🔍 Found ${items.length} total items in database for this user:`);
    items.forEach((item, idx) => {
      console.log(`   [${idx}] _id: ${item._id}`);
      console.log(`         name: "${item.name}"`);
      console.log(`         room: "${item.room}"`);
      console.log(`         foodGroup: "${item.foodGroup}"`);
    });
    
    // Group by room
    const byRoom = {};
    items.forEach(item => {
      const r = item.room || 'NO_ROOM_FIELD';
      if (!byRoom[r]) byRoom[r] = [];
      byRoom[r].push(item.name);
    });
    
    console.log(`\n🔍 Items grouped by room:`);
    Object.entries(byRoom).forEach(([room, names]) => {
      console.log(`   "${room}": [${names.join(', ')}]`);
    });
    
    res.json({ 
      totalItems: items.length,
      byRoom,
      items: items.map(item => ({
        _id: item._id,
        name: item.name,
        room: item.room || 'NO ROOM FIELD',
        foodGroup: item.foodGroup
      }))
    });
  } catch (err) {
    console.error("❌ DEBUG Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/inventory - Get user's inventory items for a specific room
router.get("/", auth, async (req, res) => {
  try {
    const { room } = req.query;
    
    if (!room || typeof room !== 'string' || room.trim() === '') {
      return res.status(400).json({ message: "Valid room name is required" });
    }

    const trimmedRoom = room.trim();
    console.log(`\n📦 GET /inventory REQUEST`);
    console.log(`   userId: ${req.userId} (type: ${typeof req.userId}, constructor: ${req.userId?.constructor?.name})`);
    console.log(`   room param: "${room}"`);
    console.log(`   trimmedRoom: "${trimmedRoom}"`);
    
    // Query for items that belong to this user AND this specific room
    const query = { userId: req.userId, room: trimmedRoom };
    console.log(`   MongoDB query: userId="${req.userId}", room="${trimmedRoom}"`);
    console.log(`   Query object keys: ${Object.keys(query).join(', ')}`);
    console.log(`   Query object: ${JSON.stringify(query, null, 2)}`);
    
    const items = await InventoryItem.find(query).sort({
      createdAt: -1,
    });
    
    // Log the actual MongoDB command
    console.log(`\n   🔍 DEBUGGING QUERY:`);
    console.log(`      MongoDB query object: { userId: ObjectId("${req.userId}"), room: "${trimmedRoom}" }`);
    console.log(`      Items found: ${items.length}`);
    
    if (items.length === 0) {
      // If no items found, check ALL items for this user
      const allItems = await InventoryItem.find({ userId: req.userId });
      console.log(`\n   ⚠️ NO ITEMS MATCHED QUERY! Total items for user: ${allItems.length}`);
      console.log(`   All items in DB:`);
      allItems.forEach((item, idx) => {
        console.log(`      [${idx}] name="${item.name}", room="${item.room}"`);
      });
    } else {
      console.log(`   Items that matched the query:`);
      items.forEach((item, idx) => {
        console.log(`      [${idx}] name="${item.name}", room="${item.room}", room type: ${typeof item.room}`);
      });
    }
    
    console.log(`✅ Query returned ${items.length} items for room: "${trimmedRoom}"`);
    if (items.length > 0) {
      console.log(`   Items returned:`);
      items.forEach((item, idx) => {
        console.log(`   [${idx}] _id: ${item._id}, name: "${item.name}", room: "${item.room}"`);
      });
    } else {
      console.log(`   NO ITEMS MATCHED! Checking what IS in the database...`);
      const allItems = await InventoryItem.find({ userId: req.userId });
      console.log(`   Total items for this user: ${allItems.length}`);
      allItems.forEach((item, idx) => {
        console.log(`   [${idx}] name: "${item.name}", room: "${item.room || 'NO ROOM FIELD'}"`);
      });
    }
    
    console.log(`   ABOUT TO SEND RESPONSE with items: ${items.map(i => `"${i.name}"(room="${i.room}")`).join(', ')}`);
    res.json(items);
  } catch (err) {
    console.error("❌ Error fetching inventory:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// POST /api/inventory - Add new item
router.post("/", auth, async (req, res) => {
  try {
    console.log(`\n➕ POST /inventory REQUEST`);
    console.log(`   userId: ${req.userId}`);
    console.log(`   Request body:`, req.body);
    
    const { name, description, foodGroup, quantity, expirationDate, room } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ message: "Item name is required" });
    }

    if (!room || typeof room !== 'string' || room.trim() === '') {
      console.error(`❌ POST /inventory: Missing or invalid room. Received: "${room}" (type: ${typeof room})`);
      return res.status(400).json({ message: "Room name is required" });
    }

    const trimmedRoom = room.trim();
    console.log(`   Extracted fields:`);
    console.log(`      name: "${name}"`);
    console.log(`      room: "${room}"`);
    console.log(`      trimmedRoom: "${trimmedRoom}"`);
    console.log(`      foodGroup: "${foodGroup}"`);
    console.log(`      quantity: ${quantity}`);

    const item = new InventoryItem({
      userId: req.userId,
      room: trimmedRoom,
      name: name.trim(),
      description,
      foodGroup: foodGroup || "Other",
      quantity: quantity || 1,
      expirationDate,
    });

    console.log(`   Before save - item object:`);
    console.log(`      room: "${item.room}"`);
    console.log(`      name: "${item.name}"`);

    await item.save();
    
    console.log(`✅ After save - item from DB:`);
    console.log(`      _id: ${item._id}`);
    console.log(`      name: "${item.name}"`);
    console.log(`      room: "${item.room}"`);
    console.log(`      userId: ${item.userId}"`);
    
    // Verify by fetching from DB
    const savedItem = await InventoryItem.findById(item._id);
    console.log(`✅ Verification - fetched from DB:`);
    console.log(`      room from DB: "${savedItem.room}"`);
    console.log(`      room is undefined? ${savedItem.room === undefined}`);
    console.log(`      room is null? ${savedItem.room === null}`);
    
    res.status(201).json({ message: "Item added successfully!", item });
  } catch (err) {
    console.error("❌ Error adding item:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// PUT /api/inventory/:id - Update item
router.put("/:id", auth, async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { name, description, foodGroup, quantity, expirationDate } = req.body;

    if (name) item.name = name;
    if (description) item.description = description;
    if (foodGroup) item.foodGroup = foodGroup;
    if (quantity !== undefined) item.quantity = quantity;
    if (expirationDate !== undefined) item.expirationDate = expirationDate;

    await item.save();
    res.json({ message: "Item updated successfully!", item });
  } catch (err) {
    console.error("❌ Error updating item:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE /api/inventory/:id - Delete item
router.delete("/:id", auth, async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.userId.toString() !== req.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await InventoryItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted successfully!" });
  } catch (err) {
    console.error("❌ Error deleting item:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// DELETE: DANGEROUS - Clear all items for current user (for testing only)
router.delete("/clear/all", auth, async (req, res) => {
  try {
    console.log(`\n⚠️ CLEARING ALL ITEMS for userId: ${req.userId}`);
    const result = await InventoryItem.deleteMany({ userId: req.userId });
    console.log(`✅ Deleted ${result.deletedCount} items`);
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    console.error("❌ Error clearing items:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/inventory/category/:category - Get items by category
router.get("/category/:category", auth, async (req, res) => {
  try {
    const { category } = req.params;

    if (!category) {
      return res.status(400).json({ message: "Food group is required" });
    }

    const items = await InventoryItem.find({
      userId: req.userId,
      foodGroup: category,
    }).sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (err) {
    console.error("❌ Error fetching food group items:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
