#!/usr/bin/env node

// Simulate the exact fetch call that would be made from the browser
const fetch = require('node-fetch');

async function testCORSSimulation() {
  console.log('🌐 Simulating Browser CORS Request');
  console.log('===================================');
  
  const API_BASE_URL = 'https://runeflow.xyz';
  const endpoint = `${API_BASE_URL}/.netlify/functions/capture-email`;
  
  console.log('🎯 Testing endpoint:', endpoint);
  console.log('📦 Request payload: { "email": "cors-test@example.com" }');
  
  try {
    // First, test OPTIONS preflight request
    console.log('\n1️⃣ Testing CORS Preflight (OPTIONS)...');
    const preflightResponse = await fetch(endpoint, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://runeflow.xyz',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type'
      }
    });
    
    console.log('Preflight Status:', preflightResponse.status);
    console.log('Preflight Headers:');
    preflightResponse.headers.forEach((value, name) => {
      if (name.toLowerCase().includes('access-control') || name.toLowerCase().includes('cors')) {
        console.log(`  ${name}: ${value}`);
      }
    });
    
    // Then test the actual POST request
    console.log('\n2️⃣ Testing Actual POST Request...');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://runeflow.xyz'
      },
      body: JSON.stringify({
        email: 'cors-test@example.com',
        selected_rune: 'ansuz',
        is_free_pack: true
      })
    });
    
    console.log('POST Status:', response.status);
    console.log('POST Headers:');
    response.headers.forEach((value, name) => {
      if (name.toLowerCase().includes('access-control') || name.toLowerCase().includes('cors')) {
        console.log(`  ${name}: ${value}`);
      }
    });
    
    const responseData = await response.text();
    console.log('Response Body:', responseData);
    
    if (response.status === 200 || response.status === 404) {
      if (response.status === 404) {
        console.log('⚠️  Function not deployed yet, but no CORS error - this is expected');
      } else {
        console.log('✅ CORS simulation successful!');
      }
    } else {
      console.log('❌ CORS simulation failed with status:', response.status);
    }
    
  } catch (error) {
    if (error.message.includes('CORS')) {
      console.error('❌ CORS Error detected:', error.message);
    } else {
      console.error('❌ Network Error:', error.message);
    }
  }
}

// Run the simulation
testCORSSimulation();
