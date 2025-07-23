// ❄️ FROZEN REALM - EPIC AUTOMATION EXPERIENCE ❄️
// Global state
let selectedIceRune = null;
let snowflakeCount = 0;
let iceRunes = [];
let iceCrystals = [];

// Epic smooth scrolling utility
function scrollTo(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 🌨️ EPIC SNOW GENERATION
function createEpicSnow() {
    const snowContainer = document.getElementById('snowContainer');
    if (!snowContainer) return;
    
    // Generate different types of snow
    const snowTypes = ['❄', '❅', '❆', '❉', '❊', '⋄', '◇', '◊', '⬟', '⬢'];
    
    function generateSnowflake() {
        if (snowflakeCount >= 50) return; // Limit for performance
        
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.innerHTML = snowTypes[Math.floor(Math.random() * snowTypes.length)];
        
        // Random properties
        const size = Math.random() * 0.8 + 0.6; // 0.6 to 1.4
        const opacity = Math.random() * 0.6 + 0.3; // 0.3 to 0.9
        const duration = Math.random() * 10 + 8; // 8 to 18 seconds
        const delay = Math.random() * 5; // 0 to 5 seconds delay
        
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.fontSize = size + 'rem';
        snowflake.style.opacity = opacity;
        snowflake.style.animationDuration = duration + 's';
        snowflake.style.animationDelay = delay + 's';
        
        // Add some horizontal drift
        const drift = (Math.random() - 0.5) * 100; // -50 to 50px drift
        snowflake.style.setProperty('--drift', drift + 'px');
        
        snowContainer.appendChild(snowflake);
        snowflakeCount++;
        
        // Remove snowflake after animation
        setTimeout(() => {
            if (snowflake.parentNode) {
                snowflake.parentNode.removeChild(snowflake);
                snowflakeCount--;
            }
        }, (duration + delay) * 1000);
    }
    
    // Generate initial batch
    for (let i = 0; i < 30; i++) {
        setTimeout(generateSnowflake, i * 200);
    }
    
    // Continue generating
    setInterval(generateSnowflake, 500);
}

// 🧊 EPIC ICE CRYSTALS
function createEpicIceCrystals() {
    const crystalContainer = document.getElementById('iceCrystals');
    if (!crystalContainer) return;
    
    function generateIceCrystal() {
        if (iceCrystals.length >= 20) return;
        
        const crystal = document.createElement('div');
        crystal.className = 'ice-crystal';
        
        // Random positioning
        crystal.style.left = Math.random() * 100 + '%';
        crystal.style.top = Math.random() * 100 + '%';
        
        // Random animation properties
        const duration = Math.random() * 6 + 4;
        const delay = Math.random() * 3;
        crystal.style.animationDuration = duration + 's';
        crystal.style.animationDelay = delay + 's';
        
        crystalContainer.appendChild(crystal);
        iceCrystals.push(crystal);
        
        // Remove after some time
        setTimeout(() => {
            if (crystal.parentNode) {
                crystal.parentNode.removeChild(crystal);
                iceCrystals = iceCrystals.filter(c => c !== crystal);
            }
        }, (duration + delay + 2) * 1000);
    }
    
    // Generate crystals periodically
    for (let i = 0; i < 15; i++) {
        setTimeout(generateIceCrystal, i * 300);
    }
    
    setInterval(generateIceCrystal, 1000);
}

// ❄️ FLOATING ICE RUNES
function createFloatingIceRunes() {
    const runeContainer = document.getElementById('floatingRunes');
    if (!runeContainer) return;
    
    const runeSymbols = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ'];
    
    for (let i = 0; i < 8; i++) {
        const rune = document.createElement('div');
        rune.className = 'ice-rune';
        rune.innerHTML = runeSymbols[Math.floor(Math.random() * runeSymbols.length)];
        
        // Random positioning
        rune.style.left = Math.random() * 80 + 10 + '%'; // 10% to 90%
        rune.style.top = Math.random() * 80 + 10 + '%'; // 10% to 90%
        
        // Random animation delay
        rune.style.animationDelay = Math.random() * 10 + 's';
        
        runeContainer.appendChild(rune);
    }
}

// Ice Rune selection functionality - EPIC EDITION
function selectRune(runeName) {
    selectedIceRune = runeName;
    
    // Epic selection effect
    createSelectionBurst();
    
    // Update UI to show selection
    document.querySelectorAll('.ice-rune-card').forEach(card => {
        card.classList.remove('selected-ice');
    });
    
    const selectedCard = document.querySelector(`[data-rune="${runeName}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected-ice');
        
        // Epic glow effect
        selectedCard.style.boxShadow = '0 0 50px rgba(0, 255, 255, 0.8), 0 0 100px rgba(0, 255, 255, 0.4)';
    }
    
    // Show ice email capture form with epic entrance
    const emailCapture = document.getElementById('email-capture');
    if (emailCapture) {
        emailCapture.style.display = 'block';
        emailCapture.style.animation = 'iceSlideIn 0.8s cubic-bezier(0.23, 1, 0.320, 1)';
        emailCapture.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    console.log(`❄️ Selected epic ice rune: ${runeName}`);
}

// Epic selection burst effect
function createSelectionBurst() {
    const burst = document.createElement('div');
    burst.style.position = 'fixed';
    burst.style.top = '50%';
    burst.style.left = '50%';
    burst.style.width = '200px';
    burst.style.height = '200px';
    burst.style.background = 'radial-gradient(circle, rgba(0, 255, 255, 0.6) 0%, transparent 70%)';
    burst.style.borderRadius = '50%';
    burst.style.transform = 'translate(-50%, -50%) scale(0)';
    burst.style.animation = 'burstEffect 0.6s ease-out';
    burst.style.pointerEvents = 'none';
    burst.style.zIndex = '9999';
    
    document.body.appendChild(burst);
    
    setTimeout(() => burst.remove(), 600);
}

// Purchase flow
function purchase(packageType) {
    console.log(`🚀 Ice purchase initiated: ${packageType}`);
    
    // Add loading state
    const button = event.target;
    const originalText = button.textContent;
    button.classList.add('loading-ice');
    button.disabled = true;
    button.textContent = 'Processing...';
    
    // Simulate purchase flow
    setTimeout(() => {
        button.classList.remove('loading-ice');
        button.disabled = false;
        button.textContent = originalText;
        
        // Open purchase modal or redirect
        if (packageType === 'eternal-ice') {
            showIcePurchaseModal('Eternal Ice Access', '$999', 'eternal-ice');
        } else if (packageType === 'annual-frost') {
            showIcePurchaseModal('Annual Frost Plan', '$199/frozen year', 'annual-frost');
        } else if (packageType === 'frozen-launch') {
            showIcePurchaseModal('Frozen Launch Access', '$297/frozen year', 'frozen-launch');
        }
    }, 1000);
}

// Ice Purchase modal
function showIcePurchaseModal(title, price, type) {
    const modal = document.createElement('div');
    modal.className = 'ice-purchase-modal';
    modal.innerHTML = `
        <div class="ice-modal-content">
            <div class="modal-header">
                <h3>❄️ ${title}</h3>
                <button class="modal-close" onclick="closeIcePurchaseModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="purchase-summary">
                    <div class="purchase-price">${price}</div>
                    <p>Ready to unlock frozen automation power?</p>
                </div>
                <div class="payment-options">
                    <button class="payment-btn card-payment" onclick="processIcePayment('${type}', 'card')">
                        💳 Pay with Card
                    </button>
                    <button class="payment-btn crypto-payment" onclick="processIcePayment('${type}', 'crypto')">
                        ₿ Pay with Crypto
                    </button>
                </div>
                <p class="payment-security">🔒 Secure payment • SSL encrypted • 30-day guarantee</p>
            </div>
        </div>
        <div class="modal-backdrop" onclick="closeIcePurchaseModal()"></div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('show'), 10);
}

function closeIcePurchaseModal() {
    const modal = document.querySelector('.ice-purchase-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }
}

function processIcePayment(packageType, paymentMethod) {
    console.log(`💳 Processing ${paymentMethod} payment for ${packageType}`);
    
    // In a real implementation, this would integrate with Stripe, PayPal, or crypto payment processors
    alert(`🎉 Payment processing for ${packageType} via ${paymentMethod}!\n\nThis would redirect to the actual payment processor in production.`);
    
    closeIcePurchaseModal();
}

// Email form handling
function setupIceEmailForm() {
    const emailForm = document.querySelector('.ice-email-form');
    if (emailForm) {
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const submitBtn = this.querySelector('button[type="submit"]');
            const email = emailInput.value;
            
            if (!email) return;
            
            // Epic submission effect
            createEpicEmailBurst();
            
            // Add loading state
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            // Simulate email submission
            setTimeout(() => {
                submitBtn.textContent = '✅ Sent! Check your email';
                emailInput.value = '';
                
                console.log(`📧 Email captured (ice): ${email} for rune: ${selectedIceRune}`);
                
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 3000);
            }, 1000);
        });
    }
}

