#!/usr/bin/env node

// Quick SendGrid API Test
// This script tests if your SendGrid API key is working

const https = require('https');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || 'YOUR_SENDGRID_API_KEY_HERE';

console.log('🧪 Testing SendGrid API Key...');
console.log('================================');

// Test API key by calling SendGrid's user profile endpoint
const options = {
  hostname: 'api.sendgrid.com',
  port: 443,
  path: '/v3/user/profile',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${SENDGRID_API_KEY}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      const profile = JSON.parse(data);
      console.log('✅ SendGrid API Key is VALID!');
      console.log(`📧 Account Email: ${profile.email || 'Not available'}`);
      console.log(`👤 First Name: ${profile.first_name || 'Not available'}`);
      console.log(`🏢 Company: ${profile.company || 'Not available'}`);
      console.log('');
      console.log('🎉 Your SendGrid is ready for RuneRUSH email delivery!');
    } else if (res.statusCode === 401) {
      console.log('❌ SendGrid API Key is INVALID!');
      console.log('   Please check your API key and try again.');
    } else {
      console.log(`⚠️  Unexpected response: ${res.statusCode}`);
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.end();
