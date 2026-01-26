// =====================
// Load environment vars
// =====================
require("dotenv").config();

// =====================
// Imports (Node ONLY)
// =====================
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");

// =====================
// App + Server
// =====================
const app = express();
const server = http.createServer(app);

// =====================
// Middleware
// =====================
app.use(
  cors({
    origin: "*", // Expo / mobile safe
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(express.json());

// Logger
app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} → ${req.method} ${req.originalUrl}`
  );
  next();
});

// =====================
// MongoDB
// =====================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// =====================
// Routes
// =====================
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/kitchens", require("./routes/kitchenRoutes"));
app.use("/api/recipes", require("./routes/recipeRoutes"));
app.use("/api/receipts", require("./routes/receiptRoutes"));

// Static uploads (optional)
app.use("/uploads", express.static("uploads"));

// =====================
// Health check (Render)
// =====================
app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// =====================
// Socket.IO
// =====================
const io = new Server(server, {
  cors: {
    origin: "*", // Expo-safe
    methods: ["GET", "POST"],
  },
});

const Kitchen = require("./models/Kitchen");

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("joinRoom", async ({ roomName, username }) => {
    socket.join(roomName);

    console.log(`👤 ${username} joined ${roomName}`);

    try {
      const kitchen = await Kitchen.findOne({ name: roomName });
      if (kitchen?.messages?.length) {
        socket.emit("loadMessages", kitchen.messages);
      }
    } catch (err) {
      console.error("Socket load error:", err.message);
    }

    io.to(roomName).emit("message", {
      sender: "System",
      text: `${username} joined the room.`,
      timestamp: new Date(),
    });
  });

  socket.on("chatMessage", async ({ roomName, sender, text }) => {
    const message = { sender, text, timestamp: new Date() };

    io.to(roomName).emit("message", message);

    try {
      await Kitchen.findOneAndUpdate(
        { name: roomName },
        { $push: { messages: message } }
      );
    } catch (err) {
      console.error("Socket save error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// =====================
// Error handler
// =====================
app.use((err, req, res, next) => {
  console.error("❌ Express error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// =====================
// Start Server (Render-safe)
// =====================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
