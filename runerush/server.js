// Load environment variables from .env.local in development
const dotenv = require('dotenv');
const path = require('path');

const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
dotenv.config({ path: path.resolve(__dirname, envFile) });

console.log(`🔧 Environment loaded from: ${envFile}`);
console.log(`📍 Port configured: ${process.env.PORT || 8080}`);

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cron = require('node-cron');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { body, validationResult } = require('express-validator');

// Services
const db = require('./database/db');
const stripeService = require('./services/stripe');
const s3Service = require('./services/s3');
const emailService = require('./services/email');

// Utils
const { 
    getClientIP, 
    isValidEmail, 
    createApiResponse, 
    generateLicenseKey,
    verifyJWT,
    generateJWT 
} = require('./utils/helpers');

const app = express();
const PORT = process.env.PORT || 8080;

// Rate limiting
const rateLimiter = new RateLimiterMemory({
    keyGenerator: (req) => getClientIP(req),
    points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    duration: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60, // 15 minutes
});

// Rate limiting middleware
const rateLimitMiddleware = async (req, res, next) => {
    try {
        await rateLimiter.consume(getClientIP(req));
        next();
    } catch (rateLimiterRes) {
        res.status(429).json(createApiResponse(
            false, 
            null, 
            'Too many requests, please try again later'
        ));
    }
};

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.tailwindcss.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://js.stripe.com"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'", "https://api.stripe.com"]
        }
    }
}));

app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

app.use(morgan('combined'));

// Stripe webhook handler (must be before express.json middleware)
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const signature = req.headers['stripe-signature'];
        await stripeService.handleWebhook(req.body, signature);
        res.json({ received: true });
    } catch (error) {
        console.error('Stripe webhook error:', error);
        res.status(400).json({ error: 'Webhook error' });
    }
});

// JSON parsing middleware (after webhook handler)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to API routes
app.use('/api', rateLimitMiddleware);

// Serve static files for RuneRush app at /runerush/
app.use('/runerush', express.static(path.join(__dirname)));

// Serve root static files (vault page)
app.use(express.static(path.join(__dirname, '..')));

// =============================================================================
// DAILY TEMPLATE ROUTES
// =============================================================================

// Mount daily template routes
const dailyTemplateRoutes = require('./routes/dailyTemplates');
app.use('/', dailyTemplateRoutes);

// =============================================================================
// API ROUTES
// =============================================================================

// Health check
app.get('/api/health', (req, res) => {
    res.json(createApiResponse(true, { status: 'healthy', timestamp: new Date().toISOString() }));
});

// =============================================================================
// PAYMENT ROUTES
// =============================================================================

// Create Stripe Checkout session for any product
app.post('/api/payments/stripe/create-checkout', [
    body('email').isEmail().normalizeEmail(),
    body('first_name').trim().isLength({ min: 1 }),
    body('last_name').trim().isLength({ min: 1 }),
    body('product_type').isIn(['core', 'pro_bundle', 'pro_upgrade', 'complete_collection']),
    body('success_url').isURL(),
    body('cancel_url').isURL()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(createApiResponse(
                false, null, 'Validation error', errors.array()
            ));
        }

        const { email, first_name, last_name, product_type, success_url, cancel_url } = req.body;
        
        const checkoutSession = await stripeService.createCheckoutSession(
            product_type,
            { email, first_name, last_name },
            success_url,
            cancel_url
        );

        // Log analytics
        await db.logAnalytics({
            event_type: 'checkout_initiated',
            user_id: null,
            metadata: { product_type, payment_method: 'stripe_checkout' },
            ip_address: getClientIP(req),
            user_agent: req.get('User-Agent'),
            referrer: req.get('Referer')
        });

        res.json(createApiResponse(true, checkoutSession, 'Checkout session created successfully'));

    } catch (error) {
        console.error('Checkout session creation failed:', error);
        res.status(500).json(createApiResponse(
            false, null, 'Failed to create checkout session'
        ));
    }
});

// Create Stripe payment intent for main product (Legacy)
app.post('/api/payments/stripe/create-intent', [
    body('email').isEmail().normalizeEmail(),
    body('first_name').trim().isLength({ min: 1 }),
    body('last_name').trim().isLength({ min: 1 })
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(createApiResponse(
                false, null, 'Validation error', errors.array()
            ));
        }

        const { email, first_name, last_name } = req.body;
        
        const paymentIntent = await stripeService.createMainProductPayment({
            email,
            first_name,
            last_name
        });

        // Log analytics
        await db.logAnalytics({
            event_type: 'payment_initiated',
            user_id: null,
            metadata: { product_type: 'core', payment_method: 'stripe' },
            ip_address: getClientIP(req),
            user_agent: req.get('User-Agent'),
            referrer: req.get('Referer')
        });

        res.json(createApiResponse(true, paymentIntent, 'Payment intent created successfully'));

    } catch (error) {
        console.error('Payment intent creation failed:', error);
        res.status(500).json(createApiResponse(
            false, null, 'Failed to create payment intent'
        ));
    }
});

