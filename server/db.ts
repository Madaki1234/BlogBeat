import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config();

// MongoDB connection string - use the DATABASE_URL from PostgreSQL for now
// or fallback to localhost for development
const MONGODB_URI = process.env.DATABASE_URL || 'mongodb://localhost:27017/blog';

// Connect to MongoDB
export const connectToDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Close the MongoDB connection when the Node process terminates
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

export default mongoose;