// server.js
require("dotenv").config();
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const app = require("./src/app");

const PORT = process.env.PORT || 3001;

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Main MongoDB connected");

    // Create HTTP server from Express app
    const server = http.createServer(app);

    // Attach Socket.IO to HTTP server
    const io = new Server(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // Initialize Socket.IO with the setup function
    const setupSocket = require("./src/sockets/chatSocket");
    setupSocket(io);
    // Make io available via the Express app if other modules expect it
    app.set('io', io);

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`⚡ Socket.IO ready at: http://localhost:${PORT}`);
    });

    // Graceful listen error handling (e.g. EADDRINUSE)
    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please stop the process using it or change the PORT.`);
        process.exit(1);
      }
      console.error('Server error:', err);
      process.exit(1);
    });

    // Handle unhandled rejections
    process.on("unhandledRejection", (err) => {
      console.error("UNHANDLED REJECTION! 💥 Shutting down...");
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle SIGTERM
    process.on("SIGTERM", () => {
      console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
      server.close(() => {
        console.log("💤 Process terminated!");
      });
    });
  })
  .catch((err) => {
    console.error("❌ Main MongoDB connection error:", err);
    process.exit(1);
  });