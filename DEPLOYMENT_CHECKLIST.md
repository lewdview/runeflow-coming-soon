# RuneFlow Deployment Checklist

## ✅ Pre-Deployment (Required)

### 1. Environment Setup
- [ ] Create `.env` file from `.env.example`
- [ ] Add your email SMTP credentials
- [ ] Add Coinbase Commerce API keys
- [ ] Test email functionality locally
- [ ] Test crypto payment functionality locally

### 2. Code Preparation
- [ ] All files committed to Git
- [ ] Remove sensitive data from code
- [ ] Test `npm start` locally
- [ ] Verify all endpoints work: `/health`, `/api/waitlist`, `/api/crypto/health`

### 3. Choose Hosting Platform
- [ ] **Railway** (Easiest for Node.js) - $5/month
- [ ] **Heroku** (Popular choice) - $7/month
- [ ] **DigitalOcean** (Good performance) - $12/month
- [ ] **Netlify** (Good for static + functions) - Free tier

## 🚀 Deployment Steps

### Quick Deploy (Railway - Recommended)
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "Deploy from GitHub repo"
4. Select your RuneFlow repository
5. Set environment variables:
   ```
   NODE_ENV=production
   SMTP_HOST=mail.webhalla.com
   SMTP_USER=bryan@webhalla.com  
   SMTP_PASS=your_password
   COINBASE_API_KEY=your_key
   COINBASE_WEBHOOK_SECRET=your_secret
   ```
6. Click Deploy
7. Get your app URL

### Alternative: Heroku
1. Install Heroku CLI
2. Run: `heroku create your-app-name`
3. Set environment variables with `heroku config:set`
4. Deploy with `git push heroku main`

## 🧪 Post-Deployment Testing

### Test These URLs:
- [ ] `https://your-app.com` (Homepage loads)
- [ ] `https://your-app.com/health` (Returns "OK")
- [ ] `https://your-app.com/api/crypto/health` (Returns crypto status)
- [ ] `https://your-app.com/api/crypto/supported-currencies` (Returns currencies)

### Test Email Signup:
```bash
curl -X POST https://your-app.com/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Test Payment Creation:
```bash
curl -X POST https://your-app.com/api/crypto/create-charge \
  -H "Content-Type: application/json" \
  -d '{"package":"basic","email":"test@example.com"}'
```

## 📱 Optional: Custom Domain

### If you want your own domain:
1. Buy domain from Namecheap/GoDaddy
2. In hosting platform, add custom domain
3. Update DNS records:
   - A record: `@` → `your-server-ip`
   - CNAME: `www` → `your-domain.com`
4. Enable SSL certificate

## 🔐 Security Checklist

- [ ] Environment variables set securely (not in code)
- [ ] HTTPS enabled
- [ ] Rate limiting enabled
- [ ] CORS configured properly
- [ ] No sensitive data in client-side code

## 📊 Monitoring Setup

### Essential Monitoring:
- [ ] Set up uptime monitoring (Pingdom, UptimeRobot)
- [ ] Configure error tracking
- [ ] Set up payment webhook monitoring
- [ ] Enable server logs

## 🚨 Troubleshooting

### Common Issues:
1. **App won't start**: Check logs for PORT or environment variable errors
2. **Email not sending**: Verify SMTP credentials
3. **Payments failing**: Check Coinbase API keys and webhook URLs
4. **Static files not loading**: Ensure `express.static` is configured

### Getting Help:
- Check application logs in hosting platform
- Test endpoints individually
- Contact bryan@webhalla.com for support

---

## 📋 Quick Summary

**Minimum requirements to deploy:**
1. `.env` file with email and crypto payment credentials
2. Choose Railway, Heroku, or DigitalOcean
3. Upload your code and set environment variables
4. Test the deployed app

**Time to deploy:** 15-30 minutes

**Monthly cost:** $5-12 (depending on hosting choice)

**Need help?** Run `./deploy-prep.sh` to check if you're ready to deploy!
