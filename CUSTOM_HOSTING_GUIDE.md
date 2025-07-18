# Deploy RuneFlow to Your Own Hosting

## 🏠 Types of Hosting & Deployment Methods

### Type 1: Shared Hosting (cPanel/Plesk)
**Examples**: Bluehost, HostGator, GoDaddy
- **Supports**: Static files only (HTML, CSS, JS)
- **Node.js**: Usually not supported
- **Method**: Upload static files via FTP/File Manager

### Type 2: VPS/Dedicated Server
**Examples**: DigitalOcean Droplet, Linode, AWS EC2
- **Supports**: Full Node.js applications
- **Method**: SSH access + PM2 process manager

### Type 3: Managed Node.js Hosting
**Examples**: A2 Hosting, Hostinger, Namecheap
- **Supports**: Node.js applications
- **Method**: Git deployment or file upload

## 🚀 Deployment Options

### Option A: Static-Only Deployment (Most Shared Hosting)

If your hosting doesn't support Node.js, we'll create a static version:

1. **Build static version**:
   ```bash
   npm run build-static
   ```

2. **Upload these files via FTP**:
   ```
   dist/
   ├── index.html
   ├── assets/
   │   ├── css/
   │   ├── js/
   │   └── images/
   └── api/
       └── (serverless functions)
   ```

### Option B: Full Node.js Deployment (VPS/Dedicated)

If your hosting supports Node.js:

1. **Upload entire project**
2. **Install dependencies**
3. **Configure process manager**
4. **Set up reverse proxy**

## 📋 What Info Do You Need to Provide?

Please tell me:
1. **Hosting provider name** (Bluehost, DigitalOcean, etc.)
2. **Access method** (cPanel, SSH, FTP)
3. **Node.js support** (yes/no/unsure)
4. **Domain name** you want to use
5. **Control panel type** (cPanel, Plesk, custom)

## 🔧 Common Hosting Scenarios

### Scenario 1: cPanel Shared Hosting
```bash
# Create static build
npm run build-static

# Upload via File Manager or FTP:
# - Upload dist/ contents to public_html/
# - Set up email forwarding for notifications
# - Configure subdomains if needed
```

### Scenario 2: VPS with Root Access
```bash
# SSH into server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your project
git clone https://github.com/yourusername/runeflow.git
cd runeflow

# Install dependencies
npm install

# Set up environment
cp .env.example .env
nano .env

# Install PM2 (process manager)
sudo npm install -g pm2

# Start application
pm2 start automation/server.js --name runeflow

# Set up Nginx reverse proxy
sudo apt install nginx
```

### Scenario 3: Managed Node.js Hosting
```bash
# Usually involves:
# 1. Git repository connection
# 2. Environment variable setup
# 3. Build command configuration
# 4. Start command: npm start
```

## 🌐 Domain & DNS Setup

### If you have a domain:
1. **Point domain to your server**:
   - A record: `@` → `your-server-ip`
   - CNAME: `www` → `your-domain.com`

2. **Set up SSL certificate**:
   ```bash
   # Using Let's Encrypt (free)
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

### If using subdomain:
- Point subdomain to your server
- Example: `runeflow.your-domain.com`

## 📁 File Upload Methods

### Method 1: FTP/SFTP
```bash
# Using FileZilla or command line
sftp user@your-server-ip
put -r dist/* /var/www/html/
```

### Method 2: cPanel File Manager
1. Log into cPanel
2. Open File Manager
3. Navigate to public_html/
4. Upload and extract files

### Method 3: Git Deployment
```bash
# On your server
git clone https://github.com/yourusername/runeflow.git
cd runeflow
npm install
npm start
```

## 🔐 Security for Your Hosting

### Essential Security Steps:
1. **Firewall configuration**
2. **SSL certificate setup**
3. **Environment variables protection**
4. **Regular security updates**
5. **Backup configuration**

### Server Security Commands:
```bash
# Update system
sudo apt update && sudo apt upgrade

# Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Set up fail2ban
sudo apt install fail2ban
```

## 📊 Monitoring Your Deployment

### Health Checks:
```bash
# Check if app is running
curl https://your-domain.com/health

# Check processes
pm2 status

# View logs
pm2 logs runeflow
```

### Performance Monitoring:
```bash
# Install monitoring tools
sudo apt install htop iotop

# Monitor resources
htop
```

## 🚨 Troubleshooting

### Common Issues:
1. **Port conflicts**: Change PORT in .env
2. **Permission errors**: Fix file permissions
3. **Node.js not found**: Install correct Node.js version
4. **Database connection**: Check connection strings

### Debug Commands:
```bash
# Check Node.js version
node --version

# Test application locally
npm start

# Check ports
sudo netstat -tlnp | grep :3000

# Check logs
tail -f /var/log/nginx/error.log
```

---

## 🎯 Quick Start Questions

**To help you deploy, please answer:**

1. **What's your hosting provider?** (Bluehost, DigitalOcean, etc.)
2. **Do you have SSH access?** (yes/no)
3. **Does it support Node.js?** (yes/no/unsure)
4. **What's your domain name?**
5. **What control panel do you use?** (cPanel, Plesk, none)

Once you provide this info, I'll give you exact deployment steps for your specific hosting setup!

**Need immediate help?** Contact bryan@webhalla.com
