/**
 * RuneFlow Crypto Payment Service
 * Handles cryptocurrency payments using Coinbase Commerce API
 */

const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

class CryptoPaymentService {
    constructor() {
        this.apiKey = process.env.COINBASE_COMMERCE_API_KEY;
        this.webhookSecret = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET;
        this.baseUrl = 'https://api.commerce.coinbase.com';
        this.spliceKeys = [
            process.env.SPLICE_KEY_1,
            process.env.SPLICE_KEY_2,
            process.env.SPLICE_KEY_3
        ];
        
        // Check if we have valid API credentials or if we're in demo mode
        this.isDemo = !this.apiKey || 
            this.apiKey === 'your_coinbase_api_key' || 
            this.apiKey === 'demo_coinbase_key_replace_with_real_key' || 
            this.apiKey.includes('demo_coinbase');
        
        if (this.isDemo) {
            console.log('🚧 CryptoPaymentService running in DEMO mode (no real Coinbase API keys)');
        } else {
            console.log('✅ CryptoPaymentService running with real Coinbase Commerce API');
        }
    }

    /**
     * Create a payment charge for crypto
     * @param {Object} options - Payment options
     * @param {string} options.name - Product name
     * @param {string} options.description - Product description
     * @param {number} options.amount - Amount in USD
     * @param {string} options.currency - Currency (default: USD)
     * @param {Object} options.metadata - Additional metadata
     * @returns {Promise<Object>} - Coinbase Commerce charge object
     */
    async createCharge(options) {
        try {
            const { name, description, amount, currency = 'USD', metadata = {} } = options;
            
            // If in demo mode, return mock charge data
            if (this.isDemo) {
                console.log('🚧 Creating DEMO crypto charge (not real):', { name, amount, currency });
                
                const mockChargeId = 'demo_' + crypto.randomUUID().substring(0, 8);
                const mockCharge = {
                    id: mockChargeId,
                    code: mockChargeId.toUpperCase(),
                    name,
                    description,
                    pricing_type: 'fixed_price',
                    local_price: {
                        amount: amount.toString(),
                        currency: currency
                    },
                    pricing: {
                        local: {
                            amount: amount.toString(),
                            currency: currency
                        },
                        bitcoin: {
                            amount: '0.00025',
                            currency: 'BTC'
                        },
                        ethereum: {
                            amount: '0.015',
                            currency: 'ETH'
                        }
                    },
                    metadata: {
                        ...metadata,
                        created_at: new Date().toISOString(),
                        runeflow_version: '1.0.0',
                        demo_mode: true
                    },
                    timeline: [
                        {
                            time: new Date().toISOString(),
                            status: 'NEW'
                        }
                    ],
                    hosted_url: `https://commerce.coinbase.com/demo/charges/${mockChargeId}`,
                    created_at: new Date().toISOString(),
                    expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
                    confirmed_at: null,
                    checkout: {
                        id: 'demo_checkout_' + crypto.randomUUID().substring(0, 8)
                    },
                    support_email: 'support@runeflow.com',
                    logo_url: null
                };
                
                console.log('✅ DEMO crypto charge created:', mockCharge.id);
                return mockCharge;
            }
            
            // Add splice key validation for real charges
            const spliceSignature = this.generateSpliceSignature(amount, metadata);
            
            const chargeData = {
                name,
                description,
                pricing_type: 'fixed_price',
                local_price: {
                    amount: amount.toString(),
                    currency: currency
                },
                metadata: {
                    ...metadata,
                    splice_signature: spliceSignature,
                    created_at: new Date().toISOString(),
                    runeflow_version: '1.0.0'
                }
            };

            const response = await axios.post(`${this.baseUrl}/charges`, chargeData, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CC-Api-Key': this.apiKey,
                    'X-CC-Version': '2018-03-22'
                }
            });

