// Test Stripe integration directly
require('dotenv').config();
const Stripe = require('stripe');

async function testStripe() {
    console.log('🧪 Testing Stripe Integration...\n');
    
    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    console.log('✅ Stripe initialized');
    console.log('🔑 Using key:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 12) + '...' : 'NOT SET');
    
    // Test products
    const products = {
        core: 'prod_SlL1zWArTK3AHs',
        pro_bundle: 'prod_SlL8jakWjh1bNn',
        pro_upgrade: 'prod_SlL5k4eZntQCK9'
    };
    
    console.log('\n📦 Testing Products:');
    for (const [name, productId] of Object.entries(products)) {
        try {
            const product = await stripe.products.retrieve(productId);
            console.log(`✅ ${name}: ${product.name} (${productId})`);
        } catch (error) {
            console.log(`❌ ${name}: Error - ${error.message} (${productId})`);
        }
    }
    
    // Test checkout session creation
    console.log('\n🛒 Testing Checkout Session Creation:');
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product: products.core,
                    unit_amount: 4900, // $49
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: 'https://runeflow.xyz/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'https://runeflow.xyz/purchase',
            customer_email: 'test@example.com',
            metadata: {
                product_type: 'core',
                customer_email: 'test@example.com',
                customer_name: 'Test User'
            },
            billing_address_collection: 'auto',
            allow_promotion_codes: true,
        });
        
        console.log('✅ Checkout session created successfully!');
        console.log('🔗 Session ID:', session.id);
        console.log('🌐 Checkout URL:', session.url);
        
    } catch (error) {
        console.log('❌ Checkout session creation failed:');
        console.log('Error type:', error.type);
        console.log('Error message:', error.message);
        console.log('Error code:', error.code);
        if (error.detail) console.log('Error detail:', error.detail);
    }
}

testStripe().catch(console.error);
