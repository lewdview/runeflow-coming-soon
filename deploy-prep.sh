#!/bin/bash

# RuneFlow Deployment Preparation Script
# This script helps you prepare your project for deployment

echo "🚀 RuneFlow Deployment Preparation"
echo "=================================="

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your actual values."
    echo ""
fi

# Check Node.js version
echo "📋 Checking Node.js version..."
node --version
npm --version
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Check if all required files exist
echo "🔍 Checking required files..."

required_files=(
    "index.html"
    "package.json"
    "assets/css/coming-soon.css"
    "assets/js/coming-soon.js"
    "automation/server.js"
    ".env"
)

missing_files=()

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo ""
    echo "⚠️  Missing files detected. Please ensure all files are present."
    exit 1
fi

echo ""
echo "🧪 Running local tests..."

# Test server start
echo "Starting server test..."
timeout 5 npm start &
sleep 2

# Test if server is running
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Server health check passed"
else
    echo "❌ Server health check failed"
fi

# Kill any running servers
pkill -f "node automation/server.js" 2>/dev/null || true

echo ""
echo "📊 Project size analysis..."
echo "Total files: $(find . -type f ! -path "./node_modules/*" | wc -l)"
echo "Project size: $(du -sh . | cut -f1)"
echo ""

echo "🎯 Deployment Options:"
echo "1. Railway (Recommended): https://railway.app"
echo "2. Heroku: https://heroku.com"
echo "3. DigitalOcean: https://digitalocean.com"
echo "4. Netlify: https://netlify.com"
echo ""

echo "📝 Next Steps:"
echo "1. Edit .env file with your actual API keys"
echo "2. Choose a hosting platform from above"
echo "3. Follow the deployment guide in DEPLOYMENT_GUIDE.md"
echo "4. Test your deployed application"
echo ""

echo "✅ Deployment preparation complete!"
echo "Need help? Contact bryan@webhalla.com"
