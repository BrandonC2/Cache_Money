const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // or use another DB
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Simple request logger for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} --> ${req.method} ${req.originalUrl}`);
  if (req.method !== 'GET') console.log('Body:', req.body);
  next();
});

// Connect to DB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', (err) => console.error('MongoDB connection error:', err));
db.once('open', () => console.log('Connected to MongoDB successfully!'));

// Import routes
const userRoutes = require('./routes/userRoutes');
// const inventoryRoutes = require('./routes/inventoryRoutes');
// const recipeRoutes = require('./routes/recipeRoutes');
// const receiptRoutes = require('./routes/receiptRoutes');

// Mount routes
app.use('/api/users', userRoutes);
// app.use('/api/inventory', inventoryRoutes);
// app.use('/api/recipes', recipeRoutes);
// app.use('/api/receipts', receiptRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

// Health check
app.get('/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Start server with automatic port fallback if the port is in use
const DEFAULT_PORT = Number(process.env.PORT) || 5000;

const startServer = (port) => {
  const server = app.listen(port, () => console.log(`Server running on port ${port}`));
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`Port ${port} is in use, trying ${nextPort}...`);
      // try next port
      startServer(nextPort);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(DEFAULT_PORT);
