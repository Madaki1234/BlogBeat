#!/bin/bash

# Production deployment script

echo "Starting deployment process..."

# Pull latest changes from repository
echo "Pulling latest code changes..."
git pull

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application for production..."
npm run build

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "PM2 is not installed. Installing PM2..."
    npm install -g pm2
fi

# Check if the app is already running
if pm2 list | grep -q "blog-app"; then
    echo "Restarting application..."
    pm2 restart blog-app
else
    echo "Starting application in production mode..."
    pm2 start dist/index.js --name "blog-app" --env production
fi

echo "Deployment completed successfully!"