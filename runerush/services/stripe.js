const Stripe = require('stripe');
const db = require('../database/db');
const { generateLicenseKey } = require('../utils/helpers');
const emailService = require('./email');

class StripeService {
    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        
        // Actual price IDs from your Stripe account
        this.prices = {
            core: 'price_1RpoLwG1VJxSkYsRLCQCPByT',              // $49 - RuneRUSH 50 CORE n8n premium templates
            complete_collection: 'price_1RpoRnG1VJxSkYsR6zllfJCs', // $88 - RuneRUSH Complete - 100 Premium n8n Templates  
            pro_upgrade: 'price_1RpoOsG1VJxSkYsR2elpDJl7',        // $39 - RuneRUSH PRO - 50 Additional Advanced Templates
            pro_limited: 'price_1RqmK7G1VJxSkYsRrJs7pUI3',        // $60 - RuneRUSH PRO Limited
            runeflow_collection: 'price_1RqGCFG1VJxSkYsRlIH2XISe'  // $499 - RuneFlow n8n template collection (8100+)
        };
    }

    /**
     * Create Stripe Checkout session for any product
     */
    async createCheckoutSession(productType, customerData, successUrl, cancelUrl) {
        try {
            const { email, first_name, last_name } = customerData;
            const customerName = `${first_name} ${last_name}`.trim();
            
            // Use existing price IDs from your Stripe account
            let priceId;
            
            switch (productType) {
                case 'core':
                    priceId = this.prices.core;
                    break;
                case 'complete_bundle':
                case 'complete_collection':
                    priceId = this.prices.complete_collection;
                    break;
                case 'pro_upgrade':
                    priceId = this.prices.pro_upgrade;
                    break;
                case 'pro_limited':
                    priceId = this.prices.pro_limited;
                    break;
                case 'runeflow_collection':
                    priceId = this.prices.runeflow_collection;
                    break;
                default:
                    throw new Error(`Invalid product type: ${productType}`);
            }
            
            const lineItems = [{
                price: priceId,
                quantity: 1,
            }];

            const session = await this.stripe.checkout.sessions.create({
                payment_method_types: [
                    'card',
                    'klarna',
                    'afterpay_clearpay',
                    'affirm',
                    'bancontact',
                    'ideal',
                    'sofort',
                    'p24',
                    'giropay',
                    'eps',
                    'grabpay',
                    'wechat_pay',
                    'alipay'
                ],
                line_items: lineItems,
                mode: 'payment',
                success_url: successUrl,
                cancel_url: cancelUrl,
                customer_email: email,
                metadata: {
                    product_type: productType,
                    customer_email: email,
                    customer_name: customerName
                },
                billing_address_collection: 'auto',
                automatic_tax: {
                    enabled: true,
                },
                // shipping_address_collection removed for digital products
                allow_promotion_codes: true, // Allow discount codes
                invoice_creation: {
                    enabled: true,
                },
                payment_intent_data: {
                    setup_future_usage: 'off_session', // For future payments
                },
            });

            return {
                session_id: session.id,
                url: session.url
            };
        } catch (error) {
            console.error('Stripe checkout session creation failed:', error);
            throw new Error('Checkout initialization failed');
        }
    }

    /**
     * Create payment intent for main product ($49) - Legacy method
     */
    async createMainProductPayment(customerData) {
        try {
            const { email, first_name, last_name } = customerData;

            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: 4900, // $49.00 in cents
                currency: 'usd',
                metadata: {
                    product_type: 'core',
                    customer_email: email,
                    customer_name: `${first_name} ${last_name}`.trim()
                },
                receipt_email: email,
                description: 'RuneRUSH Core Bundle - 50 Premium n8n Templates'
            });

            return {
                client_secret: paymentIntent.client_secret,
                payment_intent_id: paymentIntent.id
            };
        } catch (error) {
            console.error('Stripe payment creation failed:', error);
            throw new Error('Payment initialization failed');
        }
    }

    /**
     * Create payment intent for upsell ($497)
     */
    async createUpsellPayment(customerData) {
        try {
            const { email, first_name, last_name, user_id } = customerData;

            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: 49700, // $497.00 in cents
                currency: 'usd',
                metadata: {
                    product_type: 'upsell',
                    customer_email: email,
                    customer_name: `${first_name} ${last_name}`.trim(),
                    user_id: user_id.toString()
                },
                receipt_email: email,
                description: 'Rune Rush - Lifetime Vault Access'
            });

            return {
                client_secret: paymentIntent.client_secret,
                payment_intent_id: paymentIntent.id
            };
        } catch (error) {
            console.error('Stripe upsell payment creation failed:', error);
            throw new Error('Upsell payment initialization failed');
        }
    }

    /**
     * Handle Stripe webhooks
     */
    async handleWebhook(payload, signature) {
        let event;

        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
        } catch (error) {
            console.error('Webhook signature verification failed:', error);
            throw new Error('Invalid webhook signature');
        }

        console.log(`Processing Stripe webhook: ${event.type}`);

        switch (event.type) {
            case 'checkout.session.completed':
                await this.handleCheckoutSessionCompleted(event.data.object);
                break;
            case 'payment_intent.succeeded':
                await this.handlePaymentSuccess(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await this.handlePaymentFailed(event.data.object);
                break;
            case 'charge.dispute.created':
                await this.handleChargeback(event.data.object);
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return { received: true };
    }

    /**
     * Handle successful checkout session completion
     */
    async handleCheckoutSessionCompleted(session) {
        try {
            console.log('Processing checkout session:', session.id);
            
            // Retrieve the session with expanded line items to get product metadata
            const sessionWithLineItems = await this.stripe.checkout.sessions.retrieve(
                session.id,
                { expand: ['line_items.data.price.product', 'customer'] }
            );

            console.log('Session details:', {
                session_id: sessionWithLineItems.id,
                customer_email: sessionWithLineItems.customer_details?.email || sessionWithLineItems.customer?.email,
                payment_status: sessionWithLineItems.payment_status,
                line_items_count: sessionWithLineItems.line_items.data.length
            });

            const lineItems = sessionWithLineItems.line_items.data;
            if (lineItems.length === 0) {
                throw new Error('No line items found in checkout session');
            }

            const product = lineItems[0].price.product;
            console.log('Product metadata:', product.metadata);
            
            // Try to get product_type from multiple sources
            let product_type = product.metadata?.product_type || 
                              sessionWithLineItems.metadata?.product_type;
            
            // If still no product_type, try to infer from product name or ID
            if (!product_type) {
                const productName = product.name?.toLowerCase() || '';
                if (productName.includes('core')) product_type = 'core';
                else if (productName.includes('pro bundle')) product_type = 'pro_bundle';
                else if (productName.includes('complete')) product_type = 'complete_collection';
                else if (productName.includes('upgrade')) product_type = 'pro_upgrade';
            }

            if (!product_type) {
                console.error('No product_type found. Product:', product);
                throw new Error(`Product ${product.id} is missing 'product_type' metadata and cannot be inferred.`);
            }

            // Get customer info from multiple possible sources
            const customer_email = sessionWithLineItems.customer_details?.email || 
                                 sessionWithLineItems.customer?.email ||
                                 sessionWithLineItems.metadata?.customer_email;
            
            const customer_name = sessionWithLineItems.customer_details?.name || 
                                sessionWithLineItems.customer?.name ||
                                sessionWithLineItems.metadata?.customer_name ||
                                'Customer';

            if (!customer_email) {
                throw new Error('No customer email found in session');
            }

            console.log(`Processing order for ${customer_email} - ${product_type}`);

            // Process the order
            await this.processSuccessfulOrder({
                payment_id: session.id,
                amount: sessionWithLineItems.amount_total,
                customer_email,
                customer_name,
                product_type,
                payment_method: 'stripe_payment_link'
            });

            console.log(`✅ Payment link checkout completed for ${customer_email} - ${product_type}`);

            // Get the user's license key for email notification
            const user = await db.getUserByEmail(customer_email);
            if (!user) {
                throw new Error('User not found after successful order processing');
            }

            // Send success email with download link
            const downloadUrl = `${process.env.FRONTEND_URL || 'https://yourdomain.com'}/downloads?key=${user.license_key}`;
            console.log(`Download URL for ${customer_email}: ${downloadUrl}`);
            
            // Note: You might want to send this via email rather than relying on redirect
            // since Payment Links handle their own redirect flow
        } catch (error) {
            console.error('Checkout session completion handling failed:', error);
            throw error;
        }
    }

    /**
     * Process successful payment
     */
    async handlePaymentSuccess(paymentIntent) {
        try {
            const { id, amount, metadata } = paymentIntent;
            const { product_type, customer_email, customer_name } = metadata;

            await this.processSuccessfulOrder({
                payment_id: id,
                amount,
                customer_email,
                customer_name,
                product_type,
                payment_method: 'stripe_intent'
            });

            console.log(`✅ Payment intent processed successfully for ${customer_email} - ${product_type}`);
        } catch (error) {
            console.error('Payment success handling failed:', error);
            throw error;
        }
    }

    /**
     * Common order processing logic
     */
    async processSuccessfulOrder(orderData) {
        const { payment_id, amount, customer_email, customer_name, product_type, payment_method } = orderData;
        
        try {
            let user;
            const existingUser = await db.getUserByEmail(customer_email);

            if (existingUser) {
                user = existingUser;
                // Update to lifetime if upsell, pro_bundle, or complete_collection
                if (product_type === 'upsell' || product_type === 'pro_bundle' || product_type === 'complete_collection') {
                    await db.run('UPDATE users SET is_lifetime = TRUE WHERE id = ?', [user.id]);
                    user.is_lifetime = true;
                }
            } else {
                // Create new user
                const licenseKey = generateLicenseKey();
                const [first_name, ...lastNameParts] = customer_name.split(' ');
                const last_name = lastNameParts.join(' ');

                const result = await db.createUser({
                    email: customer_email,
                    license_key: licenseKey,
                    first_name,
                    last_name,
                    is_lifetime: (product_type === 'upsell' || product_type === 'pro_bundle' || product_type === 'complete_collection') ? true : false
                });

                user = await db.getUserByEmail(customer_email);
            }

            // Create order record
            await db.createOrder({
                user_id: user.id,
                stripe_payment_intent_id: payment_id,
                paypal_payment_id: null,
                amount,
                currency: 'usd',
                product_type,
                status: 'completed'
            });

            // Send welcome email with download links
            await emailService.sendWelcomeEmail(user, product_type);

            // Schedule follow-up emails
            await this.scheduleFollowUpEmails(user, product_type);

            // Log analytics
            await db.logAnalytics({
                event_type: 'purchase',
                user_id: user.id,
                metadata: { product_type, amount, payment_method },
                ip_address: null,
                user_agent: null,
                referrer: null
            });

            console.log(`✅ Order processed successfully for ${customer_email} - ${product_type}`);

        } catch (error) {
            console.error('Order processing failed:', error);
            throw error;
        }
    }

    /**
     * Handle failed payment
     */
    async handlePaymentFailed(paymentIntent) {
        try {
            const { id, metadata } = paymentIntent;
            
            // Update order status if exists
            const order = await db.getOrderByPaymentId(id);
            if (order) {
                await db.updateOrderStatus(order.id, 'failed');
            }

            console.log(`❌ Payment failed for payment intent: ${id}`);
        } catch (error) {
            console.error('Payment failure handling failed:', error);
        }
    }

    /**
     * Handle chargeback
     */
    async handleChargeback(charge) {
        try {
            const paymentIntentId = charge.payment_intent;
            const order = await db.getOrderByPaymentId(paymentIntentId);
            
            if (order) {
                await db.updateOrderStatus(order.id, 'disputed');
                
                // Log for manual review
                console.log(`🚨 Chargeback received for order ${order.id}`);
                
                // Could send alert email to admin here
            }
        } catch (error) {
            console.error('Chargeback handling failed:', error);
        }
    }

    /**
     * Schedule follow-up email sequences
     */
    async scheduleFollowUpEmails(user, product_type) {
        try {
            const now = new Date();

            if (product_type === 'main') {
                // Schedule upsell email immediately after purchase
                await db.scheduleEmail({
                    user_id: user.id,
                    sequence_type: 'upsell',
                    email_subject: '🚀 EXCLUSIVE: Upgrade to Lifetime Vault Access (24hrs only)',
                    email_template: 'upsell_offer',
                    scheduled_at: new Date(now.getTime() + 5 * 60 * 1000) // 5 minutes after purchase
                });

                // Schedule 3-day follow-up
                await db.scheduleEmail({
                    user_id: user.id,
                    sequence_type: 'follow_up',
                    email_subject: 'How are your n8n automations going?',
                    email_template: 'follow_up_day_3',
                    scheduled_at: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
                });
            }

            // Schedule lifetime welcome series for upsell customers
            if (product_type === 'upsell') {
                await db.scheduleEmail({
                    user_id: user.id,
                    sequence_type: 'welcome',
                    email_subject: 'Welcome to the Lifetime Vault! 🎉',
                    email_template: 'lifetime_welcome',
                    scheduled_at: new Date(now.getTime() + 10 * 60 * 1000) // 10 minutes after
                });
            }

        } catch (error) {
            console.error('Email scheduling failed:', error);
        }
    }

    /**
     * Create refund
     */
    async createRefund(paymentIntentId, amount, reason = 'requested_by_customer') {
        try {
            const refund = await this.stripe.refunds.create({
                payment_intent: paymentIntentId,
                amount, // optional, full refund if omitted
                reason
            });

            // Update order status
            const order = await db.getOrderByPaymentId(paymentIntentId);
            if (order) {
                await db.updateOrderStatus(order.id, 'refunded');
                
                // Create refund record
                await db.run(`
                    INSERT INTO refunds (order_id, stripe_refund_id, amount, reason, status)
                    VALUES (?, ?, ?, ?, 'completed')
                `, [order.id, refund.id, refund.amount, reason]);
            }

            return refund;
        } catch (error) {
            console.error('Refund creation failed:', error);
            throw error;
        }
    }

    /**
     * Get payment details
     */
    async getPaymentDetails(paymentIntentId) {
        try {
            return await this.stripe.paymentIntents.retrieve(paymentIntentId);
        } catch (error) {
            console.error('Failed to retrieve payment details:', error);
            throw error;
        }
    }
}

module.exports = new StripeService();
