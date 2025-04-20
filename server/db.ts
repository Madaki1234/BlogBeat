import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { log } from './vite';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

let mongoServer: MongoMemoryServer;

export const connectToDatabase = async (): Promise<void> => {
  try {
    // Use in-memory MongoDB for development/testing
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      log(`Using MongoDB memory server at ${mongoUri}`, 'express');
      
      await mongoose.connect(mongoUri);
    } 
    // Use real MongoDB in production
    else {
      if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not defined. Please set it in your .env file');
      }
      
      log(`Connecting to MongoDB production database...`, 'express');
      await mongoose.connect(process.env.MONGODB_URI);
      log(`Connected to MongoDB production database`, 'express');
    }
    
    log('✅ MongoDB connected', 'express');
    
    // Log when connected
    mongoose.connection.on('connected', () => {
      log('Connected to MongoDB', 'express');
    });
    
    // Log when disconnected
    mongoose.connection.on('disconnected', () => {
      log('Disconnected from MongoDB', 'express');
    });
    
    // Log errors
    mongoose.connection.on('error', (err) => {
      log(`MongoDB connection error: ${err}`, 'express');
    });
    
  } catch (error) {
    log(`Error connecting to MongoDB: ${error}`, 'express');
    process.exit(1);
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    
    if (mongoServer && process.env.NODE_ENV !== 'production') {
      await mongoServer.stop();
    }
    
    log('Disconnected from MongoDB', 'express');
  } catch (error) {
    log(`Error disconnecting from MongoDB: ${error}`, 'express');
  }
};