#!/usr/bin/env node

// Test script to verify the Netlify function works locally
const captureEmailHandler = require('./netlify/functions/capture-email').handler;

// Mock event object
const mockEvent = {
  httpMethod: 'POST',
  headers: {
    'content-type': 'application/json',
    'user-agent': 'test-agent',
    'client-ip': '127.0.0.1'
  },
  body: JSON.stringify({
    email: 'test@example.com',
    selected_rune: 'ansuz',
    is_free_pack: true
  })
};

// Mock context object
const mockContext = {
  functionName: 'capture-email',
  requestId: 'test-request-id'
};

async function testFunction() {
  console.log('🧪 Testing Netlify Function Locally');
  console.log('=====================================');
  
  try {
    console.log('📤 Sending test request:', JSON.parse(mockEvent.body));
    
    const result = await captureEmailHandler(mockEvent, mockContext);
    
    console.log('📥 Function Response:');
    console.log('Status Code:', result.statusCode);
    console.log('Headers:', result.headers);
    console.log('Body:', JSON.parse(result.body || '{}'));
    
    if (result.statusCode === 200) {
      console.log('✅ Function test PASSED! The function works locally.');
    } else {
      console.log('❌ Function test FAILED with status:', result.statusCode);
    }
    
  } catch (error) {
    console.error('❌ Function test ERROR:', error.message);
    console.error('Stack trace:', error.stack);
  }
  
  // Also test CORS preflight
  console.log('\n🔒 Testing CORS Preflight');
  console.log('==========================');
  
  const corsEvent = {
    httpMethod: 'OPTIONS',
    headers: {
      'origin': 'https://runeflow.xyz',
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'content-type'
    }
  };
  
  try {
    const corsResult = await captureEmailHandler(corsEvent, mockContext);
    console.log('CORS Status Code:', corsResult.statusCode);
    console.log('CORS Headers:', corsResult.headers);
    
    if (corsResult.statusCode === 200 && corsResult.headers['Access-Control-Allow-Origin']) {
      console.log('✅ CORS test PASSED!');
    } else {
      console.log('❌ CORS test FAILED');
    }
    
  } catch (error) {
    console.error('❌ CORS test ERROR:', error.message);
  }
}

// Run the test
testFunction();
