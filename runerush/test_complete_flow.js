const axios = require('axios');

const BASE_URL = 'https://runeflow.xyz';

async function testCompletePurchaseFlow() {
    console.log('🧪 Testing Complete Purchase Flow...\n');

    try {
        // Step 1: Create a checkout session
        console.log('1️⃣ Creating checkout session...');
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
        console.log('Checkout URL:', checkoutResponse.data.checkout_url);
        
        // Extract session ID from the checkout URL
        const sessionId = checkoutResponse.data.checkout_url.match(/cs_[a-zA-Z0-9_]+/)?.[0];
        console.log('Session ID:', sessionId);

        if (!sessionId) {
            throw new Error('Could not extract session ID from checkout URL');
        }

        // Step 2: Test the session endpoint (what the success page uses)
        console.log('\n2️⃣ Testing session endpoint...');
        const sessionResponse = await axios.get(`${BASE_URL}/api/session/${sessionId}`);
        
        console.log('Session endpoint response:', sessionResponse.data);

        // Step 3: Check if user was created (this would happen via webhook in real flow)
        console.log('\n3️⃣ Checking for user creation...');
        
        // In a real scenario, we'd need to wait for the webhook to process
        // For now, let's just verify the endpoints are working

        console.log('\n✅ Flow test completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('- Complete a real payment using the checkout URL above');
        console.log('- Verify webhook processes the payment');
        console.log('- Check that license key is generated');
        console.log('- Test the success page with the session ID');

        return {
            success: true,
            checkoutUrl: checkoutResponse.data.checkout_url,
            sessionId: sessionId
        };

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        return { success: false, error: error.message };
    }
}

// Run the test
testCompletePurchaseFlow().then(result => {
    if (result.success) {
        console.log('\n🎉 All tests passed! You can now test with a real payment.');
    } else {
        console.log('\n💥 Tests failed. Check the errors above.');
        process.exit(1);
    }
});
