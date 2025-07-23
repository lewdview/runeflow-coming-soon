// Netlify Function for Coinbase Commerce Webhook Handler
// Processes payment confirmations and creates user accounts

const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Payment tier configuration (should match frontend)
const PAYMENT_TIERS = {
    'elite': {
        name: 'Elite Access',
        price: 999,
        productId: '7d052c71-c392-4f48-9e48-df68f90b76d1'
    },
    'pro': {
        name: 'Pro Access',
        price: 297,
        productId: '217582f9-25da-472a-9bed-b09e095dcd10'
    },
    'founder': {
        name: 'Founder Access',
        price: 199,
        productId: '52bc5d8a-bc5d-4257-b17c-20f3b21340ed'
    }
};

// User ID generation
function generateUserId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `RF_${timestamp}_${randomStr}`.toUpperCase();
}

// Get tier from product metadata or amount
function getTierFromCharge(charge) {
    // Try to match by product ID first (if stored in metadata)
    if (charge.metadata && charge.metadata.product_id) {
        for (const [tier, data] of Object.entries(PAYMENT_TIERS)) {
            if (data.productId === charge.metadata.product_id) {
                return tier;
            }
        }
    }
    
    // Fallback: match by amount
    const amount = parseFloat(charge.pricing.local.amount);
    for (const [tier, data] of Object.entries(PAYMENT_TIERS)) {
        if (Math.abs(amount - data.price) < 0.01) { // Allow for small floating point differences
            return tier;
        }
    }
    
    return null;
}

// Verify Coinbase webhook signature
function verifyWebhookSignature(body, signature, secret) {
    try {
        const expectedSignature = crypto.createHmac('sha256', secret).update(body, 'utf8').digest('hex');
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    } catch (error) {
        console.error('❌ Signature verification error:', error);
        return false;
    }
}

