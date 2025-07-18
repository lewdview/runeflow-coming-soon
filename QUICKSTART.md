# RuneFlow Coming Soon - Quick Deployment Guide

🚀 **Get your RuneFlow landing page live in 5 minutes!**

## ⚡ Quick Start Commands

```bash
# 1. Navigate to deployment directory
cd /Volumes/extremeUno/webhalla_complete/runeflow_deployment

# 2. Make startup script executable
chmod +x start.sh

# 3. Start the system
./start.sh start
```

## 🎯 What You Get

### ✅ Complete Landing Page System
- **Norse/Mystical Theme** - Professional coming soon page
- **Email Capture** - Automated waitlist with welcome emails
- **Social Media Automation** - Twitter, LinkedIn, Facebook posting
- **Analytics Dashboard** - Real-time signup tracking
- **Payment Integration** - Stripe for early access sales

### 🔧 Technical Stack
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Email**: Nodemailer with SMTP
- **Social Media**: Twitter API, LinkedIn API, Facebook API
- **Deployment**: Netlify, Vercel, GitHub Pages ready

## 🚀 Deployment Options

### Option 1: Local Development (Immediate)
```bash
./start.sh start
# Access at: http://localhost:3000
```

### Option 2: Netlify (Recommended)
```bash
# Set environment variables in .env
NETLIFY_SITE_ID=your_site_id
NETLIFY_ACCESS_TOKEN=your_access_token

# Deploy
./start.sh deploy netlify
```

### Option 3: Vercel
```bash
# Set environment variables in .env
VERCEL_ACCESS_TOKEN=your_access_token

# Deploy
./start.sh deploy vercel
```

## ⚙️ Essential Configuration

### 1. Email Setup (Required)
```bash
# Edit .env file
SMTP_HOST=mail.webhalla.com
SMTP_PORT=587
SMTP_USER=bryan@webhalla.com
SMTP_PASS=your_password
```

### 2. Social Media APIs (Optional but Recommended)
```bash
# Twitter
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_secret

# Facebook
FACEBOOK_APP_ID=your_app_id
FACEBOOK_ACCESS_TOKEN=your_access_token
FACEBOOK_PAGE_ID=your_page_id

# LinkedIn
LINKEDIN_ACCESS_TOKEN=your_access_token
```

## 📊 Social Media Automation

### Automatic Schedule
- **9-11 AM**: Launch announcements
- **12-2 PM**: Product highlights  
- **3-5 PM**: Social proof
- **6-8 PM**: Urgency posts
- **Every 2 hours**: Milestone celebrations

### Manual Campaigns
```bash
# Run specific campaign
./start.sh social launch_announcement
./start.sh social product_highlights
./start.sh social urgency_posts
```

## 📈 Analytics & Monitoring

### View Analytics
```bash
# Browser
http://localhost:3000/analytics

# Export emails
http://localhost:3000/export-emails
```

### Service Status
```bash
./start.sh status
```

### View Logs
```bash
./start.sh logs
```

## 🛠️ Available Commands

```bash
./start.sh start              # Start all services
./start.sh stop               # Stop all services
./start.sh restart            # Restart all services
./start.sh status             # Check service status
./start.sh logs               # Show recent logs
./start.sh deploy netlify     # Deploy to Netlify
./start.sh social campaign    # Run social media campaign
./start.sh dev                # Start development server
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

#### 2. Email Not Sending
```bash
# Test email configuration
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
    host: 'mail.webhalla.com',
    port: 587,
    auth: { user: 'bryan@webhalla.com', pass: 'your_password' }
});
transporter.verify(console.log);
"
```

#### 3. Social Media Posts Failing
```bash
# Check API keys are set
echo $TWITTER_API_KEY
echo $FACEBOOK_ACCESS_TOKEN
```

## 🌟 Features Included

### Landing Page Features
- ✅ Responsive design (mobile-first)
- ✅ Email capture with validation
- ✅ Social proof counters
- ✅ Payment integration (Stripe)
- ✅ Countdown timers
- ✅ Modal popups
- ✅ SEO optimized

### Backend Features
- ✅ Express.js API server
- ✅ Email automation
- ✅ Analytics tracking
- ✅ Data persistence
- ✅ Health monitoring
- ✅ Error handling

### Social Media Features
- ✅ Automated posting schedule
- ✅ Multiple platform support
- ✅ Campaign templates
- ✅ Engagement tracking
- ✅ Error notifications

### Deployment Features
- ✅ Multi-platform deployment
- ✅ Asset optimization
- ✅ Security headers
- ✅ Performance monitoring
- ✅ Automated builds

## 🎉 Success Metrics

After deployment, you'll have:
- 📧 **Email Capture**: Automated waitlist building
- 📱 **Social Media**: Automated posting across platforms
- 📊 **Analytics**: Real-time signup tracking
- 💰 **Revenue**: Payment processing for early access
- 🚀 **Automation**: Fully automated system

## 🔄 Next Steps

1. **Launch** → `./start.sh start`
2. **Configure** → Edit `.env` with your API keys
3. **Deploy** → `./start.sh deploy netlify`
4. **Monitor** → Check analytics and social media
5. **Optimize** → Adjust campaigns based on performance

## 📞 Support

- **Email**: bryan@webhalla.com
- **Documentation**: See `README.md` for detailed docs
- **Logs**: Check `data/` directory for troubleshooting

---

**🔥 RuneFlow is ready to launch! The automation revolution begins now.**
