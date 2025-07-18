# 🚀 RuneFlow Deployment Setup - Required Steps

## ⚡ IMMEDIATE DEPLOYMENT (5 minutes)

### 1. **Basic Setup (Required)**

```bash
# Create .env file
cp .env.example .env

# Install dependencies
npm install

# Start locally (test first)
./start.sh start
```

### 2. **Minimum Required Configuration**

Edit `.env` file with these **ESSENTIAL** settings:

```bash
# Email (REQUIRED for waitlist)
SMTP_HOST=mail.webhalla.com
SMTP_PORT=587
SMTP_USER=bryan@webhalla.com
SMTP_PASS=giveME1221!sex
FROM_EMAIL=bryan@webhalla.com
FROM_NAME=Bryan Meason - RuneFlow
```

**That's it! The system will work with just email configuration.**

---

## 📊 ENHANCED DEPLOYMENT (30 minutes)

### 3. **Social Media Automation (Optional but Recommended)**

#### Twitter Setup:
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new app
3. Generate API keys
4. Add to `.env`:

```bash
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret  
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_secret
TWITTER_BEARER_TOKEN=your_bearer_token
```

#### Facebook Setup:
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Get Page Access Token
4. Add to `.env`:

```bash
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
FACEBOOK_ACCESS_TOKEN=your_page_access_token
FACEBOOK_PAGE_ID=your_page_id
```

#### LinkedIn Setup:
1. Go to [LinkedIn Developers](https://developer.linkedin.com/)
2. Create a new app
3. Get access token
4. Add to `.env`:

```bash
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_ACCESS_TOKEN=your_access_token
```

### 4. **Production Deployment**

#### Option A: Netlify (Recommended)
1. Sign up at [Netlify](https://netlify.com)
2. Create new site
3. Get Site ID and Access Token
4. Add to `.env`:

```bash
NETLIFY_SITE_ID=your_site_id
NETLIFY_ACCESS_TOKEN=your_access_token
```

5. Deploy:
```bash
./start.sh deploy netlify
```

#### Option B: Vercel
1. Sign up at [Vercel](https://vercel.com)
2. Get Access Token
3. Add to `.env`:

```bash
VERCEL_ACCESS_TOKEN=your_access_token
```

4. Deploy:
```bash
./start.sh deploy vercel
```

---

## 🔧 OPTIONAL ENHANCEMENTS

### 5. **Analytics (Optional)**
```bash
# Google Analytics
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID

# Google Tag Manager
GOOGLE_TAG_MANAGER_ID=GTM_CONTAINER_ID
```

### 6. **Notifications (Optional)**
```bash
# Discord webhook for notifications
DISCORD_WEBHOOK_URL=your_discord_webhook_url

# Slack webhook
SLACK_WEBHOOK_URL=your_slack_webhook_url
```

### 7. **Payment Processing (Optional)**
```bash
# Stripe for payments
STRIPE_PUBLIC_KEY=your_stripe_public_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

---

## 🎯 QUICK TEST CHECKLIST

Run these commands to verify everything works:

```bash
# 1. Start the system
./start.sh start

# 2. Test email capture (in browser)
# Go to: http://localhost:3000
# Enter email and submit

# 3. Check analytics
# Go to: http://localhost:3000/analytics

# 4. Test social media (if configured)
./start.sh social launch_announcement

# 5. Check system status
./start.sh status
```

---

## 🚨 IMMEDIATE ACTIONS NEEDED

### **RIGHT NOW:**

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update email password in .env:**
   ```bash
   # Edit .env file and update:
   SMTP_PASS=giveME1221!sex
   ```

4. **Start the system:**
   ```bash
   ./start.sh start
   ```

5. **Test locally:**
   - Go to: `http://localhost:3000`
   - Enter an email and submit
   - Check if you receive welcome email

### **NEXT 30 MINUTES:**

1. **Set up Twitter API** (for social media automation)
2. **Set up Netlify account** (for deployment)
3. **Deploy to production:**
   ```bash
   ./start.sh deploy netlify
   ```

### **WITHIN 1 HOUR:**

1. **Set up Facebook/LinkedIn APIs** (for broader social reach)
2. **Configure analytics** (Google Analytics)
3. **Set up monitoring** (Discord/Slack webhooks)

---

## 📋 DEPLOYMENT PRIORITY

### **Priority 1 (Do Now):**
- ✅ Email configuration (SMTP)
- ✅ Local testing
- ✅ Basic functionality

### **Priority 2 (Next 30 min):**
- ✅ Twitter API setup
- ✅ Netlify deployment
- ✅ Domain configuration

### **Priority 3 (Within 1 hour):**
- ✅ Facebook/LinkedIn APIs
- ✅ Analytics setup
- ✅ Monitoring setup

### **Priority 4 (Later):**
- ✅ Payment processing
- ✅ Advanced monitoring
- ✅ Performance optimization

---

## 🔥 WHAT YOU GET IMMEDIATELY

With just the **minimum setup** (email only), you get:

- ✅ **Professional landing page** at localhost:3000
- ✅ **Email capture system** with validation
- ✅ **Automated welcome emails** to new signups
- ✅ **Admin notifications** for new signups
- ✅ **Analytics dashboard** with signup tracking
- ✅ **CSV export** of all captured emails
- ✅ **Health monitoring** of the system

**The system is 100% functional with just email configuration!**

---

## 🚀 DEPLOYMENT COMMANDS

```bash
# Start system
./start.sh start

# Deploy to Netlify
./start.sh deploy netlify

# Run social media campaign
./start.sh social launch_announcement

# Check status
./start.sh status

# View logs
./start.sh logs

# Stop system
./start.sh stop
```

---

## 📞 IMMEDIATE SUPPORT

If you encounter issues:

1. **Check logs:** `./start.sh logs`
2. **Check status:** `./start.sh status`
3. **Restart system:** `./start.sh restart`
4. **Email:** bryan@webhalla.com

**🔥 You're ready to launch! Start with the minimum setup and enhance as needed.**
