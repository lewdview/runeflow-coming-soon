# 🚂 Railway Switch Checklist

## ✅ Pre-Switch Checklist

### 1. Railway Environment Variables
Go to your Railway dashboard and ensure these are set:

```env
PORT=3000
NODE_ENV=production
HOST=0.0.0.0

# Email Configuration (Ready to use)
SMTP_HOST=mail.runeflow.xyz
SMTP_PORT=587
SMTP_USER=hello@runeflow.xyz
SMTP_PASS=giveME1221!sex
FROM_EMAIL=hello@runeflow.xyz
FROM_NAME=RuneFlow Team
ADMIN_EMAIL=hello@runeflow.xyz
ADMIN_KEY=runeflow-admin-2025
```

### 2. Railway Deployment Check
```bash
# Make sure latest code is pushed
git status
git add .
git commit -m "Prepare Railway deployment"
git push origin main
```

### 3. Domain Configuration
- Ensure Railway has runeflow.xyz configured as custom domain
- DNS should point to Railway (not Netlify)

## 🔄 Switch Process

### Step 1: Verify Railway is Ready
```bash
# Check if Railway deployment is working
# (Replace with actual Railway URL from dashboard)
curl https://your-railway-app.up.railway.app/health
```

### Step 2: Update DNS (if needed)
- Go to your domain registrar (GoDaddy, Namecheap, etc.)
- Point A record to Railway instead of Netlify
- Or configure custom domain in Railway dashboard

### Step 3: Test Switch
```bash
# Wait 5-10 minutes for DNS propagation
# Then test:
./monitor-deployments.sh
```

## ✅ Post-Switch Verification

After switching, you should see:
- ✅ `curl https://runeflow.xyz/health` returns JSON
- ✅ Email capture works: `curl -X POST https://runeflow.xyz/capture-email -H "Content-Type: application/json" -d '{"email":"test@example.com"}'`
- ✅ Admin dashboard: `curl -H "Authorization: Bearer runeflow-admin-2025" https://runeflow.xyz/admin/analytics`

## 🚨 If Something Goes Wrong
- Revert DNS to Netlify
- Check Railway logs in dashboard
- Verify environment variables are correct

## ⏱️ Expected Timeline
- DNS propagation: 5-15 minutes
- Full switch complete: 15-30 minutes
- Verification: 5 minutes

Total: **20-45 minutes** for full Railway switch
