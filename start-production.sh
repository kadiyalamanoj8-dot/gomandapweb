#!/bin/bash

# Gomandap Ecosystem - Production Setup & Startup Script
# Designed for the OCI Linux VM Instance (68.233.97.93)

echo "======================================================"
echo " Starting Gomandap Production Deployment / Restart"
echo "======================================================"

# 1. Pull latest code (if in git repo)
if [ -d .git ]; then
  echo "Pulling latest code from Git..."
  git pull origin main
else
  echo "Git repository not found, skipping pull."
fi

# 2. Install dependencies & build apps
echo "Installing Root dependencies..."
npm install

echo "Installing Backend dependencies..."
cd backend && npm install && cd ..

# 3. Handle Frontend builds (Firebase hosting builds or VM local builds)
echo "Installing and building Frontend Apps (Client, Vendor, Admin)..."
echo "Building Client..."
cd client && npm install && npm run build && cd ..

echo "Building Vendor..."
cd vendor && npm install && npm run build && cd ..

echo "Building Admin..."
cd admin && npm install && npm run build && cd ..

# 4. Process Management with PM2
if command -v pm2 > /dev/null 2>&1; then
  echo "PM2 is installed globally. Starting/Reloading servers..."
  pm2 startOrReload pm2.config.js
  pm2 save
  echo "PM2 status:"
  pm2 list
else
  echo "PM2 is not installed globally. Using npx to run PM2..."
  npx pm2 startOrReload pm2.config.js
  npx pm2 save
  echo "PM2 status:"
  npx pm2 list
fi

echo "======================================================"
echo " Gomandap Production Servers successfully updated!"
echo "======================================================"
echo "Backend port: 5000"
echo "======================================================"
