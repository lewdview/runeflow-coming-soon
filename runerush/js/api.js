// RuneRush API Configuration
const API_CONFIG = {
    // This will be automatically proxied by Netlify to Railway
    BASE_URL: window.location.origin + '/api',
    
    // Stripe publishable key (set this from your Railway environment)
    STRIPE_PUBLISHABLE_KEY: 'pk_test_your_stripe_publishable_key_here'
};

// API Client
class RuneRushAPI {
    constructor() {
        this.baseURL = API_CONFIG.BASE_URL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Health check
    async health() {
        return this.request('/health');
    }

    // Payment methods
    async createPaymentIntent(customerData) {
        return this.request('/payments/stripe/create-intent', {
            method: 'POST',
            body: JSON.stringify(customerData)
        });
    }

    async createUpsellIntent(licenseKey) {
        return this.request('/payments/stripe/create-upsell-intent', {
            method: 'POST',
            body: JSON.stringify({ user_license_key: licenseKey })
        });
    }

    async createCheckoutSession(payload) {
        return this.request('/payments/stripe/create-checkout', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }

    // Download methods
    async getDownloads(licenseKey) {
        return this.request(`/downloads?license_key=${licenseKey}`);
    }

    // User methods
    async getUser(licenseKey) {
        return this.request(`/user/${licenseKey}`);
    }

    // Analytics
    async trackPageView(page, licenseKey = null, metadata = {}) {
        return this.request('/analytics/pageview', {
            method: 'POST',
            body: JSON.stringify({ page, license_key: licenseKey, metadata })
        });
    }
}

// Initialize API client
const api = new RuneRushAPI();

// Initialize Stripe
let stripe = null;
if (typeof Stripe !== 'undefined') {
    stripe = Stripe(API_CONFIG.STRIPE_PUBLISHABLE_KEY);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { api, stripe, API_CONFIG };
}

// Test API connection on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const health = await api.health();
        console.log('✅ API Connected:', health);
        
        // Track page view
        const page = window.location.pathname;
        await api.trackPageView(page);
        
    } catch (error) {
        console.error('❌ API Connection Failed:', error);
        // You might want to show a user-friendly message here
    }
});
