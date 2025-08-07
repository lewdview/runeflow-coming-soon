# Railway Environment Variable Updates Needed

## Missing Variable
Add this to your Railway environment variables:

```
ADMIN_PASSWORD=runeflow-admin-2025
```

**Why:** The server.js expects `ADMIN_PASSWORD` (line 592) but you have `ADMIN_KEY`. 

## Optional Variables for Full Features
These aren't critical for startup but are needed for full functionality:

```
STRIPE_PRICE_ID_MAIN=price_1RpoLwG1VJxSkYsRLCQCPByT
STRIPE_PRICE_ID_UPSELL=price_1RpoOsG1VJxSkYsR2elpDJl7
```

**Note:** Your application already has these hardcoded in services/stripe.js, so they're not critical for startup.

## Test the Fix

1. Add `ADMIN_PASSWORD=runeflow-admin-2025` to Railway
2. Deploy the updated start.js (I'll commit it)
3. Check if the main application starts successfully

## Current Status
✅ Health check working (debug script success)
⚠️ Main application needs the ADMIN_PASSWORD variable
🔄 Ready to switch back to production startup once fixed
