require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

//To start server
// cd backend
// npm run dev

// Express app setup
const app = express();
app.use(cors());
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} --> ${req.method} ${req.originalUrl}`);
  if (req.method !== "GET") console.log("Body:", req.body);
  next();
});

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB successfully!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ✅ Import routes
const userRoutes = require("./routes/userRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const kitchenRoutes = require("./routes/kitchenRoutes");
const receiptRoutes = require("./routes/receiptRoutes");

// ✅ Mount routes
app.use("/api/users", userRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/kitchens", kitchenRoutes);
app.use("/api/receipts", receiptRoutes);

// ✅ Health check
app.get("/health", (req, res) =>
  res.json({ ok: true, time: new Date().toISOString() })
);

// --- SOCKET.IO SETUP --- //
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow mobile devices on LAN
    methods: ["GET", "POST"],
  },
});

// --- SOCKET EVENTS --- //
const Kitchen = require("./models/Kitchen");

io.on("connection", (socket) => {
  console.log("🟢 New client connected:", socket.id);

  socket.on("joinRoom", async ({ roomName, username }) => {
    socket.join(roomName);
    console.log(`👤 ${username} joined room ${roomName}`);

    try {
      const kitchen = await Kitchen.findOne({ name: roomName });
      if (kitchen && kitchen.messages.length > 0) {
        socket.emit("loadMessages", kitchen.messages);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    }

    io.to(roomName).emit("message", {
      sender: "System",
      text: `${username} joined the room.`,
    });
  });

  socket.on("chatMessage", async ({ roomName, sender, text }) => {
    const message = { sender, text, timestamp: new Date() };
    console.log(`💬 ${sender} -> ${roomName}: ${text}`);

    io.to(roomName).emit("message", message);

    try {
      await Kitchen.findOneAndUpdate(
        { name: roomName },
        { $push: { messages: message } }
      );
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// --- ERROR HANDLING MIDDLEWARE --- //
app.use((err, req, res, next) => {
  console.error("Express error:", err);
  res.status(500).json({ error: err.message });
});

// --- START SERVER --- //
const PORT = process.env.PORT || 5001;

// IMPORTANT: Bind to 0.0.0.0 so your phone can connect
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running and accessible on:`);
  console.log(`   ▶ http://0.0.0.0:${PORT}`);
  console.log(`   ▶ http://YOUR_LAN_IP:${PORT}   <-- Use this on your phone`);
});
