# Gomandap Ecosystem - Local Windows Dev Setup & Startup Script

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " Starting Gomandap Local Dev Setup / Restart" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan

# 1. Pull latest code (if in git repo)
if (Test-Path .git) {
    Write-Host "Pulling latest code from Git..." -ForegroundColor Yellow
    git pull origin main
} else {
    Write-Host "Git repository not found, skipping pull." -ForegroundColor Yellow
}

# 2. Install dependencies & build apps
Write-Host "Installing Root dependencies..." -ForegroundColor Green
npm install

Write-Host "Installing Backend dependencies..." -ForegroundColor Green
cd backend
npm install
cd ..
# 3. Handle Frontend builds
Write-Host "Installing and building Frontend Apps (Client, Vendor, Admin)..." -ForegroundColor Green
Write-Host "Building Client..." -ForegroundColor Green
cd client
npm install
npm run build
cd ..

Write-Host "Building Vendor..." -ForegroundColor Green
cd vendor
npm install
npm run build
cd ..

Write-Host "Building Admin..." -ForegroundColor Green
cd admin
npm install
npm run build
cd ..

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host " Gomandap Production Servers successfully built locally!" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
