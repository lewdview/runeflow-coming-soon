# 🌐 Netlify Functions Debug Plan

## 🔍 Current Issue
Netlify functions are returning HTML instead of JSON responses, indicating they're not properly deployed or configured.

## 🛠️ Debug Steps (For Later)

### Step 1: Check Netlify Build Logs
1. Go to Netlify Dashboard → Your Site → Deploys
2. Click on latest deploy → View function logs
3. Look for build errors or function deployment issues

### Step 2: Verify Function Dependencies
```bash
# Check if functions have required dependencies
ls -la netlify/functions/
cat netlify/functions/capture-email.js
```

### Step 3: Test Functions Locally
```bash
# Install Netlify CLI if not installed
npm install -g netlify-cli

# Test functions locally
netlify dev
# Then test: http://localhost:8888/.netlify/functions/health
```

### Step 4: Check Environment Variables
- Go to Netlify Dashboard → Site Settings → Environment Variables
- Ensure all variables from `netlify-env-vars.md` are set
- Especially: SMTP_HOST, SMTP_USER, SMTP_PASS, etc.

### Step 5: Function Build Configuration
Check if netlify.toml has correct settings:
```toml
[build]
  command = "npm run build-static"
  publish = "dist"
  functions = "netlify/functions"
```

### Step 6: Common Issues & Fixes

**Issue 1: Function Not Found**
- Functions returning HTML = function doesn't exist or wrong path
- Fix: Verify function files are in `netlify/functions/` directory
- Fix: Check function export syntax: `exports.handler = async (event, context) => {}`

**Issue 2: Missing Dependencies**
- Functions need their own package.json or dependencies
- Fix: Create `netlify/functions/package.json` with nodemailer dependency

**Issue 3: Build Process**
- Functions not included in build
- Fix: Ensure `npm run build-static` includes function files
- Fix: Update netlify.toml functions directory path

**Issue 4: Runtime Errors**
- Function crashes and returns default HTML
- Fix: Add error handling and logging
- Fix: Check Netlify function logs for specific errors

### Step 7: Quick Test Commands

```bash
# Test health function specifically
curl -v https://runeflow.xyz/.netlify/functions/health

# Test with different headers
curl -H "Accept: application/json" https://runeflow.xyz/.netlify/functions/health

# Test POST to email capture
curl -X POST https://runeflow.xyz/.netlify/functions/capture-email \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"debug@test.com"}'
```

## 🔧 Likely Fixes Needed

### Fix 1: Add Function Dependencies
Create `netlify/functions/package.json`:
```json
{
  "dependencies": {
    "nodemailer": "^6.9.8"
  }
}
```

### Fix 2: Update Function Response Headers
Ensure all functions return proper CORS headers and Content-Type.

### Fix 3: Environment Variable Access
Functions might not be accessing process.env correctly in Netlify environment.

## 📅 When to Debug This
- **After Railway is working** and stable
- **When you have 30-60 minutes** for debugging
- **As backup/testing platform** setup

## 🎯 Expected Outcome
After fixing:
- `https://runeflow.xyz/.netlify/functions/health` returns JSON
- `https://runeflow.xyz/.netlify/functions/capture-email` accepts POST requests
- Functions work as backup to Railway deployment

## 📞 Priority Level
- **Low priority** - Railway is working
- **Nice to have** - Free backup deployment
- **Future enhancement** - A/B testing platform
