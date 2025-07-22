# 🎯 RuneFlow.xyz Complete Action Plan

## 🚂 Phase 1: Switch to Railway (NOW - 15 minutes)

### ✅ Completed:
- [x] Code pushed to Railway
- [x] Documentation created
- [x] Monitoring scripts ready

### 🔄 Next Steps (Do Now):

#### Step 1: Railway Dashboard Setup (5 minutes)
1. Go to **Railway Dashboard**: https://railway.app
2. Find your RuneFlow project
3. Go to **Variables** tab
4. Add these environment variables:

```env
PORT=3000
NODE_ENV=production
HOST=0.0.0.0
SMTP_HOST=mail.runeflow.xyz
SMTP_PORT=587
SMTP_USER=hello@runeflow.xyz
SMTP_PASS=giveME1221!sex
FROM_EMAIL=hello@runeflow.xyz
FROM_NAME=RuneFlow Team
ADMIN_EMAIL=hello@runeflow.xyz
ADMIN_KEY=runeflow-admin-2025
```

#### Step 2: Domain Configuration (5 minutes)
1. In Railway Dashboard → Your Project → Settings
2. Add custom domain: `runeflow.xyz`
3. Follow Railway's DNS instructions
4. **OR** update your domain registrar DNS to point to Railway

#### Step 3: Test Railway Deployment (5 minutes)
```bash
# Wait for deployment to finish, then test:
./monitor-deployments.sh

# Should show Railway as active deployment
# All functions should work
```

### 🎯 Success Criteria:
- ✅ `https://runeflow.xyz/health` returns JSON
- ✅ Email capture works
- ✅ Admin dashboard accessible
- ✅ Monitor script shows "Railway" as active

---

## 🌐 Phase 2: Fix Netlify as Backup (LATER - 1 hour)

### When to do this:
- **After Railway is stable** (24-48 hours)
- **When you have free time** for debugging
- **As a weekend project**

### Steps (from NETLIFY_DEBUG_PLAN.md):
1. Check Netlify build logs
2. Fix function dependencies  
3. Test functions locally
4. Deploy and verify

---

## 📊 Phase 3: Monitoring & Optimization (ONGOING)

### Daily Monitoring:
```bash
# Run this daily to check status
./monitor-deployments.sh
```

### Weekly Review:
- Check Railway costs
- Monitor email capture rates
- Review admin analytics: `https://runeflow.xyz/admin/analytics`

### Monthly Tasks:
- Compare Railway vs Netlify performance
- Optimize costs if needed
- Update environment variables if changed

---

## 🚨 Emergency Procedures

### If Railway Goes Down:
1. Check Railway status page
2. If prolonged, switch DNS back to Netlify
3. Fix Netlify functions quickly using debug plan
4. Monitor until Railway is back

### If Domain Issues:
1. Check DNS propagation: https://whatsmydns.net
2. Verify Railway custom domain setup
3. Check domain registrar settings

---

## 📱 Quick Commands Reference

```bash
# Check current deployment status
./monitor-deployments.sh

# Test Railway endpoints
curl https://runeflow.xyz/health
curl -X POST https://runeflow.xyz/capture-email -H "Content-Type: application/json" -d '{"email":"test@test.com"}'

# Check admin analytics  
curl -H "Authorization: Bearer runeflow-admin-2025" https://runeflow.xyz/admin/analytics

# Push updates to both deployments
git add . && git commit -m "Update" && git push origin main
```

---

## 🎉 Expected Timeline

| Task | Time | Status |
|------|------|--------|
| **Railway Setup** | 15 min | ⏳ DO NOW |
| **DNS Propagation** | 15-30 min | ⏳ Automatic |
| **Testing & Verification** | 10 min | ⏳ DO AFTER |
| **Netlify Debug** | 1 hour | 📅 Later |
| **Total to Working State** | **30-45 min** | 🎯 Today |

---

## 🚀 Ready to Start?

**Your next action:** Go to Railway Dashboard and add those environment variables!

Once Railway is configured with the custom domain, runeflow.xyz will automatically switch over and you'll have:
- ✅ Working email capture
- ✅ Admin analytics dashboard  
- ✅ All automation features
- ✅ Professional deployment

The Netlify backup can wait - let's get Railway working first! 🚂