// Create Stripe payment intent for upsell
app.post('/api/payments/stripe/create-upsell-intent', [
    body('user_license_key').matches(/^RR-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/)
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(createApiResponse(
                false, null, 'Invalid license key format', errors.array()
            ));
        }

        const { user_license_key } = req.body;
        
        const user = await db.getUserByLicenseKey(user_license_key);
        if (!user) {
            return res.status(404).json(createApiResponse(
                false, null, 'User not found'
            ));
        }

        if (user.is_lifetime) {
            return res.status(400).json(createApiResponse(
                false, null, 'User already has lifetime access'
            ));
        }

        const paymentIntent = await stripeService.createUpsellPayment({
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            user_id: user.id
        });

        // Log analytics
        await db.logAnalytics({
            event_type: 'upsell_initiated',
            user_id: user.id,
            metadata: { product_type: 'upsell', payment_method: 'stripe' },
            ip_address: getClientIP(req),
            user_agent: req.get('User-Agent'),
            referrer: req.get('Referer')
        });

        res.json(createApiResponse(true, paymentIntent, 'Upsell payment intent created successfully'));

    } catch (error) {
        console.error('Upsell payment intent creation failed:', error);
        res.status(500).json(createApiResponse(
            false, null, 'Failed to create upsell payment intent'
        ));
    }
});


// =============================================================================
// DOWNLOAD ROUTES
// =============================================================================

// Get user's downloadable files
app.get('/api/downloads', async (req, res) => {
    try {
        const { license_key } = req.query;
        
        if (!license_key) {
            return res.status(400).json(createApiResponse(
                false, null, 'License key is required'
            ));
        }

        const user = await db.getUserByLicenseKey(license_key);
        if (!user) {
            return res.status(404).json(createApiResponse(
                false, null, 'Invalid license key'
            ));
        }

        const files = await s3Service.getUserDownloadableFiles(
            user.id,
            getClientIP(req),
            req.get('User-Agent')
        );

        // Log analytics
        await db.logAnalytics({
            event_type: 'download_page_view',
            user_id: user.id,
            metadata: { files_count: files.length },
            ip_address: getClientIP(req),
            user_agent: req.get('User-Agent'),
            referrer: req.get('Referer')
        });

        res.json(createApiResponse(true, { files, user: {
            email: user.email,
            first_name: user.first_name,
            is_lifetime: user.is_lifetime
        }}, 'Files retrieved successfully'));

    } catch (error) {
        console.error('Download retrieval failed:', error);
        
        if (error.message.includes('Download limit exceeded')) {
            return res.status(429).json(createApiResponse(
                false, null, error.message
            ));
        }

        res.status(500).json(createApiResponse(
            false, null, 'Failed to retrieve downloads'
        ));
    }
});

// Process download with token
app.get('/api/download/:token', async (req, res) => {
    try {
        const { token } = req.params;
        
        const downloadData = await s3Service.validateAndGenerateDownload(token);
        
        // Log download
        await db.logAnalytics({
            event_type: 'download',
            user_id: downloadData.user_id,
            metadata: { file_path: downloadData.file_path },
            ip_address: getClientIP(req),
            user_agent: req.get('User-Agent'),
            referrer: req.get('Referer')
        });

        // Redirect to signed URL
        res.redirect(downloadData.signed_url);

    } catch (error) {
        console.error('Download processing failed:', error);
        res.status(400).json(createApiResponse(
            false, null, error.message
        ));
    }
});

// =============================================================================
// CONTACT ROUTES
// =============================================================================