            console.log('✅ Crypto charge created:', response.data.data.id);
            return response.data.data;
        } catch (error) {
            console.error('❌ Error creating crypto charge:', error.response?.data || error.message);
            throw new Error(`Failed to create crypto charge: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * Get charge details
     * @param {string} chargeId - Charge ID
     * @returns {Promise<Object>} - Charge details
     */
    async getCharge(chargeId) {
        try {
            const response = await axios.get(`${this.baseUrl}/charges/${chargeId}`, {
                headers: {
                    'X-CC-Api-Key': this.apiKey,
                    'X-CC-Version': '2018-03-22'
                }
            });

            return response.data.data;
        } catch (error) {
            console.error('❌ Error getting charge:', error.response?.data || error.message);
            throw new Error(`Failed to get charge: ${error.response?.data?.error?.message || error.message}`);
        }
    }

    /**
     * Verify webhook signature
     * @param {string} payload - Raw webhook payload
     * @param {string} signature - Webhook signature
     * @returns {boolean} - Whether signature is valid
     */
    verifyWebhookSignature(payload, signature) {
        if (!this.webhookSecret) {
            console.warn('⚠️ Webhook secret not configured, skipping signature verification');
            return true;
        }

        try {
            const computedSignature = crypto
                .createHmac('sha256', this.webhookSecret)
                .update(payload)
                .digest('hex');

            return crypto.timingSafeEqual(
                Buffer.from(signature, 'hex'),
                Buffer.from(computedSignature, 'hex')
            );
        } catch (error) {
            console.error('❌ Error verifying webhook signature:', error);
            return false;
        }
    }

    /**
     * Generate splice signature for enhanced security
     * @param {number} amount - Payment amount
     * @param {Object} metadata - Payment metadata
     * @returns {string} - Splice signature
     */
    generateSpliceSignature(amount, metadata) {
        const dataString = JSON.stringify({ amount, metadata, timestamp: Date.now() });
        const signature = crypto
            .createHmac('sha256', this.spliceKeys.join(''))
            .update(dataString)
            .digest('hex');
        
        return signature;
    }

    /**
     * Validate splice signature
     * @param {string} signature - Splice signature
     * @param {number} amount - Payment amount
     * @param {Object} metadata - Payment metadata
     * @returns {boolean} - Whether signature is valid
     */
    validateSpliceSignature(signature, amount, metadata) {
        try {
            const expectedSignature = this.generateSpliceSignature(amount, metadata);
            return crypto.timingSafeEqual(
                Buffer.from(signature, 'hex'),
                Buffer.from(expectedSignature, 'hex')
            );
        } catch (error) {
            console.error('❌ Error validating splice signature:', error);
            return false;
        }
    }

    /**
     * Get supported cryptocurrencies
     * @returns {Array} - List of supported cryptocurrencies
     */
    getSupportedCurrencies() {
        return [
            {
                code: 'BTC',
                name: 'Bitcoin',
                symbol: '₿',
                rune: 'ᛒ'
            },
            {
                code: 'ETH',
                name: 'Ethereum',
                symbol: 'Ξ',
                rune: 'ᛖ'
            },
            {
                code: 'USDC',
                name: 'USD Coin',
                symbol: '$',
                rune: 'ᛟ'
            },
            {
                code: 'LTC',
                name: 'Litecoin',
                symbol: 'Ł',
                rune: 'ᛚ'
            },
            {
                code: 'BCH',
                name: 'Bitcoin Cash',
                symbol: '₿',
                rune: 'ᛒ'
            }
        ];
    }

    /**
     * Process payment webhook
     * @param {Object} webhookData - Webhook payload
     * @returns {Promise<Object>} - Processing result
     */
    async processPaymentWebhook(webhookData) {
        try {
            const { event } = webhookData;
            const charge = event.data;

            console.log(`📦 Processing webhook: ${event.type} for charge ${charge.id}`);

            switch (event.type) {
                case 'charge:created':
                    return await this.handleChargeCreated(charge);
                
                case 'charge:confirmed':
                    return await this.handleChargeConfirmed(charge);
                
                case 'charge:failed':
                    return await this.handleChargeFailed(charge);
                
                case 'charge:delayed':
                    return await this.handleChargeDelayed(charge);
                
                case 'charge:pending':
                    return await this.handleChargePending(charge);
                
                case 'charge:resolved':
                    return await this.handleChargeResolved(charge);
                
                default:
                    console.log(`⚠️ Unhandled webhook event type: ${event.type}`);
                    return { status: 'ignored', event_type: event.type };
            }
        } catch (error) {
            console.error('❌ Error processing payment webhook:', error);
            throw error;
        }
    }

    async handleChargeCreated(charge) {
        console.log('🆕 Charge created:', charge.id);
        return { status: 'created', charge_id: charge.id };
    }

    async handleChargeConfirmed(charge) {
        console.log('✅ Payment confirmed:', charge.id);
        
        // Validate splice signature
        const metadata = charge.metadata || {};
        if (metadata.splice_signature && !this.validateSpliceSignature(
            metadata.splice_signature,
            parseFloat(charge.pricing.local.amount),
            metadata
        )) {
            console.error('❌ Invalid splice signature for charge:', charge.id);
            return { status: 'invalid_signature', charge_id: charge.id };
        }

        // Process the successful payment
        await this.fulfillOrder(charge);
        
        return { status: 'confirmed', charge_id: charge.id };
    }

    async handleChargeFailed(charge) {
        console.log('❌ Payment failed:', charge.id);
        return { status: 'failed', charge_id: charge.id };
    }

    async handleChargeDelayed(charge) {
        console.log('⏳ Payment delayed:', charge.id);
        return { status: 'delayed', charge_id: charge.id };
    }

    async handleChargePending(charge) {
        console.log('⏳ Payment pending:', charge.id);
        return { status: 'pending', charge_id: charge.id };
    }

    async handleChargeResolved(charge) {
        console.log('🔄 Payment resolved:', charge.id);
        return { status: 'resolved', charge_id: charge.id };
    }

    /**
     * Fulfill order after successful payment
     * @param {Object} charge - Coinbase Commerce charge object
     */
    async fulfillOrder(charge) {
        try {
            const metadata = charge.metadata || {};
            const packageType = metadata.package_type;
            const userEmail = metadata.user_email;

            console.log(`🎯 Fulfilling order for ${packageType} package - ${userEmail}`);

            switch (packageType) {
                case 'blind_founder':
                    await this.fulfillBlindFounderPackage(charge);
                    break;
                
                case 'launch_access':
                    await this.fulfillLaunchAccessPackage(charge);
                    break;
                
                default:
                    console.error('❌ Unknown package type:', packageType);
                    throw new Error(`Unknown package type: ${packageType}`);
            }
        } catch (error) {
            console.error('❌ Error fulfilling order:', error);
            throw error;
        }
    }

    async fulfillBlindFounderPackage(charge) {
        const metadata = charge.metadata || {};
        const userEmail = metadata.user_email;
        
        console.log('🎯 Fulfilling Blind Founder package for:', userEmail);
        
        // TODO: Implement blind founder fulfillment
        // - Grant access to all templates
        // - Send confirmation email
        // - Update user database
        // - Send admin notification
    }

    async fulfillLaunchAccessPackage(charge) {
        const metadata = charge.metadata || {};
        const userEmail = metadata.user_email;
        
        console.log('🚀 Fulfilling Launch Access package for:', userEmail);
        
        // TODO: Implement launch access fulfillment
        // - Reserve launch day access
        // - Send confirmation email
        // - Update user database
        // - Send admin notification
    }
}

module.exports = CryptoPaymentService;
