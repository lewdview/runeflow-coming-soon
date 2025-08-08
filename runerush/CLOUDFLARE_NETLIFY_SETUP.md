# 🔧 Cloudflare + Netlify Setup Guide for RuneRush

## 🎯 Overview
Setting up Cloudflare with Netlify requires specific configurations to avoid SSL conflicts and ensure proper routing.

---

## 📋 Prerequisites
- [ ] Domain registered (runerush.xyz / runeflow.xyz)
- [ ] Cloudflare account with domain added
- [ ] Netlify account with site deployed
- [ ] Access to DNS settings in Cloudflare

---

## 🚀 Step-by-Step Configuration

### Step 1: Netlify Configuration

1. **Log into Netlify** (https://app.netlify.com)
2. Go to your site → **Domain settings**
3. Click **Add custom domain**
4. Add your domains:
   - `runerush.xyz`
   - `www.runerush.xyz` (if needed)
   - `runeflow.xyz` (if using)
   - `www.runeflow.xyz` (if using)

5. **Get Netlify's Load Balancer IP**:
   - Netlify will show you a record like: `75.2.60.5`
   - Or a CNAME like: `[your-site-name].netlify.app`
   - **Save this information!**

### Step 2: Cloudflare DNS Configuration

1. **Log into Cloudflare** (https://dash.cloudflare.com)
2. Select your domain
3. Go to **DNS** section
4. **Delete any existing A/CNAME records** for @ and www

5. **Add these DNS records**:

#### For APEX domain (runerush.xyz):
```
Type: A
Name: @
Content: 75.2.60.5
Proxy status: DNS only (gray cloud) ⚠️ IMPORTANT
TTL: Auto
```

#### For www subdomain:
```
Type: CNAME
Name: www
Content: [your-site-name].netlify.app
Proxy status: DNS only (gray cloud) ⚠️ IMPORTANT
TTL: Auto
```

#### Alternative setup using CNAME for both:
```
Type: CNAME
Name: @
Content: [your-site-name].netlify.app
Proxy status: DNS only (gray cloud)
TTL: Auto

Type: CNAME
Name: www
Content: [your-site-name].netlify.app
Proxy status: DNS only (gray cloud)
TTL: Auto
```

### Step 3: Cloudflare SSL/TLS Settings

1. Go to **SSL/TLS** → **Overview**
2. Set encryption mode to: **Full** (NOT Full Strict)
3. Go to **SSL/TLS** → **Edge Certificates**
4. Ensure these settings:
   - **Always Use HTTPS**: ON
   - **Automatic HTTPS Rewrites**: ON
   - **Minimum TLS Version**: 1.2

### Step 4: Cloudflare Page Rules (Optional but Recommended)

1. Go to **Rules** → **Page Rules**
2. Create a rule:
   ```
   URL: http://*runerush.xyz/*
   Setting: Always Use HTTPS
   ```

3. Create another rule:
   ```
   URL: http://*runeflow.xyz/*
   Setting: Always Use HTTPS
   ```

### Step 5: Critical Cloudflare Settings

⚠️ **IMPORTANT**: These settings prevent conflicts with Netlify

1. **Speed** → **Optimization**:
   - **Auto Minify**: OFF for JavaScript (Netlify handles this)
   - **Rocket Loader**: OFF (can break React/modern JS)
   - **Mirage**: OFF
   - **Polish**: Can leave ON

2. **Caching** → **Configuration**:
   - **Browser Cache TTL**: Respect Existing Headers
   - **Crawler Hints**: OFF

3. **Network**:
   - **HTTP/3 (with QUIC)**: ON
   - **WebSockets**: ON
   - **IP Geolocation**: ON (optional)

---

## 🔍 Verification Steps

### 1. Check DNS Propagation
```bash
# Check A record
dig runerush.xyz

# Check CNAME
dig www.runerush.xyz

# Check from different server
dig @8.8.8.8 runerush.xyz
```

### 2. Test SSL Certificate
```bash
# Check SSL
curl -I https://runerush.xyz

# Verbose SSL check
openssl s_client -connect runerush.xyz:443 -servername runerush.xyz
```

### 3. Verify Netlify SSL
- In Netlify → Domain settings → HTTPS
- Should show: "Your site has HTTPS enabled"
- Certificate should be from Let's Encrypt

---

## 🔧 Troubleshooting

### Problem: "SSL Handshake Failed" or Infinite Redirect Loop
**Solution**: 
- Set Cloudflare SSL to "Full" (not Full Strict)
- Ensure proxy is OFF (gray cloud) for Netlify domains

### Problem: "Site Can't Be Reached"
**Solution**:
- Check DNS records are pointing to correct Netlify IP/CNAME
- Ensure proxy status is "DNS only" (gray cloud)
- Wait 5-10 minutes for propagation

### Problem: "Mixed Content" Warnings
**Solution**:
- Enable "Automatic HTTPS Rewrites" in Cloudflare
- Update your HTML to use https:// or protocol-relative URLs (//)

### Problem: Site Loads but API Calls Fail
**Solution**:
- Add CORS headers in your backend
- Ensure API subdomain is properly configured

---

## 🎯 Recommended Setup for RuneRush

### Frontend (Netlify via Cloudflare):
```
runerush.xyz → A record → 75.2.60.5 (DNS only)
www.runerush.xyz → CNAME → runerush.netlify.app (DNS only)
```

### Backend API (Railway - Direct):
```
api.runerush.xyz → CNAME → runerush.up.railway.app (DNS only)
```

### Alternative domains:
```
runeflow.xyz → A record → 75.2.60.5 (DNS only)
www.runeflow.xyz → CNAME → runerush.netlify.app (DNS only)
```

---

## 📝 Environment Variables Update

After setup, update your frontend environment variables in Netlify:

```env
# In Netlify Environment Variables
REACT_APP_API_URL=https://api.runerush.xyz
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_51RlZW9G1VJxSkYsRZV30j6T7cEhUGe6Em9R8eyxHv0pP06tzrfx8so4r1S6qs3b32Y9VXvUZfwmpcYL6Die5Kiic00VM5BIGGM
```

---

## 🚨 Important Notes

1. **Never use Cloudflare Proxy (Orange Cloud) with Netlify** - it causes SSL conflicts
2. **Always use "DNS Only" (Gray Cloud)** for Netlify domains
3. **Cloudflare's SSL must be set to "Full"** not "Full (Strict)"
4. **Wait 5-10 minutes** after DNS changes for propagation
5. **Clear browser cache** after making changes

---

## ✅ Final Checklist

- [ ] Netlify site deployed and accessible via .netlify.app URL
- [ ] Custom domain added in Netlify
- [ ] DNS records added in Cloudflare (DNS only mode)
- [ ] SSL set to "Full" in Cloudflare
- [ ] HTTPS working on custom domain
- [ ] No redirect loops
- [ ] API calls working from frontend to backend

---

## 🔗 Quick Links

- **Netlify Dashboard**: https://app.netlify.com
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **DNS Checker**: https://dnschecker.org
- **SSL Test**: https://www.ssllabs.com/ssltest/

---

## 📞 Support

If issues persist after following this guide:

1. **Netlify Support**: https://www.netlify.com/support/
2. **Cloudflare Support**: https://support.cloudflare.com/
3. **Check Status Pages**:
   - Netlify: https://www.netlifystatus.com/
   - Cloudflare: https://www.cloudflarestatus.com/

---

**Last Updated**: August 2025
**Version**: 1.0.0
