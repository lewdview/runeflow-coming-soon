#!/usr/bin/env node

require('dotenv').config();
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function setupWebhook() {
    try {
        console.log('🚀 Setting up Stripe webhook...\n');

        // Your Railway production URL
        const webhookUrl = 'https://runeflow.xyz/api/webhooks/stripe';
        
        console.log(`Webhook URL: ${webhookUrl}`);
        
        // Events to listen for
        const events = [
            'checkout.session.completed',
            'payment_intent.succeeded',
            'payment_intent.payment_failed',
            'charge.dispute.created'
        ];

        // Check if webhook already exists
        const existingWebhooks = await stripe.webhookEndpoints.list();
        const existingWebhook = existingWebhooks.data.find(webhook => 
            webhook.url === webhookUrl
        );

        if (existingWebhook) {
            console.log(`⚠️  Webhook already exists with ID: ${existingWebhook.id}`);
            console.log(`   URL: ${existingWebhook.url}`);
            console.log(`   Status: ${existingWebhook.status}`);
            console.log(`   Events: ${existingWebhook.enabled_events.join(', ')}`);
            
            // Update webhook events if needed
            const currentEvents = new Set(existingWebhook.enabled_events);
            const requiredEvents = new Set(events);
            
            const needsUpdate = events.some(event => !currentEvents.has(event)) ||
                              existingWebhook.enabled_events.some(event => !requiredEvents.has(event));
            
            if (needsUpdate) {
                console.log('\n🔄 Updating webhook events...');
                const updatedWebhook = await stripe.webhookEndpoints.update(
                    existingWebhook.id,
                    { enabled_events: events }
                );
                console.log(`✅ Webhook updated successfully!`);
                console.log(`   Events: ${updatedWebhook.enabled_events.join(', ')}`);
            } else {
                console.log('\n✅ Webhook is already properly configured!');
            }
            
            return;
        }

        // Create new webhook
        console.log('\n📡 Creating new webhook endpoint...');
        const webhook = await stripe.webhookEndpoints.create({
            url: webhookUrl,
            enabled_events: events,
            description: 'RuneRUSH Production Webhook'
        });

        console.log('\n✅ Webhook created successfully!');
        console.log(`   ID: ${webhook.id}`);
        console.log(`   URL: ${webhook.url}`);
        console.log(`   Secret: ${webhook.secret}`);
        console.log(`   Events: ${webhook.enabled_events.join(', ')}`);
        
        console.log('\n🔧 Next steps:');
        console.log('1. Copy the webhook secret above');
        console.log('2. Update your Railway environment variable STRIPE_WEBHOOK_SECRET with this secret');
        console.log('3. Redeploy your Railway service');
        
        console.log(`\n🌐 Current Railway webhook secret: ${process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 20)}...`);
        
        if (process.env.STRIPE_WEBHOOK_SECRET !== webhook.secret) {
            console.log('\n⚠️  WARNING: Your current STRIPE_WEBHOOK_SECRET does not match the webhook secret!');
            console.log('   Please update the Railway environment variable.');
        } else {
            console.log('\n✅ Webhook secret matches your Railway environment variable!');
        }

    } catch (error) {
        console.error('❌ Error setting up webhook:', error.message);
        process.exit(1);
    }
}

async function testWebhook() {
    try {
        console.log('\n🧪 Testing webhook endpoint...');
        
        const webhookUrl = 'https://runeflow.xyz/api/webhooks/stripe';
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'stripe-signature': 'test'
            },
            body: JSON.stringify({ test: true })
        });
        
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${response.status === 400 ? '✅ Expected error (webhook signature verification)' : '❌ Unexpected response'}`);
        
    } catch (error) {
        console.log(`   Error: ${error.message} (This is expected for signature verification)`);
    }
}

async function listWebhooks() {
    try {
        console.log('\n📋 Current webhooks:');
        const webhooks = await stripe.webhookEndpoints.list();
        
        if (webhooks.data.length === 0) {
            console.log('   No webhooks found');
            return;
        }
        
        webhooks.data.forEach((webhook, index) => {
            console.log(`\n   ${index + 1}. ${webhook.id}`);
            console.log(`      URL: ${webhook.url}`);
            console.log(`      Status: ${webhook.status}`);
            console.log(`      Events: ${webhook.enabled_events.join(', ')}`);
            console.log(`      Created: ${new Date(webhook.created * 1000).toISOString()}`);
        });
        
    } catch (error) {
        console.error('❌ Error listing webhooks:', error.message);
    }
}

// Main execution
async function main() {
    const command = process.argv[2];
    
    switch (command) {
        case 'setup':
            await setupWebhook();
            break;
        case 'test':
            await testWebhook();
            break;
        case 'list':
            await listWebhooks();
            break;
        default:
            console.log('Usage: node setup-stripe-webhook.js [setup|test|list]');
            console.log('\nCommands:');
            console.log('  setup - Create/update webhook endpoint');
            console.log('  test  - Test webhook endpoint connectivity');
            console.log('  list  - List all existing webhooks');
            process.exit(1);
    }
}

if (require.main === module) {
    main();
}
