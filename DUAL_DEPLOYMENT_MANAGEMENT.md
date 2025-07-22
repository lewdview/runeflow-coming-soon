# RuneFlow.xyz - Dual Deployment Management

Since you're deployed on both Railway and Netlify, here's how to manage both effectively:

## 🔍 Current Status Check

### Test Both Deployments:

**Railway Endpoints:**
```bash
# Health Check
curl https://runeflow.xyz/health

# Email Capture Test
curl -X POST https://runeflow.xyz/capture-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","selected_rune":"test"}'

# Admin Analytics (requires auth)
curl -H "Authorization: Bearer runeflow-admin-2025" https://runeflow.xyz/admin/analytics
```

**Netlify Endpoints:**
```bash
# Health Check  
curl https://runeflow.xyz/.netlify/functions/health

# Email Capture Test
curl -X POST https://runeflow.xyz/.netlify/functions/capture-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","selected_rune":"test"}'
```

## 🌐 Domain Routing Strategy

Currently, your domain runeflow.xyz is pointing to one of them. Here are your options:

### Option 1: Primary/Backup Setup
- **Primary**: Railway (full features)
- **Backup**: Netlify (fallback)
- **Domain**: runeflow.xyz → Railway
- **Backup**: Keep Netlify as backup deployment

### Option 2: Feature Split
- **Main Site**: Netlify (fast static content)
- **API/Backend**: Railway subdomain (api.runeflow.xyz)
- **Benefit**: Best of both worlds

### Option 3: A/B Testing
- **50% traffic**: Railway
- **50% traffic**: Netlify  
- **Use**: Cloudflare or DNS load balancing

## 🔧 Managing Environment Variables

**Keep both in sync:**
```bash
# Check current env vars (create this script)
echo "Checking environment variables sync..."
```

## 📊 Monitoring Both Deployments

### Railway Monitoring:
- Dashboard: https://railway.app (your project)
- Logs: Real-time in Railway dashboard
- Metrics: CPU, Memory, Network usage
- Uptime: Always on (24/7)

### Netlify Monitoring:
- Dashboard: https://app.netlify.com (your site)
- Functions: Usage and performance metrics
- Analytics: Built-in site analytics
- Uptime: On-demand functions

## 🚦 Traffic Management

**Check which deployment is currently active:**
```bash
# Test which version is responding
curl -I https://runeflow.xyz
# Look for server headers to identify Railway vs Netlify
```

## 💡 Recommendations

### Immediate Actions:
1. **Verify both are working** with the curl commands above
2. **Check which one runeflow.xyz currently points to**
3. **Sync environment variables** if needed
4. **Monitor both for 24-48 hours** to compare performance

### Long-term Strategy:
- **Primary**: Railway (for full features)
- **Secondary**: Netlify (as backup/testing)
- **Cost**: Monitor Railway costs vs Netlify's free tier
- **Performance**: Compare response times and uptime

## 🔄 Quick Switching

If you need to switch the primary deployment:

**To Railway:**
```bash
# Update DNS A record to point to Railway IP
# Or use Railway's custom domain settings
```

**To Netlify:**
```bash
# Update DNS A record to point to Netlify IP  
# Or use Netlify's custom domain settings
```

## 📈 Performance Comparison

Create this simple monitoring script:

```bash
#!/bin/bash
echo "=== Railway Performance ==="
time curl -s https://runeflow.xyz/health > /dev/null
echo ""

echo "=== Netlify Performance ==="  
time curl -s https://runeflow.xyz/.netlify/functions/health > /dev/null
echo ""
```

Run it periodically to compare response times.

## 🎯 Next Steps

1. **Test both deployments** using the curl commands
2. **Identify which one is currently active** for runeflow.xyz
3. **Compare features** - which deployment has what working
4. **Decide on primary/secondary** strategy
5. **Set up monitoring** for both platforms

Would you like me to help you test both deployments or create monitoring scripts?
