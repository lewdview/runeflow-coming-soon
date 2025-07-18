#!/bin/bash

# RuneFlow Enhanced Deployment Script with DNS Configuration
# This script handles deployment AND DNS setup for your domain

echo "🚀 RuneFlow Enhanced Deployment + DNS Setup"
echo "=============================================="

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if deployment package exists
if [ ! -f "runeflow-deployment.tar.gz" ]; then
    echo -e "${RED}❌ Deployment package not found. Please run the deployment script first.${NC}"
    exit 1
fi

echo -e "${BLUE}📡 Server Connection Setup${NC}"
echo "Please provide your server information:"
read -p "Server hostname or IP: " SERVER_HOST
read -p "SSH username: " SSH_USER
read -p "SSH port (default 22): " SSH_PORT
SSH_PORT=${SSH_PORT:-22}
read -p "Domain name (e.g., runeflow.co): " DOMAIN_NAME

echo ""
echo -e "${BLUE}🔧 Deployment Path Options${NC}"
echo "1. Upload to home directory (~/) - Recommended"
echo "2. Upload to web root (/var/www/html/)"
echo "3. Upload to your hosting directory (/homepages/30/d4299177779/htdocs/)"
echo "4. Custom path"
read -p "Choose option (1-4): " DEPLOY_OPTION

case $DEPLOY_OPTION in
    1)
        DEPLOY_PATH="~/"
        ;;
    2)
        DEPLOY_PATH="/var/www/html/"
        ;;
    3)
        DEPLOY_PATH="/homepages/30/d4299177779/htdocs/"
        ;;
    4)
        read -p "Enter custom path: " DEPLOY_PATH
        ;;
    *)
        echo -e "${YELLOW}❌ Invalid option. Using home directory.${NC}"
        DEPLOY_PATH="~/"
        ;;
esac

echo ""
echo -e "${BLUE}🌐 DNS Configuration Options${NC}"
echo "1. Configure DNS with Cloudflare API"
echo "2. Configure DNS with Manual Instructions"
echo "3. Skip DNS setup (deploy only)"
read -p "Choose DNS option (1-3): " DNS_OPTION

# DNS Configuration
if [ "$DNS_OPTION" == "1" ]; then
    echo ""
    echo -e "${YELLOW}📝 Cloudflare DNS Configuration${NC}"
    read -p "Cloudflare API Token: " CF_API_TOKEN
    read -p "Cloudflare Zone ID: " CF_ZONE_ID
    
    echo "Setting up DNS records for $DOMAIN_NAME -> $SERVER_HOST"
    
    # Create A record for root domain
    curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{\"type\":\"A\",\"name\":\"$DOMAIN_NAME\",\"content\":\"$SERVER_HOST\",\"ttl\":1}" \
        --silent | jq -r '.success'
    
    # Create A record for www subdomain
    curl -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{\"type\":\"A\",\"name\":\"www\",\"content\":\"$SERVER_HOST\",\"ttl\":1}" \
        --silent | jq -r '.success'
    
    echo -e "${GREEN}✅ DNS records created successfully${NC}"
fi

echo ""
echo -e "${BLUE}📦 Uploading deployment package...${NC}"
echo "Command: scp -P $SSH_PORT runeflow-deployment.tar.gz $SSH_USER@$SERVER_HOST:$DEPLOY_PATH"

# Upload the deployment package
if scp -P $SSH_PORT runeflow-deployment.tar.gz $SSH_USER@$SERVER_HOST:$DEPLOY_PATH; then
    echo -e "${GREEN}✅ Upload successful!${NC}"
else
    echo -e "${RED}❌ Upload failed. Please check your server details and try again.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔧 Deploying on server...${NC}"

# Create deployment commands
DEPLOYMENT_COMMANDS=$(cat <<EOF
cd $DEPLOY_PATH
tar -xzf runeflow-deployment.tar.gz
cd runeflow

# Load NVM and install dependencies
source ~/.nvm/nvm.sh
npm install

# Create systemd service for auto-start
sudo tee /etc/systemd/system/runeflow.service > /dev/null <<EOL
[Unit]
Description=RuneFlow Coming Soon Server
After=network.target

[Service]
Type=simple
User=$SSH_USER
WorkingDirectory=$DEPLOY_PATH/runeflow
ExecStart=$(which node) automation/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOL

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable runeflow
sudo systemctl start runeflow

echo "✅ RuneFlow service installed and started"
echo "🔍 Service status:"
sudo systemctl status runeflow --no-pager -l

echo ""
echo "🌐 Server is running on port 3000"
echo "📊 Test access: curl http://localhost:3000"
EOF
)

# Execute deployment commands on server
echo -e "${YELLOW}🚀 Executing deployment commands on server...${NC}"
ssh -p $SSH_PORT $SSH_USER@$SERVER_HOST "$DEPLOYMENT_COMMANDS"

echo ""
echo -e "${BLUE}🔧 Setting up Nginx reverse proxy...${NC}"

# Nginx configuration
NGINX_CONFIG=$(cat <<EOF
# Update system and install Nginx
sudo apt update
sudo apt install -y nginx

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/runeflow > /dev/null <<EOL
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
    }
}
EOL

# Enable the site
sudo ln -sf /etc/nginx/sites-available/runeflow /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "✅ Nginx configured and running"
echo "🔍 Nginx status:"
sudo systemctl status nginx --no-pager -l
EOF
)

