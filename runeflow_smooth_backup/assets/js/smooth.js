// Global state
let selectedRune = null;

// Smooth scrolling utility
function scrollTo(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Rune selection functionality
function selectRune(runeName) {
    selectedRune = runeName;
    
    // Update UI to show selection
    document.querySelectorAll('.rune-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`[data-rune="${runeName}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // Show email capture form
    const emailCapture = document.getElementById('email-capture');
    if (emailCapture) {
        emailCapture.style.display = 'block';
        emailCapture.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    console.log(`✨ Selected rune: ${runeName}`);
}

// Purchase flow
function purchase(packageType) {
    console.log(`🚀 Purchase initiated: ${packageType}`);
    
    // Add loading state
    const button = event.target;
    const originalText = button.textContent;
    button.classList.add('loading');
    button.disabled = true;
    button.textContent = 'Processing...';
    
    // Simulate purchase flow
    setTimeout(() => {
        button.classList.remove('loading');
        button.disabled = false;
        button.textContent = originalText;
        
        // Open purchase modal or redirect
        if (packageType === 'lifetime') {
            showPurchaseModal('Lifetime Access', '$999', 'lifetime');
        } else if (packageType === 'annual') {
            showPurchaseModal('Annual Plan', '$199/year', 'annual');
        } else if (packageType === 'launch') {
            showPurchaseModal('Launch Access', '$297/year', 'launch');
        }
    }, 1000);
}

// Purchase modal
function showPurchaseModal(title, price, type) {
    const modal = document.createElement('div');
    modal.className = 'purchase-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>🚀 ${title}</h3>
                <button class="modal-close" onclick="closePurchaseModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="purchase-summary">
                    <div class="purchase-price">${price}</div>
                    <p>Ready to unlock ancient automation power?</p>
                </div>
                <div class="payment-options">
                    <button class="payment-btn card-payment" onclick="processPayment('${type}', 'card')">
                        💳 Pay with Card
                    </button>
                    <button class="payment-btn crypto-payment" onclick="processPayment('${type}', 'crypto')">
                        ₿ Pay with Crypto
                    </button>
                </div>
                <p class="payment-security">🔒 Secure payment • SSL encrypted • 30-day guarantee</p>
            </div>
        </div>
        <div class="modal-backdrop" onclick="closePurchaseModal()"></div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function closePurchaseModal() {
    const modal = document.querySelector('.purchase-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

function processPayment(packageType, paymentMethod) {
    console.log(`💳 Processing ${paymentMethod} payment for ${packageType}`);
    
    // In a real implementation, this would integrate with Stripe, PayPal, or crypto payment processors
    alert(`🎉 Payment processing for ${packageType} via ${paymentMethod}!\n\nThis would redirect to the actual payment processor in production.`);
    
    closePurchaseModal();
}

// Email form handling
function setupEmailForm() {
    const emailForm = document.querySelector('.email-form');
    if (emailForm) {
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const submitBtn = this.querySelector('button[type="submit"]');
            const email = emailInput.value;
            
            if (!email) return;
            
            // Add loading state
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Simulate email submission
            setTimeout(() => {
                submitBtn.textContent = '✅ Sent! Check your email';
                emailInput.value = '';
                
                console.log(`📧 Email captured: ${email} for rune: ${selectedRune}`);
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 3000);
            }, 1000);
        });
    }
}

// Intersection Observer for animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe sections for animations
    document.querySelectorAll('section, .rune-card, .pricing-card').forEach(el => {
        observer.observe(el);
    });
}

// Add dynamic styles for modal and animations
function addDynamicStyles() {
    const styles = `
        /* Purchase Modal */
        .purchase-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .purchase-modal.show {
            opacity: 1;
            visibility: visible;
        }
        
        .modal-backdrop {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
        }
        
        .modal-content {
            background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
            border: 2px solid var(--primary-orange);
            border-radius: var(--border-radius);
            padding: 2rem;
            max-width: 500px;
            width: 90%;
            position: relative;
            z-index: 2;
            transform: scale(0.9);
            transition: transform 0.3s ease;
        }
        
        .purchase-modal.show .modal-content {
            transform: scale(1);
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }
        
        .modal-header h3 {
            color: var(--primary-orange);
            margin: 0;
            font-family: 'Cinzel', serif;
        }
        
        .modal-close {
            background: none;
            border: none;
            color: var(--text-secondary);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .purchase-price {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--primary-orange);
            text-align: center;
            margin-bottom: 1rem;
            font-family: 'Cinzel', serif;
        }
        
        .payment-options {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin: 2rem 0;
        }
        
        .payment-btn {
            background: var(--gradient-primary);
            color: white;
            border: none;
            padding: 1rem;
            border-radius: 50px;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition);
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .payment-btn:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-medium);
        }
        
        .crypto-payment {
            background: linear-gradient(135deg, #f7931a, #ffab00);
        }
        
        .payment-security {
            text-align: center;
            color: var(--text-secondary);
            font-size: 0.9rem;
            margin-top: 1rem;
        }
        
        /* Rune selection states */
        .rune-card.selected {
            border-color: var(--primary-orange);
            background: linear-gradient(135deg, rgba(255, 107, 53, 0.15), rgba(255, 171, 0, 0.1));
            transform: translateY(-8px) scale(1.02);
        }
        
        .rune-card.selected .rune-symbol {
            color: var(--primary-orange);
            text-shadow: 0 0 20px rgba(255, 107, 53, 0.5);
        }
        
        /* Animations */
        .animate-in {
            animation: fadeInUp 0.6s ease-out forwards;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Live badge animation */
        .live-badge {
            background: linear-gradient(135deg, #00ff87, #60efff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: pulse-glow 2s ease-in-out infinite;
        }
        
        @keyframes pulse-glow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// Norse Runes Animation
function createFloatingRunes() {
    const mysticalSymbols = ['*', '+', 'x', '•', '○', '◦', '▪', '▫', '■', '□', '♦', '♢', '◆', '◇', '△', '▲', '▽', '▼', '◈', '⬟', '⬢', '⬡', '⬠', '⬣'];
    const colors = [
        'rgba(255, 107, 53, 0.15)',  // Faded orange
        'rgba(0, 255, 135, 0.15)',   // Faded green
        'rgba(96, 239, 255, 0.15)',  // Faded blue
        'rgba(255, 171, 0, 0.12)',   // Faded gold
        'rgba(34, 197, 94, 0.12)',   // Faded emerald
        'rgba(6, 182, 212, 0.12)'    // Faded cyan
    ];
    
    function createPersistentRune(index) {
        const floatingRunesContainer = document.getElementById('floatingRunes');
        if (!floatingRunesContainer) return;
        
        const rune = document.createElement('div');
        rune.className = 'floating-rune persistent';
        rune.textContent = mysticalSymbols[Math.floor(Math.random() * mysticalSymbols.length)];
        
        // Random color from faded palette
        rune.style.color = colors[Math.floor(Math.random() * colors.length)];
        
        // Random horizontal position
        rune.style.left = Math.random() * 100 + '%';
        rune.style.top = Math.random() * 100 + '%';
        
        // Random size variation
        const scale = 0.6 + Math.random() * 0.8;
        rune.style.fontSize = scale + 'rem';
        
        // Random animation duration
        const duration = 15 + Math.random() * 10; // 15-25 seconds
        rune.style.animationDuration = duration + 's';
        rune.style.animationDelay = (index * 2) + 's';
        
        floatingRunesContainer.appendChild(rune);
    }
    
    // Create persistent floating runes
    for (let i = 0; i < 12; i++) {
        createPersistentRune(i);
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎉 RuneFlow Smooth Redesign Loaded!');
    console.log('✨ All backend elements preserved: 3 runes, launch access, blind founders pricing');
    console.log('🔮 Norse rune animations activated!');
    
    addDynamicStyles();
    setupEmailForm();
    setupScrollAnimations();
    createFloatingRunes();
    
    // Add subtle entrance animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

