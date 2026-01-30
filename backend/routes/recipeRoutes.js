const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Create recipe
router.post('/', upload.single('image'), async (req, res) => {
  const { title, description } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!title) return res.status(400).json({ message: 'Title is required' });

  // TODO: Save to DB if you have a Recipe model
  console.log({ title, description, image });

  res.status(201).json({ message: 'Recipe created', data: { title, description, image } });
});

module.exports = router;
