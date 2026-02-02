const multer = require("multer");
const path = require("path");
const fs = require("fs");

module.exports = (folder, prefix) => {
  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        // Ensure the folder exists
        fs.mkdirSync(folder, { recursive: true });
        cb(null, folder);
      },
      filename: (req, file, cb) => {
        cb(null, `${prefix}_${Date.now()}${path.extname(file.originalname)}`);
      },
    }),
  });
};
