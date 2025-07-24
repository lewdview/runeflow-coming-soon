// RuneFlow.xyz Payment Confirmation & User ID System
// Handles Coinbase Commerce webhooks and user account creation

// User ID Generation System
function generateUserId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    const runePrefix = 'RF'; // RuneFlow prefix
    return `${runePrefix}_${timestamp}_${randomStr}`.toUpperCase();
}

// Payment Tier Mapping
const PAYMENT_TIERS = {
    'elite': {
        name: 'Elite Access',
        price: 999,
        features: [
            'Lifetime access to all 8,100+ runes',
            'Instant beta raw download',
            'VIP founder badge & privileges',
            '1-on-1 priority support',
            'Beta access to new features',
            'Exclusive founder community'
        ],
        productId: '7d052c71-c392-4f48-9e48-df68f90b76d1'
    },
    'pro': {
        name: 'Pro Access',
        price: 297,
        features: [
            'Complete access to all 8,100+ runes at launch',
            'Pro tier status',
            'Priority email support',
            'Advanced tutorials & guides',
            'Regular feature updates'
        ],
        productId: '217582f9-25da-472a-9bed-b09e095dcd10'
    },
    'founder': {
        name: 'Founder Access',
        price: 199,
        features: [
            'Complete access to all 8,100+ runes at launch',
            'Exclusive founder status badge',
            'Lifetime access guarantee',
            'Founder community access',
            'Price locked forever at founder rate'
        ],
        productId: '52bc5d8a-bc5d-4257-b17c-20f3b21340ed'
    }
};

// User Account Management
class UserAccount {
    constructor(userId, tier, paymentData) {
        this.userId = userId;
        this.tier = tier;
        this.createdAt = new Date().toISOString();
        this.paymentData = {
            chargeId: paymentData.chargeId,
            amount: paymentData.amount,
            currency: paymentData.currency,
            paidAt: paymentData.paidAt,
            transactionHash: paymentData.transactionHash || null
        };
        this.status = 'active';
        this.accessLevel = this.getAccessLevel(tier);
        this.features = PAYMENT_TIERS[tier].features;
    }

    getAccessLevel(tier) {
        const levels = {
            'elite': 'lifetime',
            'pro': 'annual',
            'founder': 'annual_founder'
        };
        return levels[tier] || 'basic';
    }

    toJSON() {
        return {
            userId: this.userId,
            tier: this.tier,
            createdAt: this.createdAt,
            paymentData: this.paymentData,
            status: this.status,
            accessLevel: this.accessLevel,
            features: this.features
        };
    }
}

