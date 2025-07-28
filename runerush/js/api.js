// RuneRush API Configuration
const API_CONFIG = {
    // This will be automatically proxied by Netlify to Railway
    BASE_URL: window.location.origin + '/api',
    
    // Stripe publishable key (from DEPLOYMENT_READY.md)
    STRIPE_PUBLISHABLE_KEY: 'pk_test_51QgUHnAZqMCvJvdPVUSlF3xHfW7FmkHHOmzUTg2naNLzYiAqO8MdnQ7a0eqxJaNF9OHQu9JYvQfL1XJHs4qUgS2J00XPYsYcqW'
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
        // Use a timeout to prevent hanging
        const healthPromise = api.health();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('API timeout')), 5000)
        );
        
        const health = await Promise.race([healthPromise, timeoutPromise]);
        console.log('✅ API Connected:', health);
        
        // Track page view
        const page = window.location.pathname;
        await api.trackPageView(page).catch(err => 
            console.warn('Analytics tracking failed:', err)
        );
        
    } catch (error) {
        console.warn('⚠️ API Connection Failed (running in offline mode):', error);
        // This is expected when testing locally or if backend is not deployed
        // The site will still function for display purposes
    }
});
