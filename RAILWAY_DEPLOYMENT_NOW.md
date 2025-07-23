# 🚂 Railway Deployment - Ready to Go!

## 🎉 EMAIL IS WORKING! 
Your Gmail SMTP is configured and tested. Now let's deploy to Railway.

## 🚀 Railway Deployment Steps (10 minutes)

### Step 1: Go to Railway Dashboard
1. **Open**: https://railway.app/dashboard  
2. **Find your RuneFlow project** (should be connected to GitHub)
3. **Click on your project**

### Step 2: Add Environment Variables
Go to **Variables** tab and add these **EXACT** settings:

```env
PORT=3000
NODE_ENV=production
HOST=0.0.0.0

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=bmeason@gmail.com
SMTP_PASS=gjqsykowspfsquos
FROM_EMAIL=hello@runeflow.xyz
FROM_NAME=RuneFlow Team
ADMIN_EMAIL=hello@runeflow.xyz
ADMIN_KEY=runeflow-admin-2025
```

### Step 3: Configure Custom Domain
1. In Railway project → **Settings** tab
2. **Domain** section → Add **Custom Domain**
3. Enter: `runeflow.xyz`
4. Follow Railway's DNS instructions

### Step 4: Deploy
Railway should **automatically deploy** when you add the environment variables.

### Step 5: Test Deployment
Once Railway shows "deployed", test these URLs:

```bash
# Health check
curl https://runeflow.xyz/health

# Email capture test
curl -X POST https://runeflow.xyz/capture-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@runeflow.xyz"}'
```

## 📊 Expected Results

**Health Check should return:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-22T23:30:00.000Z",
  "uptime": 123.45,
  "signups": 0
}
```

**Email Capture should return:**
```json
{
  "message": "Email captured successfully",
  "success": true,
  "download_url": "/assets/downloads/starter-rune-template.json"
}
```

## ⚡ Quick Status Check
Run this after deployment:
```bash
./monitor-deployments.sh
```

Should show:
- ✅ Active Deployment: RAILWAY
- ✅ Railway health endpoint: WORKING
- ✅ Railway email endpoint: WORKING

## 🎯 Success Criteria
- [ ] Railway environment variables added
- [ ] Custom domain configured
- [ ] Deployment successful
- [ ] Health check returns JSON
- [ ] Email capture works
- [ ] Monitor script shows Railway as active

## 🚨 If Something Goes Wrong
- Check Railway deployment logs
- Verify all environment variables are correct
- Make sure custom domain DNS is pointed to Railway
- Test endpoints directly with Railway's temporary URL first

## 🎉 When It Works
Your visitors will be able to:
- ✅ Visit runeflow.xyz and see your site
- ✅ Sign up with their email address  
- ✅ Receive welcome emails from RuneFlow Team
- ✅ You'll get admin notifications of new signups

**Ready to deploy? Go to Railway dashboard and add those environment variables!**
