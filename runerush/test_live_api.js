const axios = require('axios');

const BASE_URL = 'https://runeflow.xyz';

async function testLiveAPI() {
    console.log('🧪 Testing Live API Endpoints...\n');

    try {
        // Test 1: Health check
        console.log('1️⃣ Testing health endpoint...');
        try {
            const healthResponse = await axios.get(`${BASE_URL}/api/health`);
            console.log('✅ Health check:', healthResponse.data);
        } catch (error) {
            console.log('❌ Health check failed:', error.response?.data || error.message);
        }

        // Test 2: Create checkout session with detailed error logging
        console.log('\n2️⃣ Testing checkout session creation...');
        try {
            const checkoutResponse = await axios.post(`${BASE_URL}/api/payments/stripe/create-checkout`, {
                email: 'test@example.com',
                first_name: 'Test',
                last_name: 'User',
                product_type: 'complete_collection',
                success_url: 'https://runeflow.xyz/success',
                cancel_url: 'https://runeflow.xyz/purchase'
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Checkout session created successfully');
            console.log('Response:', JSON.stringify(checkoutResponse.data, null, 2));
            
        } catch (error) {
            console.log('❌ Checkout session creation failed');
            console.log('Status:', error.response?.status);
            console.log('Status Text:', error.response?.statusText);
            console.log('Response Data:', JSON.stringify(error.response?.data, null, 2));
            console.log('Error Message:', error.message);
        }

        // Test 3: Test with different product type
        console.log('\n3️⃣ Testing with core product...');
        try {
            const coreResponse = await axios.post(`${BASE_URL}/api/payments/stripe/create-checkout`, {
                email: 'test@example.com',
                first_name: 'Test',
                last_name: 'User',
                product_type: 'core',
                success_url: 'https://runeflow.xyz/success',
                cancel_url: 'https://runeflow.xyz/purchase'
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('✅ Core product checkout session created');
            console.log('Response:', JSON.stringify(coreResponse.data, null, 2));
            
        } catch (error) {
            console.log('❌ Core product checkout failed');
            console.log('Status:', error.response?.status);
            console.log('Response Data:', JSON.stringify(error.response?.data, null, 2));
        }

    } catch (error) {
        console.error('Unexpected error:', error.message);
    }
}

testLiveAPI();