// Epic email submission burst
function createEpicEmailBurst() {
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.top = '50%';
            particle.style.left = '50%';
            particle.style.width = '6px';
            particle.style.height = '6px';
            particle.style.background = 'var(--neon-cyan)';
            particle.style.borderRadius = '50%';
            particle.style.boxShadow = 'var(--neon-cyan-glow)';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '9999';
            
            const angle = (i / 8) * Math.PI * 2;
            const distance = 100;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            particle.style.animation = `particleBurst 1s ease-out forwards`;
            particle.style.setProperty('--end-x', x + 'px');
            particle.style.setProperty('--end-y', y + 'px');
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 1000);
        }, i * 50);
    }
}

// Mouse interaction effects
function setupMouseEffects() {
    let mouseX = 0, mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Create trailing ice particles
        if (Math.random() < 0.1) {
            createMouseTrail(mouseX, mouseY);
        }
    });
}

function createMouseTrail(x, y) {
    const trail = document.createElement('div');
    trail.style.position = 'fixed';
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    trail.style.width = '4px';
    trail.style.height = '4px';
    trail.style.background = 'rgba(0, 255, 255, 0.6)';
    trail.style.borderRadius = '50%';
    trail.style.pointerEvents = 'none';
    trail.style.zIndex = '1';
    trail.style.animation = 'trailFade 0.8s ease-out forwards';
    
    document.body.appendChild(trail);
    
    setTimeout(() => trail.remove(), 800);
}

