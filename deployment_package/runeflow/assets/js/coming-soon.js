// RuneFlow Coming Soon Page JavaScript
// Enhanced with Stripe and Crypto Payment Integration

// Initialize Stripe (will be set after fetching config)
let stripe = null;

// Fetch Stripe configuration from server
async function initializeStripe() {
    try {
        const response = await fetch('/api/stripe/config');
        const config = await response.json();
        
        if (config.success && config.publishableKey) {
            stripe = Stripe(config.publishableKey);
            console.log('✅ Stripe initialized successfully');
        } else {
            console.error('❌ Failed to get Stripe configuration');
        }
    } catch (error) {
        console.error('❌ Error initializing Stripe:', error);
    }
}

// Payment context
let currentPaymentContext = {
    type: null, // 'stripe' or 'crypto'
    package: null,
    amount: null,
    email: null
};

// DOM loaded event
document.addEventListener('DOMContentLoaded', function() {
    initializeStripe();
    initializeEmailCapture();
    initializePaymentButtons();
    initializeModals();
});

// Email capture functionality
function initializeEmailCapture() {
    const emailForm = document.querySelector('.email-form');
    const emailInput = document.getElementById('email');
    const notifyBtn = document.getElementById('notify-btn');
    
    if (notifyBtn) {
        notifyBtn.addEventListener('click', async function() {
            const email = emailInput.value.trim();
            
            if (!email || !isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            try {
                // Show loading state
                notifyBtn.textContent = 'Adding...';
                notifyBtn.disabled = true;
                
                const response = await fetch('/capture-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        referrer: document.referrer,
                        utm_source: getUrlParameter('utm_source'),
                        utm_medium: getUrlParameter('utm_medium'),
                        utm_campaign: getUrlParameter('utm_campaign')
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('Welcome! Check your email for your free starter rune.', 'success');
                    emailInput.value = '';
                    
                    // Show success state
                    notifyBtn.textContent = 'Added!';
                    notifyBtn.style.background = '#4CAF50';
                    
                    // Reset after 3 seconds
                    setTimeout(() => {
                        notifyBtn.textContent = 'Notify Me';
                        notifyBtn.style.background = '#ff6b6b';
                        notifyBtn.disabled = false;
                    }, 3000);
                } else {
                    showNotification(result.error || 'Something went wrong. Please try again.', 'error');
                    notifyBtn.textContent = 'Notify Me';
                    notifyBtn.disabled = false;
                }
                
            } catch (error) {
                console.error('Email capture error:', error);
                showNotification('Network error. Please try again.', 'error');
                notifyBtn.textContent = 'Notify Me';
                notifyBtn.disabled = false;
            }
        });
    }
}

// Payment buttons initialization
function initializePaymentButtons() {
    // Stripe payment buttons
    const stripeButtons = document.querySelectorAll('.stripe-btn');
    stripeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const packageType = this.dataset.package;
            const amount = parseFloat(this.dataset.amount);
            
            currentPaymentContext = {
                type: 'stripe',
                package: packageType,
                amount: amount,
                email: null
            };
            
            showPaymentModal('stripe');
        });
    });
    
    // Crypto payment buttons
    const cryptoButtons = document.querySelectorAll('.crypto-btn');
    cryptoButtons.forEach(button => {
        button.addEventListener('click', function() {
            const packageType = this.dataset.package;
            const amount = parseFloat(this.dataset.amount);
            
            currentPaymentContext = {
                type: 'crypto',
                package: packageType,
                amount: amount,
                email: null
            };
            
            showPaymentModal('crypto');
        });
    });
}

