import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';

let mongoServer: MongoMemoryServer | undefined;
const mongoBinaryVersion = process.env.MONGOMS_VERSION || '7.0.14';
const mongoDownloadDir = path.resolve(process.cwd(), '.mongodb-binaries');

beforeAll(async () => {
  try {
    // Close any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Start in-memory MongoDB with longer timeout
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: mongoBinaryVersion,
        downloadDir: mongoDownloadDir,
      },
      instance: {
        dbName: 'test-therapy-ai',
      },
    });

    const mongoUri = mongoServer.getUri();

    // Connect to in-memory database
    await mongoose.connect(mongoUri);

    console.log('Test database connected');
  } catch (error) {
    console.error('Failed to start test database:', error);
    throw error;
  }
}, 60000);

afterAll(async () => {
  try {
    // Disconnect mongoose
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    // Stop mongo server if it exists
    if (mongoServer) {
      await mongoServer.stop();
    }

    console.log('Test database stopped');
  } catch (error) {
    console.error('Error stopping test database:', error);
  }
}, 60000);

afterEach(async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return;
    }

    // Clear all collections after each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  } catch (error) {
    console.error('Error clearing collections:', error);
  }
});