// Payment Confirmation Handler
async function handlePaymentConfirmation(paymentData) {
    try {
        console.log('🎉 Processing payment confirmation:', paymentData);

        // Generate unique user ID
        const userId = generateUserId();
        
        // Determine tier from product ID
        const tier = getTierFromProductId(paymentData.productId);
        
        if (!tier) {
            throw new Error('Unknown product ID: ' + paymentData.productId);
        }

        // Create user account
        const userAccount = new UserAccount(userId, tier, paymentData);
        
        // Store user data
        await storeUserAccount(userAccount);
        
        // Send confirmation email
        await sendConfirmationEmail(userAccount);
        
        // Update UI for successful payment
        showPaymentSuccess(userAccount);
        
        console.log('✅ Payment processed successfully for user:', userId);
        
        return {
            success: true,
            userId: userId,
            tier: tier,
            account: userAccount.toJSON()
        };
        
    } catch (error) {
        console.error('❌ Payment confirmation error:', error);
        showPaymentError(error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Get tier from Coinbase product ID
function getTierFromProductId(productId) {
    for (const [tier, data] of Object.entries(PAYMENT_TIERS)) {
        if (data.productId === productId) {
            return tier;
        }
    }
    return null;
}

// Store user account (localStorage for now, should be database in production)
async function storeUserAccount(userAccount) {
    try {
        // Store in localStorage for immediate access
        localStorage.setItem(`user_${userAccount.userId}`, JSON.stringify(userAccount.toJSON()));
        
        // Store in global users list
        const existingUsers = JSON.parse(localStorage.getItem('runeflow_users') || '[]');
        existingUsers.push(userAccount.toJSON());
        localStorage.setItem('runeflow_users', JSON.stringify(existingUsers));
        
        // TODO: In production, send to backend API
        /*
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userAccount.toJSON())
        });
        */
        
        console.log('💾 User account stored:', userAccount.userId);
        
    } catch (error) {
        console.error('❌ Error storing user account:', error);
        throw error;
    }
}

// Send confirmation email
async function sendConfirmationEmail(userAccount) {
    try {
        const emailData = {
            to: userAccount.paymentData.email || 'user@example.com', // Should come from payment data
            subject: `🎉 Welcome to RuneFlow.xyz - ${PAYMENT_TIERS[userAccount.tier].name} Activated!`,
            template: 'payment_confirmation',
            data: {
                userId: userAccount.userId,
                tier: userAccount.tier,
                tierName: PAYMENT_TIERS[userAccount.tier].name,
                features: userAccount.features,
                paymentAmount: userAccount.paymentData.amount,
                accessLevel: userAccount.accessLevel
            }
        };
        
        // TODO: In production, send via backend
        /*
        const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData)
        });
        */
        
        console.log('📧 Confirmation email queued for:', userAccount.userId);
        
    } catch (error) {
        console.error('❌ Error sending confirmation email:', error);
        // Don't throw - email failure shouldn't block account creation
    }
}

// Show payment success UI
function showPaymentSuccess(userAccount) {
    // Create success modal
    const modal = document.createElement('div');
    modal.className = 'payment-success-modal';
    modal.innerHTML = `
        <div class="success-modal-content">
            <div class="success-header">
                <h2>🎉 Payment Successful!</h2>
                <p>Welcome to RuneFlow.xyz</p>
            </div>
            
            <div class="user-info">
                <div class="user-id-card">
                    <h3>Your User ID</h3>
                    <div class="user-id-display">${userAccount.userId}</div>
                    <button onclick="copyUserId('${userAccount.userId}')" class="copy-btn">Copy ID</button>
                </div>
                
                <div class="tier-info">
                    <h3>${PAYMENT_TIERS[userAccount.tier].name}</h3>
                    <div class="tier-features">
                        ${userAccount.features.map(feature => `<div class="feature">✅ ${feature}</div>`).join('')}
                    </div>
                </div>
            </div>
            
            <div class="next-steps">
                <h3>What's Next?</h3>
                <div class="steps">
                    <div class="step">📧 Check your email for confirmation details</div>
                    <div class="step">🔮 Access your dashboard (coming in Week 5)</div>
                    <div class="step">📥 Download your weekly runes</div>
                </div>
            </div>
            
            <div class="modal-actions">
                <button onclick="closeSuccessModal()" class="close-btn">Continue to Site</button>
                <button onclick="downloadUserData('${userAccount.userId}')" class="download-btn">Download Account Info</button>
            </div>
        </div>
    `;

    // Add modal styles
    const style = document.createElement('style');
    style.textContent = `
        .payment-success-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }
        
        .success-modal-content {
            background: linear-gradient(135deg, #001a33 0%, #002244 100%);
            border: 2px solid #00ffff;
            border-radius: 16px;
            padding: 2rem;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            color: white;
            box-shadow: 0 0 50px rgba(0, 255, 255, 0.3);
        }
        
        .success-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .success-header h2 {
            color: #00ffff;
            margin: 0 0 0.5rem 0;
            text-shadow: 0 0 20px #00ffff;
        }
        
        .user-id-card {
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid #00ffff;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
            text-align: center;
        }
        
        .user-id-display {
            font-family: 'Courier New', monospace;
            font-size: 1.2rem;
            color: #00ffff;
            background: rgba(0, 0, 0, 0.3);
            padding: 0.5rem;
            border-radius: 4px;
            margin: 0.5rem 0;
            letter-spacing: 1px;
        }
        
        .copy-btn, .close-btn, .download-btn {
            background: linear-gradient(135deg, #00ffff, #0088cc);
            border: none;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
            margin: 0.25rem;
            transition: all 0.3s ease;
        }
        
        .copy-btn:hover, .close-btn:hover, .download-btn:hover {
            background: linear-gradient(135deg, #00ccff, #0066aa);
            transform: translateY(-2px);
        }
        
        .tier-features {
            margin-top: 1rem;
        }
        
        .feature {
            margin: 0.5rem 0;
            color: #80f0ff;
        }
        
        .next-steps {
            margin-top: 2rem;
        }
        
        .steps {
            margin-top: 1rem;
        }
        
        .step {
            margin: 0.5rem 0;
            padding: 0.5rem;
            background: rgba(0, 255, 255, 0.05);
            border-radius: 4px;
        }
        
        .modal-actions {
            margin-top: 2rem;
            text-align: center;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
}

// Copy user ID to clipboard
function copyUserId(userId) {
    navigator.clipboard.writeText(userId).then(() => {
        const btn = document.querySelector('.copy-btn');
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        btn.style.background = 'linear-gradient(135deg, #00ff88, #00aa55)';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = 'linear-gradient(135deg, #00ffff, #0088cc)';
        }, 2000);
    });
}

// Close success modal
function closeSuccessModal() {
    const modal = document.querySelector('.payment-success-modal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    }
}

// Download user account data
function downloadUserData(userId) {
    const userData = localStorage.getItem(`user_${userId}`);
    if (userData) {
        const blob = new Blob([userData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `runeflow-account-${userId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Show payment error
function showPaymentError(errorMessage) {
    alert(`Payment Error: ${errorMessage}\n\nPlease contact hello@runeflow.xyz for assistance.`);
}

// Check for payment confirmation on page load (from URL parameters)
function checkForPaymentConfirmation() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Coinbase Commerce redirects with these parameters
    if (urlParams.has('charge_id')) {
        const paymentData = {
            chargeId: urlParams.get('charge_id'),
            productId: urlParams.get('product_id'),
            amount: parseFloat(urlParams.get('amount')) || 0,
            currency: urlParams.get('currency') || 'USD',
            paidAt: new Date().toISOString(),
            email: urlParams.get('email') || null
        };
        
        handlePaymentConfirmation(paymentData);
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Simulate payment confirmation (for testing)
function simulatePaymentConfirmation(tier = 'founder') {
    const testPaymentData = {
        chargeId: 'test_charge_' + Date.now(),
        productId: PAYMENT_TIERS[tier].productId,
        amount: PAYMENT_TIERS[tier].price,
        currency: 'USD',
        paidAt: new Date().toISOString(),
        email: 'test@runeflow.xyz'
    };
    
    handlePaymentConfirmation(testPaymentData);
}

// Get user account by ID
function getUserAccount(userId) {
    const userData = localStorage.getItem(`user_${userId}`);
    return userData ? JSON.parse(userData) : null;
}

// List all users (admin function)
function getAllUsers() {
    const users = localStorage.getItem('runeflow_users');
    return users ? JSON.parse(users) : [];
}

// Initialize payment system
function initializePaymentSystem() {
    console.log('💳 Payment system initialized');
    
    // Check for payment confirmation on page load
    checkForPaymentConfirmation();
    
    // Add global functions to window for testing
    window.simulatePaymentConfirmation = simulatePaymentConfirmation;
    window.getUserAccount = getUserAccount;
    window.getAllUsers = getAllUsers;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePaymentSystem);
} else {
    initializePaymentSystem();
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handlePaymentConfirmation,
        generateUserId,
        getUserAccount,
        getAllUsers,
        PAYMENT_TIERS
    };
}
