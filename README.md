# RuneFlow.co - Coming Soon Landing Page

🔥 **The Ultimate n8n Template Marketplace** - Deployment-Ready Landing Page with Automated Social Media Campaigns

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Deployment Options](#deployment-options)
- [Social Media Automation](#social-media-automation)
- [Configuration](#configuration)
- [Development](#development)
- [Analytics](#analytics)
- [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Deploy to Production

```bash
npm run deploy netlify
# or
npm run deploy vercel
```

## ✨ Features

### 🎯 Core Features
- **Responsive Landing Page** - Mobile-first design with Norse/mystical theme
- **Email Capture System** - Automated waitlist with analytics
- **Payment Processing** - Stripe integration for early access purchases
- **Social Media Automation** - Automated posting to Twitter, LinkedIn, Facebook
- **Analytics Dashboard** - Real-time signup tracking and conversion metrics
- **Multi-Platform Deployment** - Netlify, Vercel, GitHub Pages support

### 🔧 Technical Features
- **Express.js Backend** - RESTful API for email capture and analytics
- **Nodemailer Integration** - Automated welcome emails and notifications
- **Social Media APIs** - Twitter, LinkedIn, Facebook posting automation
- **Asset Optimization** - CSS/JS minification, image compression
- **SEO Optimization** - Meta tags, sitemap, robots.txt
- **Security Headers** - CORS, XSS protection, content security policy

## 🌐 Deployment Options

### Option 1: Netlify (Recommended)

```bash
# 1. Set up Netlify environment variables
NETLIFY_SITE_ID=your_site_id
NETLIFY_ACCESS_TOKEN=your_access_token

# 2. Deploy
npm run deploy netlify
```

### Option 2: Vercel

```bash
# 1. Set up Vercel environment variables
VERCEL_PROJECT_ID=your_project_id
VERCEL_ACCESS_TOKEN=your_access_token

# 2. Deploy
npm run deploy vercel
```

### Option 3: GitHub Pages

```bash
# 1. Set up GitHub repository
# 2. Deploy
npm run deploy github-pages
```

### Option 4: Manual Static Hosting

```bash
# 1. Build the project
npm run build

# 2. Upload the 'dist' folder to your hosting provider
```

## 📱 Social Media Automation

### Automatic Posting Schedule

- **9-11 AM**: Launch announcements
- **12-2 PM**: Product highlights
- **3-5 PM**: Social proof and testimonials
- **6-8 PM**: Urgency and scarcity posts
- **Other times**: Milestone celebrations

### Manual Social Media Blast

```bash
# Launch announcement
npm run social-blast launch_announcement

# Product highlights
npm run social-blast product_highlights

# Social proof
npm run social-blast social_proof

# Urgency posts
npm run social-blast urgency_posts

# Milestone posts
npm run social-blast milestone_posts
```

### Schedule Automated Posts

```bash
# Start the scheduler (runs continuously)
npm run schedule-posts
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

#### Required Variables

```env
# Email Configuration
SMTP_HOST=mail.webhalla.com
SMTP_PORT=587
SMTP_USER=bryan@webhalla.com
SMTP_PASS=your_password
FROM_EMAIL=bryan@webhalla.com
FROM_NAME=Bryan Meason - RuneFlow

# Social Media APIs
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_SECRET=your_twitter_access_secret

FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token
FACEBOOK_PAGE_ID=your_facebook_page_id

LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token
```

#### Optional Variables

```env
# Analytics
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
GOOGLE_TAG_MANAGER_ID=GTM_CONTAINER_ID

# Notifications
DISCORD_WEBHOOK_URL=your_discord_webhook_url
SLACK_WEBHOOK_URL=your_slack_webhook_url

# Monitoring
UPTIME_ROBOT_API_KEY=your_uptime_robot_api_key
```

## 🛠️ Development

### Project Structure

```
runeflow_deployment/
├── index.html                     # Main landing page
├── assets/
│   ├── css/coming-soon.css       # Styles
│   ├── js/coming-soon.js         # Frontend JavaScript
│   └── images/                   # Images and assets
├── automation/
│   ├── server.js                 # Express.js backend
│   ├── deploy.js                 # Deployment automation
│   └── optimize.js               # Asset optimization
├── social-media-campaigns/
│   ├── social-blast.js           # Social media automation
│   ├── scheduler.js              # Post scheduling
│   └── milestone-post.js         # Milestone celebrations
├── data/                         # Data storage (created at runtime)
│   ├── emails.json               # Email list
│   ├── analytics.json            # Analytics data
│   └── social-media-log.json     # Social media logs
├── package.json                  # Dependencies and scripts
├── .env.example                  # Environment template
└── README.md                     # This file
```

### Development Commands

```bash
# Start development server with live reload
npm run dev

# Start production server
npm start

# Run social media blast
npm run social-blast

# Schedule automated posts
npm run schedule-posts

# View analytics
npm run analytics

# Build for production
npm run build

# Deploy to platform
npm run deploy [platform]
```

## 📊 Analytics

### View Analytics Dashboard

```bash
# Open browser to analytics endpoint
curl http://localhost:3000/analytics
```

### Export Email List

```bash
# Download CSV of all emails
curl http://localhost:3000/export-emails > emails.csv
```

### Analytics Data Includes

- **Total Signups**: Overall email capture count
- **Daily Signups**: Breakdown by date
- **Conversion Rates**: Visitor to signup conversion
- **Top Referrers**: Traffic sources
- **Recent Activity**: Latest signups with metadata

## 🔧 Troubleshooting

### Common Issues

#### 1. Email Not Sending

**Problem**: Welcome emails not being sent

**Solution**:
```bash
# Check SMTP configuration
echo "SMTP_HOST: $SMTP_HOST"
echo "SMTP_USER: $SMTP_USER"

# Test email configuration
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});
transporter.verify((error, success) => {
    if (error) console.log('Error:', error);
    else console.log('✅ Email config working');
});
"
```

#### 2. Social Media Posts Failing

**Problem**: Posts not appearing on social media

**Solution**:
```bash
# Check API keys
echo "TWITTER_API_KEY: ${TWITTER_API_KEY:0:10}..."
echo "FACEBOOK_ACCESS_TOKEN: ${FACEBOOK_ACCESS_TOKEN:0:10}..."

# Test individual platform
node social-media-campaigns/social-blast.js launch_announcement
```

#### 3. Deployment Fails

**Problem**: Deployment to platform fails

**Solution**:
```bash
# Check build output
npm run build

# Check deployment tokens
echo "NETLIFY_ACCESS_TOKEN: ${NETLIFY_ACCESS_TOKEN:0:10}..."

# Manual deployment
cd dist && zip -r ../deploy.zip . && echo "Manual zip created"
```

### Health Check

```bash
# Check server health
curl http://localhost:3000/health
```

### Log Files

```bash
# View server logs
tail -f logs/server.log

# View social media logs
cat data/social-media-log.json | jq '.[-5:]'
```

## 📈 Performance Optimization

### Asset Optimization

The build process automatically:
- Minifies CSS and JavaScript
- Compresses images
- Generates optimized HTML
- Creates sitemap and robots.txt
- Adds security headers

### CDN Setup

For production, consider setting up a CDN:

```bash
# Cloudflare configuration
CLOUDFLARE_ZONE_ID=your_zone_id
CLOUDFLARE_API_TOKEN=your_api_token
```

## 🚀 Going Live Checklist

### Pre-Launch

- [ ] Configure all environment variables
- [ ] Test email capture functionality
- [ ] Test social media posting
- [ ] Set up analytics tracking
- [ ] Configure domain and SSL
- [ ] Test payment processing

### Launch Day

- [ ] Deploy to production
- [ ] Verify all endpoints working
- [ ] Start social media automation
- [ ] Monitor server health
- [ ] Track signup metrics

### Post-Launch

- [ ] Monitor social media engagement
- [ ] Analyze email signup data
- [ ] Optimize conversion rates
- [ ] Scale server if needed
- [ ] Update content based on feedback

## 📞 Support

For questions or issues:

1. Check the troubleshooting section above
2. Review the logs in the `data/` directory
3. Contact: bryan@webhalla.com
4. GitHub Issues: [Create an issue](https://github.com/webhalla/runeflow-deployment/issues)

## 📄 License

MIT License - see LICENSE file for details

---

**Built by automation masters, for automation masters** 🧙‍♂️

© 2025 RuneFlow.co - Forged by WebHalla
