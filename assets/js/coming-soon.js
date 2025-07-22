// RuneFlow.co - Coming Soon Page JavaScript

// Starter Rune Selection System
window.selectedRunes = [];
window.isBundle = false;
window.totalPrice = 0;
window.selectedFreeRune = null; // Track which free rune is selected

// Toggle individual rune selection
window.toggleRuneSelection = function(runeId) {
    const runeCard = document.querySelector(`.rune-card[data-rune="${runeId}"]`);
    const button = runeCard.querySelector('.select-rune-btn');
    const btnText = button.querySelector('.btn-text');
    
    if (window.selectedRunes.includes(runeId)) {
        // Remove from selection
        window.selectedRunes = window.selectedRunes.filter(id => id !== runeId);
        runeCard.classList.remove('selected');
        btnText.textContent = 'Select';
        button.classList.remove('selected');
    } else {
        // Add to selection
        window.selectedRunes.push(runeId);
        runeCard.classList.add('selected');
        btnText.textContent = 'Selected';
        button.classList.add('selected');
    }
    
    // Clear bundle selection if individual runes are selected
    if (window.selectedRunes.length > 0) {
        window.isBundle = false;
        const bundleCard = document.querySelector('.bundle-card');
        const bundleBtn = document.querySelector('.select-bundle-btn');
        bundleCard.classList.remove('selected');
        bundleBtn.classList.remove('selected');
        bundleBtn.querySelector('.btn-text').textContent = 'Get Complete Bundle';
    }
    
    updateSelectionSummary();
};

// Toggle free rune selection
window.toggleFreeRuneSelection = function(runeId) {
    // Clear previous selection
    document.querySelectorAll('.free-rune-selection .rune-card').forEach(card => {
        card.classList.remove('selected');
        const btn = card.querySelector('.select-rune-btn');
        if (btn) {
            btn.classList.remove('selected');
            const btnText = btn.querySelector('.btn-text');
            if (btnText) {
                btnText.textContent = 'Select This Rune';
            }
        }
    });
    
    // Select the clicked rune
    const runeCard = document.querySelector(`.free-rune-selection .rune-card[data-rune="${runeId}"]`);
    if (runeCard) {
        runeCard.classList.add('selected');
        const btn = runeCard.querySelector('.select-rune-btn');
        if (btn) {
            btn.classList.add('selected');
            const btnText = btn.querySelector('.btn-text');
            if (btnText) {
                btnText.textContent = 'Selected';
            }
        }
    }
    
    // Update selected free rune
    window.selectedFreeRune = runeId;
    
    // Show the email form if it's hidden
    const emailForm = document.querySelector('.email-form');
    if (emailForm) {
        emailForm.style.display = 'block';
    }
};

// Select free rune (alias for toggleFreeRuneSelection to match HTML)
window.selectFreeRune = function(runeId) {
    window.toggleFreeRuneSelection(runeId);
};

// Purchase bundle function (alias for existing functionality)
window.purchaseBundle = function() {
    // For now, just open a payment modal or show a message
    alert('Bundle purchase functionality will be available soon!');
};

// Select complete bundle
window.selectBundle = function() {
    const bundleCard = document.querySelector('.bundle-card');
    const bundleBtn = document.querySelector('.select-bundle-btn');
    const btnText = bundleBtn.querySelector('.btn-text');
    
    if (window.isBundle) {
        // Deselect bundle
        window.isBundle = false;
        bundleCard.classList.remove('selected');
        bundleBtn.classList.remove('selected');
        btnText.textContent = 'Get Complete Bundle';
    } else {
        // Select bundle
        window.isBundle = true;
        bundleCard.classList.add('selected');
        bundleBtn.classList.add('selected');
        btnText.textContent = 'Bundle Selected';
        
        // Clear individual selections
        window.selectedRunes = [];
        document.querySelectorAll('.rune-card').forEach(card => {
            card.classList.remove('selected');
            const btn = card.querySelector('.select-rune-btn');
            btn.classList.remove('selected');
            btn.querySelector('.btn-text').textContent = 'Select';
        });
    }
    
    updateSelectionSummary();
};

// Update selection summary
function updateSelectionSummary() {
    const summary = document.getElementById('selectionSummary');
    const selectedItems = document.getElementById('selectedItems');
    const totalPriceEl = document.getElementById('totalPrice');
    
    if (window.isBundle) {
        window.totalPrice = 5;
        selectedItems.innerHTML = `
            <div class="selected-item">
                <span class="item-icon rune-icon">ᚦ</span>
                <span class="item-name">Complete Starter Bundle</span>
                <span class="item-price">$5</span>
            </div>
            <div class="bundle-includes">
                <small>Includes: FlowRune, Ansuz, Laguz + bonus content</small>
            </div>
        `;
        summary.style.display = 'block';
    } else if (window.selectedRunes.length > 0) {
        window.totalPrice = window.selectedRunes.length * 2;
        const runeNames = {
            'flowrune': 'FlowRune',
            'ansuz': 'Ansuz',
            'laguz': 'Laguz'
        };
        const runeIcons = {
            'flowrune': 'ᚠ',
            'ansuz': 'ᚨ',
            'laguz': 'ᛚ'
        };
        
        selectedItems.innerHTML = window.selectedRunes.map(runeId => `
            <div class="selected-item">
                <span class="item-icon rune-icon">${runeIcons[runeId]}</span>
                <span class="item-name">${runeNames[runeId]}</span>
                <span class="item-price">$2</span>
            </div>
        `).join('');
        summary.style.display = 'block';
    } else {
        summary.style.display = 'none';
        window.totalPrice = 0;
    }
    
    if (totalPriceEl) {
        totalPriceEl.textContent = `$${window.totalPrice}`;
    }
}

// Clear all selections
window.clearSelection = function() {
    window.selectedRunes = [];
    window.isBundle = false;
    window.totalPrice = 0;
    
    // Reset rune cards
    document.querySelectorAll('.rune-card').forEach(card => {
        card.classList.remove('selected');
        const btn = card.querySelector('.select-rune-btn');
        btn.classList.remove('selected');
        btn.querySelector('.btn-text').textContent = 'Select';
    });
    
    // Reset bundle card
    const bundleCard = document.querySelector('.bundle-card');
    const bundleBtn = document.querySelector('.select-bundle-btn');
    bundleCard.classList.remove('selected');
    bundleBtn.classList.remove('selected');
    bundleBtn.querySelector('.btn-text').textContent = 'Get Complete Bundle';
    
    // Hide summary
    document.getElementById('selectionSummary').style.display = 'none';
};

// Proceed to checkout
window.proceedToCheckout = function() {
    if (window.totalPrice === 0) {
        alert('Please select at least one rune or the bundle.');
        return;
    }
    
    // Open payment modal for starter runes
    openPaymentModal('card', 'starter_runes');
};

// Define payment modal functions globally before DOM loads
window.openPaymentModal = function(paymentType, packageType) {
    console.log('openPaymentModal called with:', paymentType, packageType);
    const modal = document.getElementById('paymentModal');
    if (!modal) {
        console.error('Payment modal element not found');
        return;
    }
    const cardForm = document.getElementById('cardPaymentForm');
    const cryptoForm = document.getElementById('cryptoPaymentForm');
    const modalTitle = document.getElementById('paymentModalTitle');
    const submitBtn = document.querySelector('.payment-submit-btn .btn-text');
    
    // Store current payment context
    window.currentPaymentContext = {
        paymentType: paymentType,
        packageType: packageType,
        amount: packageType === 'blind_founder' ? 999 : packageType === 'launch' ? 297 : window.totalPrice,
        email: null,
        selectedRunes: packageType === 'starter_runes' ? [...window.selectedRunes] : [],
        isBundle: packageType === 'starter_runes' ? window.isBundle : false
    };

    if (packageType === 'launch') {
        if (modalTitle) modalTitle.textContent = 'Complete Your Launch Access Purchase';
        if (submitBtn) submitBtn.textContent = 'Complete Purchase - $297';
        const summaryTitle = document.querySelector('.payment-summary h4');
        const summaryOriginal = document.querySelector('.summary-original');
        const summaryPrice = document.querySelector('.summary-price');
        const summarySavings = document.querySelector('.summary-savings');

        if (summaryTitle) summaryTitle.textContent = 'Launch Access Package';
        if (summaryOriginal) summaryOriginal.textContent = '$497';
        if (summaryPrice) summaryPrice.textContent = '$297';
        if (summarySavings) summarySavings.textContent = '40% OFF';
    } else if (packageType === 'blind') {
        if (modalTitle) modalTitle.textContent = 'Complete Your Blind Founder Purchase';
        if (submitBtn) submitBtn.textContent = 'Complete Purchase - $999';
        const summaryTitle = document.querySelector('.payment-summary h4');
        const summaryOriginal = document.querySelector('.summary-original');
        const summaryPrice = document.querySelector('.summary-price');
        const summarySavings = document.querySelector('.summary-savings');

        if (summaryTitle) summaryTitle.textContent = 'Blind Founder Package';
        if (summaryOriginal) summaryOriginal.textContent = '$1,998';
        if (summaryPrice) summaryPrice.textContent = '$999';
        if (summarySavings) summarySavings.textContent = '50% OFF';
    } else if (packageType === 'starter_runes') {
        if (modalTitle) modalTitle.textContent = 'Complete Your Starter Runes Purchase';
        if (submitBtn) submitBtn.textContent = `Complete Purchase - $${window.totalPrice}`;
        const summaryTitle = document.querySelector('.payment-summary h4');
        const summaryOriginal = document.querySelector('.summary-original');
        const summaryPrice = document.querySelector('.summary-price');
        const summarySavings = document.querySelector('.summary-savings');

        if (summaryTitle) {
            summaryTitle.textContent = window.isBundle ? 'Starter Runes Bundle' : 'Selected Starter Runes';
        }
        if (summaryOriginal) {
            summaryOriginal.textContent = window.isBundle ? '$6' : `$${window.selectedRunes.length * 2}`;
        }
        if (summaryPrice) summaryPrice.textContent = `$${window.totalPrice}`;
        if (summarySavings) {
            summarySavings.textContent = window.isBundle ? 'Save $1' : '';
        }
    }

    if (paymentType === 'card') {
        if (cardForm) cardForm.style.display = 'block';
        if (cryptoForm) cryptoForm.style.display = 'none';
    } else if (paymentType === 'crypto') {
        if (cardForm) cardForm.style.display = 'none';
        if (cryptoForm) cryptoForm.style.display = 'block';
    }
    
    document.body.style.overflow = 'hidden';
    
    // Show modal with proper animation
    requestAnimationFrame(() => {
        modal.classList.add('show');
    });
    
    console.log('Modal should be visible now');
};