// Modal initialization
function initializeModals() {
    const modal = document.getElementById('payment-modal');
    const closeBtn = document.querySelector('.close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Show payment modal
function showPaymentModal(paymentType) {
    const modal = document.getElementById('payment-modal');
    const modalContent = modal.querySelector('.modal-content');
    
    // Clear previous content
    modalContent.innerHTML = `
        <span class="close">&times;</span>
        <h3>Complete Your Purchase</h3>
        <div id="payment-container">
            <div class="payment-loading">
                <div class="spinner"></div>
                <p>Setting up payment...</p>
            </div>
        </div>
    `;
    
    // Re-attach close event
    modalContent.querySelector('.close').addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    modal.style.display = 'block';
    
    // Load payment interface
    if (paymentType === 'stripe') {
        loadStripePayment();
    } else if (paymentType === 'crypto') {
        loadCryptoPayment();
    }
}

// Stripe payment handling
async function loadStripePayment() {
    try {
        const email = await getCustomerEmail();
        if (!email) return;
        
        currentPaymentContext.email = email;
        
        // Create payment intent
        const response = await fetch('/api/stripe/create-payment-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                packageType: currentPaymentContext.package,
                userEmail: currentPaymentContext.email,
                amount: currentPaymentContext.amount
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Create Stripe Elements
            const elements = stripe.elements();
            
            // Create card element
            const cardElement = elements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                            color: '#aab7c4',
                        },
                    },
                },
            });
            
            // Update modal content
            document.getElementById('payment-container').innerHTML = `
                <div class="stripe-payment">
                    <h4>Pay with Credit Card</h4>
                    <div class="payment-summary">
                        <p><strong>Package:</strong> ${getPackageName(currentPaymentContext.package)}</p>
                        <p><strong>Amount:</strong> $${currentPaymentContext.amount.toFixed(2)}</p>
                        <p><strong>Email:</strong> ${currentPaymentContext.email}</p>
                    </div>
                    <div id="card-element"></div>
                    <div id="card-errors" role="alert"></div>
                    <button id="submit-payment" class="stripe-pay-btn">Pay $${currentPaymentContext.amount.toFixed(2)}</button>
                </div>
            `;
            
            // Mount card element
            cardElement.mount('#card-element');
            
            // Handle form submission
            const submitButton = document.getElementById('submit-payment');
            submitButton.addEventListener('click', async function() {
                submitButton.disabled = true;
                submitButton.textContent = 'Processing...';
                
                const {token, error} = await stripe.createToken(cardElement);
                
                if (error) {
                    // Show error to customer
                    document.getElementById('card-errors').textContent = error.message;
                    submitButton.disabled = false;
                    submitButton.textContent = `Pay $${currentPaymentContext.amount.toFixed(2)}`;
                } else {
                    // Confirm payment
                    const {error: confirmError} = await stripe.confirmCardPayment(result.client_secret, {
                        payment_method: {
                            card: cardElement,
                            billing_details: {
                                email: currentPaymentContext.email,
                            },
                        }
                    });
                    
                    if (confirmError) {
                        document.getElementById('card-errors').textContent = confirmError.message;
                        submitButton.disabled = false;
                        submitButton.textContent = `Pay $${currentPaymentContext.amount.toFixed(2)}`;
                    } else {
                        // Payment succeeded
                        showPaymentSuccess('stripe');
                    }
                }
            });
            
        } else {
            showPaymentError(result.error || 'Failed to initialize payment');
        }
        
    } catch (error) {
        console.error('Stripe payment error:', error);
        showPaymentError('Payment system error. Please try again.');
    }
}

