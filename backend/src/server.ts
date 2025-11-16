import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { createApp } from "./app";
import { attachSocketHandlers } from "./socket";
import config from "./config";
import { connectDB } from "./db"; // NEW import

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

// Wrap startup in an async function so we can await DB connection
async function startServer() {
  // 1) Connect to MongoDB first
  await connectDB();

  // 2) Start HTTP + Socket.IO server only if DB connection succeeded
  httpServer.listen(config.PORT, () => {
    console.log(`[HTTP] Server running in ${config.NODE_ENV} mode.`);
    console.log(`[HTTP] Listening on http://localhost:${config.PORT}`);
  });
}

// Kick off server startup
startServer().catch((err) => {
  console.error("[SERVER] Failed to start:", err);
  process.exit(1);
});