// Close payment modal
window.closePaymentModal = function() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
};

// Open terms modal
window.openTermsModal = function() {
    const modal = document.getElementById('termsModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
};

// Close terms modal
window.closeTermsModal = function() {
    const modal = document.getElementById('termsModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
};

// Open Launch Access Terms modal
window.openLaunchTermsModal = function() {
    const modal = document.getElementById('launchTermsModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
};

// Close Launch Access Terms modal
window.closeLaunchTermsModal = function() {
    const modal = document.getElementById('launchTermsModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
};

document.addEventListener('DOMContentLoaded', function() {
    
    // Elements
    const waitlistForm = document.getElementById('waitlistForm');
    const emailInput = document.getElementById('email');
    const submitBtn = waitlistForm.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const successModal = document.getElementById('successModal');
    const waitlistCountEl = document.getElementById('waitlistCount');
    
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Dynamic waitlist count - starts from a real base and increments organically
    let waitlistCount = 847; // Starting count
    waitlistCountEl.textContent = waitlistCount;
    
    // Form submission handler
    waitlistForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        // Basic validation
        if (!email) {
            showError('Please enter your email address');
            return;
        }
        
        if (!emailRegex.test(email)) {
            showError('Please enter a valid email address');
            return;
        }
        
        // Check if this is a free rune selection
        const isFreePack = window.selectedFreeRune !== null;
        
        // Show loading state
        setLoadingState(true);
        
        try {
            // Simulate API call (replace with actual endpoint)
            const success = await submitToWaitlist(email, isFreePack ? window.selectedFreeRune : null);
            
            if (success) {
                // Reset form
                waitlistForm.reset();
                
                // Update waitlist count
                waitlistCount++;
                waitlistCountEl.textContent = waitlistCount.toLocaleString();
                
                if (isFreePack) {
                    // Show free download success modal
                    showFreeDownloadModal();
                } else {
                    // Show regular success modal
                    showSuccessModal();
                }
                
                // Track conversion (replace with actual analytics)
                trackConversion(email);
                
            } else {
                showError('Something went wrong. Please try again.');
            }
        } catch (error) {
            console.error('Waitlist submission error:', error);
            showError('Something went wrong. Please try again.');
        } finally {
            setLoadingState(false);
        }
    });
    
    // Submit to waitlist function - Connected to real API
    async function submitToWaitlist(email, selectedRune = null) {
        try {
            const requestBody = { email };
            
            // Add selected rune if this is a free pack request
            if (selectedRune) {
                requestBody.selected_rune = selectedRune;
                requestBody.is_free_pack = true;
            }
            
            const response = await fetch('/capture-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('Email captured successfully:', result);
                
                // Store download URL for later use
                if (result.download_url) {
                    sessionStorage.setItem('starterRuneDownloadUrl', result.download_url);
                }
                
                // Store selected rune info
                if (selectedRune) {
                    sessionStorage.setItem('selectedFreeRune', selectedRune);
                }
                
                return true;
            } else {
                console.error('API request failed:', response.status);
                return false;
            }
        } catch (error) {
            console.error('Network error:', error);
            return false;
        }
    }
    
    // Show error message
    function showError(message) {
        // Remove existing error
        const existingError = waitlistForm.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Create and show error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #ff6b6b;
            font-size: 0.9rem;
            margin-top: 0.5rem;
            text-align: center;
            animation: fadeIn 0.3s ease;
        `;
        
        waitlistForm.appendChild(errorDiv);
        
        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
        
        // Focus back to input
        emailInput.focus();
    }
    
    // Set loading state
    function setLoadingState(loading) {
        if (loading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }
    
    // Show success modal
    function showSuccessModal() {
        successModal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Add celebration effect
        createCelebrationEffect();
    }
    
    // Show free download modal
    function showFreeDownloadModal() {
        const selectedRune = window.selectedFreeRune;
        const runeNames = {
            'flowrune': 'FlowRune',
            'ansuz': 'Ansuz',
            'laguz': 'Laguz'
        };
        const runeIcons = {
            'flowrune': 'ᚠ',
            'ansuz': 'ᚨ',
            'laguz': 'ᛚ'
        };
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <h3><span class="rune-icon">${runeIcons[selectedRune]}</span> ${runeNames[selectedRune]} Ready!</h3>
                <div class="download-success">
                    <div class="download-preview">
                        <span class="download-rune">${runeIcons[selectedRune]}</span>
                        <div>
                            <h4>${runeNames[selectedRune]} - The Starter Pack</h4>
                            <p>Your free automation template package is ready to download</p>
                        </div>
                    </div>
                    <div class="download-actions">
                        <button class="download-btn" onclick="downloadSelectedRune()">📦 Download ZIP Package</button>
                        <p class="download-note">Complete ZIP Package • n8n Workflow + Setup Guide</p>
                    </div>
                </div>
                <p>Check your email for setup instructions and additional resources!</p>
                <button class="modal-close" onclick="closeFreeDownloadModal()">Continue</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Trigger animation after DOM insertion
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
        
        // Add celebration effect
        createCelebrationEffect();
    }
    
    // Close free download modal
    window.closeFreeDownloadModal = function() {
        const modal = document.querySelector('.modal.show');
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
            
            // Remove modal after animation completes
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.remove();
                }
            }, 300); // Match CSS transition duration
        }
    };
    
    // Download selected rune
    window.downloadSelectedRune = function() {
        const selectedRune = sessionStorage.getItem('selectedFreeRune') || window.selectedFreeRune;
        
        if (!selectedRune) {
            console.error('No rune selected for download');
            return;
        }
        
        // Show loading state
        const downloadBtn = document.querySelector('.download-btn');
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = 'Preparing Download...';
        downloadBtn.disabled = true;
        
        // Try to get download URL from session storage first
        const downloadUrl = sessionStorage.getItem('starterRuneDownloadUrl');
        
        if (downloadUrl) {
            // Use real API download endpoint
            const fullUrl = `${downloadUrl}`;
            
            // Create temporary link for download
            const a = document.createElement('a');
            a.href = fullUrl;
            a.download = `runeflow-${selectedRune}-template.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Show success message
            downloadBtn.textContent = 'Downloaded! ✓';
            downloadBtn.style.background = '#4ecdc4';
            
            // Track download event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'download', {
                    'event_category': 'free_starter_pack',
                    'event_label': `${selectedRune}_zip`,
                    'value': 1
                });
            }
            
            // Reset button after 3 seconds
            setTimeout(() => {
                downloadBtn.textContent = originalText;
                downloadBtn.style.background = '';
                downloadBtn.disabled = false;
            }, 3000);
        } else {
            // Fallback: Try direct download from backend
            const directDownloadUrl = `/download/rune/${selectedRune}`;
            
            // Create temporary link for download
            const a = document.createElement('a');
            a.href = directDownloadUrl;
            a.download = `runeflow-${selectedRune}-template.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Show success message
            downloadBtn.textContent = 'Downloaded! ✓';
            downloadBtn.style.background = '#4ecdc4';
            
            // Track download event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'download', {
                    'event_category': 'free_starter_pack',
                    'event_label': `${selectedRune}_zip_direct`,
                    'value': 1
                });
            }
            
            // Reset button after 3 seconds
            setTimeout(() => {
                downloadBtn.textContent = originalText;
                downloadBtn.style.background = '';
                downloadBtn.disabled = false;
            }, 3000);
        }
    };
    
    // Close modal
    window.closeModal = function() {
        successModal.classList.remove('show');
        document.body.style.overflow = 'auto';
    };
    
    // Download starter rune function - Connected to real API
    window.downloadStarter = function() {
        // Show loading state
        const downloadBtn = document.querySelector('.download-btn');
        const originalText = downloadBtn.textContent;
        downloadBtn.textContent = 'Preparing Download...';
        downloadBtn.disabled = true;
        
        // Try to get download URL from session storage first
        const downloadUrl = sessionStorage.getItem('starterRuneDownloadUrl');
        
        if (downloadUrl) {
            // Use real API download endpoint
            const fullUrl = `${downloadUrl}`;
            
            // Create temporary link for download
            const a = document.createElement('a');
            a.href = fullUrl;
            a.download = 'runeflow-starter-rune-ansuz.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Show success message
            downloadBtn.textContent = 'Downloaded! ✓';
            downloadBtn.style.background = '#4ecdc4';
            
            // Track download event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'download', {
                    'event_category': 'starter_pack',
                    'event_label': 'ansuz_messenger_real',
                    'value': 1
                });
            }
            
            // Reset button after 3 seconds
            setTimeout(() => {
                downloadBtn.textContent = originalText;
                downloadBtn.style.background = '';
                downloadBtn.disabled = false;
            }, 3000);
        } else {
            // Fallback to ZIP creation if no download URL
            createStarterPackZip().then(() => {
                downloadBtn.textContent = 'Downloaded! ✓';
                downloadBtn.style.background = '#4ecdc4';
                
                setTimeout(() => {
                    downloadBtn.textContent = originalText;
                    downloadBtn.style.background = '';
                    downloadBtn.disabled = false;
                }, 3000);
            }).catch(error => {
                console.error('Download failed:', error);
                downloadBtn.textContent = 'Download Failed - Try Again';
                downloadBtn.style.background = '#ff4444';
                
                setTimeout(() => {
                    downloadBtn.textContent = originalText;
                    downloadBtn.style.background = '';
                    downloadBtn.disabled = false;
                }, 3000);
            });
        }
    };
    
// Coinbase Commerce Integration
window.initiateCoinbasePayment = async function() {
    try {
        // Get the current payment context
        const context = window.currentPaymentContext;
        if (!context) {
            throw new Error('No payment context available');
        }
        
        // Get user email from context first, then from input field
        let userEmail = context.email;
        if (!userEmail) {
            const emailInput = document.getElementById('paymentEmail');
            userEmail = emailInput ? emailInput.value : null;
        }
        
        if (!userEmail) {
            // Show email collection modal
            showEmailRequiredModal();
            return;
        }
        
        // Show loading state
        const coinbaseBtn = document.querySelector('.coinbase-btn');
        const originalText = coinbaseBtn.innerHTML;
        coinbaseBtn.innerHTML = '<span class="coinbase-logo">⚡</span><span class="coinbase-text">Loading...</span>';
        coinbaseBtn.disabled = true;
        
        // Create Coinbase Commerce charge
        const response = await fetch('/api/coinbase/create-charge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                packageType: context.packageType,
                userEmail: userEmail,
                amount: context.amount,
                description: getPackageDescription(context.packageType)
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.checkout_url) {
            // Redirect to Coinbase Commerce checkout
            window.open(data.checkout_url, '_blank');
            
            // Start monitoring the payment
            monitorCoinbasePayment(data.charge_id);
            
            // Show success message
            showCoinbaseRedirectMessage();
        } else {
            throw new Error(data.error || 'Failed to create Coinbase Commerce charge');
        }
        
    } catch (error) {
        console.error('Error creating Coinbase Commerce charge:', error);
        showPaymentError('Failed to create Coinbase payment. Please try again.');
    } finally {
        // Reset button
        const coinbaseBtn = document.querySelector('.coinbase-btn');
        if (coinbaseBtn) {
            coinbaseBtn.innerHTML = originalText;
            coinbaseBtn.disabled = false;
        }
    }
};

// Get package description for Coinbase Commerce
function getPackageDescription(packageType) {
    switch (packageType) {
        case 'blind':
        case 'blind_founder':
            return 'RuneFlow Blind Founder Package - Lifetime access to all 8,000+ automation templates';
        case 'launch':
            return 'RuneFlow Launch Access Package - Annual subscription with 40% discount';
        case 'starter_runes':
            return 'RuneFlow Starter Runes Package - Individual automation templates';
        default:
            return 'RuneFlow Premium Package';
    }
}

// Monitor Coinbase Commerce payment
async function monitorCoinbasePayment(chargeId) {
    const maxAttempts = 60; // Monitor for 30 minutes
    let attempts = 0;
    
    const checkPayment = async () => {
        try {
            const response = await fetch(`/api/coinbase/charge/${chargeId}`);
            const data = await response.json();
            
            if (data.success) {
                const status = data.status;
                
                switch (status) {
                    case 'COMPLETED':
                        handleCoinbasePaymentSuccess(data);
                        return;
                    case 'FAILED':
                    case 'EXPIRED':
                        handleCoinbasePaymentFailed(data);
                        return;
                    case 'PENDING':
                    case 'NEW':
                        attempts++;
                        if (attempts < maxAttempts) {
                            setTimeout(checkPayment, 30000); // Check every 30 seconds
                        } else {
                            handleCoinbasePaymentTimeout();
                        }
                        break;
                }
            }
        } catch (error) {
            console.error('Error checking Coinbase payment:', error);
            attempts++;
            if (attempts < maxAttempts) {
                setTimeout(checkPayment, 30000);
            }
        }
    };
    
    // Start monitoring after initial delay
    setTimeout(checkPayment, 30000);
}

// Handle successful Coinbase payment
function handleCoinbasePaymentSuccess(data) {
    console.log('Coinbase payment successful:', data);
    closePaymentModal();
    showCoinbaseSuccessModal(data);
    trackPaymentConversion();
    
    // Update spots remaining
    const spotsEl = document.getElementById('spotsRemaining');
    if (spotsEl) {
        const currentSpots = parseInt(spotsEl.textContent);
        spotsEl.textContent = Math.max(0, currentSpots - 1);
    }
}

// Handle failed Coinbase payment
function handleCoinbasePaymentFailed(data) {
    console.log('Coinbase payment failed:', data);
    showPaymentError('Your Coinbase payment was not completed. Please try again.');
}

// Handle Coinbase payment timeout
function handleCoinbasePaymentTimeout() {
    console.log('Coinbase payment monitoring timed out');
    showPaymentError('Payment monitoring timed out. Please check your payment status.');
}

// Show Coinbase redirect message
function showCoinbaseRedirectMessage() {
    const message = document.createElement('div');
    message.className = 'coinbase-redirect-message';
    message.innerHTML = `
        <div class="redirect-content">
            <h4>🚀 Redirecting to Coinbase Commerce</h4>
            <p>Complete your payment in the new tab that opened. This page will automatically update when payment is confirmed.</p>
            <div class="redirect-spinner">⚡</div>
        </div>
    `;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #0052ff 0%, #0041cc 100%);
        color: white;
        padding: 1.5rem;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 1002;
        max-width: 350px;
        animation: slideInFromRight 0.3s ease;
    `;
    
    document.body.appendChild(message);
    
    // Remove message after 10 seconds
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 10000);
}

