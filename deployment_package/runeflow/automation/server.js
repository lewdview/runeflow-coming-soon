#!/usr/bin/env node

/**
 * RuneFlow Coming Soon - Production Server
 * Handles email capture, analytics, and serves the landing page
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const CryptoPaymentService = require('./crypto-payment-service');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Email transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.webhalla.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || 'bryan@webhalla.com',
        pass: process.env.SMTP_PASS || 'giveME1221!sex'
    }
});

// Initialize crypto payment service
let cryptoPaymentService;
try {
    cryptoPaymentService = new CryptoPaymentService();
    console.log('✅ Crypto payment service initialized');
} catch (error) {
    console.error('❌ Failed to initialize crypto payment service:', error.message);
    console.log('🔧 Crypto payments will be disabled');
}

// In-memory storage for development (replace with database in production)
let emailList = [];
let analyticsData = {
    totalSignups: 0,
    dailySignups: {},
    conversionRate: 0,
    topReferrers: {}
};

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        signups: analyticsData.totalSignups
    });
});

// Stripe configuration endpoint
app.get('/api/stripe/config', (req, res) => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        success: true
    });
});

// Email capture endpoint
app.post('/capture-email', async (req, res) => {
    const { email, referrer, utm_source, utm_medium, utm_campaign } = req.body;
    
    console.log('📧 Email capture attempt:', email);
    
    // Validate email
    if (!email || !isValidEmail(email)) {
        return res.status(400).json({ 
            error: 'Invalid email address',
            success: false 
        });
    }
    
    // Check for duplicates
    const existingEmail = emailList.find(entry => entry.email === email);
    if (existingEmail) {
        return res.status(200).json({
            message: 'Email already registered',
            success: true,
            duplicate: true
        });
    }
    
    // Store email with metadata
    const emailEntry = {
        email,
        timestamp: new Date().toISOString(),
        referrer: referrer || req.get('Referer'),
        utm_source,
        utm_medium,
        utm_campaign,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    };
    
    emailList.push(emailEntry);
    
    // Update analytics
    analyticsData.totalSignups++;
    const today = new Date().toISOString().split('T')[0];
    analyticsData.dailySignups[today] = (analyticsData.dailySignups[today] || 0) + 1;
    
    // Save to file (backup)
    await saveEmailList();
    
    try {
        // Send welcome email
        await sendWelcomeEmail(email);
        
        // Send notification to admin
        await sendAdminNotification(emailEntry);
        
        // Trigger social media automation
        await triggerSocialMediaPost(emailEntry);
        
        console.log('✅ Email captured successfully:', email);
        
        res.json({
            message: 'Email captured successfully',
            success: true,
            download_url: '/assets/downloads/starter-rune-template.json'
        });
        
    } catch (error) {
        console.error('❌ Error processing email:', error);
        res.status(500).json({
            error: 'Failed to process email',
            success: false
        });
    }
});

// Analytics endpoint
app.get('/analytics', (req, res) => {
    res.json({
        ...analyticsData,
        recentSignups: emailList.slice(-10).map(entry => ({
            email: entry.email.replace(/(.{2}).*(@.*)/, '$1***$2'),
            timestamp: entry.timestamp,
            referrer: entry.referrer
        }))
    });
});

// Export email list
app.get('/export-emails', (req, res) => {
    const csv = emailList.map(entry => 
        `${entry.email},${entry.timestamp},${entry.referrer || ''},${entry.utm_source || ''}`
    ).join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="runeflow-emails.csv"');
    res.send('Email,Timestamp,Referrer,UTM Source\n' + csv);
});

// ==================== CRYPTO PAYMENT ENDPOINTS ====================

// Create crypto payment charge
app.post('/api/crypto/create-charge', async (req, res) => {
    if (!cryptoPaymentService) {
        return res.status(503).json({
            error: 'Crypto payment service not available',
            success: false
        });
    }

    try {
        const { packageType, userEmail, amount, description } = req.body;
        
        console.log('💰 Creating crypto charge for:', { packageType, userEmail, amount });
        
        // Validate input
        if (!packageType || !userEmail || !amount) {
            return res.status(400).json({
                error: 'Missing required fields: packageType, userEmail, amount',
                success: false
            });
        }

        if (!isValidEmail(userEmail)) {
            return res.status(400).json({
                error: 'Invalid email address',
                success: false
            });
        }

        // Create charge with Coinbase Commerce
        const charge = await cryptoPaymentService.createCharge({
            name: getPackageName(packageType),
            description: description || getPackageDescription(packageType),
            amount: amount,
            currency: 'USD',
            metadata: {
                package_type: packageType,
                user_email: userEmail,
                source: 'runeflow_website',
                created_via: 'api'
            }
        });

        console.log('✅ Crypto charge created successfully:', charge.id);
        
        // Return charge details to frontend
        res.json({
            success: true,
            charge_id: charge.id,
            charge_url: charge.hosted_url,
            payment_addresses: charge.addresses,
            pricing: charge.pricing,
            expires_at: charge.expires_at,
            metadata: charge.metadata
        });
        
    } catch (error) {
        console.error('❌ Error creating crypto charge:', error);
        res.status(500).json({
            error: 'Failed to create crypto payment',
            message: error.message,
            success: false
        });
    }
});

// Get crypto payment status
app.get('/api/crypto/charge/:chargeId', async (req, res) => {
    if (!cryptoPaymentService) {
        return res.status(503).json({
            error: 'Crypto payment service not available',
            success: false
        });
    }

    try {
        const { chargeId } = req.params;
        
        console.log('🔍 Getting charge status for:', chargeId);
        
        const charge = await cryptoPaymentService.getCharge(chargeId);
        
        res.json({
            success: true,
            charge_id: charge.id,
            status: charge.timeline[charge.timeline.length - 1]?.status || 'unknown',
            timeline: charge.timeline,
            pricing: charge.pricing,
            addresses: charge.addresses,
            metadata: charge.metadata
        });
        
    } catch (error) {
        console.error('❌ Error getting charge:', error);
        res.status(500).json({
            error: 'Failed to get charge status',
            message: error.message,
            success: false
        });
    }
});

// Get supported cryptocurrencies
app.get('/api/crypto/supported-currencies', (req, res) => {
    if (!cryptoPaymentService) {
        return res.status(503).json({
            error: 'Crypto payment service not available',
            success: false
        });
    }

    try {
        const currencies = cryptoPaymentService.getSupportedCurrencies();
        res.json({
            success: true,
            currencies: currencies
        });
    } catch (error) {
        console.error('❌ Error getting supported currencies:', error);
        res.status(500).json({
            error: 'Failed to get supported currencies',
            success: false
        });
    }
});

// Coinbase Commerce Webhook Endpoint
app.post('/webhook/coinbase-commerce', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!cryptoPaymentService) {
        console.error('❌ Webhook received but crypto payment service not available');
        return res.status(503).json({ error: 'Service not available' });
    }

    try {
        const signature = req.get('X-CC-Webhook-Signature');
        const payload = req.body;
        
        console.log('📦 Coinbase Commerce webhook received');
        
        // Verify webhook signature
        if (!cryptoPaymentService.verifyWebhookSignature(payload, signature)) {
            console.error('❌ Invalid webhook signature');
            return res.status(400).json({ error: 'Invalid signature' });
        }
        
        // Parse webhook payload
        const webhookData = JSON.parse(payload);
        
        // Process the webhook
        const result = await cryptoPaymentService.processPaymentWebhook(webhookData);
        
        console.log('✅ Webhook processed successfully:', result);
        
        // Send success response
        res.json({
            success: true,
            processed: true,
            result: result
        });
        
    } catch (error) {
        console.error('❌ Error processing webhook:', error);
        res.status(500).json({
            error: 'Failed to process webhook',
            message: error.message
        });
    }
});

// Test webhook endpoint (for development)
app.post('/webhook/test', async (req, res) => {
    console.log('🧪 Test webhook received:', req.body);
    res.json({ success: true, message: 'Test webhook received' });
});

// ==================== STRIPE PAYMENT ENDPOINTS ====================

// Create Stripe payment intent
app.post('/api/stripe/create-payment-intent', async (req, res) => {
    try {
        const { packageType, userEmail, amount, currency = 'usd' } = req.body;
        
        console.log('💳 Creating Stripe payment intent for:', { packageType, userEmail, amount });
        
        // Validate input
        if (!packageType || !userEmail || !amount) {
            return res.status(400).json({
                error: 'Missing required fields: packageType, userEmail, amount',
                success: false
            });
        }

        if (!isValidEmail(userEmail)) {
            return res.status(400).json({
                error: 'Invalid email address',
                success: false
            });
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency,
            description: getPackageDescription(packageType),
            metadata: {
                package_type: packageType,
                user_email: userEmail,
                source: 'runeflow_website',
                created_via: 'stripe_api'
            },
            receipt_email: userEmail
        });

        console.log('✅ Stripe payment intent created:', paymentIntent.id);
        
        res.json({
            success: true,
            client_secret: paymentIntent.client_secret,
            payment_intent_id: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            metadata: paymentIntent.metadata
        });
        
    } catch (error) {
        console.error('❌ Error creating Stripe payment intent:', error);
        res.status(500).json({
            error: 'Failed to create payment intent',
            message: error.message,
            success: false
        });
    }
});

// Confirm Stripe payment
app.post('/api/stripe/confirm-payment', async (req, res) => {
    try {
        const { payment_intent_id } = req.body;
        
        console.log('🔍 Confirming Stripe payment:', payment_intent_id);
        
        const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);
        
        if (paymentIntent.status === 'succeeded') {
            // Process successful payment
            await processStripePaymentSuccess(paymentIntent);
            
            res.json({
                success: true,
                status: paymentIntent.status,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                metadata: paymentIntent.metadata
            });
        } else {
            res.json({
                success: false,
                status: paymentIntent.status,
                message: 'Payment not completed'
            });
        }
        
    } catch (error) {
        console.error('❌ Error confirming Stripe payment:', error);
        res.status(500).json({
            error: 'Failed to confirm payment',
            message: error.message,
            success: false
        });
    }
});

// Stripe webhook endpoint
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('❌ Stripe webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('📦 Stripe webhook received:', event.type);

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('✅ Payment succeeded:', paymentIntent.id);
            await processStripePaymentSuccess(paymentIntent);
            break;
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('❌ Payment failed:', failedPayment.id);
            await processStripePaymentFailure(failedPayment);
            break;
        case 'customer.created':
            const customer = event.data.object;
            console.log('👤 Customer created:', customer.id);
            break;
        default:
            console.log(`🔔 Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

// Helper functions for Stripe payment processing
async function processStripePaymentSuccess(paymentIntent) {
    try {
        const { user_email, package_type } = paymentIntent.metadata;
        
        // Add to email list if not already present
        const existingEmail = emailList.find(entry => entry.email === user_email);
        if (!existingEmail) {
            const emailEntry = {
                email: user_email,
                timestamp: new Date().toISOString(),
                source: 'stripe_payment',
                package_type: package_type,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency,
                payment_intent_id: paymentIntent.id
            };
            
            emailList.push(emailEntry);
            analyticsData.totalSignups++;
            
            await saveEmailList();
        }
        
        // Send purchase confirmation email
        await sendPurchaseConfirmationEmail(user_email, package_type, paymentIntent);
        
        // Send admin notification
        await sendAdminPurchaseNotification(user_email, package_type, paymentIntent);
        
        console.log('✅ Stripe payment processed successfully');
        
    } catch (error) {
        console.error('❌ Error processing Stripe payment success:', error);
    }
}

async function processStripePaymentFailure(paymentIntent) {
    try {
        const { user_email, package_type } = paymentIntent.metadata;
        
        // Send payment failure notification
        await sendPaymentFailureEmail(user_email, package_type, paymentIntent);
        
        console.log('⚠️ Stripe payment failure processed');
        
    } catch (error) {
        console.error('❌ Error processing Stripe payment failure:', error);
    }
}

async function sendPurchaseConfirmationEmail(email, packageType, paymentIntent) {
    const mailOptions = {
        from: `${process.env.FROM_NAME || 'Bryan Meason - RuneFlow'} <${process.env.FROM_EMAIL || 'bryan@webhalla.com'}>`,
        to: email,
        subject: '🎉 RuneFlow Purchase Confirmed - Access Granted!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #022b3a; color: #e0e1dd; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #d4af37; font-size: 2.5em; margin-bottom: 10px;">RuneFlow</h1>
                    <p style="color: #46b29d; font-size: 1.2em;">Payment Confirmed!</p>
                </div>
                
                <div style="background: rgba(70, 178, 157, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h2 style="color: #46b29d; margin-bottom: 15px;">🎉 Welcome to RuneFlow!</h2>
                    <p>Your payment has been processed successfully:</p>
                    <ul>
                        <li><strong>Package:</strong> ${getPackageName(packageType)}</li>
                        <li><strong>Amount:</strong> $${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()}</li>
                        <li><strong>Transaction ID:</strong> ${paymentIntent.id}</li>
                    </ul>
                </div>
                
                <div style="background: rgba(212, 175, 55, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #d4af37;">What's Next?</h3>
                    <p>You now have access to your RuneFlow benefits. We'll send you login details and access instructions within 24 hours.</p>
                </div>
                
                <div style="border-top: 1px solid #46b29d; padding-top: 20px; margin-top: 30px; text-align: center; opacity: 0.8;">
                    <p>Questions? Reply to this email or contact support.</p>
                    <p>© 2025 RuneFlow.co - Forged by WebHalla</p>
                </div>
            </div>
        `
    };
    
    await transporter.sendMail(mailOptions);
}

async function sendPaymentFailureEmail(email, packageType, paymentIntent) {
    const mailOptions = {
        from: `${process.env.FROM_NAME || 'Bryan Meason - RuneFlow'} <${process.env.FROM_EMAIL || 'bryan@webhalla.com'}>`,
        to: email,
        subject: '⚠️ RuneFlow Payment Issue - Let\'s Fix This',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #022b3a; color: #e0e1dd; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #d4af37; font-size: 2.5em; margin-bottom: 10px;">RuneFlow</h1>
                    <p style="color: #ff6b6b; font-size: 1.2em;">Payment Issue Detected</p>
                </div>
                
                <div style="background: rgba(255, 107, 107, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h2 style="color: #ff6b6b; margin-bottom: 15px;">Payment Not Completed</h2>
                    <p>We encountered an issue processing your payment for ${getPackageName(packageType)}.</p>
                    <p>Don't worry - no charges were made to your account.</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://runeflow.co" style="background: linear-gradient(135deg, #46b29d 0%, #3a9688 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                        Try Again
                    </a>
                </div>
                
                <div style="border-top: 1px solid #46b29d; padding-top: 20px; margin-top: 30px; text-align: center; opacity: 0.8;">
                    <p>Need help? Reply to this email for assistance.</p>
                    <p>© 2025 RuneFlow.co - Forged by WebHalla</p>
                </div>
            </div>
        `
    };
    
    await transporter.sendMail(mailOptions);
}

async function sendAdminPurchaseNotification(email, packageType, paymentIntent) {
    const mailOptions = {
        from: `RuneFlow System <${process.env.FROM_EMAIL || 'bryan@webhalla.com'}>`,
        to: process.env.ADMIN_EMAIL || 'bryan@webhalla.com',
        subject: `💰 New RuneFlow Purchase: ${email}`,
        html: `
            <h2>New Purchase Completed!</h2>
            <p><strong>Customer:</strong> ${email}</p>
            <p><strong>Package:</strong> ${getPackageName(packageType)}</p>
            <p><strong>Amount:</strong> $${(paymentIntent.amount / 100).toFixed(2)} ${paymentIntent.currency.toUpperCase()}</p>
            <p><strong>Payment ID:</strong> ${paymentIntent.id}</p>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            
            <hr>
            <p><strong>Total Customers:</strong> ${analyticsData.totalSignups}</p>
        `
    };
    
    await transporter.sendMail(mailOptions);
}

// ==================== HELPER FUNCTIONS ====================

function getPackageName(packageType) {
    switch (packageType) {
        case 'blind_founder':
            return 'RuneFlow Blind Founder Package';
        case 'launch_access':
            return 'RuneFlow Launch Access Package';
        default:
            return 'RuneFlow Package';
    }
}

function getPackageDescription(packageType) {
    switch (packageType) {
        case 'blind_founder':
            return 'Complete access to all 8,000+ n8n templates with 50% lifetime discount and exclusive founder benefits';
        case 'launch_access':
            return 'Day-one access to 2,500+ n8n templates with 40% launch discount and priority support';
        default:
            return 'RuneFlow automation template package';
    }
}

// Functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function saveEmailList() {
    try {
        const dataPath = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataPath)) {
            fs.mkdirSync(dataPath, { recursive: true });
        }
        
        await fs.promises.writeFile(
            path.join(dataPath, 'emails.json'),
            JSON.stringify(emailList, null, 2)
        );
        
        await fs.promises.writeFile(
            path.join(dataPath, 'analytics.json'),
            JSON.stringify(analyticsData, null, 2)
        );
    } catch (error) {
        console.error('Error saving email list:', error);
    }
}

async function sendWelcomeEmail(email) {
    const mailOptions = {
        from: `${process.env.FROM_NAME || 'Bryan Meason - RuneFlow'} <${process.env.FROM_EMAIL || 'bryan@webhalla.com'}>`,
        to: email,
        subject: '🔥 Your RuneFlow Starter Rune is Ready!',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #022b3a; color: #e0e1dd; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #d4af37; font-size: 2.5em; margin-bottom: 10px;">RuneFlow</h1>
                    <p style="color: #46b29d; font-size: 1.2em;">Ancient Power. Modern Automation.</p>
                </div>
                
                <div style="background: rgba(70, 178, 157, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h2 style="color: #46b29d; margin-bottom: 15px;">🎉 Welcome to the Revolution!</h2>
                    <p>You've just secured your spot among the first 1000 automation masters to experience RuneFlow.</p>
                    <p>Your <strong>FREE Starter Rune</strong> is attached to this email - the viral ASMR automation template that's taking the internet by storm.</p>
                </div>
                
                <div style="background: rgba(212, 175, 55, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3 style="color: #d4af37;">What's Next?</h3>
                    <ul style="line-height: 1.6;">
                        <li>🔥 <strong>Founding Member Benefits</strong> - Lock in 40% off lifetime pricing</li>
                        <li>⚡ <strong>Launch Day Access</strong> - Get instant access to 4,000+ templates</li>
                        <li>🎯 <strong>Exclusive Updates</strong> - Be the first to know about new releases</li>
                        <li>🧙‍♂️ <strong>Master Community</strong> - Join our Discord for automation wizards</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://runeflow.co" style="background: linear-gradient(135deg, #46b29d 0%, #3a9688 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                        🚀 Secure Your Launch Access
                    </a>
                </div>
                
                <div style="border-top: 1px solid #46b29d; padding-top: 20px; margin-top: 30px; text-align: center; opacity: 0.8;">
                    <p>Built by automation masters, for automation masters</p>
                    <p>© 2025 RuneFlow.co - Forged by WebHalla</p>
                </div>
            </div>
        `
    };
    
    await transporter.sendMail(mailOptions);
}

async function sendAdminNotification(emailEntry) {
    const mailOptions = {
        from: `RuneFlow System <${process.env.FROM_EMAIL || 'bryan@webhalla.com'}>`,
        to: process.env.ADMIN_EMAIL || 'bryan@webhalla.com',
        subject: `🎯 New RuneFlow Signup: ${emailEntry.email}`,
        html: `
            <h2>New Email Captured!</h2>
            <p><strong>Email:</strong> ${emailEntry.email}</p>
            <p><strong>Timestamp:</strong> ${emailEntry.timestamp}</p>
            <p><strong>Referrer:</strong> ${emailEntry.referrer || 'Direct'}</p>
            <p><strong>UTM Source:</strong> ${emailEntry.utm_source || 'None'}</p>
            <p><strong>Total Signups:</strong> ${analyticsData.totalSignups}</p>
            
            <hr>
            <p><strong>User Agent:</strong> ${emailEntry.userAgent}</p>
            <p><strong>IP:</strong> ${emailEntry.ip}</p>
        `
    };
    
    await transporter.sendMail(mailOptions);
}

async function triggerSocialMediaPost(emailEntry) {
    // Trigger social media automation every 10 signups
    if (analyticsData.totalSignups % 10 === 0) {
        try {
            const { exec } = require('child_process');
            exec('node social-media-campaigns/milestone-post.js', (error, stdout, stderr) => {
                if (error) {
                    console.error('Social media automation error:', error);
                } else {
                    console.log('🚀 Social media milestone post triggered');
                }
            });
        } catch (error) {
            console.error('Error triggering social media post:', error);
        }
    }
}

// Load existing data on startup
async function loadExistingData() {
    try {
        const emailsPath = path.join(__dirname, '..', 'data', 'emails.json');
        const analyticsPath = path.join(__dirname, '..', 'data', 'analytics.json');
        
        if (fs.existsSync(emailsPath)) {
            emailList = JSON.parse(await fs.promises.readFile(emailsPath, 'utf8'));
        }
        
        if (fs.existsSync(analyticsPath)) {
            analyticsData = JSON.parse(await fs.promises.readFile(analyticsPath, 'utf8'));
        }
        
        console.log(`📊 Loaded ${emailList.length} existing emails`);
    } catch (error) {
        console.error('Error loading existing data:', error);
    }
}

// Start server
app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 RuneFlow Coming Soon server running on port ${PORT}`);
    console.log(`🌐 Access at: http://localhost:${PORT}`);
    
    await loadExistingData();
    
    // Schedule periodic backups
    setInterval(saveEmailList, 5 * 60 * 1000); // Save every 5 minutes
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🔄 Saving data before shutdown...');
    await saveEmailList();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('🔄 Saving data before shutdown...');
    await saveEmailList();
    process.exit(0);
});
