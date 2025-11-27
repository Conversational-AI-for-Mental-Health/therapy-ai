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


const startServer = async () => {
  try {
    // Connect to MongoDB FIRST
    await connectDatabase();

    // Create Express app and HTTP server
    const app = createApp();
    const httpServer = createServer(app);

    // Configure Socket.IO
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: config.CORS_ORIGIN,
        methods: ['GET', 'POST'],
      },
    });

    // Attach socket handlers
    attachSocketHandlers(io);

    // Start listening
    httpServer.listen(config.PORT, () => {
      console.log('\n Server started successfully!');
      console.log(` Server running on port ${config.PORT}`);
      console.log(` API URL: http://localhost:${config.PORT}`);
      console.log(` Database URL: http://localhost:8081`); // MongoDB GUI runs here after running `docker-compose up -d mongodb mongo-express` at project root
      console.log(` Socket.io ready`);
      console.log(` Environment: ${config.NODE_ENV}`);
      console.log('\nPress CTRL+C to stop\n');
    });
  } catch (error) {
    console.error(' Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();
