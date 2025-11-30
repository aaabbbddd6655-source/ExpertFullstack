#!/bin/bash

# ===========================================
# IVEA Order Tracking - Initial VPS Setup
# ===========================================
# Run this script on a fresh Hostinger VPS
# Usage: sudo bash scripts/initial-setup.sh

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  IVEA - Initial VPS Setup${NC}"
echo -e "${BLUE}========================================${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root (sudo)${NC}"
    exit 1
fi

# Step 1: Update system
echo -e "\n${GREEN}[1/10] Updating system packages...${NC}"
apt update && apt upgrade -y

# Step 2: Install essential packages
echo -e "\n${GREEN}[2/10] Installing essential packages...${NC}"
apt install -y curl wget git build-essential nginx ufw

# Step 3: Install Node.js via NVM
echo -e "\n${GREEN}[3/10] Installing Node.js via NVM...${NC}"
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
nvm alias default 20

# Verify Node.js installation
echo -e "${YELLOW}Node.js version:${NC} $(node -v)"
echo -e "${YELLOW}NPM version:${NC} $(npm -v)"

# Step 4: Install PM2
echo -e "\n${GREEN}[4/10] Installing PM2...${NC}"
npm install -g pm2

# Step 5: Install PostgreSQL
echo -e "\n${GREEN}[5/10] Installing PostgreSQL...${NC}"
apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Step 6: Configure PostgreSQL
echo -e "\n${GREEN}[6/10] Configuring PostgreSQL...${NC}"
# Generate a random password
DB_PASSWORD=$(openssl rand -base64 16)

sudo -u postgres psql << EOF
CREATE USER ivea_user WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
CREATE DATABASE ivea_orders OWNER ivea_user;
GRANT ALL PRIVILEGES ON DATABASE ivea_orders TO ivea_user;
\c ivea_orders
GRANT ALL ON SCHEMA public TO ivea_user;
EOF

echo -e "${YELLOW}Database created with credentials:${NC}"
echo -e "  User: ivea_user"
echo -e "  Password: $DB_PASSWORD"
echo -e "  Database: ivea_orders"
echo -e "\n${RED}IMPORTANT: Save this password! It won't be shown again.${NC}"

# Step 7: Create application directory
echo -e "\n${GREEN}[7/10] Creating application directory...${NC}"
mkdir -p /var/www/ivea-order-tracking
mkdir -p /var/log/pm2

# Step 8: Configure firewall
echo -e "\n${GREEN}[8/10] Configuring firewall (UFW)...${NC}"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Step 9: Configure Nginx
echo -e "\n${GREEN}[9/10] Configuring Nginx...${NC}"
# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t
systemctl restart nginx
systemctl enable nginx

# Step 10: Install Certbot for SSL
echo -e "\n${GREEN}[10/10] Installing Certbot for SSL...${NC}"
apt install -y certbot python3-certbot-nginx

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}  Initial setup completed!${NC}"
echo -e "${BLUE}========================================${NC}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Clone your repository to /var/www/ivea-order-tracking"
echo -e "2. Copy nginx/order-ivea.com.conf to /etc/nginx/sites-available/"
echo -e "3. Create symlink: ln -s /etc/nginx/sites-available/order-ivea.com.conf /etc/nginx/sites-enabled/"
echo -e "4. Create .env file with your configuration"
echo -e "5. Run: npm install && npm run build && npm run db:push"
echo -e "6. Start with PM2: pm2 start ecosystem.config.cjs"
echo -e "7. Get SSL certificate: certbot --nginx -d order-ivea.com -d www.order-ivea.com"

echo -e "\n${YELLOW}Database Connection String:${NC}"
echo -e "DATABASE_URL=postgresql://ivea_user:$DB_PASSWORD@localhost:5432/ivea_orders"
