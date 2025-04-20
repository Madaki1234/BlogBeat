import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { log } from './vite';

let mongoServer: MongoMemoryServer;

// Connect to MongoDB
export const connectToDatabase = async (): Promise<void> => {
  try {
    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    log(`Using MongoDB memory server at ${mongoUri}`);
    
    // Connect to in-memory database
    await mongoose.connect(mongoUri);
    log('✅ MongoDB connected');
    
    // Listen to connection events
    mongoose.connection.on('error', (err) => {
      log(`MongoDB connection error: ${err}`, 'error');
    });
    
    mongoose.connection.on('disconnected', () => {
      log('MongoDB disconnected');
    });
    
    // Clean up connection on process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      if (mongoServer) {
        await mongoServer.stop();
      }
      log('MongoDB connection closed');
      process.exit(0);
    });
  } catch (error) {
    log(`❌ MongoDB connection error: ${error}`, 'error');
    throw error;
  }
};

export default mongoose;