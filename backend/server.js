require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

// Import routes
const userRoutes = require('./routes/userRoutes');
const kitchenRoutes = require('./routes/kitchenRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const recipeRoutes = require('./routes/recipeRoutes');

const app = express();
const server = http.createServer(app);

app.use(express.json());

// Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} → ${req.method} ${req.originalUrl}`);
  next();
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/kitchens', kitchenRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/recipes', recipeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Socket.IO
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

io.on('connection', socket => {
  console.log('🟢 Socket connected:', socket.id);

  socket.on('joinRoom', async ({ roomName, username }) => {
    socket.join(roomName);
    io.to(roomName).emit('message', {
      sender: 'System',
      text: `${username} joined the room.`,
      timestamp: new Date(),
    });
  });

  socket.on('chatMessage', ({ roomName, sender, text }) => {
    io.to(roomName).emit('message', { sender, text, timestamp: new Date() });
  });

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected:', socket.id);
  });
});

// Error handler
app.use((err, req, res) => {
  console.error('❌ Express error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