// Handle contact form submissions
app.post('/api/contact', [
    body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('subject').trim().isLength({ min: 1 }).withMessage('Subject is required'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
    body('category').isIn(['questions', 'support', 'partners']).withMessage('Valid category is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json(createApiResponse(
                false, null, 'Validation error', errors.array()
            ));
        }

        const { name, email, subject, message, category } = req.body;
        const ip_address = getClientIP(req);
        const user_agent = req.get('User-Agent');
        
        // Store contact submission in database
        const contactId = await db.createContactSubmission({
            name,
            email,
            subject,
            message,
            category,
            ip_address,
            user_agent,
            referrer: req.get('Referer')
        });

        // Send notification email to admin
        await emailService.sendContactNotification({
            name,
            email,
            subject,
            message,
            category,
            contactId
        });

        // Send auto-reply to user
        await emailService.sendContactAutoReply({
            name,
            email,
            category
        });

        // Log analytics
        await db.logAnalytics({
            event_type: 'contact_form_submitted',
            user_id: null,
            metadata: { category, subject_length: subject.length, message_length: message.length },
            ip_address,
            user_agent,
            referrer: req.get('Referer')
        });

        res.json(createApiResponse(
            true, 
            { contactId }, 
            'Thank you for your message! We\'ll get back to you soon.'
        ));

    } catch (error) {
        console.error('Contact form submission failed:', error);
        res.status(500).json(createApiResponse(
            false, null, 'Failed to send message. Please try again later.'
        ));
    }
});

// =============================================================================
// USER ROUTES
// =============================================================================

// Get user info by Stripe session ID
app.get('/api/session/:session_id', async (req, res) => {
    try {
        const { session_id } = req.params;
        
        // Get session from Stripe
        const session = await stripeService.stripe.checkout.sessions.retrieve(session_id);
        
        if (!session || session.payment_status !== 'paid') {
            return res.status(404).json(createApiResponse(
                false, null, 'Session not found or payment not completed'
            ));
        }
        
        // Find user by email
        const user = await db.getUserByEmail(session.customer_details?.email);
        
        if (!user) {
            return res.status(404).json(createApiResponse(
                false, null, 'User not found - please check your email for the download link'
            ));
        }
        
        // Return user data with license key
        const userData = {
            license_key: user.license_key,
            email: user.email,
            first_name: user.first_name,
            is_lifetime: user.is_lifetime
        };
        
        res.json(createApiResponse(true, userData, 'Session data retrieved successfully'));
        
    } catch (error) {
        console.error('Session lookup failed:', error);
        res.status(500).json(createApiResponse(
            false, null, 'Failed to retrieve session data'
        ));
    }
});

// Get user info by license key
app.get('/api/user/:license_key', async (req, res) => {
    try {
        const { license_key } = req.params;
        
        const user = await db.getUserByLicenseKey(license_key);
        if (!user) {
            return res.status(404).json(createApiResponse(
                false, null, 'User not found'
            ));
        }

        // Return safe user data
        const userData = {
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            is_lifetime: user.is_lifetime,
            created_at: user.created_at
        };

        res.json(createApiResponse(true, userData, 'User retrieved successfully'));

    } catch (error) {
        console.error('User retrieval failed:', error);
        res.status(500).json(createApiResponse(
            false, null, 'Failed to retrieve user'
        ));
    }
});

// =============================================================================
// ANALYTICS ROUTES
// =============================================================================

// Track page view
app.post('/api/analytics/pageview', [
    body('page').trim().isLength({ min: 1 }),
    body('license_key').optional().matches(/^RR-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/)
], async (req, res) => {
    try {
        const { page, license_key, metadata = {} } = req.body;
        
        let user_id = null;
        if (license_key) {
            const user = await db.getUserByLicenseKey(license_key);
            if (user) user_id = user.id;
        }

        await db.logAnalytics({
            event_type: 'page_view',
            user_id,
            metadata: { page, ...metadata },
            ip_address: getClientIP(req),
            user_agent: req.get('User-Agent'),
            referrer: req.get('Referer')
        });

        res.json(createApiResponse(true, null, 'Analytics recorded'));

    } catch (error) {
        console.error('Analytics recording failed:', error);
        res.status(200).json(createApiResponse(true, null, 'Analytics ignored')); // Don't fail the request
    }
});

// =============================================================================
// TEST ROUTES (Development)
// =============================================================================