// Show Coinbase success modal
function showCoinbaseSuccessModal(data) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <h3><span class="rune-icon">₿</span> Coinbase Payment Successful!</h3>
            <div class="coinbase-success-content">
                <div class="success-icon">✅</div>
                <p>Your payment has been successfully processed through Coinbase Commerce.</p>
                <div class="payment-details">
                    <p><strong>Amount:</strong> $${window.currentPaymentContext.amount}</p>
                    <p><strong>Package:</strong> ${getPackageDescription(window.currentPaymentContext.packageType)}</p>
                </div>
                <div class="next-steps">
                    <h4>What happens next:</h4>
                    <ul>
                        <li>✓ Confirmation email sent to your inbox</li>
                        <li>✓ Access credentials provided on launch day</li>
                        <li>✓ You're now part of the exclusive founders group</li>
                    </ul>
                </div>
            </div>
            <button class="modal-close" onclick="closeCoinbaseSuccessModal()">Continue</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    createPaymentCelebration();
}

// Close Coinbase success modal
window.closeCoinbaseSuccessModal = function() {
    const modal = document.querySelector('.modal.show');
    if (modal) {
        modal.remove();
    }
};

// Show email required modal for Coinbase payments
function showEmailRequiredModal() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Email Required</h3>
                <button class="modal-close-btn" onclick="closeEmailRequiredModal()">&times;</button>
            </div>
            <div class="email-required-content">
                <p>Please enter your email address to continue with Coinbase Commerce payment.</p>
                <div class="form-group">
                    <label for="coinbaseEmail">Email Address</label>
                    <input type="email" id="coinbaseEmail" placeholder="your@email.com" required>
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="closeEmailRequiredModal()">Cancel</button>
                    <button class="btn-primary" onclick="proceedWithCoinbasePayment()">Continue Payment</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus on email input
    setTimeout(() => {
        document.getElementById('coinbaseEmail').focus();
    }, 100);
}

// Close email required modal
window.closeEmailRequiredModal = function() {
    const modal = document.querySelector('.modal.show');
    if (modal) {
        modal.remove();
    }
};