// Crypto payment handling
async function loadCryptoPayment() {
    try {
        const email = await getCustomerEmail();
        if (!email) return;
        
        currentPaymentContext.email = email;
        
        // Create crypto charge
        const response = await fetch('/api/crypto/create-charge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                packageType: currentPaymentContext.package,
                userEmail: currentPaymentContext.email,
                amount: currentPaymentContext.amount
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Update modal content
            document.getElementById('payment-container').innerHTML = `
                <div class="crypto-payment">
                    <h4>Pay with Cryptocurrency</h4>
                    <div class="payment-summary">
                        <p><strong>Package:</strong> ${getPackageName(currentPaymentContext.package)}</p>
                        <p><strong>Amount:</strong> $${currentPaymentContext.amount.toFixed(2)}</p>
                        <p><strong>Email:</strong> ${currentPaymentContext.email}</p>
                    </div>
                    <div class="crypto-options">
                        <div class="crypto-addresses">
                            <h5>Send payment to:</h5>
                            <div class="address-list">
                                ${Object.entries(result.payment_addresses).map(([currency, address]) => `
                                    <div class="address-item">
                                        <div class="currency">${currency.toUpperCase()}</div>
                                        <div class="address">${address}</div>
                                        <button class="copy-btn" data-address="${address}">Copy</button>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="payment-status">
                            <div class="spinner"></div>
                            <p>Waiting for payment...</p>
                            <p class="expires">Expires: ${new Date(result.expires_at).toLocaleString()}</p>
                        </div>
                    </div>
                    <button id="open-coinbase" class="coinbase-btn">Open in Coinbase Commerce</button>
                </div>
            `;
            
            // Add copy functionality
            document.querySelectorAll('.copy-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const address = this.dataset.address;
                    navigator.clipboard.writeText(address).then(() => {
                        this.textContent = 'Copied!';
                        setTimeout(() => {
                            this.textContent = 'Copy';
                        }, 2000);
                    });
                });
            });
            
            // Add Coinbase Commerce button
            document.getElementById('open-coinbase').addEventListener('click', function() {
                window.open(result.charge_url, '_blank');
            });
            
            // Poll for payment status
            pollPaymentStatus(result.charge_id);
            
        } else {
            showPaymentError(result.error || 'Failed to initialize crypto payment');
        }
        
    } catch (error) {
        console.error('Crypto payment error:', error);
        showPaymentError('Payment system error. Please try again.');
    }
}

// Poll crypto payment status
async function pollPaymentStatus(chargeId) {
    const pollInterval = setInterval(async () => {
        try {
            const response = await fetch(`/api/crypto/charge/${chargeId}`);
            const result = await response.json();
            
            if (result.success) {
                const status = result.status;
                
                if (status === 'COMPLETED') {
                    clearInterval(pollInterval);
                    showPaymentSuccess('crypto');
                } else if (status === 'FAILED' || status === 'EXPIRED') {
                    clearInterval(pollInterval);
                    showPaymentError('Payment failed or expired. Please try again.');
                }
            }
        } catch (error) {
            console.error('Error polling payment status:', error);
        }
    }, 5000); // Poll every 5 seconds
    
    // Stop polling after 30 minutes
    setTimeout(() => {
        clearInterval(pollInterval);
    }, 30 * 60 * 1000);
}

// Get customer email
async function getCustomerEmail() {
    return new Promise((resolve) => {
        const email = prompt('Please enter your email address:');
        if (email && isValidEmail(email)) {
            resolve(email);
        } else {
            showNotification('Please enter a valid email address', 'error');
            resolve(null);
        }
    });
}

// Show payment success
function showPaymentSuccess(paymentType) {
    const container = document.getElementById('payment-container');
    container.innerHTML = `
        <div class="payment-success">
            <div class="success-icon">✅</div>
            <h4>Payment Successful!</h4>
            <p>Thank you for your purchase. You'll receive a confirmation email shortly.</p>
            <p>Welcome to RuneFlow!</p>
            <button onclick="document.getElementById('payment-modal').style.display='none'" class="success-btn">Close</button>
        </div>
    `;
}

// Show payment error
function showPaymentError(message) {
    const container = document.getElementById('payment-container');
    container.innerHTML = `
        <div class="payment-error">
            <div class="error-icon">❌</div>
            <h4>Payment Error</h4>
            <p>${message}</p>
            <button onclick="document.getElementById('payment-modal').style.display='none'" class="error-btn">Close</button>
        </div>
    `;
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function getPackageName(packageType) {
    switch (packageType) {
        case 'early-bird':
            return 'Early Bird Package';
        case 'founder':
            return 'Founder Package';
        case 'enterprise':
            return 'Enterprise Package';
        case 'blind_founder':
            return 'Blind Founder Package';
        case 'launch_access':
            return 'Launch Access Package';
        default:
            return 'RuneFlow Package';
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});
