import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { createApp } from "./app";
import mongoose from 'mongoose';
import { attachSocketHandlers } from "./socket";
import config from "./config";


mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log('[DB] Connected to MongoDB successfully.');
  })
  .catch((err) => {
    console.error('[DB] Failed to connect to MongoDB', err);
    process.exit(1);
  });


// Create the Express app and HTTP server
const app = createApp();
const httpServer = createServer(app);

// Configure and create the Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.CORS_ORIGIN, // Use value from config
    methods: ["GET", "POST"],
  },
});

// Attach socket event handlers (the logic is separated in socket.ts)
attachSocketHandlers(io);

// Start the server listener
httpServer.listen(config.PORT, () => {
  console.log(`[HTTP] Server running in ${config.NODE_ENV} mode.`);
  console.log(`[HTTP] Listening on http://localhost:${config.PORT}`);
});