// Proceed with Coinbase payment after email is entered
window.proceedWithCoinbasePayment = function() {
    const emailInput = document.getElementById('coinbaseEmail');
    const email = emailInput ? emailInput.value.trim() : '';
    
    if (!email) {
        alert('Please enter your email address.');
        return;
    }
    
    if (!isValidEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    // Store email in window.currentPaymentContext for immediate use
    if (window.currentPaymentContext) {
        window.currentPaymentContext.email = email;
    }
    
    // Also try to store in payment modal's email field if it exists
    const paymentEmailInput = document.getElementById('paymentEmail');
    if (paymentEmailInput) {
        paymentEmailInput.value = email;
    }
    
    // Close modal and proceed with payment
    closeEmailRequiredModal();
    
    // Retry the Coinbase payment immediately without delay
    initiateCoinbasePayment();
};

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Create comprehensive starter pack ZIP file
    async function createStarterPackZip() {
        // Dynamic import of JSZip (we'll need to include this library)
        const JSZip = await loadJSZip();
        const zip = new JSZip();
        
        // Main n8n workflow template
        const workflowTemplate = {
            "name": "Ansuz - The Messenger",
            "nodes": [
                {
                    "parameters": {
                        "httpMethod": "POST",
                        "path": "email-signup",
                        "responseMode": "responseNode",
                        "options": {}
                    },
                    "id": "0a6e2c7d-6e1c-4e1a-9b2f-1c3d4e5f6a7b",
                    "name": "Email Signup Webhook",
                    "type": "n8n-nodes-base.webhook",
                    "typeVersion": 1,
                    "position": [240, 300],
                    "webhookId": "runeflow-email-signup-webhook"
                },
                {
                    "parameters": {
                        "amount": 5,
                        "unit": "minutes"
                    },
                    "id": "1b7f3d8e-7f2d-5f2b-ac3g-2d4e5f6g7h8i",
                    "name": "Welcome Delay",
                    "type": "n8n-nodes-base.wait",
                    "typeVersion": 1,
                    "position": [460, 300]
                },
                {
                    "parameters": {
                        "sendTo": "={{ $json.email }}",
                        "subject": "Welcome to RuneFlow, {{ $json.name }}!",
                        "message": "=" + getWelcomeEmailHTML(),
                        "options": {
                            "allowUnauthorizedCerts": true,
                            "replyTo": "support@runeflow.co"
                        }
                    },
                    "id": "2c8g4e9f-8g3e-6g3c-bd4h-3e5f6g7h8i9j",
                    "name": "Welcome Email",
                    "type": "n8n-nodes-base.emailSend",
                    "typeVersion": 1,
                    "position": [680, 300]
                },
                {
                    "parameters": {
                        "resource": "contact",
                        "operation": "create",
                        "additionalFields": {
                            "customFields": {
                                "customFieldsValues": [
                                    {
                                        "fieldId": "subscription_source",
                                        "value": "runeflow_starter_pack"
                                    },
                                    {
                                        "fieldId": "signup_date",
                                        "value": "={{ $now }}"
                                    }
                                ]
                            },
                            "tags": "new-subscriber,starter-pack,runeflow-founder"
                        },
                        "email": "={{ $json.email }}",
                        "firstName": "={{ $json.name.split(' ')[0] }}",
                        "lastName": "={{ $json.name.split(' ')[1] || '' }}"
                    },
                    "id": "3d9h5f0g-9h4f-7h4d-ce5i-4f6g7h8i9j0k",
                    "name": "Add to CRM",
                    "type": "n8n-nodes-base.hubspot",
                    "typeVersion": 1,
                    "position": [900, 300]
                },
                {
                    "parameters": {
                        "mode": "raw",
                        "jsonData": "{\n  \"success\": true,\n  \"message\": \"Welcome to RuneFlow! Check your email for your starter pack.\",\n  \"data\": {\n    \"email\": \"{{ $json.email }}\",\n    \"name\": \"{{ $json.name }}\",\n    \"starter_pack\": \"ansuz-messenger\",\n    \"download_url\": \"https://runeflow.co/downloads/starter-pack.zip\",\n    \"next_steps\": [\n      \"Check your email for setup instructions\",\n      \"Import the workflow into n8n\",\n      \"Configure your email credentials\",\n      \"Test the automation\"\n    ]\n  }\n}",
                        "options": {}
                    },
                    "id": "8i4m0k5l-4m9k-2m9i-hj0n-9k1l2m3n4o5p",
                    "name": "Return Response",
                    "type": "n8n-nodes-base.respondToWebhook",
                    "typeVersion": 1,
                    "position": [1120, 300]
                }
            ],
            "connections": {
                "Email Signup Webhook": {
                    "main": [
                        [
                            {
                                "node": "Welcome Delay",
                                "type": "main",
                                "index": 0
                            }
                        ]
                    ]
                },
                "Welcome Delay": {
                    "main": [
                        [
                            {
                                "node": "Welcome Email",
                                "type": "main",
                                "index": 0
                            }
                        ]
                    ]
                },
                "Welcome Email": {
                    "main": [
                        [
                            {
                                "node": "Add to CRM",
                                "type": "main",
                                "index": 0
                            }
                        ]
                    ]
                },
                "Add to CRM": {
                    "main": [
                        [
                            {
                                "node": "Return Response",
                                "type": "main",
                                "index": 0
                            }
                        ]
                    ]
                }
            },
            "active": true,
            "settings": {
                "saveManualExecutions": true,
                "callerPolicy": "workflowsFromSameOwner"
            },
            "staticData": {},
            "tags": ["email-automation", "starter-pack", "runeflow"],
            "meta": {
                "version": "1.0.0",
                "description": "Ansuz - The Messenger: Complete email automation workflow for new subscriber onboarding",
                "author": "RuneFlow Team",
                "category": "Email Marketing",
                "difficulty": "Beginner",
                "estimated_setup_time": "5 minutes",
                "required_credentials": [
                    "Email service (Gmail/Outlook)",
                    "HubSpot CRM (optional)"
                ]
            }
        };
        
        // Add workflow JSON to ZIP
        zip.file("ansuz-messenger-workflow.json", JSON.stringify(workflowTemplate, null, 2));
        
        // Add comprehensive README
        const readmeContent = getStarterPackReadme();
        zip.file("README.md", readmeContent);
        
        // Add email template HTML
        const emailTemplate = getEmailTemplateHTML();
        zip.file("email-template.html", emailTemplate);
        
        // Add quick start guide
        const quickStartGuide = getQuickStartGuide();
        zip.file("QUICK_START.md", quickStartGuide);
        
        // Add credentials setup guide
        const credentialsGuide = getCredentialsGuide();
        zip.file("CREDENTIALS_SETUP.md", credentialsGuide);
        
        // Add sample webhook test file
        const webhookTest = getWebhookTestFile();
        zip.file("test-webhook.json", webhookTest);
        
        // Generate ZIP file
        const zipBlob = await zip.generateAsync({type: "blob"});
        
        // Create download link
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'runeflow-starter-pack-ansuz-messenger.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Close modal on outside click
    successModal.addEventListener('click', function(e) {
        if (e.target === successModal) {
            closeModal();
        }
    });
    
    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && successModal.classList.contains('show')) {
            closeModal();
        }
    });
    
    // Create celebration effect
    function createCelebrationEffect() {
        const colors = ['#d4af37', '#46b29d', '#e0e1dd'];
        const runes = ['ᚨ', 'ᛞ', 'ᚱ', 'ᚦ', 'ᛗ', 'ᛊ', 'ᛖ', 'ᛚ'];
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.textContent = runes[Math.floor(Math.random() * runes.length)];
                particle.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    color: ${colors[Math.floor(Math.random() * colors.length)]};
                    font-size: 1.5rem;
                    pointer-events: none;
                    z-index: 1001;
                    animation: celebrate 2s ease-out forwards;
                `;
                
                document.body.appendChild(particle);
                
                // Remove particle after animation
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.remove();
                    }
                }, 2000);
            }, i * 100);
        }
    }
    
    // Track conversion (replace with actual analytics)
    function trackConversion(email) {
        // Google Analytics example
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                'event_category': 'waitlist',
                'event_label': 'email_signup',
                'value': 1
            });
        }
        
        // Facebook Pixel example
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                content_name: 'Waitlist Signup',
                content_category: 'email_signup'
            });
        }
        
        // Custom tracking
        console.log('Waitlist conversion tracked:', email);
    }
    
    // Animate waitlist count on page load
    function animateWaitlistCount() {
        const finalCount = parseInt(waitlistCountEl.textContent);
        const startCount = Math.max(0, finalCount - 50);
        const duration = 2000;
        const startTime = performance.now();
        
        function updateCount(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentCount = Math.floor(startCount + (finalCount - startCount) * progress);
            waitlistCountEl.textContent = currentCount.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCount);
            }
        }
        
        requestAnimationFrame(updateCount);
    }
    
    // Load waitlist count from localStorage if available, otherwise animate
    const savedWaitlistCount = localStorage.getItem('waitlistCount');
    if (savedWaitlistCount) {
        waitlistCount = parseInt(savedWaitlistCount);
        waitlistCountEl.textContent = waitlistCount;
    } else {
        // Start count animation after a short delay
        setTimeout(animateWaitlistCount, 500);
    }
    
    // Organically increment waitlist count - more realistic timing
    setInterval(() => {
        if (Math.random() < 0.4) { // 40% chance to increment (more realistic)
            waitlistCount++;
            waitlistCountEl.textContent = waitlistCount;
            localStorage.setItem('waitlistCount', waitlistCount);
            console.log('Waitlist count updated:', waitlistCount);
        }
    }, Math.random() * 1800000 + 1800000); // 30-60 minutes (more realistic)
    
    // Social sharing functionality
    window.shareOnTwitter = function() {
        const text = encodeURIComponent("🔥 The ultimate n8n automation template marketplace is coming! Join the waiting list at RuneFlow.co for exclusive founding member perks. #automation #n8n #workflows");
        const url = encodeURIComponent(window.location.href);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    };
    
    window.shareOnLinkedIn = function() {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent("RuneFlow.co - Ultimate n8n Template Marketplace Coming Soon");
        const summary = encodeURIComponent("Join 1000+ automation masters waiting for the most powerful collection of n8n workflow templates ever assembled.");
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank');
    };
    
    // Email input enhancements
    emailInput.addEventListener('input', function() {
        // Remove any existing error when user starts typing
        const existingError = waitlistForm.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    });
    
    // Keyboard navigation for form
    emailInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            waitlistForm.dispatchEvent(new Event('submit'));
        }
    });
    
    // Floating runes interaction (subtle hover effect)
    const floatingRunes = document.querySelectorAll('.floating-runes .rune-float');
    floatingRunes.forEach(rune => {
        rune.addEventListener('mouseenter', function() {
            this.style.animation = 'floatRune 3s ease-in-out infinite';
            this.style.opacity = '0.3';
        });
        
        rune.addEventListener('mouseleave', function() {
            this.style.animation = 'floatRune 15s ease-in-out infinite';
            this.style.opacity = '0.1';
        });
    });
    
    // Scroll-triggered animations
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        const animatedElements = document.querySelectorAll('.benefit-item, .timeline-item, .proof-item');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            observer.observe(el);
        });
    }
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Preload success modal content
    function preloadModalContent() {
        const modalContent = successModal.querySelector('.modal-content');
        modalContent.style.transform = 'scale(0.9)';
        modalContent.style.opacity = '0';
        modalContent.style.transition = 'all 0.3s ease';
        
        // When modal is shown, animate content
        const originalShow = successModal.classList.add;
        successModal.classList.add = function(className) {
            originalShow.call(this, className);
            if (className === 'show') {
                setTimeout(() => {
                    modalContent.style.transform = 'scale(1)';
                    modalContent.style.opacity = '1';
                }, 100);
            }
        };
    }
    
    preloadModalContent();
    
    // Performance optimization: Debounce resize events
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            // Handle any resize-specific logic here
            console.log('Window resized');
        }, 250);
    });
    
    // Add CSS animation for fadeInUp
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes celebrate {
            0% {
                transform: translate(-50%, -50%) scale(1) rotate(0deg);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) translate(${Math.random() * 400 - 200}px, ${Math.random() * 400 - 200}px) scale(0.5) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    console.log('RuneFlow Coming Soon page initialized');
    
    // Initialize payment functionality
    initializePaymentSystem();
    
    // Initialize countdown timer
    initializeCountdownTimer();
});

// Payment system initialization
function initializePaymentSystem() {
    const paymentForm = document.getElementById('paymentForm');
    const spotsRemainingEl = document.getElementById('spotsRemaining');
    
    // Load spots remaining from localStorage if available
    const savedSpots = localStorage.getItem('spotsRemaining');
    if (savedSpots && parseInt(savedSpots) > 0) {
        spotsRemainingEl.textContent = savedSpots;
    }
    
    // Transparent spots counter - starts at realistic number based on current time
    const now = new Date();
    const daysSinceLaunch = Math.floor((now - new Date('2025-01-22')) / (1000 * 60 * 60 * 24));
    let spotsRemaining = Math.max(15, 100 - Math.floor(daysSinceLaunch * 2.5)); // Decreases ~2-3 per day organically
    
    // Load from localStorage if available, but keep realistic bounds
    const savedSpots = localStorage.getItem('spotsRemaining');
    if (savedSpots && parseInt(savedSpots) > 5 && parseInt(savedSpots) <= 100) {
        spotsRemaining = parseInt(savedSpots);
    }
    
    spotsRemainingEl.textContent = spotsRemaining;
    localStorage.setItem('spotsRemaining', spotsRemaining);
    
    // Organically decrease spots every 3-6 hours
    setInterval(() => {
        if (spotsRemaining > 8 && Math.random() < 0.3) { // 30% chance every 3-6 hours
            spotsRemaining--;
            spotsRemainingEl.textContent = spotsRemaining;
            localStorage.setItem('spotsRemaining', spotsRemaining);
            console.log('Founder spots remaining:', spotsRemaining);
        }
    }, Math.random() * 10800000 + 10800000); // 3-6 hours
    
    // Handle payment form submission
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmission);
    }
    
    // Format card number input
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', formatCardNumber);
    }
    
    // Format expiry date input
    const cardExpiryInput = document.getElementById('cardExpiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', formatExpiryDate);
    }
    
    // Format CVC input
    const cardCvcInput = document.getElementById('cardCvc');
    if (cardCvcInput) {
        cardCvcInput.addEventListener('input', formatCvc);
    }
}


// Handle payment form submission
async function handlePaymentSubmission(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('.payment-submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Simulate successful payment
        const success = await processPayment();
        
        if (success) {
            // Close payment modal
            closePaymentModal();
            
            // Show success message
            showPaymentSuccessModal();
            
            // Track conversion
            trackPaymentConversion();
            
            // Update spots remaining
            const spotsEl = document.getElementById('spotsRemaining');
            const currentSpots = parseInt(spotsEl.textContent);
            spotsEl.textContent = Math.max(0, currentSpots - 1);
            
        } else {
            showPaymentError('Payment failed. Please try again.');
        }
    } catch (error) {
        console.error('Payment error:', error);
        showPaymentError('Something went wrong. Please try again.');
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Process payment (simulate)
async function processPayment() {
    // In production, this would integrate with Stripe, PayPal, etc.
    // For demo purposes, we'll simulate success
    return true;
}

// Show payment success modal
function showPaymentSuccessModal() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <h3><span class="rune-icon fire-rune">ᚠ</span> Welcome, Blind Founder!</h3>
            <p>Your payment has been processed successfully! You'll receive an email with your dashboard access credentials on launch day.</p>
            <div class="founder-benefits-summary">
                <h4>Your Blind Founder Benefits:</h4>
                <ul>
                    <li>✓ 50% lifetime discount locked in</li>
                    <li>✓ Dashboard access on day 0</li>
                    <li>✓ All 2,500+ templates included</li>
                    <li>✓ Exclusive founder badge</li>
                    <li>✓ Priority support</li>
                </ul>
            </div>
            <button class="modal-close" onclick="closePaymentSuccessModal()">Continue</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add celebration effect
    createPaymentCelebration();
}

// Close payment success modal
window.closePaymentSuccessModal = function() {
    const modal = document.querySelector('.modal.show');
    if (modal) {
        modal.remove();
    }
};

// Show payment error
function showPaymentError(message) {
    const existingError = document.querySelector('.payment-error');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'payment-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Create payment celebration effect
function createPaymentCelebration() {
    const colors = ['#ff6b35', '#d4af37', '#46b29d', '#ffd23f'];
    const runes = ['ᚠ', 'ᚦ', 'ᛏ', 'ᚱ', 'ᚨ', 'ᛞ', 'ᛗ', 'ᛊ'];
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.textContent = runes[Math.floor(Math.random() * runes.length)];
            particle.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                color: ${colors[Math.floor(Math.random() * colors.length)]};
                font-size: 2rem;
                font-family: 'Cinzel', serif;
                font-weight: 700;
                pointer-events: none;
                z-index: 1002;
                animation: celebratePayment 3s ease-out forwards;
            `;
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, 3000);
        }, i * 100);
    }
}

