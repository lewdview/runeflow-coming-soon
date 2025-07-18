#!/bin/bash

# RuneFlow Quick Deployment Script
# This script will help you upload and deploy to your server

echo "🚀 RuneFlow Quick Deployment"
echo "=============================="

# Check if deployment package exists
if [ ! -f "runeflow-deployment.tar.gz" ]; then
    echo "❌ Deployment package not found. Please run ./deploy.sh first."
    exit 1
fi

# Get server details
echo "📡 Server Connection Details:"
echo "Please provide your server information:"
read -p "Server hostname or IP: " SERVER_HOST
read -p "SSH username: " SSH_USER
read -p "SSH port (default 22): " SSH_PORT
SSH_PORT=${SSH_PORT:-22}

echo ""
echo "🔧 Deployment Options:"
echo "1. Upload to home directory (~/)"
echo "2. Upload to web root (/homepages/30/d4299177779/htdocs/)"
echo "3. Custom path"
read -p "Choose option (1-3): " DEPLOY_OPTION

case $DEPLOY_OPTION in
    1)
        DEPLOY_PATH="~/"
        ;;
    2)
        DEPLOY_PATH="/homepages/30/d4299177779/htdocs/"
        ;;
    3)
        read -p "Enter custom path: " DEPLOY_PATH
        ;;
    *)
        echo "❌ Invalid option. Using home directory."
        DEPLOY_PATH="~/"
        ;;
esac

echo ""
echo "📦 Uploading deployment package..."
echo "Command: scp -P $SSH_PORT runeflow-deployment.tar.gz $SSH_USER@$SERVER_HOST:$DEPLOY_PATH"

# Upload the deployment package
if scp -P $SSH_PORT runeflow-deployment.tar.gz $SSH_USER@$SERVER_HOST:$DEPLOY_PATH; then
    echo "✅ Upload successful!"
    echo ""
    echo "🔧 Next steps - SSH into your server and run:"
    echo "ssh -p $SSH_PORT $SSH_USER@$SERVER_HOST"
    echo "cd $DEPLOY_PATH"
    echo "tar -xzf runeflow-deployment.tar.gz"
    echo "cd runeflow"
    echo "source ~/.nvm/nvm.sh"
    echo "npm install"
    echo "npm start"
    echo ""
    echo "🌐 Your RuneFlow coming soon page will be available at:"
    echo "http://$SERVER_HOST:3000"
    echo ""
    echo "📋 For detailed instructions, see DEPLOY_INSTRUCTIONS.md"
else
    echo "❌ Upload failed. Please check your server details and try again."
    exit 1
fi
