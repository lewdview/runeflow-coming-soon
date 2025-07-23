// Countdown Timer
function updateCountdown() {
    const now = new Date().getTime();
    const endTime = now + (24 * 60 * 60 * 1000); // 24 hours from now
    
    const distance = endTime - now;
    
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

// Animated Number Counter
function animateNumbers() {
    const proofNumbers = document.querySelectorAll('.proof-number[data-count]');
    
    proofNumbers.forEach(element => {
        const target = parseInt(element.getAttribute('data-count'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString();
        }, 16);
    });
}

// Smooth Scrolling
function scrollToPackages() {
    const packagesSection = document.getElementById('packages');
    packagesSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
    
    // Add pulse effect to packages section
    packagesSection.style.animation = 'none';
    setTimeout(() => {
        packagesSection.style.animation = 'section-highlight 1s ease-in-out';
    }, 10);
}

// Purchase Flow
function purchase(packageType) {
    // Add purchase tracking
    console.log(`Purchase initiated: ${packageType}`);
    
    // Create purchase modal or redirect
    if (packageType === 'lifetime') {
        window.open('https://buy.stripe.com/lifetime-access', '_blank');
    } else if (packageType === 'annual') {
        window.open('https://buy.stripe.com/annual-plan', '_blank');
    }
    
    // Track conversion
    if (typeof gtag !== 'undefined') {
        gtag('event', 'purchase_intent', {
            'package_type': packageType,
            'value': packageType === 'lifetime' ? 999 : 199
        });
    }
}

// Particle System Enhancement
function createParticles() {
    const particleField = document.getElementById('particles');
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'dynamic-particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 1}px;
            height: ${Math.random() * 4 + 1}px;
            background: ${Math.random() > 0.5 ? '#ff6b35' : '#ffab00'};
            border-radius: 50%;
            opacity: ${Math.random() * 0.8 + 0.2};
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: particle-float ${Math.random() * 20 + 10}s linear infinite;
            pointer-events: none;
        `;
        particleField.appendChild(particle);
    }
}

// Intersection Observer for Animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Trigger number animation for social proof
                if (entry.target.classList.contains('social-proof')) {
                    animateNumbers();
                }
            }
        });
    }, observerOptions);
    
    // Observe sections
    const sections = document.querySelectorAll('.social-proof, .power-preview, .packages, .trust-signals');
    sections.forEach(section => observer.observe(section));
}

// Mouse Parallax Effect
function setupParallax() {
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 100;
        mouseY = (e.clientY / window.innerHeight) * 100;
        
        // Apply parallax to floating runes
        const runes = document.querySelectorAll('.rune-float');
        runes.forEach((rune, index) => {
            const speed = 0.02 + (index * 0.01);
            const x = (mouseX - 50) * speed;
            const y = (mouseY - 50) * speed;
            rune.style.transform = `translate(${x}px, ${y}px)`;
        });
        
        // Apply subtle parallax to background
        const bg = document.querySelector('.mystical-background');
        const bgX = (mouseX - 50) * 0.01;
        const bgY = (mouseY - 50) * 0.01;
        bg.style.transform = `translate(${bgX}px, ${bgY}px)`;
    });
}

// Add CSS animations dynamically
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes particle-float {
            0% { transform: translateY(100vh) rotate(0deg); }
            100% { transform: translateY(-100px) rotate(360deg); }
        }
        
        @keyframes section-highlight {
            0% { box-shadow: 0 0 0 rgba(255, 107, 53, 0.4); }
            50% { box-shadow: 0 0 50px rgba(255, 107, 53, 0.6); }
            100% { box-shadow: 0 0 0 rgba(255, 107, 53, 0.4); }
        }
        
        .animate-in {
            animation: fadeInUp 0.8s ease-out forwards;
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
        
        .category-card {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease-out;
        }
        
        .animate-in .category-card {
            opacity: 1;
            transform: translateY(0);
        }
        
        .animate-in .category-card:nth-child(1) { transition-delay: 0.1s; }
        .animate-in .category-card:nth-child(2) { transition-delay: 0.2s; }
        .animate-in .category-card:nth-child(3) { transition-delay: 0.3s; }
        .animate-in .category-card:nth-child(4) { transition-delay: 0.4s; }
    `;
    document.head.appendChild(style);
}

// Easter Eggs and Delight
function addEasterEggs() {
    // Konami Code for special effect
    let konamiCode = '';
    const konami = '38,38,40,40,37,39,37,39,66,65';
    
    document.addEventListener('keydown', (e) => {
        konamiCode += e.keyCode + ',';
        if (konamiCode.indexOf(konami) >= 0) {
            activateSpecialMode();
            konamiCode = '';
        }
        if (konamiCode.length > 50) konamiCode = '';
    });
    
    // Double-click logo for surprise
    document.querySelector('.logo').addEventListener('dblclick', () => {
        createRuneExplosion();
    });
}

function activateSpecialMode() {
    document.body.style.filter = 'hue-rotate(180deg)';
    document.querySelectorAll('.rune-float').forEach(rune => {
        rune.style.animation = 'float-mystical 2s infinite ease-in-out';
        rune.style.fontSize = '4rem';
    });
    
    setTimeout(() => {
        document.body.style.filter = '';
        document.querySelectorAll('.rune-float').forEach(rune => {
            rune.style.animation = 'float-mystical 15s infinite ease-in-out';
            rune.style.fontSize = '2rem';
        });
    }, 5000);
}

function createRuneExplosion() {
    const runes = ['ᚠ', 'ᚨ', 'ᛚ', 'ᚦ', 'ᛗ', 'ᛊ'];
    const container = document.querySelector('.hero-container');
    
    for (let i = 0; i < 20; i++) {
        const rune = document.createElement('div');
        rune.textContent = runes[Math.floor(Math.random() * runes.length)];
        rune.style.cssText = `
            position: absolute;
            font-family: 'Cinzel', serif;
            font-size: 2rem;
            color: #ff6b35;
            pointer-events: none;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            animation: explode ${Math.random() * 2 + 1}s ease-out forwards;
            z-index: 1000;
        `;
        container.appendChild(rune);
        
        // Remove after animation
        setTimeout(() => {
            if (rune.parentNode) rune.parentNode.removeChild(rune);
        }, 3000);
    }
    
    // Add explosion animation
    if (!document.getElementById('explosion-style')) {
        const style = document.createElement('style');
        style.id = 'explosion-style';
        style.textContent = `
            @keyframes explode {
                0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                100% { 
                    transform: translate(
                        calc(-50% + ${Math.random() * 400 - 200}px), 
                        calc(-50% + ${Math.random() * 400 - 200}px)
                    ) scale(0) rotate(720deg); 
                    opacity: 0; 
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Performance monitoring
function trackPerformance() {
    // Track page load time
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
        
        // Track to analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'timing_complete', {
                'name': 'page_load',
                'value': Math.round(loadTime)
            });
        }
    });
    
    // Track scroll depth
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent > maxScroll) {
            maxScroll = Math.round(scrollPercent);
            if (maxScroll % 25 === 0 && maxScroll > 0) { // Track at 25%, 50%, 75%, 100%
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'scroll', {
                        'scroll_depth': maxScroll
                    });
                }
            }
        }
    });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 RuneFlow Redesign Loaded - Ancient Power Activated!');
    
    // Start countdown timer
    updateCountdown();
    setInterval(updateCountdown, 1000);
    
    // Initialize features
    addDynamicStyles();
    createParticles();
    setupScrollAnimations();
    setupParallax();
    addEasterEggs();
    trackPerformance();
    
    // Add loading completion effect
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease-in';
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    console.log('✨ All systems initialized. Ready to convert!');
});

// Handle visibility change (tab switching)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.title = '⚡ Don\'t Miss Out! - RuneFlow';
    } else {
        document.title = 'RuneFlow - Ancient Automation Magic Available Now';
    }
});

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}
