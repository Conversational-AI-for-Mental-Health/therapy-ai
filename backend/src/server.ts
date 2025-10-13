import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { createApp } from "./app";
import { attachSocketHandlers } from "./socket";
import config from "./config"; // Import configuration

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

// Handle Server Errors
httpServer.on("error", (err: any) => {
  console.error(`[HTTP] Server Error: ${err.message}`);
  process.exit(1);
});

// Proper Shutdown
process.on("SIGINT", () => {
  console.log("\n[System] Shutting down server gracefully...");
  io.close();
  httpServer.close(() => {
    console.log("[System] Server closed successfully. Exiting...");
    process.exit(0);
  });
});
