const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // folder to save images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

router.post('/', upload.single('image'), (req, res) => {
  const { title, description } = req.body;
  const image = req.file ? req.file.filename : null;

  // TODO: Save to DB here
  console.log({ title, description, image });

  res.json({ message: 'Recipe created', data: { title, description, image } });
});

module.exports = router;
