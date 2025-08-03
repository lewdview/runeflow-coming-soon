require('dotenv').config();
const StripeService = require('./services/stripe');

async function testStripeDirectly() {
    console.log('🧪 Testing Stripe service directly...\n');
    
    try {
        // Test data
        const customerData = {
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User'
        };
        
        const successUrl = 'https://runeflow.xyz/success';
        const cancelUrl = 'https://runeflow.xyz/purchase';
        
        console.log('🔄 Testing core product checkout...');
        const result = await StripeService.createCheckoutSession(
            'core',
            customerData,
            successUrl,
            cancelUrl
        );
        
        console.log('✅ Checkout session created successfully!');
        console.log('Session ID:', result.session_id);
        console.log('Checkout URL:', result.url);
        
        return { success: true, result };
        
    } catch (error) {
        console.error('❌ Direct Stripe test failed:');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        return { success: false, error: error.message };
    }
}

testStripeDirectly().then(result => {
    if (result.success) {
        console.log('\n🎉 Direct Stripe test successful!');
    } else {
        console.log('\n💥 Direct Stripe test failed.');
        process.exit(1);
    }
});
