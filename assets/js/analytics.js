// Google Analytics Initialization
(function() {
    // This will be replaced during build process with actual GA ID
    const GA_MEASUREMENT_ID = 'GA_MEASUREMENT_ID';
    
    // Initialize Google Analytics if we have a valid ID
    if (GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'GA_MEASUREMENT_ID') {
        // Update the script src with actual ID
        const gaScript = document.querySelector('script[src*="gtag/js"]');
        if (gaScript) {
            gaScript.src = gaScript.src.replace('GA_MEASUREMENT_ID', GA_MEASUREMENT_ID);
        }
        
        // Update gtag config with actual ID
        if (typeof gtag !== 'undefined') {
            gtag('config', GA_MEASUREMENT_ID);
        }
        
        console.log('Google Analytics initialized with ID:', GA_MEASUREMENT_ID);
    } else {
        console.log('Google Analytics ID not configured');
    }
    
    // Enhanced event tracking for RuneFlow
    window.trackEvent = function(action, category = 'User Interaction', label = '', value = 0) {
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: label,
                value: value
            });
        }
    };
    
    // Track specific RuneFlow events
    window.trackRuneFlowEvent = function(eventName, data = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                custom_parameter_1: data.runeType || '',
                custom_parameter_2: data.userTier || '',
                custom_parameter_3: data.weekNumber || '',
                ...data
            });
        }
    };
    
    // Auto-track important interactions
    document.addEventListener('DOMContentLoaded', function() {
        // Track email form submissions
        const emailForm = document.getElementById('emailCaptureForm');
        if (emailForm) {
            emailForm.addEventListener('submit', function() {
                trackRuneFlowEvent('email_capture', {
                    runeType: 'week1_asmr',
                    category: 'Lead Generation'
                });
            });
        }
        
        // Track pricing button clicks
        const pricingButtons = document.querySelectorAll('.coinbase-btn');
        pricingButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tier = this.classList.contains('elite-btn') ? 'elite' : 
                           this.classList.contains('pro-btn') ? 'pro' : 'founder';
                trackRuneFlowEvent('pricing_click', {
                    userTier: tier,
                    category: 'Purchase Intent'
                });
            });
        });
        
        // Track social link clicks
        const socialLinks = document.querySelectorAll('.social-link');
        socialLinks.forEach(link => {
            link.addEventListener('click', function() {
                trackRuneFlowEvent('social_click', {
                    platform: 'twitter',
                    category: 'Social Engagement'
                });
            });
        });
        
        // Track milestone interactions
        const milestoneButtons = document.querySelectorAll('.milestone-toggle');
        milestoneButtons.forEach(button => {
            button.addEventListener('click', function() {
                const milestone = this.closest('.milestone-card').dataset.month;
                trackRuneFlowEvent('milestone_interaction', {
                    milestone: milestone,
                    category: 'Dashboard Engagement'
                });
            });
        });
    });
})();