// Test download system
app.get('/api/test/downloads', async (req, res) => {
    try {
        // Get all files from database
        const files = await db.query('SELECT * FROM files WHERE is_active = TRUE');
        
        // Get sample user
        const users = await db.query('SELECT * FROM users LIMIT 1');
        
        res.json({
            success: true,
            data: {
                files_in_database: files.length,
                files: files,
                sample_user: users[0] || null,
                s3_config: {
                    bucket: process.env.S3_BUCKET_NAME ? '✅ Set' : '❌ Missing',
                    access_key: process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing',
                    secret_key: process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing',
                    region: process.env.AWS_REGION || 'us-east-1'
                }
            }
        });
    } catch (error) {
        console.error('Test route error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =============================================================================
// ADMIN ROUTES (Protected)
// =============================================================================

// Simple admin authentication middleware
const adminAuth = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json(createApiResponse(false, null, 'Authentication required'));
    }

    const payload = verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
        return res.status(403).json(createApiResponse(false, null, 'Admin access required'));
    }

    req.admin = payload;
    next();
};

// Admin login
app.post('/api/admin/login', [
    body('password').isLength({ min: 8 })
], async (req, res) => {
    try {
        const { password } = req.body;
        
        // Simple password check - you should use environment variable
        const adminPassword = process.env.ADMIN_PASSWORD || 'RuneRush2024!';
        
        if (password !== adminPassword) {
            return res.status(401).json(createApiResponse(
                false, null, 'Invalid credentials'
            ));
        }

        const token = generateJWT({ role: 'admin' }, '24h');
        
        res.json(createApiResponse(true, { token }, 'Login successful'));

    } catch (error) {
        console.error('Admin login failed:', error);
        res.status(500).json(createApiResponse(
            false, null, 'Login failed'
        ));
    }
});

// Get analytics dashboard data
app.get('/api/admin/analytics', adminAuth, async (req, res) => {
    try {
        const { days = 30 } = req.query;
        
        const [revenueStats, conversionStats] = await Promise.all([
            db.getRevenueStats(days),
            db.getConversionStats(days)
        ]);

        // Get user counts
        const userCounts = await db.query(`
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN is_lifetime = TRUE THEN 1 ELSE 0 END) as lifetime_users
            FROM users
        `);

        // Get recent orders
        const recentOrders = await db.query(`
            SELECT 
                o.id, o.amount, o.currency, o.product_type, o.status, o.created_at,
                u.email, u.first_name, u.last_name
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
            LIMIT 10
        `);

        const dashboardData = {
            revenue_stats: revenueStats,
            conversion_stats: conversionStats,
            user_counts: userCounts[0],
            recent_orders: recentOrders
        };

        res.json(createApiResponse(true, dashboardData, 'Analytics retrieved successfully'));

    } catch (error) {
        console.error('Analytics retrieval failed:', error);
        res.status(500).json(createApiResponse(
            false, null, 'Failed to retrieve analytics'
        ));
    }
});

// Get all users (paginated)
app.get('/api/admin/users', adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;
        const offset = (page - 1) * limit;

        let whereClause = '';
        let params = [];
        
        if (search) {
            whereClause = 'WHERE email LIKE ? OR first_name LIKE ? OR last_name LIKE ?';
            params = [`%${search}%`, `%${search}%`, `%${search}%`];
        }

        const users = await db.query(`
            SELECT 
                id, email, first_name, last_name, license_key, is_lifetime, created_at
            FROM users 
            ${whereClause}
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `, [...params, parseInt(limit), parseInt(offset)]);

        const [{ count: totalUsers }] = await db.query(`
            SELECT COUNT(*) as count FROM users ${whereClause}
        `, params);

        res.json(createApiResponse(true, {
            users,
            pagination: {
                current_page: parseInt(page),
                per_page: parseInt(limit),
                total: totalUsers,
                total_pages: Math.ceil(totalUsers / limit)
            }
        }, 'Users retrieved successfully'));

    } catch (error) {
        console.error('Users retrieval failed:', error);
        res.status(500).json(createApiResponse(
            false, null, 'Failed to retrieve users'
        ));
    }
});

// =============================================================================
// FRONTEND ROUTES
// =============================================================================

// Serve vault page at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Serve RuneRush app at /runerush/
app.get('/runerush/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Upsell page
app.get('/upsell', (req, res) => {
    // For now, redirect to main page with upsell parameter
    // You can create a separate upsell.html file
    res.redirect(`/?upsell=true&user=${req.query.user || ''}`);
});

// Download page
app.get('/downloads', (req, res) => {
    res.sendFile(path.join(__dirname, 'downloads.html'));
});

// Success page
app.get('/runerush/success.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'success.html'));
});

