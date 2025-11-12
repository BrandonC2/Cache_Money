// Script to fix inventory items missing the 'room' field
// Usage: node backend/scripts/fix_inventory_rooms.js <roomName>

const mongoose = require('mongoose');
const InventoryItem = require('../models/InventoryItem');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cache_money';

async function main() {
  const roomName = process.argv[2];
  if (!roomName) {
    console.error('Usage: node fix_inventory_rooms.js <roomName>');
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI);
  const result = await InventoryItem.updateMany(
    { $or: [ { room: { $exists: false } }, { room: null }, { room: '' } ] },
    { $set: { room: roomName } }
  );
  console.log(`Updated ${result.modifiedCount} items to have room: '${roomName}'`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
