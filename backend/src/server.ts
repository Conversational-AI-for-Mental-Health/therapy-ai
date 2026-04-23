import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app';
import { attachSocketHandlers } from './socket';
import { connectDatabase } from './config/database';
import config from './config';

const startServer = async () => {
  try {
    // Connect to MongoDB before starting the server to ensure DB is available
    await connectDatabase();

    // Create Express app and HTTP server
    const app = createApp();
    const httpServer = createServer(app);

    // Initialize Socket.io with CORS settings
    const io = new SocketIOServer(httpServer, {
      cors: {
        origin: config.CORS_ORIGIN,
        methods: ['GET', 'POST'],
      },
    });

    // Attach Socket.io event handlers
    attachSocketHandlers(io);

    // Start the server
    httpServer.listen(config.PORT, () => {
      console.log('\n Server started successfully!');
      console.log(` Server running on port ${config.PORT} `);
      console.log(` API URL: http://localhost:${config.PORT}`);
      console.log(` Database URL: http://localhost:8081`); 
      console.log(` Socket.io ready (JWT auth enabled)`);
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