// Crypto payment functions
window.selectCrypto = async function(cryptoType) {
    const options = document.querySelectorAll('.crypto-option');
    options.forEach(option => option.classList.remove('selected'));
    
    const selectedOption = event.target.closest('.crypto-option');
    selectedOption.classList.add('selected');
    
    const cryptoDetails = document.getElementById('cryptoPaymentDetails');
    const cryptoAddress = document.getElementById('cryptoAddress');
    
    // Show loading state
    cryptoAddress.value = 'Generating payment address...';
    cryptoDetails.style.display = 'block';
    
    try {
        // Create crypto payment charge
        const response = await createCryptoCharge(cryptoType);
        
        if (response.success) {
            // Update payment details
            cryptoAddress.value = response.payment_addresses[cryptoType.toUpperCase()];
            
            // Store charge ID for tracking
            window.currentCryptoCharge = {
                charge_id: response.charge_id,
                charge_url: response.charge_url,
                expires_at: response.expires_at
            };
            
            // Start payment monitoring
            monitorCryptoPayment(response.charge_id);
            
            // Update QR code placeholder
            const qrPlaceholder = document.querySelector('.qr-placeholder');
            qrPlaceholder.innerHTML = `<p>Payment expires: ${new Date(response.expires_at).toLocaleString()}</p>`;
            
        } else {
            throw new Error(response.error || 'Failed to create crypto charge');
        }
        
    } catch (error) {
        console.error('Error creating crypto charge:', error);
        cryptoAddress.value = 'Error generating address. Please try again.';
        showPaymentError('Failed to create crypto payment. Please try again.');
    }
};