# Execute Nginx setup
echo -e "${YELLOW}🔧 Setting up Nginx reverse proxy...${NC}"
ssh -p $SSH_PORT $SSH_USER@$SERVER_HOST "$NGINX_CONFIG"

echo ""
echo -e "${BLUE}🔒 Setting up SSL with Let's Encrypt...${NC}"

# SSL setup
SSL_SETUP=$(cat <<EOF
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME --non-interactive --agree-tos --email bryan@webhalla.com

# Test SSL renewal
sudo certbot renew --dry-run

echo "✅ SSL certificate installed and configured"
EOF
)

# Execute SSL setup
echo -e "${YELLOW}🔒 Installing SSL certificate...${NC}"
ssh -p $SSH_PORT $SSH_USER@$SERVER_HOST "$SSL_SETUP"

echo ""
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo -e "${BLUE}🌐 Your RuneFlow coming soon page is now live at:${NC}"
echo "   • https://$DOMAIN_NAME"
echo "   • https://www.$DOMAIN_NAME"
echo ""
echo -e "${BLUE}📊 Admin URLs:${NC}"
echo "   • Analytics: https://$DOMAIN_NAME/analytics"
echo "   • Health Check: https://$DOMAIN_NAME/health"
echo "   • Export Emails: https://$DOMAIN_NAME/export-emails"
echo ""
echo -e "${BLUE}🔧 Server Management:${NC}"
echo "   • Check status: sudo systemctl status runeflow"
echo "   • View logs: sudo journalctl -u runeflow -f"
echo "   • Restart: sudo systemctl restart runeflow"
echo "   • Stop: sudo systemctl stop runeflow"
echo ""
echo -e "${BLUE}🌟 Features Available:${NC}"
echo "   ✅ Email capture with automated welcome emails"
echo "   ✅ Stripe payment processing"
echo "   ✅ Coinbase Commerce crypto payments"
echo "   ✅ Analytics dashboard"
echo "   ✅ Social media automation"
echo "   ✅ SSL encryption"
echo "   ✅ Auto-restart on reboot"
echo ""

# DNS Instructions for manual setup
if [ "$DNS_OPTION" == "2" ]; then
    echo -e "${YELLOW}📝 Manual DNS Configuration Required:${NC}"
    echo "=========================================="
    echo "Add these DNS records to your domain registrar:"
    echo ""
    echo "Record Type: A"
    echo "Name: @ (root domain)"
    echo "Value: $SERVER_HOST"
    echo "TTL: 300"
    echo ""
    echo "Record Type: A"
    echo "Name: www"
    echo "Value: $SERVER_HOST"
    echo "TTL: 300"
    echo ""
    echo "🕐 DNS propagation may take 24-48 hours"
    echo ""
fi

echo -e "${BLUE}🆘 Need Help?${NC}"
echo "   • Check server logs: ssh -p $SSH_PORT $SSH_USER@$SERVER_HOST 'sudo journalctl -u runeflow -f'"
echo "   • Test server: curl http://$SERVER_HOST:3000"
echo "   • Contact support: bryan@webhalla.com"
echo ""
echo -e "${GREEN}🚀 RuneFlow is now live and ready to capture early access signups!${NC}"
