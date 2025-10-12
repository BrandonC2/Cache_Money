const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // or use another DB
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to DB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});
db.once('open', () => {
  console.log('Connected to MongoDB successfully!');
});

// Import routes
const userRoutes = require('./routes/userRoutes');
// const inventoryRoutes = require('./routes/inventoryRoutes');
// const recipeRoutes = require('./routes/recipeRoutes');
// const receiptRoutes = require('./routes/receiptRoutes');

// app.use('/api/users', userRoutes);
// app.use('/api/inventory', inventoryRoutes);
// app.use('/api/recipes', recipeRoutes);
// app.use('/api/receipts', receiptRoutes);

app.use('/api/users', userRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));