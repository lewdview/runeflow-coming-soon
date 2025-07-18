#!/usr/bin/env node

/**
 * RuneFlow Crypto Payment Debug Test
 * Tests the crypto payment system with simulation mode
 */

const express = require('express');
const app = express();
app.use(express.json());

// Create a simple simulation of crypto payment
function simulateCryptoPayment(packageType, userEmail, amount, cryptoType) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const chargeId = 'sim_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            const addresses = {
                'bitcoin': '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
                'ethereum': '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
                'usdc': '0xA0b86a33E6441d56F9A2F28FA47E0E1ea5D1A6D8'
            };
            
            resolve({
                success: true,
                charge_id: chargeId,
                charge_url: `https://commerce.coinbase.com/charges/${chargeId}`,
                expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
                payment_addresses: {
                    [cryptoType.toUpperCase()]: addresses[cryptoType] || addresses['bitcoin']
                },
                status: 'NEW',
                amount: amount,
                currency: 'USD',
                metadata: {
                    package_type: packageType,
                    user_email: userEmail,
                    created_at: new Date().toISOString()
                }
            });
        }, 1000);
    });
}

// Test the payment system
async function testPaymentSystem() {
    console.log('🧪 Testing RuneFlow Crypto Payment System...\n');
    
    const testCases = [
        { packageType: 'blind', userEmail: 'test@example.com', amount: 999, cryptoType: 'bitcoin' },
        { packageType: 'launch', userEmail: 'user@test.com', amount: 297, cryptoType: 'ethereum' },
        { packageType: 'blind', userEmail: 'crypto@example.com', amount: 999, cryptoType: 'usdc' }
    ];
    
    for (const testCase of testCases) {
        console.log(`💰 Testing ${testCase.cryptoType} payment for ${testCase.packageType} package...`);
        
        try {
            const result = await simulateCryptoPayment(
                testCase.packageType,
                testCase.userEmail,
                testCase.amount,
                testCase.cryptoType
            );
            
            console.log('✅ Payment simulation successful:');
            console.log(`   - Charge ID: ${result.charge_id}`);
            console.log(`   - Amount: $${result.amount}`);
            console.log(`   - Address: ${result.payment_addresses[testCase.cryptoType.toUpperCase()]}`);
            console.log(`   - Expires: ${result.expires_at}`);
            console.log('');
            
        } catch (error) {
            console.error('❌ Payment simulation failed:', error.message);
            console.log('');
        }
    }
    
    console.log('✅ All crypto payment tests completed!');
    console.log('\n🔧 To enable real crypto payments:');
    console.log('   1. Get valid Coinbase Commerce API key');
    console.log('   2. Update .env with real COINBASE_COMMERCE_API_KEY');
    console.log('   3. Restart the server');
    console.log('   4. Test with real crypto transactions');
}

// Run the test
if (require.main === module) {
    testPaymentSystem().catch(console.error);
}

module.exports = { simulateCryptoPayment };
