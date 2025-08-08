#!/usr/bin/env node

/**
 * API Endpoint Testing Script
 * Tests both frontend and backend endpoints without requiring database
 */

const https = require('https');
const http = require('http');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('\n============================================================');
console.log('🔍 RuneRush API Health Check');
console.log('============================================================\n');

// Test endpoints
const endpoints = [
  {
    name: 'Frontend (Netlify)',
    url: 'https://runeflow.xyz',
    type: 'frontend'
  },
  {
    name: 'Frontend Alt',
    url: 'https://runerush.xyz',
    type: 'frontend'
  },
  {
    name: 'Backend (Railway) - Option 1',
    url: 'https://runerush.up.railway.app/api/health',
    type: 'api'
  },
  {
    name: 'Backend (Railway) - Option 2',
    url: 'https://runerush-production.up.railway.app/api/health',
    type: 'api'
  },
  {
    name: 'Local Backend',
    url: 'http://localhost:8080/api/health',
    type: 'api'
  }
];

// Test configurations from environment
console.log('📋 Configuration Status:\n');
console.log(`✅ Stripe: ${process.env.STRIPE_SECRET_KEY ? 'Configured (Live Mode)' : '❌ Not configured'}`);
console.log(`✅ SendGrid: ${process.env.SENDGRID_API_KEY ? 'Configured' : '❌ Not configured'}`);
console.log(`✅ AWS S3: ${process.env.AWS_ACCESS_KEY_ID ? 'Configured' : '❌ Not configured'}`);
console.log(`✅ Database: ${process.env.DATABASE_URL ? 'PostgreSQL on Railway' : '❌ Not configured'}`);
console.log(`✅ Twitter Bot: ${process.env.TWITTER_API_KEY ? 'Configured' : '❌ Not configured'}`);

console.log('\n📡 Testing Endpoints:\n');

// Function to test a single endpoint
function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = new URL(endpoint.url);
    const protocol = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'GET',
      timeout: 5000,
      headers: {
        'User-Agent': 'RuneRush-Test/1.0'
      }
    };

    const startTime = Date.now();
    
    const req = protocol.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const status = res.statusCode;
        const isHealthy = status >= 200 && status < 400;
        
        console.log(`${isHealthy ? '✅' : '❌'} ${endpoint.name}`);
        console.log(`   Status: ${status} | Time: ${responseTime}ms`);
        
        if (endpoint.type === 'api' && isHealthy) {
          try {
            const parsed = JSON.parse(data);
            if (parsed.success !== undefined) {
              console.log(`   API Response: ${parsed.success ? 'Success' : 'Failed'}`);
            }
          } catch (e) {
            // Not JSON, that's ok
          }
        }
        
        console.log('');
        
        resolve({
          name: endpoint.name,
          url: endpoint.url,
          status,
          responseTime,
          healthy: isHealthy
        });
      });
    });
    
    req.on('error', (error) => {
      const responseTime = Date.now() - startTime;
      console.log(`❌ ${endpoint.name}`);
      console.log(`   Error: ${error.code || error.message}`);
      console.log('');
      
      resolve({
        name: endpoint.name,
        url: endpoint.url,
        status: 0,
        responseTime,
        healthy: false,
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log(`❌ ${endpoint.name}`);
      console.log(`   Error: Timeout after 5 seconds`);
      console.log('');
      
      resolve({
        name: endpoint.name,
        url: endpoint.url,
        status: 0,
        responseTime: 5000,
        healthy: false,
        error: 'Timeout'
      });
    });
    
    req.end();
  });
}

// Test all endpoints
async function runTests() {
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
  }
  
  // Summary
  console.log('============================================================');
  console.log('📊 Summary');
  console.log('============================================================\n');
  
  const healthyCount = results.filter(r => r.healthy).length;
  const totalCount = results.length;
  
  console.log(`Overall Health: ${healthyCount}/${totalCount} services responding\n`);
  
  // Find working endpoints
  const workingFrontend = results.find(r => r.healthy && r.name.includes('Frontend'));
  const workingBackend = results.find(r => r.healthy && r.name.includes('Backend'));
  
  if (workingFrontend) {
    console.log(`✅ Frontend is accessible at: ${workingFrontend.url}`);
  } else {
    console.log('⚠️  No frontend endpoints are currently accessible');
  }
  
  if (workingBackend) {
    console.log(`✅ Backend API is accessible at: ${workingBackend.url}`);
  } else {
    console.log('⚠️  No backend API endpoints are currently accessible');
    console.log('   You may need to:');
    console.log('   1. Check Railway deployment: https://railway.app');
    console.log('   2. Start local server: npm run dev');
  }
  
  // Test recommendations
  console.log('\n💡 Next Steps:\n');
  
  if (!workingBackend) {
    console.log('1. Deploy backend to Railway:');
    console.log('   git push origin main');
    console.log('   Check: https://railway.app/dashboard\n');
  }
  
  if (!workingFrontend) {
    console.log('2. Deploy frontend to Netlify:');
    console.log('   git push origin main');
    console.log('   Check: https://app.netlify.com\n');
  }
  
  console.log('3. For local development:');
  console.log('   Use SQLite database locally by updating DATABASE_URL');
  console.log('   Or connect to Railway PostgreSQL public URL\n');
  
  console.log('✨ Test complete!\n');
}

// Run the tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