// Dynamic CSS animations
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes burstEffect {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
        }
        
        @keyframes iceSlideIn {
            0% { transform: translateY(50px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes particleBurst {
            0% { 
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
            100% { 
                transform: translate(calc(-50% + var(--end-x)), calc(-50% + var(--end-y))) scale(0);
                opacity: 0;
            }
        }
        
        @keyframes trailFade {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0); }
        }
        
        .snowflake {
            --drift: 0px;
        }
        
        @keyframes snowfall {
            0% {
                transform: translateY(-100vh) translateX(0) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(100vh) translateX(var(--drift)) rotate(360deg);
                opacity: 0;
            }
        }
        
        .selected-ice {
            transform: translateY(-10px) scale(1.05) !important;
            border-color: var(--neon-cyan) !important;
            animation: selectedPulse 2s ease-in-out infinite !important;
        }
        
        @keyframes selectedPulse {
            0%, 100% { box-shadow: 0 0 30px rgba(0, 255, 255, 0.6); }
            50% { box-shadow: 0 0 60px rgba(0, 255, 255, 0.9), 0 0 100px rgba(0, 255, 255, 0.4); }
        }
    `;
    document.head.appendChild(style);
}

// 🌌 EPIC INITIALIZATION
function initializeFrozenRealm() {
    console.log('❄️ INITIALIZING FROZEN REALM...');
    
    // Add dynamic styles first
    addDynamicStyles();
    
    // Initialize all epic effects
    createEpicSnow();
    createEpicIceCrystals();
    createFloatingIceRunes();
    setupMouseEffects();
    setupIceEmailForm();
    
    // Add intersection observer for scroll animations
    setupScrollAnimations();
    
    console.log('❄️ FROZEN REALM ACTIVATED! Welcome to the ice...');
}

// Intersection Observer for epic scroll animations
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe sections
    document.querySelectorAll('section, .ice-rune-card, .frozen-pricing-card').forEach(el => {
        observer.observe(el);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFrozenRealm);
} else {
    initializeFrozenRealm();
}
