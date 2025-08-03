require('dotenv').config();
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function getAllPrices() {
    console.log('🔍 Fetching all prices from your Stripe account...\n');
    
    try {
        const prices = await stripe.prices.list({
            limit: 100,
            expand: ['data.product']
        });

        console.log(`Found ${prices.data.length} prices:\n`);

        const priceMap = {};
        
        prices.data.forEach(price => {
            const product = price.product;
            console.log(`📦 Product: ${product.name}`);
            console.log(`   💰 Price: $${(price.unit_amount / 100).toFixed(2)} ${price.currency.toUpperCase()}`);
            console.log(`   🆔 Price ID: ${price.id}`);
            console.log(`   🔗 Product ID: ${product.id}`);
            console.log(`   📝 Description: ${product.description || 'No description'}`);
            console.log(`   ✅ Active: ${price.active}\n`);
            
            // Try to determine product type from name
            const productName = product.name.toLowerCase();
            let productType = 'unknown';
            
            if (productName.includes('core') && !productName.includes('bundle')) {
                productType = 'core';
            } else if (productName.includes('pro') && productName.includes('bundle')) {
                productType = 'pro_bundle';
            } else if (productName.includes('pro') && productName.includes('upgrade')) {
                productType = 'pro_upgrade';
            } else if (productName.includes('complete') || productName.includes('collection')) {
                productType = 'complete_collection';
            } else if (productName.includes('limited')) {
                productType = 'pro_limited';
            }
            
            if (productType !== 'unknown') {
                priceMap[productType] = price.id;
            }
        });

        console.log('🎯 Suggested price mapping for services/stripe.js:');
        console.log('===============================================\n');
        console.log('this.prices = {');
        Object.entries(priceMap).forEach(([type, priceId]) => {
            console.log(`    ${type}: '${priceId}',`);
        });
        console.log('};\n');

        console.log('📋 Copy the price IDs above into your services/stripe.js file');
        console.log('💡 Make sure to match the product types with your actual products');

        return priceMap;

    } catch (error) {
        console.error('❌ Error fetching prices:', error.message);
        
        if (error.type === 'StripeAuthenticationError') {
            console.log('\n🔐 Make sure your STRIPE_SECRET_KEY is correct in .env file');
        }
    }
}

getAllPrices();
