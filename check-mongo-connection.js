#!/usr/bin/env node

/**
 * A script to check the MongoDB connection in production environment
 * Run with: NODE_ENV=production node check-mongo-connection.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Check if MongoDB URI is defined
if (!process.env.MONGODB_URI) {
  console.error('\x1b[31mERROR: MONGODB_URI environment variable is not defined.\x1b[0m');
  console.error('Make sure to create a .env file with MONGODB_URI set to your MongoDB connection string.');
  process.exit(1);
}

// Connect to MongoDB
console.log('\x1b[36mAttempting to connect to MongoDB...\x1b[0m');
console.log(`Connection string: ${process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@')}`);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('\x1b[32m✓ Successfully connected to MongoDB!\x1b[0m');
    
    // Display database info
    const db = mongoose.connection;
    console.log(`\x1b[36mConnected to database: ${db.name}\x1b[0m`);
    
    // List collections
    return db.db.listCollections().toArray();
  })
  .then(collections => {
    console.log('\x1b[36mAvailable collections:\x1b[0m');
    if (collections.length === 0) {
      console.log('  No collections found. The database is empty.');
    } else {
      collections.forEach(collection => {
        console.log(`  - ${collection.name}`);
      });
    }
    
    // All checks complete
    console.log('\x1b[32m✓ MongoDB connection check completed successfully.\x1b[0m');
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('\x1b[31mERROR: Failed to connect to MongoDB\x1b[0m');
    console.error(err);
    process.exit(1);
  });