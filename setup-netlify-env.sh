#!/bin/bash

# RuneFlow.xyz Netlify Environment Variables Setup Script
# This script helps you set the required environment variables for payment processing

echo "🚀 RuneFlow.xyz - Netlify Environment Variables Setup"
echo "=================================================="
echo ""

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI not found. Installing..."
    npm install -g netlify-cli
    echo "✅ Netlify CLI installed!"
fi

# Login to Netlify if not already logged in
echo "🔐 Checking Netlify authentication..."
if ! netlify status &> /dev/null; then
    echo "Please log in to Netlify:"
    netlify login
fi

echo ""
echo "📋 Setting up environment variables..."
echo "You'll need to provide the actual values for these variables:"
echo ""

# Function to set environment variable
set_env_var() {
    local key=$1
    local description=$2
    local example=$3
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Setting: $key"
    echo "Description: $description"
    echo "Example: $example"
    echo ""
    read -p "Enter value for $key: " value
    
    if [ ! -z "$value" ]; then
        netlify env:set "$key" "$value"
        echo "✅ $key set successfully!"
    else
        echo "⚠️ Skipping $key (empty value)"
    fi
    echo ""
}

# Set each environment variable
set_env_var "COINBASE_WEBHOOK_SECRET" "Webhook secret from Coinbase Commerce dashboard" "whsec_1234567890abcdef..."

set_env_var "SMTP_HOST" "Your email server hostname" "smtp.ionos.com"

set_env_var "SMTP_PORT" "Your email server port (usually 587 for TLS)" "587"

set_env_var "SMTP_USER" "Your email address for sending confirmations" "hello@runeflow.xyz"

set_env_var "SMTP_PASS" "Your email password or app password" "your_secure_password"

set_env_var "FROM_EMAIL" "The email address to send confirmations from" "hello@runeflow.xyz"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Environment variables setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy your site: netlify deploy --prod"
echo "2. Test the webhook endpoint: https://runeflow.xyz/.netlify/functions/coinbase-webhook"
echo "3. Configure Coinbase Commerce webhook with this URL"
echo ""
echo "🔍 To view your current environment variables:"
echo "   netlify env:list"
echo ""
echo "🚀 Your payment system should now be ready!"
