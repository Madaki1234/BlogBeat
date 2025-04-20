import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { log } from './vite';
import { dbConfig, isProduction } from './config';

let mongoServer: MongoMemoryServer;

export const connectToDatabase = async (): Promise<void> => {
  try {
    // Set up connection event handlers before connecting
    mongoose.connection.on('connected', () => {
      log('Connected to MongoDB', 'express');
    });
    
    mongoose.connection.on('disconnected', () => {
      log('Disconnected from MongoDB', 'express');
      
      // In production, attempt to reconnect
      if (isProduction && !mongoose.connection.readyState) {
        log('Attempting to reconnect to MongoDB...', 'express');
        setTimeout(connectToDatabase, 5000); // Try reconnecting after 5 seconds
      }
    });
    
    mongoose.connection.on('error', (err) => {
      log(`MongoDB connection error: ${err}`, 'express');
      
      // In production, attempt to reconnect on error
      if (isProduction) {
        log('Attempting to reconnect to MongoDB after error...', 'express');
        setTimeout(connectToDatabase, 5000); // Try reconnecting after 5 seconds
      }
    });
    
    // Configure mongoose settings for production
    if (isProduction) {
      mongoose.set('debug', false);
    }
    
    // Use in-memory MongoDB for development/testing
    if (dbConfig.useInMemory) {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      log(`Using MongoDB memory server at ${mongoUri}`, 'express');
      
      await mongoose.connect(mongoUri);
    } 
    // Use real MongoDB in production
    else {
      if (!dbConfig.uri) {
        throw new Error('MongoDB URI is not defined. Please set MONGODB_URI in your .env file');
      }
      
      log(`Connecting to MongoDB production database...`, 'express');
      await mongoose.connect(dbConfig.uri, dbConfig.options);
      log(`Connected to MongoDB production database`, 'express');
    }
    
    log('✅ MongoDB connected', 'express');
    
  } catch (error) {
    log(`Error connecting to MongoDB: ${error}`, 'express');
    process.exit(1);
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    
    if (mongoServer && !isProduction) {
      await mongoServer.stop();
    }
    
    log('Disconnected from MongoDB', 'express');
  } catch (error) {
    log(`Error disconnecting from MongoDB: ${error}`, 'express');
  }
};