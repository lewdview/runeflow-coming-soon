# 🚀 RuneFlow.xyz Deployment Structure

## 📁 Project Architecture

```
runeflow.xyz (Main Domain)
│
├── / (Root - Main RuneFlow landing page)
│   └── index.html (Parent directory)
│
└── /runerush/ (Sales Funnel - RuneRush)
    ├── index.html (Sales landing page)
    ├── purchase.html (Checkout page)
    ├── success.html (Success page)
    ├── downloads.html (Download portal)
    └── [other pages]
```

## 🌐 URL Structure

### Frontend (Netlify):
- **Main Site**: https://runeflow.xyz
- **RuneRush Funnel**: https://runeflow.xyz/runerush/
- **Direct Netlify**: https://runeflowxyz.netlify.app

### Backend API (Railway):
- **API Endpoint**: https://api.runeflow.xyz (needs setup)
- **Railway URL**: https://[your-app].up.railway.app

---

## ✅ Current Status

### Working ✅:
- www.runeflow.xyz → Netlify (WORKING!)
- runeflow.xyz → Netlify (A records configured)
- SSL/HTTPS enabled via Let's Encrypt

### Needs Configuration 🔧:
- API subdomain for backend
- Ensure all paths work correctly

---

## 🔧 Cloudflare DNS Configuration

### Current Setup (Verified):
```
# Apex domain
Type: A
Name: @
Content: 75.2.60.5
Proxy: DNS only (gray cloud) ⚠️

Type: A
Name: @
Content: 99.83.190.102
Proxy: DNS only (gray cloud) ⚠️

# WWW subdomain
Type: CNAME
Name: www
Content: runeflowxyz.netlify.app
Proxy: DNS only (gray cloud) ⚠️
```

### Add for Backend API:
```
Type: CNAME
Name: api
Content: [your-railway-app].up.railway.app
Proxy: DNS only (gray cloud) ⚠️
```

---

## 📂 Netlify Deployment Configuration

### 1. Build Settings in Netlify:
```
Base directory: /
Publish directory: /
Build command: (leave empty for static site)
```

### 2. Redirects (_redirects file in root):
```
# Redirect /runerush to /runerush/ (trailing slash)
/runerush  /runerush/  301

# API proxy (optional - if not using subdomain)
/api/*  https://your-backend.up.railway.app/api/:splat  200
```

### 3. Directory Structure for Deployment:
```
/ (repository root)
├── index.html (main landing page)
├── runerush/
│   ├── index.html (sales funnel)
│   ├── assets/
│   ├── images/
│   └── [other files]
├── _redirects
└── netlify.toml
```

---

## 🚀 Deployment Steps

### Step 1: Prepare Files
```bash
# Your current structure
/runeflow_deployment/
├── index.html (parent - main site)
└── runerush/
    └── index.html (sales funnel)
```

### Step 2: Create netlify.toml in root
```toml
[build]
  publish = "."

[[redirects]]
  from = "/runerush"
  to = "/runerush/"
  status = 301

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

### Step 3: Update Frontend API Calls
In your RuneRush HTML/JS files, update API URLs:
```javascript
// Old
const API_URL = 'https://runerush.xyz/api';

// New
const API_URL = 'https://api.runeflow.xyz';
// OR if using proxy
const API_URL = '/api';
```

---

## 🔍 Testing Your Deployment

### Test URLs:
```bash
# Main site
curl -I https://runeflow.xyz

# RuneRush funnel
curl -I https://runeflow.xyz/runerush/

# Check redirects
curl -I https://runeflow.xyz/runerush
```

### Expected Results:
- https://runeflow.xyz → Shows main landing page
- https://runeflow.xyz/runerush/ → Shows sales funnel
- https://runeflow.xyz/runerush → Redirects to /runerush/

---

## 📝 Environment Variables

### Netlify Environment Variables:
```env
# API Configuration
API_URL=https://api.runeflow.xyz

# Stripe Public Key
STRIPE_PUBLISHABLE_KEY=pk_live_51RlZW9G1VJxSkYsRZV30j6T7cEhUGe6Em9R8eyxHv0pP06tzrfx8so4r1S6qs3b32Y9VXvUZfwmpcYL6Die5Kiic00VM5BIGGM
```

### Update in HTML/JS:
```html
<!-- In runerush/index.html -->
<script>
  const API_BASE = 'https://api.runeflow.xyz';
  const STRIPE_KEY = 'pk_live_...';
</script>
```

---

## 🐛 Common Issues & Solutions

### Issue: /runerush not loading
**Solution**: Ensure the runerush folder is in the repository root and deployed to Netlify

### Issue: API calls failing
**Solution**: 
1. Set up api.runeflow.xyz subdomain
2. Or use Netlify proxy redirects
3. Check CORS settings on backend

### Issue: Assets not loading
**Solution**: Use relative paths or absolute paths from root:
```html
<!-- Good -->
<link href="/runerush/assets/style.css">
<!-- Or relative -->
<link href="assets/style.css">
```

---

## ✅ Verification Checklist

- [ ] runeflow.xyz loads main page
- [ ] www.runeflow.xyz redirects to runeflow.xyz
- [ ] runeflow.xyz/runerush/ loads sales funnel
- [ ] All assets load correctly
- [ ] API calls work (when backend is deployed)
- [ ] SSL/HTTPS working
- [ ] No mixed content warnings

---

## 🎯 Next Steps

1. **Verify Netlify deployment includes both directories**
2. **Set up API subdomain for Railway backend**
3. **Test all paths and redirects**
4. **Update any hardcoded URLs in your code**

---

**Status**: Frontend Ready ✅ | Backend Needs Deployment 🔧
