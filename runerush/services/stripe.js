const Stripe = require('stripe');
const db = require('../database/db');
const { generateLicenseKey } = require('../utils/helpers');
const emailService = require('./email');

class StripeService {
    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    }

    /**
     * Create payment intent for main product ($49)
     */
    async createMainProductPayment(customerData) {
        try {
            const { email, first_name, last_name } = customerData;

            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: 4900, // $49.00 in cents
                currency: 'usd',
                metadata: {
                    product_type: 'main',
                    customer_email: email,
                    customer_name: `${first_name} ${last_name}`.trim()
                },
                receipt_email: email,
                description: 'Rune Rush - 50 Premium n8n Templates'
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
     * Process successful payment
     */
    async handlePaymentSuccess(paymentIntent) {
        try {
            const { id, amount, metadata } = paymentIntent;
            const { product_type, customer_email, customer_name } = metadata;

            let user;
            const existingUser = await db.getUserByEmail(customer_email);

            if (existingUser) {
                user = existingUser;
                // Update to lifetime if upsell
                if (product_type === 'upsell') {
                    await db.run('UPDATE users SET is_lifetime = 1 WHERE id = ?', [user.id]);
                    user.is_lifetime = 1;
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
                    is_lifetime: product_type === 'upsell' ? 1 : 0
                });

                user = await db.getUserByEmail(customer_email);
            }

            // Create order record
            await db.createOrder({
                user_id: user.id,
                stripe_payment_intent_id: id,
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
                metadata: { product_type, amount, payment_method: 'stripe' },
                ip_address: null,
                user_agent: null,
                referrer: null
            });

            console.log(`✅ Payment processed successfully for ${customer_email} - ${product_type}`);

        } catch (error) {
            console.error('Payment success handling failed:', error);
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
