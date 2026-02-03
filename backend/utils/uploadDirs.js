const path = require("path");
const fs = require("fs");

const uploadsBase = path.join(__dirname, "../uploads");

const uploadDirs = {
  profile: path.join(uploadsBase, "profile"),
  recipes: path.join(uploadsBase, "recipes"),
  items: path.join(uploadsBase, "items"),
};

// ensure directories exist
Object.values(uploadDirs).forEach((dir) => fs.mkdirSync(dir, { recursive: true }));

module.exports = uploadDirs;
