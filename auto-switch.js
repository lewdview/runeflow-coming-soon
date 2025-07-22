// Auto-Switch Script for RuneFlow Coming Soon Page
// This script runs client-side and switches from simple to complex page on countdown

(function() {
    // Configuration
    const SWITCH_DATE = new Date('2025-09-01T00:00:00Z'); // September 1st, 2025
    const COMPLEX_PAGE_URL = 'complex-index.html';
    
    // Check if we should switch to complex page
    function checkAndSwitch() {
        const now = new Date();
        
        // If current time is past the switch date, redirect to complex page
        if (now >= SWITCH_DATE) {
            console.log('🚀 Countdown reached! Switching to full coming soon page...');
            
            // Check if we're not already on the complex page
            if (!window.location.pathname.includes('complex-index.html')) {
                window.location.href = COMPLEX_PAGE_URL;
            }
            return true;
        }
        
        return false;
    }
    
    // Add countdown display to simple page
    function addCountdownDisplay() {
        // Only add if we're on the simple page (not complex)
        if (window.location.pathname.includes('complex-index.html')) {
            return;
        }
        
        // Create countdown element
        const countdownEl = document.createElement('div');
        countdownEl.id = 'autoSwitchCountdown';
        countdownEl.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(255, 107, 53, 0.1);
            border: 1px solid rgba(255, 107, 53, 0.3);
            border-radius: 15px;
            padding: 15px;
            color: #ff6b35;
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
            text-align: center;
            backdrop-filter: blur(10px);
            z-index: 1000;
            min-width: 200px;
        `;
        
        // Add to page
        document.body.appendChild(countdownEl);
        
        // Update countdown every second
        const updateCountdown = () => {
            if (checkAndSwitch()) {
                return; // Stop if we switched
            }
            
            const now = new Date();
            const distance = SWITCH_DATE.getTime() - now.getTime();
            
            if (distance < 0) {
                countdownEl.innerHTML = `
                    <div style="color: #4ecdc4;">
                        <div style="font-weight: 600; margin-bottom: 5px;">🚀 Launching Now!</div>
                        <div style="font-size: 0.8rem; opacity: 0.8;">Redirecting to full page...</div>
                    </div>
                `;
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            countdownEl.innerHTML = `
                <div style="font-weight: 600; margin-bottom: 5px; color: #ffab00;">Full Launch In:</div>
                <div style="font-weight: 700; font-size: 1.1rem;">
                    ${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}
                </div>
                <div style="font-size: 0.8rem; opacity: 0.8; margin-top: 5px;">Auto-switching to full page</div>
            `;
        };
        
        // Initial update
        updateCountdown();
        
        // Update every second
        setInterval(updateCountdown, 1000);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Small delay to ensure page is fully loaded
            setTimeout(() => {
                if (!checkAndSwitch()) {
                    addCountdownDisplay();
                }
            }, 1000);
        });
    } else {
        // DOM already ready
        setTimeout(() => {
            if (!checkAndSwitch()) {
                addCountdownDisplay();
            }
        }, 1000);
    }
    
    console.log('🔮 RuneFlow Auto-Switch initialized. Switch date:', SWITCH_DATE.toISOString());
})();