// Create crypto charge
async function createCryptoCharge(cryptoType) {
    const context = window.currentPaymentContext;
    if (!context) {
        throw new Error('No payment context available');
    }
    
    const emailInput = document.getElementById('paymentEmail');
    const userEmail = emailInput ? emailInput.value : context.email;
    
    if (!userEmail) {
        throw new Error('Email is required for crypto payment');
    }
    
    const response = await fetch('/api/crypto/create-charge', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            packageType: context.packageType,
            userEmail: userEmail,
            amount: context.amount,
            cryptoType: cryptoType
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

// Monitor crypto payment status
async function monitorCryptoPayment(chargeId) {
    const maxAttempts = 60; // Monitor for 30 minutes (30 seconds * 60)
    let attempts = 0;
    
    const checkPayment = async () => {
        try {
            const response = await fetch(`/api/crypto/charge/${chargeId}`);
            const data = await response.json();
            
            if (data.success) {
                const status = data.status;
                
                switch (status) {
                    case 'CONFIRMED':
                        // Payment confirmed!
                        handleCryptoPaymentSuccess(data);
                        return; // Stop monitoring
                    
                    case 'FAILED':
                        // Payment failed
                        handleCryptoPaymentFailed(data);
                        return; // Stop monitoring
                    
                    case 'EXPIRED':
                        // Payment expired
                        handleCryptoPaymentExpired(data);
                        return; // Stop monitoring
                    
                    case 'PENDING':
                    case 'NEW':
                        // Keep monitoring
                        attempts++;
                        if (attempts < maxAttempts) {
                            setTimeout(checkPayment, 30000); // Check every 30 seconds
                        } else {
                            handleCryptoPaymentTimeout();
                        }
                        break;
                    
                    default:
                        console.log('Unknown payment status:', status);
                        attempts++;
                        if (attempts < maxAttempts) {
                            setTimeout(checkPayment, 30000);
                        }
                        break;
                }
            } else {
                throw new Error(data.error || 'Failed to check payment status');
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
            attempts++;
            if (attempts < maxAttempts) {
                setTimeout(checkPayment, 30000);
            }
        }
    };
    
    // Start monitoring
    setTimeout(checkPayment, 30000); // First check after 30 seconds
}

// Handle successful crypto payment
function handleCryptoPaymentSuccess(paymentData) {
    console.log('Crypto payment confirmed:', paymentData);
    
    // Close payment modal
    closePaymentModal();
    
    // Show success message
    showCryptoPaymentSuccessModal(paymentData);
    
    // Track conversion
    trackPaymentConversion();
    
    // Update spots remaining
    const spotsEl = document.getElementById('spotsRemaining');
    if (spotsEl) {
        const currentSpots = parseInt(spotsEl.textContent);
        spotsEl.textContent = Math.max(0, currentSpots - 1);
    }
}

// Handle failed crypto payment
function handleCryptoPaymentFailed(paymentData) {
    console.log('Crypto payment failed:', paymentData);
    showPaymentError('Your crypto payment failed. Please try again or contact support.');
}

// Handle expired crypto payment
function handleCryptoPaymentExpired(paymentData) {
    console.log('Crypto payment expired:', paymentData);
    showPaymentError('Your crypto payment has expired. Please create a new payment.');
}

// Handle payment timeout
function handleCryptoPaymentTimeout() {
    console.log('Crypto payment monitoring timed out');
    showPaymentError('Payment monitoring timed out. Please check your payment status manually.');
}

// Show crypto payment success modal
function showCryptoPaymentSuccessModal(paymentData) {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <h3><span class="rune-icon crypto-rune">₿</span> Crypto Payment Confirmed!</h3>
            <p>Your cryptocurrency payment has been successfully processed.</p>
            <div class="payment-details">
                <p><strong>Transaction ID:</strong> ${paymentData.charge_id}</p>
                <p><strong>Amount:</strong> $${window.currentPaymentContext.amount}</p>
                <p><strong>Package:</strong> ${window.currentPaymentContext.packageType === 'blind_founder' ? 'Blind Founder' : 'Launch Access'}</p>
            </div>
            <div class="founder-benefits-summary">
                <h4>What happens next:</h4>
                <ul>
                    <li>✓ Confirmation email sent to your inbox</li>
                    <li>✓ Access credentials will be provided on launch day</li>
                    <li>✓ You're now part of the exclusive founders group</li>
                    <li>✓ Watch for updates and early access notifications</li>
                </ul>
            </div>
            <button class="modal-close" onclick="closeCryptoSuccessModal()">Continue</button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add celebration effect
    createPaymentCelebration();
}

// Close crypto success modal
window.closeCryptoSuccessModal = function() {
    const modal = document.querySelector('.modal.show');
    if (modal) {
        modal.remove();
    }
};

// Copy crypto address
window.copyAddress = function() {
    const addressInput = document.getElementById('cryptoAddress');
    addressInput.select();
    document.execCommand('copy');
    
    const copyBtn = document.querySelector('.copy-btn');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    copyBtn.style.background = '#4ecdc4';
    
    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = '';
    }, 2000);
};

// Format card number
function formatCardNumber(e) {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let matches = value.match(/\d{4,16}/g);
    let match = matches && matches[0] || '';
    let parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
        e.target.value = parts.join(' ');
    } else {
        e.target.value = value;
    }
}

// Format expiry date
function formatExpiryDate(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
}

// Format CVC
function formatCvc(e) {
    let value = e.target.value.replace(/\D/g, '');
    e.target.value = value.substring(0, 4);
}

// Track payment conversion
function trackPaymentConversion() {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', 'purchase', {
            transaction_id: 'BF_' + Date.now(),
            value: 999,
            currency: 'USD',
            items: [{
                item_id: 'blind_founder_package',
                item_name: 'Blind Founder Package',
                category: 'subscription',
                quantity: 1,
                price: 999
            }]
        });
    }
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', 'Purchase', {
            value: 999,
            currency: 'USD',
            content_name: 'Blind Founder Package',
            content_category: 'subscription'
        });
    }
    
    console.log('Payment conversion tracked: Blind Founder Package - $999');
}

// Add payment celebration animation CSS
const paymentAnimationStyle = document.createElement('style');
paymentAnimationStyle.textContent = `
    @keyframes celebratePayment {
        0% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) translate(${Math.random() * 600 - 300}px, ${Math.random() * 600 - 300}px) scale(0.3) rotate(720deg);
            opacity: 0;
        }
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .founder-benefits-summary {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 107, 53, 0.3);
        border-radius: 15px;
        padding: 1.5rem;
        margin: 1.5rem 0;
        text-align: left;
    }
    
    .founder-benefits-summary h4 {
        color: #ff6b35;
        margin-bottom: 1rem;
        font-size: 1.2rem;
    }
    
    .founder-benefits-summary ul {
        list-style: none;
        padding: 0;
    }
    
    .founder-benefits-summary li {
        padding: 0.5rem 0;
        color: #e0e1dd;
        font-size: 0.95rem;
    }
`;
document.head.appendChild(paymentAnimationStyle);

// FAQ Toggle Functionality
window.toggleFAQ = function(questionElement) {
    const faqItem = questionElement.parentElement;
    const isOpen = faqItem.classList.contains('open');
    
    // Close all other FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
        if (item !== faqItem) {
            item.classList.remove('open');
        }
    });
    
    // Toggle current FAQ item
    if (isOpen) {
        faqItem.classList.remove('open');
    } else {
        faqItem.classList.add('open');
    }
};

// Countdown Timer - Real countdown to actual date (30 days from now)
function initializeCountdownTimer() {
    // Calculate target date - 30 days from current date
    const now = new Date();
    const targetDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
    
    console.log('Countdown timer initialized. Target date:', targetDate.toISOString());
    
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    function updateCountdown() {
        const currentTime = new Date().getTime();
        const distance = targetDate.getTime() - currentTime;
        
        if (distance < 0) {
            // Timer expired - show zeros
            if (daysElement) daysElement.textContent = '0';
            if (hoursElement) hoursElement.textContent = '0';
            if (minutesElement) minutesElement.textContent = '0';
            if (secondsElement) secondsElement.textContent = '0';
            
            // Update the pricing section to show expired pricing
            const founderSection = document.querySelector('.founder-urgency');
            if (founderSection) {
                founderSection.innerHTML = `
                    <div class="urgency-content">
                        <span class="urgency-icon">⚠️</span>
                        <div class="urgency-text">
                            <h4>Founder Pricing Expired</h4>
                            <p>The early bird pricing has ended. Join the waitlist for future opportunities.</p>
                        </div>
                    </div>
                `;
            }
            return;
        }
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        if (daysElement) daysElement.textContent = days.toString().padStart(2, '0');
        if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
        if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
        if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');
    }
    
    // Update countdown every second
    const countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdown(); // Initial call to set the timer immediately
    
    // Store interval ID for potential cleanup
    window.countdownInterval = countdownInterval;
}

// Helper functions for ZIP file creation

