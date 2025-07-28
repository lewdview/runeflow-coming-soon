#!/bin/bash

# RuneRUSH Railway Deployment Script
# This script helps you deploy RuneRUSH to Railway with proper environment variables

echo "🚀 RuneRUSH Railway Deployment Helper"
echo "======================================"

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Install it first:"
    echo "   npm install -g @railway/cli"
    echo "   Then run: railway login"
    exit 1
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged into Railway. Please run:"
    echo "   railway login"
    exit 1
fi

echo "✅ Railway CLI found and authenticated"

# Create new Railway project or link existing
echo ""
echo "🔧 Setting up Railway project..."
read -p "Do you want to create a new project or link an existing one? (new/existing): " project_choice

if [ "$project_choice" = "new" ]; then
    read -p "Enter project name (e.g., runerush-backend): " project_name
    railway new "$project_name"
elif [ "$project_choice" = "existing" ]; then
    echo "Available projects:"
    railway projects
    read -p "Enter project ID to link: " project_id
    railway link "$project_id"
else
    echo "❌ Invalid choice. Exiting."
    exit 1
fi

# Add PostgreSQL database
echo ""
echo "📊 Adding PostgreSQL database..."
railway add --database postgresql

# Set environment variables
echo ""
echo "🔧 Setting up environment variables..."

# Ask for Stripe keys
echo ""
echo "Enter your Stripe configuration:"
read -p "Stripe Publishable Key (pk_test_...): " stripe_pub_key
read -p "Stripe Secret Key (sk_test_...): " stripe_secret_key

# Ask for SendGrid API key
echo ""
read -p "SendGrid API Key (SG.xxx...): " sendgrid_key

# Ask for domain
echo ""
read -p "Your domain (e.g., runerush.com): " domain_name

# Set all environment variables
echo ""
echo "🔄 Setting environment variables..."

railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set STRIPE_PUBLISHABLE_KEY="$stripe_pub_key"
railway variables set STRIPE_SECRET_KEY="$stripe_secret_key"
read -p "Stripe Webhook Secret (whsec_...): " webhook_secret
railway variables set STRIPE_WEBHOOK_SECRET="$webhook_secret"
railway variables set SENDGRID_API_KEY="$sendgrid_key"
railway variables set FROM_EMAIL="support@$domain_name"
railway variables set FROM_NAME="RuneRUSH Support"
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set ADMIN_PASSWORD="RuneRush2024!"
railway variables set DOWNLOAD_TOKEN_EXPIRY="24h"
railway variables set MAX_DOWNLOADS_PER_IP="3"
railway variables set FRONTEND_URL="https://$domain_name"
railway variables set RATE_LIMIT_WINDOW="15"
railway variables set RATE_LIMIT_MAX_REQUESTS="100"

echo "✅ Environment variables set successfully!"

# Deploy the application
echo ""
echo "🚀 Deploying application..."
railway up

echo ""
echo "✅ Deployment initiated!"
echo ""
echo "📋 Next Steps:"
echo "1. Wait for deployment to complete"
echo "2. Get your Railway app URL: railway domain"
echo "3. Add the webhook URL to Stripe:"
echo "   https://your-app.railway.app/api/webhooks/stripe"
echo "4. Update your Netlify frontend to point to the Railway backend"
echo "5. Test a payment to ensure everything works!"
echo ""
echo "🔧 Useful Railway commands:"
echo "   railway logs          - View application logs"
echo "   railway domain        - Get your app URL"
echo "   railway variables     - View environment variables"
echo "   railway connect       - Connect to your database"
echo ""
echo "🎉 Happy deploying!"
