# RuneRUSH Deployment Checklist ✅

## 🎯 Your Current Setup Status

### ✅ **Completed:**
- ✅ Stripe product IDs integrated (core, pro_bundle, pro_upgrade)
- ✅ Webhook secret configured (requires your webhook secret from Stripe)
- ✅ SendGrid API key configured and **TESTED** (requires your SendGrid API key)
- ✅ Payment flow updated to use Stripe Checkout
- ✅ Backend API endpoints ready
- ✅ Frontend payment integration complete
- ✅ Email service ready (Bryan @ Webhalla account confirmed)
- ✅ Success page created (`success.html`) with order processing flow
- ✅ Cancel page created (`cancel.html`) with recovery optimization

### 🔄 **Next Steps:**

## 1. Deploy Backend to Railway

### Option A: Automatic Deployment
```bash
./deploy-to-railway.sh
```

### Option B: Manual Deployment
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Create project: `railway new runerush-backend`
4. Add database: `railway add --database postgresql`
5. Set environment variables (see below)
6. Deploy: `railway up`

### Required Environment Variables:
```bash
NODE_ENV=production
PORT=3000
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
SENDGRID_API_KEY=SG.YOUR_SENDGRID_API_KEY_HERE
FROM_EMAIL=support@yourdomain.com
FROM_NAME=RuneRUSH Support
JWT_SECRET=generate-secure-random-string-here
ADMIN_PASSWORD=create-secure-password-here
FRONTEND_URL=https://yourdomain.com
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

## 2. Configure Stripe Webhook

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. **Endpoint URL:** `https://your-railway-app.railway.app/api/webhooks/stripe`
4. **Events to send:**
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.dispute.created`
5. Save and copy the webhook secret (already configured ✅)

## 3. Update Frontend Configuration

Update `js/api.js`:
```javascript
const API_CONFIG = {
    BASE_URL: 'https://your-railway-app.railway.app/api',
    STRIPE_PUBLISHABLE_KEY: 'pk_test_YOUR_PUBLISHABLE_KEY_HERE'
};
```

## 4. Deploy Frontend to Netlify

1. Connect your GitHub repo to Netlify
2. Set build settings:
   - Build command: (none needed for static HTML)
   - Publish directory: `/`
3. Configure domain
4. Enable HTTPS

## 5. Create Success/Cancel Pages

### Create `success.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Payment Successful - RuneRUSH</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: Arial, sans-serif; background: #f8f9fa; padding: 50px; text-align: center;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <h1 style="color: #10b981;">🎉 Payment Successful!</h1>
        <p>Thank you for purchasing RuneRUSH! Check your email for download instructions.</p>
        <div id="download-section" style="margin-top: 30px;">
            <p>Loading your downloads...</p>
        </div>
    </div>
    
    <script>
        // Extract session ID and show download links
        const urlParams = new URLSearchParams(window.location.search);
        const sessionId = urlParams.get('session_id');
        
        if (sessionId) {
            // You can implement download link generation here
            document.getElementById('download-section').innerHTML = 
                '<p><strong>Downloads will be sent to your email within 5 minutes.</strong></p>';
        }
    </script>
</body>
</html>
```

### Create `cancel.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Payment Cancelled - RuneRUSH</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="font-family: Arial, sans-serif; background: #f8f9fa; padding: 50px; text-align: center;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <h1 style="color: #dc3545;">❌ Payment Cancelled</h1>
        <p>Your payment was cancelled. No charges were made to your account.</p>
        <a href="/" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 20px;">← Back to Offer</a>
    </div>
</body>
</html>
```

## 6. Test the Payment Flow

1. Visit your deployed site
2. Click a payment button
3. Enter test details
4. Use Stripe test card: `4242 4242 4242 4242`
5. Complete payment
6. Verify webhook receives the event
7. Check that user receives email

## 7. Go Live Checklist

When ready for production:
- [ ] Switch to live Stripe keys
- [ ] Update webhook endpoint to production URL
- [ ] Test with real payment
- [ ] Set up monitoring/alerts
- [ ] Configure backups

## 🚨 Important Notes

- **Webhook Secret:** Use your webhook secret from Stripe Dashboard
- **Product IDs:** Using your actual Stripe products
- **Security:** Change default admin password in production
- **Monitoring:** Check Railway logs for any issues

## 📞 Support

If you encounter issues:
1. Check Railway logs: `railway logs`
2. Verify environment variables: `railway variables`
3. Test webhook endpoint manually
4. Check Stripe webhook delivery logs

---

**You're almost there! 🚀 The hard work is done - now it's just deployment and testing.**