// Load JSZip library dynamically
function loadJSZip() {
    return new Promise((resolve, reject) => {
        if (window.JSZip) {
            resolve(window.JSZip);
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = () => resolve(window.JSZip);
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Get welcome email HTML template
function getWelcomeEmailHTML() {
    return `<html>
<body style="font-family: Arial, sans-serif; background-color: #0a0a0a; color: #ffffff; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); border-radius: 15px; padding: 40px; border: 2px solid #ff6b35;">
    <h1 style="color: #ff6b35; text-align: center; font-size: 2.5rem; margin-bottom: 20px;">ᚱᚢᚾᛖᚠᛚᛟᚹ</h1>
    <h2 style="color: #ffab00; text-align: center; margin-bottom: 30px;">Welcome, {{ $json.name }}!</h2>
    
    <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px;">Welcome to the exclusive preview of RuneFlow's automation templates.</p>
    
    <div style="background: rgba(255, 107, 53, 0.1); border-left: 4px solid #ff6b35; padding: 20px; margin: 30px 0; border-radius: 8px;">
      <h3 style="color: #ff6b35; margin-bottom: 15px;">🎯 Your Preview Starter Rune \"Ansuz\" is Ready!</h3>
      <p>You've received early access to one of our most sophisticated email automation templates. This preview workflow will empower you to:</p>
      <ul style="margin: 15px 0; padding-left: 20px;">
        <li>Experience our automation template approach</li>
        <li>Test integration capabilities</li>
        <li>Prepare for the full platform launch</li>
        <li>Join our preview community</li>
      </ul>
    </div>
    
    <div style="text-align: center; margin: 40px 0;">
      <a href="https://runeflow.co/dashboard" style="background: linear-gradient(135deg, #ff6b35, #ffab00); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Stay Updated on Launch</a>
    </div>
    
    <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #333;">
      <p style="color: #aaaaaa; font-size: 0.9rem;">Ancient Power. Modern Automation.<br>The RuneFlow Team</p>
    </div>
  </div>
</body>
</html>`;
}

// Get starter pack README content
function getStarterPackReadme() {
    return `# RuneFlow Starter Pack - Ansuz: The Messenger

Welcome to your first RuneFlow automation template! This starter pack contains everything you need to set up a professional email automation workflow in under 5 minutes.

## 🎯 What You'll Get

The **Ansuz - The Messenger** template is a complete email automation workflow that:

- ✅ Captures new email signups via webhook
- ✅ Sends personalized welcome emails with delay
- ✅ Automatically adds contacts to your CRM
- ✅ Tracks analytics and engagement
- ✅ Enriches lead data with scoring

## 📋 Requirements

Before you start, make sure you have:

1. **n8n instance** (cloud or self-hosted)
2. **Email service** (Gmail, Outlook, or SMTP)
3. **HubSpot account** (free tier works)

## 🚀 Quick Setup Guide

### Step 1: Import the Workflow

1. Open your n8n instance
2. Click "Import from file" 
3. Select \`ansuz-messenger-workflow.json\`
4. Click "Import"

### Step 2: Configure Credentials

You'll need to set up these credentials in n8n:

#### Email Service (Required)
- **Node**: "Welcome Email"
- **Type**: Gmail, Outlook, or SMTP
- **Setup**: Go to Settings → Credentials → Add New
- **Note**: For Gmail, enable "Less secure app access" or use App Password

#### HubSpot CRM (Optional)
- **Node**: "Add to CRM"
- **Type**: HubSpot
- **Setup**: Get your API key from HubSpot Settings → Integrations → API key
- **Note**: Free HubSpot accounts work perfectly

### Step 3: Test Your Automation

1. Use the \`test-webhook.json\` file to test your webhook
2. Check that emails are sent correctly
3. Verify CRM integration works

## 📊 Expected Results

With this automation, you should see:
- **90%+ email delivery rate**
- **25-35% open rates**
- **5-10% click-through rates**
- **Instant CRM synchronization**

## 🆘 Getting Help

- 📧 Email: support@runeflow.co
- 💬 Discord: [RuneFlow Community](https://discord.gg/runeflow)
- 📖 Documentation: [docs.runeflow.co](https://docs.runeflow.co)

---

**May the runes guide your automation journey!**

*The RuneFlow Team*`;
}

// Get email template HTML
function getEmailTemplateHTML() {
return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to RuneFlow Preview</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #0a0a0a;
            color: #ffffff;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            border-radius: 15px;
            padding: 40px;
            border: 2px solid #ff6b35;
        }
        .logo {
            color: #ff6b35;
            text-align: center;
            font-size: 2.5rem;
            margin-bottom: 20px;
        }
        .cta-button {
            background: linear-gradient(135deg, #ff6b35, #ffab00);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">ᚱᚢᚾᛖᚠᛚᛟᚹ</div>
        <h1 style="color: #ffab00; text-align: center;">Welcome to the Preview, {{name}}!</h1>
        <p>You've joined the exclusive preview of RuneFlow's automation templates. Experience what's coming to the full platform.</p>
        <div style="text-align: center; margin: 40px 0;">
            <a href="https://runeflow.xyz" class="cta-button">Stay Updated on Launch</a>
        </div>
        <p style="text-align: center; color: #aaaaaa; font-size: 0.9rem;">Ancient Power. Modern Automation.<br>The RuneFlow Team</p>
    </div>
</body>
</html>`;
}

// Get quick start guide
function getQuickStartGuide() {
    return `# Quick Start Guide - Ansuz Messenger

## Step 1: Import Workflow
1. Open n8n
2. Click "Import from file"
3. Select \`ansuz-messenger-workflow.json\`
4. Click "Import"

## Step 2: Configure Email
1. Click on "Welcome Email" node
2. Set up your email credentials
3. Replace support@runeflow.co with your email
4. Customize the email template

## Step 3: Test the Workflow
1. Activate the workflow
2. Copy the webhook URL
3. Send a test POST request (use test-webhook.json)
4. Check if email is received

## Step 4: Go Live
1. Update your website forms to use the webhook URL
2. Monitor the workflow executions
3. Customize as needed

## Troubleshooting

**Email not sending?**
- Check email credentials
- Verify SMTP settings
- Check spam folder

**Webhook not triggering?**
- Ensure workflow is active
- Check webhook URL
- Verify POST request format

**Need help?** Contact support@runeflow.co`;
}

// Get credentials setup guide
function getCredentialsGuide() {
    return `# Credentials Setup Guide

## Email Service Setup

### Gmail
1. Enable 2-factor authentication
2. Generate an App Password
3. Use your email and app password in n8n

### Outlook
1. Go to account settings
2. Enable IMAP/SMTP
3. Use your email and password in n8n

### SMTP
1. Get SMTP settings from your provider
2. Configure host, port, username, password
3. Test connection

## HubSpot Setup (Optional)

1. Go to HubSpot Settings
2. Navigate to Integrations → API key
3. Generate or copy your API key
4. Add to n8n HubSpot credentials

## Security Best Practices

- Use environment variables for sensitive data
- Regularly rotate API keys
- Enable SSL/TLS for all connections
- Monitor credential usage

## Testing Credentials

1. Test each credential individually
2. Check connection status in n8n
3. Send test emails/requests
4. Verify data flows correctly

For detailed setup instructions, visit: https://docs.runeflow.co`;
}

// Get webhook test file
function getWebhookTestFile() {
    return JSON.stringify({
        "test_data": {
            "email": "test@example.com",
            "name": "Test User",
            "source": "coming_soon_page",
            "timestamp": new Date().toISOString()
        },
        "instructions": {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": "Use the test_data object above",
            "example_curl": "curl -X POST [YOUR_WEBHOOK_URL] -H 'Content-Type: application/json' -d '{\"email\":\"test@example.com\",\"name\":\"Test User\"}'"
        }
    }, null, 2);
}

// Create ZIP file for selected individual rune
async function createSelectedRuneZip(selectedRune) {
    const JSZip = await loadJSZip();
    const zip = new JSZip();
    
    const runeNames = {
        'flowrune': 'FlowRune',
        'ansuz': 'Ansuz', 
        'laguz': 'Laguz'
    };
    
    const runeDescriptions = {
        'flowrune': 'The Flow Optimizer - Streamlines your automation workflows',
        'ansuz': 'The Messenger - Perfect for email automation and communication',
        'laguz': 'The Adapter - Connects different systems and data sources'
    };
    
    const runeName = runeNames[selectedRune];
    const runeDescription = runeDescriptions[selectedRune];
    
    // Create workflow template for the selected rune
    const workflowTemplate = createRuneWorkflowTemplate(selectedRune, runeName, runeDescription);
    
    // Add workflow JSON to ZIP
    zip.file(`${selectedRune}-workflow.json`, JSON.stringify(workflowTemplate, null, 2));
    
    // Add rune-specific README
    const readmeContent = getRuneSpecificReadme(selectedRune, runeName, runeDescription);
    zip.file("README.md", readmeContent);
    
    // Add email template HTML
    const emailTemplate = getEmailTemplateHTML();
    zip.file("email-template.html", emailTemplate);
    
    // Add quick start guide
    const quickStartGuide = getQuickStartGuide();
    zip.file("QUICK_START.md", quickStartGuide);
    
    // Add credentials setup guide
    const credentialsGuide = getCredentialsGuide();
    zip.file("CREDENTIALS_SETUP.md", credentialsGuide);
    
    // Add sample webhook test file
    const webhookTest = getWebhookTestFile();
    zip.file("test-webhook.json", webhookTest);
    
    // Generate ZIP file
    const zipBlob = await zip.generateAsync({type: "blob"});
    
    // Create download link
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `runeflow-${selectedRune}-starter-pack.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Create workflow template for specific rune
function createRuneWorkflowTemplate(runeId, runeName, runeDescription) {
    const baseTemplate = {
        "name": `${runeName} - Starter Template`,
        "active": true,
        "settings": {
            "saveManualExecutions": true,
            "callerPolicy": "workflowsFromSameOwner"
        },
        "staticData": {},
        "tags": ["email-automation", "starter-pack", "runeflow", runeId],
        "meta": {
            "version": "1.0.0",
            "description": `${runeName}: ${runeDescription}`,
            "author": "RuneFlow Team",
            "category": "Email Marketing",
            "difficulty": "Beginner",
            "estimated_setup_time": "5 minutes"
        }
    };
    
    if (runeId === 'flowrune') {
        // FlowRune - Workflow optimization template
        baseTemplate.nodes = [
            {
                "parameters": {
                    "httpMethod": "POST",
                    "path": "workflow-trigger",
                    "responseMode": "responseNode",
                    "options": {}
                },
                "id": "flowrune-webhook",
                "name": "FlowRune Trigger",
                "type": "n8n-nodes-base.webhook",
                "typeVersion": 1,
                "position": [240, 300]
            },
            {
                "parameters": {
                    "conditions": {
                        "string": [
                            {
                                "value1": "={{ $json.priority }}",
                                "operation": "equal",
                                "value2": "high"
                            }
                        ]
                    }
                },
                "id": "priority-check",
                "name": "Priority Check",
                "type": "n8n-nodes-base.if",
                "typeVersion": 1,
                "position": [460, 300]
            },
            {
                "parameters": {
                    "mode": "raw",
                    "jsonData": "{\"status\": \"processed\", \"priority\": \"high\", \"timestamp\": \"{{ $now }}\"}" 
                },
                "id": "high-priority-response",
                "name": "High Priority Response",
                "type": "n8n-nodes-base.respondToWebhook",
                "typeVersion": 1,
                "position": [680, 200]
            },
            {
                "parameters": {
                    "mode": "raw",
                    "jsonData": "{\"status\": \"queued\", \"priority\": \"normal\", \"timestamp\": \"{{ $now }}\"}" 
                },
                "id": "normal-priority-response",
                "name": "Normal Priority Response",
                "type": "n8n-nodes-base.respondToWebhook",
                "typeVersion": 1,
                "position": [680, 400]
            }
        ];
        
        baseTemplate.connections = {
            "FlowRune Trigger": {
                "main": [[{"node": "Priority Check", "type": "main", "index": 0}]]
            },
            "Priority Check": {
                "main": [
                    [{"node": "High Priority Response", "type": "main", "index": 0}],
                    [{"node": "Normal Priority Response", "type": "main", "index": 0}]
                ]
            }
        };
        
    } else if (runeId === 'ansuz') {
        // Ansuz - Messenger template (email automation)
        baseTemplate.nodes = [
            {
                "parameters": {
                    "httpMethod": "POST",
                    "path": "email-signup",
                    "responseMode": "responseNode"
                },
                "id": "ansuz-webhook",
                "name": "Email Signup Webhook",
                "type": "n8n-nodes-base.webhook",
                "typeVersion": 1,
                "position": [240, 300]
            },
            {
                "parameters": {
                    "sendTo": "={{ $json.email }}",
                    "subject": "Welcome to RuneFlow!",
                    "message": "Welcome {{ $json.name || 'there' }}!\n\nThank you for joining RuneFlow. Your automation journey starts now."
                },
                "id": "welcome-email",
                "name": "Send Welcome Email",
                "type": "n8n-nodes-base.emailSend",
                "typeVersion": 1,
                "position": [460, 300]
            },
            {
                "parameters": {
                    "mode": "raw",
                    "jsonData": "{\"success\": true, \"message\": \"Welcome email sent\", \"email\": \"{{ $json.email }}\"}" 
                },
                "id": "success-response",
                "name": "Success Response",
                "type": "n8n-nodes-base.respondToWebhook",
                "typeVersion": 1,
                "position": [680, 300]
            }
        ];
        
        baseTemplate.connections = {
            "Email Signup Webhook": {
                "main": [[{"node": "Send Welcome Email", "type": "main", "index": 0}]]
            },
            "Send Welcome Email": {
                "main": [[{"node": "Success Response", "type": "main", "index": 0}]]
            }
        };
        
    } else if (runeId === 'laguz') {
        // Laguz - Data adapter template
        baseTemplate.nodes = [
            {
                "parameters": {
                    "httpMethod": "POST",
                    "path": "data-sync",
                    "responseMode": "responseNode"
                },
                "id": "laguz-webhook",
                "name": "Data Sync Webhook",
                "type": "n8n-nodes-base.webhook",
                "typeVersion": 1,
                "position": [240, 300]
            },
            {
                "parameters": {
                    "jsCode": "// Transform incoming data\nconst transformedData = {\n  id: $input.first().json.id,\n  name: $input.first().json.name,\n  email: $input.first().json.email,\n  timestamp: new Date().toISOString(),\n  source: 'laguz-adapter'\n};\n\nreturn { json: transformedData };"
                },
                "id": "data-transform",
                "name": "Transform Data",
                "type": "n8n-nodes-base.code",
                "typeVersion": 1,
                "position": [460, 300]
            },
            {
                "parameters": {
                    "mode": "raw",
                    "jsonData": "{{ $json }}" 
                },
                "id": "transformed-response",
                "name": "Return Transformed Data",
                "type": "n8n-nodes-base.respondToWebhook",
                "typeVersion": 1,
                "position": [680, 300]
            }
        ];
        
        baseTemplate.connections = {
            "Data Sync Webhook": {
                "main": [[{"node": "Transform Data", "type": "main", "index": 0}]]
            },
            "Transform Data": {
                "main": [[{"node": "Return Transformed Data", "type": "main", "index": 0}]]
            }
        };
    }
    
    return baseTemplate;
}

// Get rune-specific README
function getRuneSpecificReadme(runeId, runeName, runeDescription) {
    return `# RuneFlow Starter Pack - ${runeName}

${runeDescription}

## 🎯 What This Template Does

${getRuneSpecificDescription(runeId)}

## 📋 Requirements

Before you start, make sure you have:

1. **n8n instance** (cloud or self-hosted)
2. **Email service** (Gmail, Outlook, or SMTP) ${runeId === 'ansuz' ? '- Required for this template' : '- Optional for this template'}
3. **API endpoints** to connect to ${runeId === 'laguz' ? '- Required for data transformation' : '- Optional'}

## 🚀 Quick Setup Guide

### Step 1: Import the Workflow

1. Open your n8n instance
2. Click "Import from file" 
3. Select \`${runeId}-workflow.json\`
4. Click "Import"

### Step 2: Configure Your Template

${getRuneSpecificSetupInstructions(runeId)}

### Step 3: Test Your Automation

1. Use the \`test-webhook.json\` file to test your webhook
2. Check that the workflow executes correctly
3. Verify all integrations work

## 📊 Expected Results

${getRuneSpecificResults(runeId)}

## 🆘 Getting Help

- 📧 Email: support@runeflow.co
- 💬 Discord: [RuneFlow Community](https://discord.gg/runeflow)
- 📖 Documentation: [docs.runeflow.co](https://docs.runeflow.co)

---

**May the runes guide your automation journey!**

*The RuneFlow Team*`;
}

// Get rune-specific description
function getRuneSpecificDescription(runeId) {
    const descriptions = {
        'flowrune': `The **FlowRune** template helps you create efficient workflow routing based on priority levels. It:

- ✅ Receives webhook data with priority indicators
- ✅ Routes high-priority items for immediate processing
- ✅ Queues normal-priority items for batch processing
- ✅ Provides different response formats based on priority
- ✅ Optimizes your automation flow efficiency`,
        
        'ansuz': `The **Ansuz** template is perfect for automated email communications. It:

- ✅ Captures new email signups via webhook
- ✅ Sends personalized welcome emails instantly
- ✅ Handles email validation and error management
- ✅ Provides confirmation responses to your frontend
- ✅ Sets up the foundation for email sequences`,
        
        'laguz': `The **Laguz** template specializes in data transformation and system integration. It:

- ✅ Receives data from external systems via webhook
- ✅ Transforms data formats using JavaScript code
- ✅ Adds timestamps and tracking information
- ✅ Returns standardized data structures
- ✅ Enables seamless system-to-system communication`
    };
    
    return descriptions[runeId] || 'A powerful automation template for n8n workflows.';
}

// Get rune-specific setup instructions
function getRuneSpecificSetupInstructions(runeId) {
    const instructions = {
        'flowrune': `1. **Configure the webhook path**: Update the webhook path to match your use case
2. **Set priority logic**: Modify the IF condition to match your priority criteria
3. **Customize responses**: Update the response formats for high and normal priority items
4. **Test the routing**: Send test data with different priority levels`,
        
        'ansuz': `1. **Set up email credentials**: Configure your email service in n8n credentials
2. **Customize the email template**: Edit the welcome email subject and message
3. **Set sender details**: Update the 'from' email address
4. **Test email delivery**: Send a test webhook to verify email sending works`,
        
        'laguz': `1. **Review the transformation code**: Examine the JavaScript code in the Transform Data node
2. **Modify data mapping**: Update the code to match your data structure
3. **Add validation**: Include data validation logic as needed
4. **Test transformations**: Send sample data to verify the transformation works`
    };
    
    return instructions[runeId] || 'Follow the general setup instructions in the main documentation.';
}

// Get rune-specific expected results
function getRuneSpecificResults(runeId) {
    const results = {
        'flowrune': `With this automation, you should see:
- **Instant processing** for high-priority items
- **Efficient queuing** for normal-priority items
- **Clear response differentiation** based on priority
- **Improved workflow organization** and performance`,
        
        'ansuz': `With this automation, you should see:
- **Instant welcome emails** for new signups
- **90%+ email delivery rate**
- **Professional email formatting**
- **Reliable webhook responses** to your frontend`,
        
        'laguz': `With this automation, you should see:
- **Consistent data transformation** across all inputs
- **Standardized output formats** for downstream systems
- **Proper timestamp tracking** for all processed data
- **Reliable data flow** between different systems`
    };
    
    return results[runeId] || 'Improved automation efficiency and reliability.';
}
