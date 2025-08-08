#!/usr/bin/env node

/**
 * Stripe Webhook Test Script
 * Tests your webhook endpoint configuration
 */

const https = require('https');
const crypto = require('crypto');

// Your webhook endpoint
const WEBHOOK_URL = 'https://api.runeflow.xyz/api/webhooks/stripe';

// Test event data
const testEvent = {
  id: 'evt_test_' + Date.now(),
  object: 'event',
  api_version: '2023-10-16',
  created: Math.floor(Date.now() / 1000),
  data: {
    object: {
      id: 'cs_test_' + Date.now(),
      object: 'checkout.session',
      amount_total: 4900,
      currency: 'usd',
      customer_details: {
        email: 'test@example.com',
        name: 'Test Customer'
      },
      payment_status: 'paid',
      payment_intent: 'pi_test_' + Date.now(),
      metadata: {
        product_type: 'core',
        test: 'true'
      },
      line_items: {
        data: [{
          description: 'RuneRush Core Bundle',
          amount_total: 4900,
          quantity: 1
        }]
      }
    }
  },
  type: 'checkout.session.completed',
  livemode: false,
  pending_webhooks: 1,
  request: {
    id: null,
    idempotency_key: null
  }
};

// Function to create Stripe signature
function createStripeSignature(payload, secret) {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');
  
  return `t=${timestamp},v1=${signature}`;
}

// Function to test webhook
async function testWebhook() {
  console.log('🧪 Stripe Webhook Test');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log();
  
  console.log('📍 Testing endpoint:', WEBHOOK_URL);
  console.log('📦 Event type:', testEvent.type);
  console.log();
  
  const payload = JSON.stringify(testEvent);
  
  // Note: For a real test, you'd need the actual webhook secret
  // This is just to test if the endpoint is accessible
  const testSignature = createStripeSignature(payload, 'test_secret');
  
  const url = new URL(WEBHOOK_URL);
  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'Stripe-Signature': testSignature
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📨 Response Status:', res.statusCode);
        console.log('📝 Response Headers:', JSON.stringify(res.headers, null, 2));
        
        if (data) {
          try {
            const parsed = JSON.parse(data);
            console.log('📦 Response Body:', JSON.stringify(parsed, null, 2));
          } catch (e) {
            console.log('📦 Response Body:', data);
          }
        }
        
        console.log();
        
        if (res.statusCode === 200) {
          console.log('✅ Webhook endpoint is accessible!');
          console.log();
          console.log('Next steps:');
          console.log('1. Add webhook in Stripe Dashboard');
          console.log('2. Copy the webhook secret (whsec_...)');
          console.log('3. Add to Railway environment variables');
          console.log('4. Send a test event from Stripe Dashboard');
        } else if (res.statusCode === 401) {
          console.log('⚠️  Webhook endpoint requires valid signature');
          console.log('This is expected! The endpoint is working correctly.');
          console.log();
          console.log('To complete setup:');
          console.log('1. Add webhook in Stripe Dashboard');
          console.log('2. Copy the webhook secret');
          console.log('3. Add STRIPE_WEBHOOK_SECRET to Railway');
        } else if (res.statusCode === 404) {
          console.log('❌ Webhook endpoint not found');
          console.log('Check that your backend is deployed correctly');
        } else {
          console.log('⚠️  Unexpected response');
          console.log('Check Railway logs for details');
        }
        
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Connection error:', error.message);
      console.log();
      console.log('Troubleshooting:');
      console.log('1. Check if backend is running: https://api.runeflow.xyz/api/health');
      console.log('2. Check Railway deployment status');
      console.log('3. Verify DNS is configured correctly');
      reject(error);
    });
    
    req.write(payload);
    req.end();
  });
}

// Test the API health first
async function testAPIHealth() {
  console.log('🏥 Testing API Health First...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const healthUrl = 'https://api.runeflow.xyz/api/health';
  
  return new Promise((resolve) => {
    https.get(healthUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ API is healthy!');
          try {
            const health = JSON.parse(data);
            console.log('📊 Health status:', health.data?.status || 'OK');
          } catch (e) {
            console.log('📊 Response:', data);
          }
        } else {
          console.log('⚠️  API returned status:', res.statusCode);
        }
        console.log();
        resolve();
      });
    }).on('error', (error) => {
      console.error('❌ API health check failed:', error.message);
      console.log();
      resolve();
    });
  });
}

// Run tests
async function runTests() {
  console.log();
  console.log('🚀 Starting Stripe Webhook Tests');
  console.log('═══════════════════════════════════════════════════════════');
  console.log();
  
  // Test API health
  await testAPIHealth();
  
  // Test webhook endpoint
  await testWebhook();
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ Test complete!');
  console.log();
  console.log('📚 Documentation: STRIPE_WEBHOOK_SETUP.md');
  console.log('🔗 Stripe Dashboard: https://dashboard.stripe.com/webhooks');
  console.log();
}

// Run the tests
runTests().catch(console.error);
