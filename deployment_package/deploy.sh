#!/bin/bash

# RuneFlow Deployment Script
# This script will deploy the coming soon page to your server

echo "🚀 RuneFlow Deployment Script"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the RuneFlow project root directory"
    exit 1
fi

# Create deployment package
echo "📦 Creating deployment package..."
mkdir -p deployment_package/runeflow

# Copy essential files
echo "📁 Copying essential files..."
cp -r automation/ deployment_package/runeflow/
cp -r assets/ deployment_package/runeflow/
cp -r data/ deployment_package/runeflow/ 2>/dev/null || mkdir -p deployment_package/runeflow/data
cp -r social-media-campaigns/ deployment_package/runeflow/
cp index.html deployment_package/runeflow/
cp package.json deployment_package/runeflow/
cp .env deployment_package/runeflow/
cp start.sh deployment_package/runeflow/

# Create a simple package.json for production
echo "📝 Creating production package.json..."
cat > deployment_package/runeflow/package.json << 'EOF'
{
  "name": "runeflow-coming-soon",
  "version": "1.0.0",
  "description": "RuneFlow Coming Soon Page",
  "main": "automation/server.js",
  "scripts": {
    "start": "node automation/server.js",
    "install-deps": "npm install --production"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "nodemailer": "^6.9.8",
    "coinbase-commerce-node": "^1.0.4",
    "crypto": "^1.0.1"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
EOF

# Create deployment instructions
echo "📋 Creating deployment instructions..."
cat > deployment_package/DEPLOY_INSTRUCTIONS.md << 'EOF'
# RuneFlow Deployment Instructions

## Prerequisites
- Node.js v16+ installed on your server
- SSH access to your server
- Domain pointing to your server

## Deployment Steps

### 1. Upload Files
Upload the entire 'runeflow' folder to your server:
```bash
scp -r runeflow/ user@your-server.com:/path/to/deployment/
```

### 2. SSH into Your Server
```bash
ssh user@your-server.com
cd /path/to/deployment/runeflow
```

### 3. Install Dependencies
```bash
source ~/.nvm/nvm.sh  # If using NVM
npm install
```

### 4. Configure Environment
Edit the .env file with your settings:
```bash
nano .env
```

### 5. Start the Application
```bash
# For development
npm start

# For production (with PM2)
npm install -g pm2
pm2 start automation/server.js --name runeflow
pm2 save
pm2 startup
```

### 6. Configure Reverse Proxy (Optional)
If you want to use port 80/443, configure Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

## Testing

1. Visit your domain to see the coming soon page
2. Test email signup functionality
3. Check server logs for any errors

## Monitoring

- Check logs: `pm2 logs runeflow`
- Monitor status: `pm2 status`
- Restart if needed: `pm2 restart runeflow`

## Troubleshooting

### Common Issues:
1. **Port already in use**: Change PORT in .env file
2. **Permission errors**: Check file permissions
3. **Module not found**: Run `npm install` again
4. **Email not sending**: Check SMTP settings in .env

### Support:
For issues, contact bryan@webhalla.com
EOF

# Create a start script for the server
echo "🔧 Creating start script..."
cat > deployment_package/runeflow/start.sh << 'EOF'
#!/bin/bash

# RuneFlow Start Script
echo "🚀 Starting RuneFlow Coming Soon..."

# Load NVM if available
if [ -f ~/.nvm/nvm.sh ]; then
    source ~/.nvm/nvm.sh
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the application
echo "🌐 Starting server..."
NODE_ENV=production npm start
EOF

chmod +x deployment_package/runeflow/start.sh

# Create archive for easy upload
echo "📦 Creating deployment archive..."
cd deployment_package
tar -czf runeflow-deployment.tar.gz runeflow/
cd ..

echo "✅ Deployment package created successfully!"
echo ""
echo "📁 Files created:"
echo "  - deployment_package/runeflow/ (deployment folder)"
echo "  - deployment_package/runeflow-deployment.tar.gz (archive for upload)"
echo "  - deployment_package/DEPLOY_INSTRUCTIONS.md (deployment guide)"
echo ""
echo "🚀 Next steps:"
echo "1. Upload deployment_package/runeflow-deployment.tar.gz to your server"
echo "2. Extract it on your server"
echo "3. Follow the instructions in DEPLOY_INSTRUCTIONS.md"
echo ""
echo "📡 Upload command example:"
echo "scp deployment_package/runeflow-deployment.tar.gz user@your-server.com:~/"
