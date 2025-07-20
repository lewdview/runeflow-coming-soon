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
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Email transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.runeflow.xyz',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER || 'hello@runeflow.xyz',
        pass: process.env.SMTP_PASS || 'your_password'
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

// Email capture endpoint
app.post('/capture-email', async (req, res) => {
    const { email, selected_rune, is_free_pack, referrer, utm_source, utm_medium, utm_campaign } = req.body;
    
    console.log('📧 Email capture attempt:', { email, selected_rune, is_free_pack });
    
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
        selected_rune: selected_rune || null,
        is_free_pack: is_free_pack || false,
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
        await sendWelcomeEmail(email, selected_rune);
        
        // Send notification to admin
        await sendAdminNotification(emailEntry);
        
        // Trigger social media automation
        await triggerSocialMediaPost(emailEntry);
        
        console.log('✅ Email captured successfully:', email);
        
        // Return appropriate download URL based on selected rune
        let downloadUrl = null;
        if (is_free_pack && selected_rune) {
            downloadUrl = `/download/rune/${selected_rune}`;
        } else {
            downloadUrl = '/assets/downloads/starter-rune-template.json';
        }
        
        res.json({
            message: 'Email captured successfully',
            success: true,
            download_url: downloadUrl,
            selected_rune: selected_rune
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

// ==================== COINBASE COMMERCE ENDPOINTS ====================

// Create Coinbase Commerce charge
app.post('/api/coinbase/create-charge', async (req, res) => {
    if (!cryptoPaymentService) {
        return res.status(503).json({
            error: 'Coinbase Commerce service not available',
            success: false
        });
    }

    try {
        const { packageType, userEmail, amount, description } = req.body;
        
        console.log('🏪 Creating Coinbase Commerce charge for:', { packageType, userEmail, amount });
        
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
                created_via: 'coinbase_commerce_api'
            }
        });

        console.log('✅ Coinbase Commerce charge created successfully:', charge.id);
        
        // Store charge for later reference
        emailList.push({
            email: userEmail,
            timestamp: new Date().toISOString(),
            package_type: packageType,
            payment_method: 'coinbase_commerce',
            charge_id: charge.id,
            amount: amount,
            status: 'pending'
        });
        
        // Return charge details to frontend
        res.json({
            success: true,
            charge_id: charge.id,
            checkout_url: charge.hosted_url,
            payment_addresses: charge.addresses,
            pricing: charge.pricing,
            expires_at: charge.expires_at,
            metadata: charge.metadata
        });
        
    } catch (error) {
        console.error('❌ Error creating Coinbase Commerce charge:', error);
        res.status(500).json({
            error: 'Failed to create Coinbase Commerce payment',
            message: error.message,
            success: false
        });
    }
});

// Get Coinbase Commerce payment status
app.get('/api/coinbase/charge/:chargeId', async (req, res) => {
    if (!cryptoPaymentService) {
        return res.status(503).json({
            error: 'Coinbase Commerce service not available',
            success: false
        });
    }

    try {
        const { chargeId } = req.params;
        
        console.log('🔍 Getting Coinbase Commerce charge status for:', chargeId);
        
        const charge = await cryptoPaymentService.getCharge(chargeId);
        
        // Get the latest status from timeline
        const latestStatus = charge.timeline && charge.timeline.length > 0 
            ? charge.timeline[charge.timeline.length - 1].status 
            : 'NEW';
        
        res.json({
            success: true,
            charge_id: charge.id,
            status: latestStatus,
            timeline: charge.timeline,
            pricing: charge.pricing,
            addresses: charge.addresses,
            metadata: charge.metadata,
            hosted_url: charge.hosted_url
        });
        
    } catch (error) {
        console.error('❌ Error getting Coinbase Commerce charge:', error);
        res.status(500).json({
            error: 'Failed to get Coinbase Commerce charge status',
            message: error.message,
            success: false
        });
    }
});

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

// Download endpoint for specific rune ZIP packages
app.get('/download/rune/:runeName', (req, res) => {
    const { runeName } = req.params;
    console.log('📥 Rune download requested:', runeName);
    
    // Validate rune name
    const validRunes = ['flowrune', 'ansuz', 'laguz'];
    if (!validRunes.includes(runeName)) {
        return res.status(404).json({
            error: 'Rune not found',
            success: false
        });
    }
    
    // Define rune file mappings
    const runeFiles = {
        'flowrune': 'FlowRune-Automation-Template.zip',
        'ansuz': 'Ansuz-Messenger-Template.zip',
        'laguz': 'Laguz-Adapter-Template.zip'
    };
    
    const fileName = runeFiles[runeName];
    const filePath = path.join(__dirname, '..', 'assets', 'downloads', fileName);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        console.error('❌ Rune file not found:', filePath);
        return res.status(404).json({
            error: 'Rune file not found',
            success: false
        });
    }
    
    // Set headers for ZIP download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    console.log('✅ Rune ZIP download started:', fileName);
});

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

async function sendWelcomeEmail(email, selectedRune = null) {
    const mailOptions = {
        from: `${process.env.FROM_NAME || 'RuneFlow Team'} <${process.env.FROM_EMAIL || 'hello@runeflow.xyz'}>`,
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
                    <a href="https://runeflow.xyz" style="background: linear-gradient(135deg, #46b29d 0%, #3a9688 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                        🚀 Secure Your Launch Access
                    </a>
                </div>
                
                <div style="border-top: 1px solid #46b29d; padding-top: 20px; margin-top: 30px; text-align: center; opacity: 0.8;">
                    <p>Built by automation masters, for automation masters</p>
                    <p>© 2025 RuneFlow.xyz - A division of WebHalla</p>
                </div>
            </div>
        `
    };
    
    await transporter.sendMail(mailOptions);
}

async function sendAdminNotification(emailEntry) {
    const mailOptions = {
        from: `RuneFlow System <${process.env.FROM_EMAIL || 'hello@runeflow.xyz'}>`,
        to: process.env.ADMIN_EMAIL || 'hello@runeflow.xyz',
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
