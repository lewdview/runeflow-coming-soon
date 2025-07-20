# RuneFlow.xyz Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Railway (Recommended for Node.js)

1. **Sign up at Railway.app**
2. **Connect your GitHub repository**
3. **Set environment variables**:
   ```bash
   PORT=3000
   NODE_ENV=production
   SMTP_HOST=mail.runeflow.xyz
   SMTP_USER=hello@runeflow.xyz
   SMTP_PASS=your_password
   COINBASE_API_KEY=your_coinbase_key
   COINBASE_WEBHOOK_SECRET=your_webhook_secret
   ```
4. **Deploy automatically from GitHub**

### Option 2: Heroku

1. **Install Heroku CLI**:
   ```bash
   npm install -g heroku
   ```

2. **Login and create app**:
   ```bash
   heroku login
   heroku create runeflow-app
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set SMTP_HOST=mail.runeflow.xyz
   heroku config:set SMTP_USER=hello@runeflow.xyz
   heroku config:set SMTP_PASS=your_password
   heroku config:set COINBASE_API_KEY=your_coinbase_key
   heroku config:set COINBASE_WEBHOOK_SECRET=your_webhook_secret
   ```

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

### Option 3: DigitalOcean App Platform

1. **Sign up at DigitalOcean**
2. **Create new app from GitHub**
3. **Configure build settings**:
   - Build command: `npm install`
   - Run command: `npm start`
   - Port: 3000
4. **Set environment variables in dashboard**

### Option 4: Netlify (Static + Functions)

1. **Sign up at Netlify**
2. **Create netlify.toml**:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [functions]
     directory = "netlify/functions"
   
   [[redirects]]
     from = "/api/*"
     to = "/.netlify/functions/:splat"
     status = 200
   ```

3. **Convert server routes to Netlify functions**
4. **Deploy from GitHub**

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Create `.env` file from `.env.example`
- [ ] Configure SMTP settings for email
- [ ] Set up Coinbase Commerce API keys
- [ ] Test crypto payment functionality
- [ ] Configure social media API keys (optional)

### 2. Security
- [ ] Remove `.env` from version control
- [ ] Set secure environment variables on hosting platform
- [ ] Enable HTTPS
- [ ] Configure CORS settings
- [ ] Set up rate limiting

### 3. Performance
- [ ] Optimize images in `assets/images/`
- [ ] Minify CSS/JS files
- [ ] Enable gzip compression
- [ ] Configure CDN (optional)

### 4. Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure error tracking
- [ ] Set up analytics
- [ ] Test payment webhooks

## 🔐 Required Environment Variables

```env
# Server
PORT=3000
NODE_ENV=production

# Email
SMTP_HOST=mail.runeflow.xyz
SMTP_PORT=587
SMTP_USER=hello@runeflow.xyz
SMTP_PASS=your_password
FROM_EMAIL=hello@runeflow.xyz
FROM_NAME=RuneFlow Team

# Crypto Payments
COINBASE_API_KEY=your_coinbase_api_key
COINBASE_WEBHOOK_SECRET=your_webhook_secret

# Social Media (Optional)
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
FACEBOOK_ACCESS_TOKEN=your_facebook_token
LINKEDIN_ACCESS_TOKEN=your_linkedin_token
```

## 🧪 Testing Before Deploy

1. **Test locally**:
   ```bash
   npm install
   npm start
   ```

2. **Test email functionality**:
   ```bash
   curl -X POST http://localhost:3000/capture-email \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

3. **Test payment endpoints**:
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/api/crypto/supported-currencies
   ```

## 🔧 Troubleshooting

### Common Issues:

1. **Port Issues**: Most hosting platforms set PORT automatically
2. **SMTP Errors**: Verify email credentials and host settings
3. **Payment Failures**: Check Coinbase API keys and webhook URLs
4. **Static Files**: Ensure `express.static` serves assets correctly

### Health Check Endpoint:
```bash
curl https://runeflow.xyz/health
```

## 🌐 Custom Domain Setup

1. **Purchase domain** (GoDaddy, Namecheap, etc.)
2. **Configure DNS**:
   - A record: `@` → `your-server-ip`
   - CNAME record: `www` → `your-domain.com`
3. **Set up SSL certificate** (Let's Encrypt)
4. **Update environment variables** with new domain

## 📱 Social Media Integration

After deployment, configure webhooks:
1. **Twitter**: Set webhook URL to `https://runeflow.xyz/webhooks/twitter`
2. **Facebook**: Set webhook URL to `https://runeflow.xyz/webhooks/facebook`
3. **LinkedIn**: Set webhook URL to `https://runeflow.xyz/webhooks/linkedin`

## 🚀 Post-Deployment

1. **Monitor logs** for errors
2. **Test all functionality** in production
3. **Set up monitoring** (Pingdom, UptimeRobot)
4. **Configure analytics** (Google Analytics)
5. **Test payment processing** with small amounts
6. **Launch social media campaigns**

---

**Need help?** Contact hello@runeflow.xyz
