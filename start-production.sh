#!/bin/bash

# Build the application for production
echo "Building application for production..."
npm run build

# Set environment to production and start the server
echo "Starting application in production mode..."
NODE_ENV=production node dist/index.js