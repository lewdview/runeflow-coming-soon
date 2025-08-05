# 🚀 RuneRush - Complete Launch Funnel System

[![Status](https://img.shields.io/badge/status-deployment_ready-brightgreen.svg)]
[![Node.js](https://img.shields.io/badge/node.js-%3E%3D16.0.0-brightgreen.svg)]
[![License](https://img.shields.io/badge/license-Proprietary-blue.svg)]

## 📋 Overview

RuneRush is a comprehensive self-serve backend system designed for the RuneRush product launch funnel. This system seamlessly integrates payment processing, user management, email automation, and license key distribution to create a complete e-commerce solution for digital template sales.

### 🎯 Key Features
- **Automated Payment Processing**: Stripe integration with webhook handling
- **User Account Management**: Automatic account creation and license key generation
- **Email Automation**: Welcome emails, download links, and follow-up sequences
- **Product Tiers**: Core ($49), Pro ($39 upgrade), and Complete bundles
- **Responsive Design**: Mobile-optimized frontend with cinematic animations
- **Admin Dashboard**: Analytics, user management, and sales tracking

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js (≥16.0.0)
- **Framework**: Express.js
- **Database**: PostgreSQL (Railway hosting)
- **Authentication**: JWT tokens
- **Security**: Helmet, rate limiting, input validation

### Frontend
- **Languages**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with dark theme and gradient effects
- **Animations**: Custom JavaScript animations and transitions
- **Responsive**: Mobile-first design approach

### Services & APIs
- **Payment Processing**: Stripe Checkout & Webhooks
- **Email Service**: SendGrid API
- **File Storage**: AWS S3 (license key distribution)
- **Hosting**: Railway (backend), Netlify (frontend)

## 🎨 Standardized Footer

All HTML pages feature a consistent, professional footer with:
- **Left**: Clickable RuneFlow logo with cyan glow effect
- **Center**: Navigation links (Contact | Privacy | RuneFlow) + Product tiers (Core | Pro | Complete)
- **Right**: "made with warp" attribution with referral link
- **Responsive**: Mobile-optimized layout with stacking behavior

📖 **Complete footer documentation**: [FOOTER_README.md](FOOTER_README.md)

## 🚀 Quick Start

### Prerequisites
```bash
# Node.js 16+ required
node --version

# Install dependencies
npm install
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Configure your keys in .env:
# - STRIPE_SECRET_KEY
# - SENDGRID_API_KEY
# - DATABASE_URL
```

### Development Server
```bash
# Start development server
npm run dev

# Test connections
npm run test-connection
npm run test-stripe
```

## 📁 Project Structure

```
runerush/
├── 📄 HTML Pages
│   ├── index.html          # Main landing page
│   ├── core.html           # Core bundle details
│   ├── pro.html            # Pro bundle details
│   ├── complete.html       # Complete bundle details
│   ├── purchase.html       # Purchase flow
│   ├── success.html        # Success page
│   ├── cancel.html         # Cancel page
│   ├── downloads.html      # Download portal
│   └── privacy.html        # Privacy policy
│
├── 🔧 Backend Files
│   ├── server.js           # Main Express server
│   ├── package.json        # Dependencies & scripts
│   └── *.js               # API endpoints & utilities
│
├── 🎨 Assets
│   ├── images/             # Logos, icons, graphics
│   ├── templates/          # Template files & specs
│   └── assets/             # Additional resources
│
└── 📚 Documentation
    ├── README.md           # This file
    ├── FOOTER_README.md    # Footer implementation guide
    ├── DEPLOYMENT_READY.md # Deployment instructions
    └── AWS_SETUP.md        # AWS configuration
```

## 🚀 Deployment

### 1. Backend Deployment (5 minutes)
```bash
# Automated deployment to Railway
./deploy-to-railway.sh
```

### 2. Stripe Webhook Configuration (2 minutes)
1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-app.railway.app/api/webhooks/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`

### 3. Frontend Deployment (3 minutes)
1. Push to GitHub repository
2. Connect to Netlify
3. Update API base URL
4. Deploy!

📖 **Detailed instructions**: [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md)

## 💰 Revenue Flow

```
Customer visits landing page
         ↓
Clicks "Get Access" button
         ↓
Stripe Checkout opens ($49)
         ↓
Payment processes successfully
         ↓
Webhook triggers account creation
         ↓
Welcome email sent with downloads
         ↓
💰 Revenue in your account!
```

## 🧪 Testing & Development

```bash
# Test email service
node test-sendgrid.js

# Test Stripe integration
node test-stripe.js

# Test complete purchase flow
node test_complete_flow.js

# View server logs
npm start
```

## 📊 Analytics & Monitoring

- **Sales Tracking**: Real-time purchase analytics
- **User Management**: Customer accounts and license keys
- **Email Metrics**: SendGrid delivery and engagement stats
- **Error Monitoring**: Comprehensive logging and alerts

## 📚 Documentation

| File | Purpose |
|------|--------|
| [FOOTER_README.md](FOOTER_README.md) | Complete footer implementation guide |
| [DEPLOYMENT_READY.md](DEPLOYMENT_READY.md) | Final deployment preparations |
| [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) | Step-by-step deployment process |
| [AWS_SETUP.md](AWS_SETUP.md) | AWS services configuration |
| [PEER_REVIEW_REPORT.md](PEER_REVIEW_REPORT.md) | Code quality and security review |

## 🛡 Security Features

- **Rate Limiting**: Protection against abuse
- **Input Validation**: Sanitized user inputs
- **CORS Configuration**: Secure cross-origin requests
- **Helmet Integration**: Security headers
- **Environment Variables**: Secure credential management

## 🎯 Product Offerings

| Bundle | Price | Features |
|--------|-------|----------|
| **Core** | $49 | Essential templates and tools |
| **Pro** | $39 upgrade | Advanced features and templates |
| **Complete** | Bundle | Full access to all resources |

## 🤝 Support & Maintenance

For technical support, feature requests, or deployment assistance:

1. **Check Documentation**: Review the comprehensive docs above
2. **Run Test Scripts**: Use built-in testing utilities
3. **Review Logs**: Check Railway/Netlify deployment logs
4. **Contact Team**: Reach out to the development team

---

**🎉 Your RuneRush system is deployment-ready and optimized for maximum conversions!**

*Built with ❤️ using modern web technologies and best practices*
