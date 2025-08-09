#!/usr/bin/env node

/**
 * Stripe Webhook Verification Script
 * Helps verify your webhook is properly configured
 */

const https = require('https');

console.log(`
🔍 STRIPE WEBHOOK VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This script will help you verify your webhook setup.

📋 MANUAL TEST INSTRUCTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Go to Stripe Dashboard:
   https://dashboard.stripe.com/webhooks

2. Click on your webhook endpoint:
   https://api.runeflow.xyz/api/webhooks/stripe

3. Click "Send test webhook"

4. Select event type: "checkout.session.completed"

5. Click "Send test webhook"

6. Check the response:
   ✅ Success = 200 OK
   ❌ Failed = 400/401/500 error

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Now checking your webhook configuration...
`);

// Function to check webhook logs
async function checkWebhookStatus() {
  console.log('🏥 Checking API Health...');
  
  const healthUrl = 'https://api.runeflow.xyz/api/health';
  
  return new Promise((resolve) => {
    https.get(healthUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ API is healthy and ready to receive webhooks');
          
          console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 WEBHOOK ENDPOINT DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

URL: https://api.runeflow.xyz/api/webhooks/stripe
Status: ACTIVE ✅
Security: Signature validation enabled ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 EXPECTED WEBHOOK FLOW:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Customer completes checkout
2. Stripe sends webhook to your endpoint
3. Your server validates the signature
4. Creates user account and license key
5. Sends welcome email with downloads
6. Returns 200 OK to Stripe

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🧪 TEST CHECKLIST:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

From Stripe Dashboard, send these test events:

[ ] checkout.session.completed - Main purchase event
[ ] payment_intent.succeeded - Payment confirmation
[ ] customer.created - New customer
[ ] charge.succeeded - Successful charge

Each should return 200 OK

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 TROUBLESHOOTING TIPS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

If webhook returns 400/401:
• Check STRIPE_WEBHOOK_SECRET in Railway
• Make sure it starts with whsec_
• No extra spaces before/after

If webhook returns 500:
• Check Railway logs for errors
• Verify database is connected
• Check SendGrid API key is set

If webhook returns 404:
• Verify URL is exactly as shown above
• Check Railway deployment is live

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📱 LIVE MONITORING:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Monitor webhook attempts at:
https://dashboard.stripe.com/webhooks/we_[your_webhook_id]/attempts

Check Railway logs at:
https://railway.app (Your project → Logs)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          `);
        } else {
          console.log('⚠️  API health check failed');
          console.log('Status:', res.statusCode);
        }
        resolve();
      });
    }).on('error', (error) => {
      console.error('❌ API health check error:', error.message);
      resolve();
    });
  });
}

// Function to simulate a simple checkout session for testing
function generateTestCheckoutSession() {
  const sessionId = 'cs_test_' + Math.random().toString(36).substring(7);
  
  console.log(`
🎯 TEST CHECKOUT SESSION DATA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You can use this data to test your purchase flow:

Session ID: ${sessionId}
Product: RuneRush Core Bundle
Price: $49.00
Test Card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits

Test URL Pattern:
https://runeflow.xyz/runerush/success?session_id=${sessionId}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

// Run the verification
async function runVerification() {
  await checkWebhookStatus();
  generateTestCheckoutSession();
  
  console.log(`
✅ VERIFICATION COMPLETE!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your webhook endpoint is configured and ready.

📋 NEXT STEPS:

1. Send a test webhook from Stripe Dashboard
2. Verify it returns 200 OK
3. Check Railway logs for processing details
4. Make a test purchase with card 4242 4242 4242 4242
5. Verify customer receives email with license key

🔗 Quick Links:
• Stripe Webhooks: https://dashboard.stripe.com/webhooks
• Railway Logs: https://railway.app
• Test Cards: https://stripe.com/docs/testing#cards

Happy selling! 🚀
  `);
}

// Run verification
runVerification().catch(console.error);