// Send confirmation email
async function sendConfirmationEmail(userAccount) {
    try {
        // Configure nodemailer
        const transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const emailTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background: #001a33; color: white; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; color: #00ffff; margin-bottom: 30px; }
                .user-id { 
                    background: rgba(0,255,255,0.1); 
                    border: 1px solid #00ffff; 
                    padding: 15px; 
                    border-radius: 8px; 
                    text-align: center; 
                    font-family: 'Courier New', monospace;
                    font-size: 18px;
                    letter-spacing: 1px;
                    margin: 20px 0;
                }
                .features { background: rgba(0,255,255,0.05); padding: 20px; border-radius: 8px; }
                .feature { margin: 10px 0; }
                .footer { text-align: center; margin-top: 30px; color: #80f0ff; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Welcome to RuneFlow.xyz!</h1>
                    <h2>${PAYMENT_TIERS[userAccount.tier].name} Activated</h2>
                </div>
                
                <p>Your payment has been confirmed and your account is now active!</p>
                
                <div class="user-id">
                    <strong>Your User ID:</strong><br>
                    ${userAccount.userId}
                </div>
                
                <p><strong>⚠️ IMPORTANT:</strong> Save your User ID - you'll need it to access your account and downloads.</p>
                
                <div class="features">
                    <h3>Your Access Includes:</h3>
                    ${userAccount.features.map(feature => `<div class="feature">✅ ${feature}</div>`).join('')}
                </div>
                
                <h3>What's Next?</h3>
                <div class="feature">📧 Keep this email for your records</div>
                <div class="feature">🔮 Dashboard access begins in Week 5</div>
                <div class="feature">📥 Download your weekly runes from the website</div>
                <div class="feature">💬 Join our community (link coming soon)</div>
                
                <div class="footer">
                    <p>Questions? Reply to this email or contact hello@runeflow.xyz</p>
                    <p>🧙‍♂️ Built by automation masters, for automation masters</p>
                </div>
            </div>
        </body>
        </html>
        `;

        const mailOptions = {
            from: `"RuneFlow.xyz" <${process.env.FROM_EMAIL}>`,
            to: userAccount.email,
            subject: `🎉 Welcome to RuneFlow.xyz - ${PAYMENT_TIERS[userAccount.tier].name} Activated!`,
            html: emailTemplate
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Confirmation email sent to:', userAccount.email);
        
    } catch (error) {
        console.error('❌ Email sending error:', error);
        // Don't throw - email failure shouldn't block webhook processing
    }
}

// Store user account (in production, this would be a database)
async function storeUserAccount(userAccount) {
    try {
        // TODO: Store in database
        // For now, we'll log it and rely on frontend localStorage
        console.log('💾 User account created:', {
            userId: userAccount.userId,
            tier: userAccount.tier,
            email: userAccount.email,
            amount: userAccount.paymentData.amount
        });
        
        // In production, you would:
        // 1. Store in PostgreSQL/MongoDB
        // 2. Update user permissions
        // 3. Trigger additional workflows
        
        return true;
    } catch (error) {
        console.error('❌ Error storing user account:', error);
        throw error;
    }
}

// Main webhook handler
exports.handler = async (event, context) => {
    console.log('🔔 Coinbase webhook received');
    
    try {
        // Only handle POST requests
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                body: JSON.stringify({ error: 'Method not allowed' })
            };
        }

        // Verify webhook signature
        const signature = event.headers['x-cc-webhook-signature'];
        const webhookSecret = process.env.COINBASE_WEBHOOK_SECRET;
        
        if (!webhookSecret) {
            console.error('❌ COINBASE_WEBHOOK_SECRET not configured');
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Webhook secret not configured' })
            };
        }
        
        if (!signature || !verifyWebhookSignature(event.body, signature, webhookSecret)) {
            console.error('❌ Invalid webhook signature');
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Invalid signature' })
            };
        }

        // Parse webhook payload
        const payload = JSON.parse(event.body);
        console.log('📦 Webhook payload:', JSON.stringify(payload, null, 2));

        // Handle charge:confirmed events
        if (payload.event && payload.event.type === 'charge:confirmed') {
            const charge = payload.event.data;
            
            console.log('💰 Processing confirmed charge:', charge.code);
            
            // Generate user ID
            const userId = generateUserId();
            
            // Determine tier
            const tier = getTierFromCharge(charge);
            if (!tier) {
                console.error('❌ Could not determine tier for charge:', charge.code);
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Could not determine payment tier' })
                };
            }
            
            // Create user account data
            const userAccount = {
                userId: userId,
                tier: tier,
                email: charge.metadata?.email || 'no-email@provided.com',
                createdAt: new Date().toISOString(),
                paymentData: {
                    chargeId: charge.id,
                    chargeCode: charge.code,
                    amount: parseFloat(charge.pricing.local.amount),
                    currency: charge.pricing.local.currency,
                    cryptocurrency: charge.payments[0]?.network || 'unknown',
                    transactionHash: charge.payments[0]?.transaction_id || null,
                    paidAt: charge.confirmed_at
                },
                status: 'active',
                accessLevel: tier === 'elite' ? 'lifetime' : 'annual',
                features: PAYMENT_TIERS[tier].features || []
            };
            
            // Store user account
            await storeUserAccount(userAccount);
            
            // Send confirmation email
            await sendConfirmationEmail(userAccount);
            
            console.log('✅ Payment processed successfully:', userId);
            
            return {
                statusCode: 200,
                body: JSON.stringify({
                    success: true,
                    userId: userId,
                    tier: tier,
                    message: 'Payment processed successfully'
                })
            };
        }
        
        // Handle other webhook events
        console.log('ℹ️ Unhandled webhook event:', payload.event?.type);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Webhook received' })
        };
        
    } catch (error) {
        console.error('❌ Webhook processing error:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Webhook processing failed',
                message: error.message
            })
        };
    }
};
