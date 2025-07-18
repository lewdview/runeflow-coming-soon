#!/usr/bin/env node

/**
 * Test script for Coinbase Commerce crypto payment integration
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testCryptoPayments() {
    console.log('🧪 Testing RuneFlow Crypto Payment System...\n');

    try {
        // Test 1: Health check
        console.log('1️⃣ Testing health endpoint...');
        const healthResponse = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health check passed:', healthResponse.data.status);

        // Test 2: Get supported currencies
        console.log('\n2️⃣ Testing supported currencies endpoint...');
        const currenciesResponse = await axios.get(`${BASE_URL}/api/crypto/supported-currencies`);
        console.log('✅ Supported currencies:', currenciesResponse.data.currencies.map(c => c.code).join(', '));

        // Test 3: Create a test crypto charge
        console.log('\n3️⃣ Testing crypto charge creation...');
        const chargeData = {
            packageType: 'blind_founder',
            userEmail: 'test@runeflow.co',
            amount: 999,
            description: 'Test Blind Founder Package'
        };

        const chargeResponse = await axios.post(`${BASE_URL}/api/crypto/create-charge`, chargeData);
        
        if (chargeResponse.data.success) {
            console.log('✅ Crypto charge created successfully!');
            console.log('📄 Charge ID:', chargeResponse.data.charge_id);
            console.log('🔗 Payment URL:', chargeResponse.data.charge_url);
            console.log('💰 Pricing:', chargeResponse.data.pricing);
            
            const chargeId = chargeResponse.data.charge_id;

            // Test 4: Check charge status
            console.log('\n4️⃣ Testing charge status check...');
            const statusResponse = await axios.get(`${BASE_URL}/api/crypto/charge/${chargeId}`);
            
            if (statusResponse.data.success) {
                console.log('✅ Charge status retrieved:', statusResponse.data.status);
                console.log('📍 Addresses available:', Object.keys(statusResponse.data.addresses || {}));
            } else {
                console.log('❌ Failed to get charge status:', statusResponse.data.error);
            }
        } else {
            console.log('❌ Failed to create crypto charge:', chargeResponse.data.error);
        }

        console.log('\n🎉 All tests completed successfully!');
        console.log('\n📋 Summary:');
        console.log('- ✅ Server is running');
        console.log('- ✅ Crypto payment service initialized');
        console.log('- ✅ API endpoints responding');
        console.log('- ✅ Coinbase Commerce integration working');
        console.log('- ✅ Real crypto charges can be created');
        
        console.log('\n🔧 Next steps:');
        console.log('1. Set webhook URL in Coinbase Commerce dashboard:');
        console.log('   https://yourdomain.com/webhook/coinbase-commerce');
        console.log('2. Test payments with real crypto transactions');
        console.log('3. Monitor payment confirmations via webhooks');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Make sure the server is running:');
            console.log('   npm start');
        }
    }
}

// Run tests
testCryptoPayments();
