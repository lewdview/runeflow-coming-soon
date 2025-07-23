// Cookie Banner and Terms Management
class CookieManager {
    constructor() {
        this.cookieBanner = document.getElementById('cookieBanner');
        this.termsModal = document.getElementById('termsModal');
        this.init();
    }

    init() {
        // Check if user has already made a choice
        if (!this.hasUserMadeChoice()) {
            this.showCookieBanner();
        }

        // Initialize event listeners
        this.initEventListeners();
    }

    initEventListeners() {
        // Close modal when clicking overlay
        const overlay = document.querySelector('.terms-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.hideTerms());
        }

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.termsModal && this.termsModal.style.display !== 'none') {
                this.hideTerms();
            }
        });
    }

    hasUserMadeChoice() {
        return localStorage.getItem('runeflow_cookie_choice') !== null;
    }

    showCookieBanner() {
        if (this.cookieBanner) {
            this.cookieBanner.style.display = 'flex';
        }
    }

    hideCookieBanner() {
        if (this.cookieBanner) {
            this.cookieBanner.style.display = 'none';
        }
    }

    acceptCookies() {
        localStorage.setItem('runeflow_cookie_choice', 'accepted');
        localStorage.setItem('runeflow_cookie_timestamp', Date.now().toString());
        
        // Enable analytics
        this.enableAnalytics();
        
        this.hideCookieBanner();
        
        // Optional: Show success message
        this.showNotification('Cookies accepted. Thank you!', 'success');
    }

    declineCookies() {
        localStorage.setItem('runeflow_cookie_choice', 'declined');
        localStorage.setItem('runeflow_cookie_timestamp', Date.now().toString());
        
        // Disable analytics
        this.disableAnalytics();
        
        this.hideCookieBanner();
        
        // Optional: Show info message
        this.showNotification('Cookies declined. Some features may be limited.', 'info');
    }

    enableAnalytics() {
        // Enable Google Analytics if it exists
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'granted'
            });
        }
        
        // Set flag for other analytics
        window.runeflowAnalyticsEnabled = true;
    }

    disableAnalytics() {
        // Disable Google Analytics if it exists
        if (typeof gtag !== 'undefined') {
            gtag('consent', 'update', {
                'analytics_storage': 'denied'
            });
        }
        
        // Set flag for other analytics
        window.runeflowAnalyticsEnabled = false;
    }

    showTerms() {
        if (this.termsModal) {
            this.termsModal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    }

    hideTerms() {
        if (this.termsModal) {
            this.termsModal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Restore scrolling
        }
    }

    acceptTermsAndCookies() {
        this.acceptCookies();
        this.hideTerms();
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `cookie-notification cookie-notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : 'ℹ️'}</span>
                <span class="notification-message">${message}</span>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'rgba(0, 255, 0, 0.9)' : 'rgba(0, 212, 255, 0.9)'};
            color: ${type === 'success' ? '#000' : '#fff'};
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            z-index: 1002;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            font-weight: 600;
            backdrop-filter: blur(10px);
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Check if user has consented to analytics
    hasAnalyticsConsent() {
        const choice = localStorage.getItem('runeflow_cookie_choice');
        return choice === 'accepted';
    }

    // Reset user choice (for debugging/testing)
    resetChoice() {
        localStorage.removeItem('runeflow_cookie_choice');
        localStorage.removeItem('runeflow_cookie_timestamp');
        this.showCookieBanner();
    }
}

// Global functions for button clicks
function acceptCookies() {
    window.cookieManager.acceptCookies();
}

function declineCookies() {
    window.cookieManager.declineCookies();
}

function showTerms() {
    window.cookieManager.showTerms();
}

function hideTerms() {
    window.cookieManager.hideTerms();
}

function acceptTermsAndCookies() {
    window.cookieManager.acceptTermsAndCookies();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.cookieManager = new CookieManager();
    
    // Initialize Google Analytics consent mode if gtag is available
    if (typeof gtag !== 'undefined') {
        gtag('consent', 'default', {
            'analytics_storage': 'denied'
        });
        
        // If user has previously accepted, enable analytics
        if (window.cookieManager.hasAnalyticsConsent()) {
            window.cookieManager.enableAnalytics();
        }
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CookieManager;
}