// Success redirect route - handles post-purchase redirects
// NOTE: Currently unused - Stripe redirects directly to /runerush/success.html
// Uncomment and use this route if you want server-side payment validation before showing success
/*
app.get('/success', async (req, res) => {
    try {
        const { session_id, product_type } = req.query;
        
        if (!session_id) {
            return res.redirect('/runerush/purchase.html?error=missing_session');
        }
        
        // Verify the session with Stripe
        let session;
        try {
            session = await stripeService.stripe.checkout.sessions.retrieve(session_id);
            console.log('✅ Retrieved Stripe session:', session_id, 'Status:', session.payment_status);
        } catch (stripeError) {
            console.error('❌ Failed to retrieve Stripe session:', session_id, stripeError.message);
            return res.redirect('/runerush/purchase.html?error=stripe_session_failed');
        }
        
        if (session.payment_status !== 'paid') {
            console.warn('⚠️ Session payment status not paid:', session.payment_status);
            return res.redirect('/runerush/purchase.html?error=payment_incomplete');
        }
        
        // Get user by email from session, create if not found
        let user = await db.getUserByEmail(session.customer_details.email);
        
        if (!user) {
            // Create new user from Stripe session data
            const licenseKey = generateLicenseKey();
            const userData = {
                email: session.customer_details.email,
                first_name: session.customer_details.name?.split(' ')[0] || 'Customer',
                last_name: session.customer_details.name?.split(' ').slice(1).join(' ') || '',
                license_key: licenseKey,
                product_type: product_type || session.metadata?.product_type || 'core',
                payment_method: 'stripe',
                amount: session.amount_total / 100, // Convert from cents
                currency: session.currency?.toUpperCase() || 'USD'
            };
            
            try {
                user = await db.createUser(userData);
                console.log('✅ Created new user from Stripe session:', user.email);
                
                // Also create an order record
                const orderData = {
                    user_id: user.id,
                    amount: session.amount_total / 100, // Convert from cents
                    currency: session.currency?.toUpperCase() || 'USD',
                    product_type: product_type || session.metadata?.product_type || 'core',
                    stripe_payment_intent_id: session.payment_intent,
                    status: 'completed'
                };
                
                await db.createOrder(orderData);
                console.log('✅ Created order record for user:', user.email);
                
                // Send welcome email with download links
                try {
                    await emailService.sendWelcomeEmail(user, product_type || session.metadata?.product_type || 'core');
                    console.log('✅ Welcome email sent to:', user.email);
                } catch (emailError) {
                    console.error('❌ Failed to send welcome email:', emailError);
                    // Don't fail the purchase flow if email fails
                }
                
            } catch (createError) {
                console.error('❌ Failed to create user/order:', createError);
                return res.redirect('/runerush/purchase.html?error=user_creation_failed');
            }
        }
        
        // Show success page with purchase details instead of immediate redirect
        const successUrl = `/runerush/success.html?session_id=${session_id}&product_type=${product_type || session.metadata?.product_type || 'core'}&license_key=${user.license_key}`;
        
        // Log successful purchase completion
        console.log('✅ Purchase completed successfully for:', user.email, 'Product:', product_type || session.metadata?.product_type || 'core');
        
        // Always show success page first - user can access downloads from there or via email
        return res.redirect(successUrl);
        
    } catch (error) {
        console.error('Success redirect error:', error);
        res.redirect('/runerush/purchase.html?error=redirect_failed');
    }
});
*/

// =============================================================================
// ERROR HANDLING
// =============================================================================

// 404 handler
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json(createApiResponse(false, null, 'API endpoint not found'));
    } else {
        res.status(404).sendFile(path.join(__dirname, '404.html'), (err) => {
            if (err) {
                res.status(404).send('Page not found');
            }
        });
    }
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    
    if (req.path.startsWith('/api/')) {
        res.status(500).json(createApiResponse(
            false, null, 'Internal server error'
        ));
    } else {
        res.status(500).send('Something went wrong!');
    }
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

async function startServer() {
    try {
        // Connect to database
        await db.connect();
        console.log('✅ Database connected');

        // Run migrations
        await db.migrate();
        console.log('✅ Database migrations completed');

        // Start background jobs after database is ready
        console.log('🔄 Starting background jobs...');
        
        // Process scheduled emails every minute
        cron.schedule('* * * * *', async () => {
            try {
                await emailService.processScheduledEmails();
            } catch (error) {
                console.error('Failed to process scheduled emails:', error);
            }
        });
        
        console.log('✅ Background jobs started');

        // Start server
        const HOST = process.env.HOST || '0.0.0.0';
        app.listen(PORT, HOST, () => {
            console.log(`
🚀 Rune Rush Backend Server Started!

📍 Server: http://${HOST}:${PORT}
🎯 Environment: ${process.env.NODE_ENV || 'development'}
📊 Database: ${process.env.DATABASE_URL || 'SQLite (default)'}

🔥 Ready to process payments and deliver digital products!
            `);
        });

    } catch (error) {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully...');
    await db.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully...');
    await db.close();
    process.exit(0);
});

// Start the server
if (require.main === module) {
    startServer();
}

module.exports = app;
