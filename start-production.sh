#!/bin/bash

# Script to start the application in production mode

echo "Starting application in production mode..."

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Warning: .env file not found. Creating default .env file."
  echo "NODE_ENV=production" > .env
  echo "SESSION_SECRET=please-change-this-in-production" >> .env
  echo "Please update the .env file with your MongoDB connection string and other settings."
  exit 1
fi

# Check if MONGODB_URI is set in .env
if ! grep -q "MONGODB_URI=" .env; then
  echo "Error: MONGODB_URI is not set in .env file."
  echo "Please add your MongoDB connection string to the .env file."
  exit 1
fi

# Check if the build exists
if [ ! -d "dist" ]; then
  echo "Building application for production..."
  npm run build
fi

# Start the application
echo "Starting server..."
NODE_ENV=production node dist/index.js