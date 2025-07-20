#!/bin/bash

# RuneFlow.xyz SSH Deployment Script
# Deploy to access-5018238038.webspace-host.com

set -e

echo "🚀 RuneFlow.xyz - Deploying to Production Server"
echo "==============================================="

# Server configuration
SERVER_HOST="access-5018238038.webspace-host.com"
SERVER_USER="a1209928"
SERVER_PORT="22"
REMOTE_PATH="~/runeflow"
DEPLOYMENT_ARCHIVE="deployment_package/runeflow-deployment.tar.gz"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if deployment archive exists
if [ ! -f "$DEPLOYMENT_ARCHIVE" ]; then
    print_error "Deployment archive not found: $DEPLOYMENT_ARCHIVE"
    print_info "Please run ./deployment_package/deploy.sh first"
    exit 1
fi

print_status "Deployment archive found: $(ls -lh $DEPLOYMENT_ARCHIVE | awk '{print $5}')"

# Step 1: Upload deployment package
print_info "Uploading deployment package to server..."
scp -P $SERVER_PORT "$DEPLOYMENT_ARCHIVE" "$SERVER_USER@$SERVER_HOST:~/"

if [ $? -eq 0 ]; then
    print_status "Deployment package uploaded successfully"
else
    print_error "Failed to upload deployment package"
    exit 1
fi

# Step 2: Deploy on server
print_info "Connecting to server and deploying..."

ssh -p $SERVER_PORT "$SERVER_USER@$SERVER_HOST" << 'ENDSSH'
    set -e
    
    echo "🔧 Setting up RuneFlow.xyz on server..."
    
    # Extract deployment package
    if [ -f "runeflow-deployment.tar.gz" ]; then
        echo "📦 Extracting deployment package..."
        tar -xzf runeflow-deployment.tar.gz
        echo "✅ Package extracted"
    else
        echo "❌ Deployment archive not found on server"
        exit 1
    fi
    
    # Navigate to deployment directory
    cd runeflow
    
    # Check if Node.js is available
    if command -v node >/dev/null 2>&1; then
        echo "✅ Node.js found: $(node --version)"
    else
        echo "❌ Node.js not found. Please install Node.js on the server."
        exit 1
    fi
    
    # Install dependencies
    echo "📦 Installing production dependencies..."
    npm install --production --silent
    
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed successfully"
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        echo "⚠️  .env file not found, creating from template..."
        cat > .env << 'ENVEOF'
# RuneFlow.xyz Production Configuration
PORT=3000
NODE_ENV=production
HOST=0.0.0.0

# Email Configuration
SMTP_HOST=mail.runeflow.xyz
SMTP_PORT=587
SMTP_USER=hello@runeflow.xyz
SMTP_PASS=your_email_password
FROM_EMAIL=hello@runeflow.xyz
FROM_NAME=RuneFlow Team

# Coinbase Commerce (Update with your keys)
COINBASE_COMMERCE_API_KEY=your_coinbase_api_key
COINBASE_COMMERCE_WEBHOOK_SECRET=your_webhook_secret

# Social Media (Optional)
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
FACEBOOK_ACCESS_TOKEN=your_facebook_token
LINKEDIN_ACCESS_TOKEN=your_linkedin_token

# Analytics
GOOGLE_ANALYTICS_ID=your_ga_id
GOOGLE_TAG_MANAGER_ID=your_gtm_id

# Webhook URLs
DISCORD_WEBHOOK_URL=your_discord_webhook
SLACK_WEBHOOK_URL=your_slack_webhook
ENVEOF
        echo "✅ .env file created - please edit with your actual values"
    fi
    
    # Make start script executable
    chmod +x start.sh
    
    # Check if PM2 is available
    if command -v pm2 >/dev/null 2>&1; then
        echo "🔄 PM2 found, using for production deployment..."
        
        # Stop existing process if running
        pm2 stop runeflow-xyz 2>/dev/null || true
        pm2 delete runeflow-xyz 2>/dev/null || true
        
        # Start with PM2
        pm2 start automation/server.js --name runeflow-xyz --log-file logs/runeflow.log
        pm2 save
        
        echo "✅ RuneFlow.xyz started with PM2"
        pm2 list
        
    else
        echo "⚠️  PM2 not found, installing PM2..."
        npm install -g pm2
        
        if [ $? -eq 0 ]; then
            echo "✅ PM2 installed successfully"
            
            # Start with PM2
            pm2 start automation/server.js --name runeflow-xyz --log-file logs/runeflow.log
            pm2 save
            pm2 startup
            
            echo "✅ RuneFlow.xyz started with PM2"
            pm2 list
        else
            echo "⚠️  Could not install PM2, starting in background..."
            nohup npm start > logs/runeflow.log 2>&1 &
            echo "✅ RuneFlow.xyz started in background"
        fi
    fi
    
    # Create logs directory
    mkdir -p logs
    
    # Test server health
    sleep 5
    echo "🧪 Testing server health..."
    
    if curl -f http://localhost:3000/health >/dev/null 2>&1; then
        echo "✅ Server health check passed!"
    else
        echo "⚠️  Server health check failed, but deployment completed"
        echo "Please check logs and configuration"
    fi
    
    echo ""
    echo "🎉 RuneFlow.xyz Deployment Complete!"
    echo "=================================="
    echo "✅ Files deployed to: ~/runeflow/"
    echo "✅ Server running on port 3000"
    echo "✅ Process managed by PM2 (if available)"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Edit ~/runeflow/.env with your API keys"
    echo "2. Configure your domain to point to this server"
    echo "3. Set up SSL certificate if needed"
    echo "4. Test the website at your domain"
    echo ""
    echo "📊 Process Management:"
    echo "- View logs: pm2 logs runeflow-xyz"
    echo "- Restart: pm2 restart runeflow-xyz"  
    echo "- Stop: pm2 stop runeflow-xyz"
    echo "- Status: pm2 list"
    echo ""
    
ENDSSH

if [ $? -eq 0 ]; then
    print_status "Deployment completed successfully!"
    echo ""
    echo "🌟 RuneFlow.xyz is now deployed!"
    echo "================================"
    echo "🔗 Server: $SERVER_HOST"
    echo "📁 Path: $REMOTE_PATH"
    echo "🚀 Status: Running on port 3000"
    echo ""
    echo "⚠️  Important Next Steps:"
    echo "1. SSH into your server and edit the .env file:"
    echo "   ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST"
    echo "   cd runeflow && nano .env"
    echo ""
    echo "2. Add your real API keys for:"
    echo "   - Email (SMTP credentials)"
    echo "   - Coinbase Commerce (API keys)"
    echo "   - Social media (Twitter, Facebook, etc.)"
    echo ""
    echo "3. Restart the application:"
    echo "   pm2 restart runeflow-xyz"
    echo ""
    echo "4. Point your domain (runeflow.xyz) to server IP"
    echo "5. Set up SSL certificate for HTTPS"
    
else
    print_error "Deployment failed!"
    exit 1
fi
