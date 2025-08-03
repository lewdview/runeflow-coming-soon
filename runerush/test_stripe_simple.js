const axios = require('axios');

const BASE_URL = 'https://runeflow.xyz';

async function testExistingStripeProducts() {
    console.log('🧪 Testing existing Stripe products...\n');

    // Test with core bundle (cheapest option)
    const testData = {
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        product_type: 'core',
        success_url: 'https://runeflow.xyz/success',
        cancel_url: 'https://runeflow.xyz/purchase'
    };

    try {
        console.log('🔄 Testing core bundle checkout...');
        const response = await axios.post(`${BASE_URL}/api/payments/stripe/create-checkout`, testData);
        
        console.log('✅ Core bundle checkout successful!');
        console.log('Checkout URL:', response.data.data.url);
        
        return { success: true, checkoutUrl: response.data.data.url };

    } catch (error) {
        console.error('❌ Core bundle test failed:', error.response?.data || error.message);
        
        // Try with a different product type
        try {
            console.log('\n🔄 Trying pro_bundle instead...');
            testData.product_type = 'pro_bundle';
            const response = await axios.post(`${BASE_URL}/api/payments/stripe/create-checkout`, testData);
            
            console.log('✅ Pro bundle checkout successful!');
            console.log('Checkout URL:', response.data.data.url);
            
            return { success: true, checkoutUrl: response.data.data.url };
            
        } catch (error2) {
            console.error('❌ Pro bundle also failed:', error2.response?.data || error2.message);
        }
        
        return { success: false, error: error.message };
    }
}

// Test health first
async function testBackend() {
    console.log('🏥 Testing backend health...');
    
    try {
        const healthResponse = await axios.get(`${BASE_URL}/api/health`);
        console.log('✅ Backend is healthy:', healthResponse.data);
        
        // Now test Stripe
        return await testExistingStripeProducts();
        
    } catch (error) {
        console.error('❌ Backend health check failed:', error.message);
        return { success: false, error: 'Backend not reachable' };
    }
}

testBackend().then(result => {
    if (result.success) {
        console.log('\n🎉 Test successful! You can use this checkout URL for testing:');
        console.log(result.checkoutUrl);
    } else {
        console.log('\n💥 Tests failed. Check your Stripe configuration.');
    }
});
