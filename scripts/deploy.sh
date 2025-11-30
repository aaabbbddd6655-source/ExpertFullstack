#!/bin/bash

# ===========================================
# IVEA Order Tracking - Deployment Script
# ===========================================
# Usage: ./scripts/deploy.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="ivea-order-tracking"
APP_DIR="/var/www/$APP_NAME"
REPO_URL="https://github.com/YOUR_USERNAME/ivea-order-tracking.git"
BRANCH="main"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  IVEA Order Tracking - Deployment${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${YELLOW}Note: Some commands may require sudo${NC}"
fi

# Step 1: Navigate to app directory
echo -e "\n${GREEN}[1/8] Navigating to application directory...${NC}"
cd $APP_DIR || {
    echo -e "${RED}Error: Directory $APP_DIR not found${NC}"
    exit 1
}

# Step 2: Pull latest code
echo -e "\n${GREEN}[2/8] Pulling latest code from $BRANCH...${NC}"
git fetch origin
git pull origin $BRANCH

# Step 3: Install all dependencies (including dev for build)
echo -e "\n${GREEN}[3/8] Installing dependencies...${NC}"
npm ci

# Step 4: Build the application
echo -e "\n${GREEN}[4/8] Building application...${NC}"
npm run build

# Step 5: Remove dev dependencies to save space
echo -e "\n${GREEN}[5/8] Cleaning up dev dependencies...${NC}"
npm prune --production

# Step 6: Run database migrations
echo -e "\n${GREEN}[6/8] Running database migrations...${NC}"
npm run db:push

# Step 7: Restart PM2 application
echo -e "\n${GREEN}[7/8] Restarting application with PM2...${NC}"
pm2 reload ecosystem.config.cjs --env production || pm2 start ecosystem.config.cjs --env production

# Step 8: Save PM2 configuration
echo -e "\n${GREEN}[8/8] Saving PM2 configuration...${NC}"
pm2 save

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}  Deployment completed successfully!${NC}"
echo -e "${BLUE}========================================${NC}"

# Show application status
echo -e "\n${YELLOW}Application Status:${NC}"
pm2 status $APP_NAME

echo -e "\n${YELLOW}Recent logs:${NC}"
pm2 logs $APP_NAME --lines 10 --nostream
