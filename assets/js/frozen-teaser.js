// Minimal JavaScript for RuneFlow.xyz Background Animations

// EPIC Snow Animation System
function createSnow() {
    const snowContainer = document.getElementById('snowContainer');
    console.log('🌨️ SNOW SYSTEM INITIALIZING...', snowContainer);
    let snowflakeIdCounter = 0;
    
    if (!snowContainer) {
        console.error('❌ Snow container not found!');
        return;
    }
    
    // Create epic CSS animations for different snowflake types
    function createSnowfallStyles() {
        if (!document.querySelector('#epic-snowfall-styles')) {
            const style = document.createElement('style');
            style.id = 'epic-snowfall-styles';
            style.textContent = `
                .epic-snowflake {
                    position: absolute;
                    color: #00ffff;
                    text-shadow: 0 0 15px #00ffff, 0 0 30px #00ffff, 0 0 45px rgba(0,255,255,0.5);
                    user-select: none;
                    pointer-events: none;
                    z-index: 1;
                }
                
                @keyframes epicSnowfall1 {
                    0% {
                        transform: translateY(-120vh) translateX(0px) rotate(0deg) scale(0.8);
                        opacity: 0;
                    }
                    5% {
                        opacity: 1;
                    }
                    95% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(120vh) translateX(-50px) rotate(720deg) scale(1.2);
                        opacity: 0;
                    }
                }
                
                @keyframes epicSnowfall2 {
                    0% {
                        transform: translateY(-120vh) translateX(0px) rotate(0deg) scale(1.1);
                        opacity: 0;
                    }
                    5% {
                        opacity: 1;
                    }
                    95% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(120vh) translateX(80px) rotate(-540deg) scale(0.7);
                        opacity: 0;
                    }
                }
                
                @keyframes epicSnowfall3 {
                    0% {
                        transform: translateY(-120vh) translateX(0px) rotate(0deg) scale(0.9);
                        opacity: 0;
                    }
                    5% {
                        opacity: 1;
                    }
                    95% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(120vh) translateX(30px) rotate(900deg) scale(1.4);
                        opacity: 0;
                    }
                }
                
                @keyframes epicSnowfall4 {
                    0% {
                        transform: translateY(-120vh) translateX(0px) rotate(0deg) scale(1.3);
                        opacity: 0;
                    }
                    5% {
                        opacity: 1;
                    }
                    95% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(120vh) translateX(-100px) rotate(-720deg) scale(0.6);
                        opacity: 0;
                    }
                }
                
                @keyframes epicSnowfall5 {
                    0% {
                        transform: translateY(-120vh) translateX(0px) rotate(0deg) scale(0.7);
                        opacity: 0;
                    }
                    5% {
                        opacity: 1;
                    }
                    95% {
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(120vh) translateX(60px) rotate(1080deg) scale(1.8);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    function createEpicSnowflake() {
        snowflakeIdCounter++;
        const snowflake = document.createElement('div');
        
        // Epic snowflake varieties + MYSTICAL RUNES!
        const snowTypes = ['❅', '❄', '✻', '✽', '❋', '❊', '⋄', '◊'];
        const mysticalRunes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚾ', 'ᛇ', 'ᛉ', 'ᛊ', 'ᛟ', 'ᛦ', 'ᛪ', '᛫'];
        const epicSymbols = ['⎈', '⎇', '⏣', '⊛', '⊚', '⊙', '⊗', '⊕'];
        
        // Combine all falling elements with weighted probability
        const allFallingElements = [
            ...snowTypes, ...snowTypes, ...snowTypes, // 60% snow
            ...mysticalRunes, ...mysticalRunes,       // 30% runes  
            ...epicSymbols                            // 10% epic symbols
        ];
        
        const glowColors = [
            '#00ffff',
            '#80f0ff', 
            '#40e0ff',
            '#60d0ff',
            '#a0f8ff',
            '#00e6ff',  // Epic cyan
            '#66f0ff',  // Bright ice
            '#ccf7ff'   // Pale frost
        ];
        
        const selectedType = allFallingElements[Math.floor(Math.random() * allFallingElements.length)];
        const selectedColor = glowColors[Math.floor(Math.random() * glowColors.length)];
        const animationType = Math.floor(Math.random() * 5) + 1;
        
        // Make runes slightly larger and more visible
        const isRune = mysticalRunes.includes(selectedType);
        const isEpicSymbol = epicSymbols.includes(selectedType);
        const size = isRune ? Math.random() * 15 + 25 : isEpicSymbol ? Math.random() * 10 + 30 : Math.random() * 25 + 15;
        
        const duration = Math.random() * 8 + 12; // 12-20 seconds
        const delay = Math.random() * 3; // 0-3 seconds delay
        
        snowflake.innerHTML = selectedType;
        snowflake.className = 'epic-snowflake';
        snowflake.style.left = Math.random() * 100 + '%';
        snowflake.style.fontSize = size + 'px';
        snowflake.style.color = selectedColor;
        snowflake.style.textShadow = `0 0 15px ${selectedColor}, 0 0 30px ${selectedColor}, 0 0 45px ${selectedColor}40`;
        snowflake.style.animation = `epicSnowfall${animationType} ${duration}s linear infinite`;
        snowflake.style.animationDelay = delay + 's';
        snowflake.style.opacity = Math.random() * 0.3 + 0.7; // 0.7-1.0 opacity (more visible)
        
        snowContainer.appendChild(snowflake);
        
        // Epic cleanup - remove after animation completes
        setTimeout(() => {
            if (snowflake && snowflake.parentNode) {
                snowflake.parentNode.removeChild(snowflake);
            }
        }, (duration + delay) * 1000 + 1000);
    }
    
    // Initialize epic snowfall system
    createSnowfallStyles();
    
    // Create epic initial burst of snowflakes with error handling
    console.log('❄️ Creating initial snow burst...');
    try {
        for (let i = 0; i < 20; i++) { // Start with fewer flakes
            setTimeout(() => {
                try {
                    createEpicSnowflake();
                    console.log(`✅ Created snowflake ${i + 1}`);
                } catch (err) {
                    console.error('❌ Error creating snowflake:', err);
                }
            }, i * 300);
        }
        
        // Continue creating epic snowflakes
        const snowInterval = setInterval(() => {
            try {
                createEpicSnowflake();
            } catch (err) {
                console.error('❌ Error in snow interval:', err);
            }
        }, 1000); // Slower for debugging
        
        console.log('✅ Snow system intervals started');
    } catch (err) {
        console.error('❌ MAJOR ERROR in snow system:', err);
    }
}

// Ice Crystals Animation
function createIceCrystals() {
    const crystalsContainer = document.getElementById('iceCrystals');
    const crystalCount = 30;
    
    // Add CSS keyframes for crystal float
    if (!document.querySelector('#crystal-style')) {
        const style = document.createElement('style');
        style.id = 'crystal-style';
        style.textContent = `
            @keyframes crystalFloat {
                0%, 100% {
                    transform: translateY(0) scale(1);
                    opacity: 0.3;
                }
                50% {
                    transform: translateY(-20px) scale(1.2);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    for (let i = 0; i < crystalCount; i++) {
        const crystal = document.createElement('div');
        crystal.style.position = 'absolute';
        crystal.style.width = '6px';
        crystal.style.height = '6px';
        crystal.style.background = '#00ffff';
        crystal.style.borderRadius = '50%';
        crystal.style.boxShadow = '0 0 20px #00ffff, 0 0 40px #00ffff';
        crystal.style.left = Math.random() * 100 + '%';
        crystal.style.top = Math.random() * 100 + '%';
        crystal.style.animation = `crystalFloat ${8 + Math.random() * 4}s ease-in-out infinite`;
        crystal.style.animationDelay = Math.random() * 8 + 's';
        
        crystalsContainer.appendChild(crystal);
    }
}

// Floating Runes Animation
function createFloatingRunes() {
    const runesContainer = document.getElementById('floatingRunes');
    const runes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', '◈', '◊', '⬟', '⬢', '⬣'];
    const runeCount = 15;
    
    // Add CSS keyframes for rune float
    if (!document.querySelector('#rune-style')) {
        const style = document.createElement('style');
        style.id = 'rune-style';
        style.textContent = `
            @keyframes runeFloat {
                0%, 100% {
                    transform: translate(0, 0) rotate(0deg) scale(1);
                    opacity: 0.1;
                }
                25% {
                    transform: translate(50px, -100px) rotate(90deg) scale(1.1);
                    opacity: 0.3;
                }
                50% {
                    transform: translate(-30px, -200px) rotate(180deg) scale(0.9);
                    opacity: 0.2;
                }
                75% {
                    transform: translate(-80px, -100px) rotate(270deg) scale(1.2);
                    opacity: 0.25;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    for (let i = 0; i < runeCount; i++) {
        const rune = document.createElement('div');
        rune.innerHTML = runes[Math.floor(Math.random() * runes.length)];
        rune.style.position = 'absolute';
        rune.style.fontFamily = 'Orbitron, monospace';
        rune.style.fontSize = '3rem';
        rune.style.color = 'rgba(0, 255, 255, 0.15)';
        rune.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(0, 255, 255, 0.6)';
        rune.style.left = Math.random() * 100 + '%';
        rune.style.top = Math.random() * 100 + '%';
        rune.style.animation = `runeFloat ${25 + Math.random() * 10}s ease-in-out infinite`;
        rune.style.animationDelay = Math.random() * 25 + 's';
        rune.style.userSelect = 'none';
        rune.style.pointerEvents = 'none';
        
        runesContainer.appendChild(rune);
    }
}

// 24-Week Launch Schedule
const weeklyLaunchSchedule = {
    1: { launchAccess: 999, foundersAnnual: 199, phase: "Pre-Launch", marketplaceLaunched: false },
    2: { launchAccess: 999, foundersAnnual: 199, phase: "Pre-Launch", marketplaceLaunched: false },
    3: { launchAccess: 999, foundersAnnual: 199, phase: "Pre-Launch", marketplaceLaunched: false },
    4: { launchAccess: 999, foundersAnnual: 199, phase: "Pre-Launch", marketplaceLaunched: false },
    5: { launchAccess: 999, foundersAnnual: 199, phase: "Alpha Testing", marketplaceLaunched: false },
    6: { launchAccess: 999, foundersAnnual: 199, phase: "Alpha Testing", marketplaceLaunched: false },
    7: { launchAccess: 999, foundersAnnual: 199, phase: "Alpha Testing", marketplaceLaunched: false },
    8: { launchAccess: 999, foundersAnnual: 199, phase: "Alpha Testing", marketplaceLaunched: false },
    9: { launchAccess: 999, foundersAnnual: 199, phase: "Beta Testing", marketplaceLaunched: false },
    10: { launchAccess: 999, foundersAnnual: 199, phase: "Beta Testing", marketplaceLaunched: false },
    11: { launchAccess: 999, foundersAnnual: 199, phase: "Beta Testing", marketplaceLaunched: false },
    12: { launchAccess: 999, foundersAnnual: 199, phase: "Beta Testing", marketplaceLaunched: false },
    13: { launchAccess: 999, foundersAnnual: 199, phase: "Pre-Launch Final", marketplaceLaunched: false },
    14: { launchAccess: 999, foundersAnnual: 199, phase: "Pre-Launch Final", marketplaceLaunched: false },
    15: { launchAccess: 999, foundersAnnual: 199, phase: "Pre-Launch Final", marketplaceLaunched: false },
    16: { launchAccess: 999, foundersAnnual: 199, phase: "Pre-Launch Final", marketplaceLaunched: false },
    17: { launchAccess: 999, foundersAnnual: 199, phase: "Launch Prep", marketplaceLaunched: false },
    18: { launchAccess: 999, foundersAnnual: 199, phase: "Launch Prep", marketplaceLaunched: false },
    19: { launchAccess: 999, foundersAnnual: 199, phase: "Launch Prep", marketplaceLaunched: false },
    20: { launchAccess: 999, foundersAnnual: 199, phase: "Launch Prep", marketplaceLaunched: false },
    21: { launchAccess: 999, foundersAnnual: 199, phase: "Launch Week", marketplaceLaunched: false },
    22: { launchAccess: 999, foundersAnnual: 199, phase: "Launch Week", marketplaceLaunched: false },
    23: { launchAccess: 999, foundersAnnual: 199, phase: "Launch Week", marketplaceLaunched: false },
    24: { launchAccess: 999, foundersAnnual: 297, phase: "Marketplace Live", marketplaceLaunched: true, totalRunes: 4000 }
};

// Rollout System Logic
function initializeRolloutSystem() {
    const currentWeekEl = document.getElementById('currentWeek');
    const founderPriceEl = document.getElementById('founderPrice');
    const phaseProgressEl = document.getElementById('phaseProgress');
    const releasedRunesEl = document.getElementById('releasedRunes');
    
    const startDate = new Date('2025-07-23'); // Adjust start date as needed
    const currentDate = new Date();
    const diffWeeks = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24 * 7));
    const currentWeek = Math.min(Math.max(diffWeeks + 1, 1), 24);

    const weekData = weeklyLaunchSchedule[currentWeek];
    
    currentWeekEl.textContent = currentWeek;
    founderPriceEl.textContent = weekData.launchAccess;
    
    // Show marketplace runes only when launched
    if (weekData.marketplaceLaunched) {
        releasedRunesEl.textContent = weekData.totalRunes;
    } else {
        releasedRunesEl.textContent = 0;
    }
    
    phaseProgressEl.style.width = `${(currentWeek / 24) * 100}%`;
    
    // Show/hide milestone dashboard based on week
    const dashboardElements = document.querySelectorAll('.milestone-dashboard, .user-dashboard');
    if (currentWeek >= 5) {
        dashboardElements.forEach(el => {
            if (el) el.style.display = 'block';
        });
    } else {
        dashboardElements.forEach(el => {
            if (el) el.style.display = 'none';
        });
    }
}

// Milestone Management System
let milestoneStatus = {
    1: false, 2: false, 3: false, 4: false, 5: false, 6: false
};

function toggleMilestone(milestoneNumber) {
    const statusElement = document.getElementById(`milestone${milestoneNumber}`);
    const buttonElement = document.querySelector(`[data-month="${milestoneNumber}"] .milestone-toggle`);
    
    milestoneStatus[milestoneNumber] = !milestoneStatus[milestoneNumber];
    
    if (milestoneStatus[milestoneNumber]) {
        statusElement.textContent = '✅';
        buttonElement.textContent = 'Completed';
        buttonElement.style.backgroundColor = '#28a745';
        
        // Special handling for milestone 3 (halfway dump)
        if (milestoneNumber === 3) {
            executeHalfwayDump();
        }
    } else {
        statusElement.textContent = milestoneNumber === 3 ? '⭐' : '⏳';
        buttonElement.textContent = milestoneNumber === 3 ? 'Execute Halfway Dump' : 'Mark Complete';
        buttonElement.style.backgroundColor = '#007acc';
    }
    
    updateOverallProgress();
    saveProgress();
}

function executeHalfwayDump() {
    // Special animation for halfway milestone
    const releasedRunesEl = document.getElementById('releasedRunes');
    animateNumber(releasedRunesEl, parseInt(releasedRunesEl.textContent), 2000, 50);
    
    // Create celebratory effect
    createCelebrationEffect();
}

function createCelebrationEffect() {
    // Add special celebration snow burst
    for (let i = 0; i < 50; i++) {
        setTimeout(() => createEpicSnowflake(), i * 50);
    }
}

function animateNumber(element, start, end, duration) {
    const startTime = Date.now();
    const step = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (end - start) * progress);
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    };
    requestAnimationFrame(step);
}

function updateOverallProgress() {
    const completed = Object.values(milestoneStatus).filter(status => status).length;
    const percentage = (completed / 6) * 100;
    
    document.getElementById('overallProgress').style.width = `${percentage}%`;
    document.getElementById('progressText').textContent = `${Math.round(percentage)}% Complete`;
    document.getElementById('completedMilestones').textContent = completed;
}

function saveMilestoneNotes() {
    const notes = document.getElementById('milestoneNotes').value;
    localStorage.setItem('milestoneNotes', notes);
    
    // Visual feedback
    const button = document.querySelector('.input-section button');
    const originalText = button.textContent;
    button.textContent = 'Saved!';
    button.style.backgroundColor = '#28a745';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '#28a745';
    }, 2000);
}

function loadProgress() {
    // Load milestone status from localStorage
    const saved = localStorage.getItem('milestoneStatus');
    if (saved) {
        milestoneStatus = JSON.parse(saved);
        
        // Update UI based on saved status
        Object.keys(milestoneStatus).forEach(milestone => {
            if (milestoneStatus[milestone]) {
                toggleMilestone(parseInt(milestone));
            }
        });
    }
    
    // Load saved notes
    const savedNotes = localStorage.getItem('milestoneNotes');
    if (savedNotes) {
        document.getElementById('milestoneNotes').value = savedNotes;
    }
}

function saveProgress() {
    localStorage.setItem('milestoneStatus', JSON.stringify(milestoneStatus));
}

// Email Capture and Download System
function initializeEmailCapture() {
    const emailForm = document.getElementById('emailCaptureForm');
    const downloadSection = document.getElementById('downloadSection');
    const week1Capture = document.getElementById('week1Capture');

    if (emailForm) {
        emailForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('userEmail');
            const submitBtn = emailForm.querySelector('.capture-btn');
            const email = emailInput.value;

            // Show loading state
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '🚀 Processing...';
            submitBtn.disabled = true;

            try {
                // Call Netlify function
                const response = await fetch('/.netlify/functions/capture-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        selected_rune: 'flowrune-asmr-v1',
                        is_free_pack: true
                    })
                });

                const result = await response.json();

                if (result.success) {
                    // Save email to cookies
                    setCookie('userEmail', email, 365);
                    setCookie('downloadUrl', result.download_url, 365);

                    // Hide capture form
                    week1Capture.style.display = 'none';

                    // Show download section
                    downloadSection.style.display = 'block';

                    console.log('✅ Email captured successfully');
                } else {
                    throw new Error(result.error || 'Failed to capture email');
                }
            } catch (error) {
                console.error('❌ Email capture error:', error);
                alert('Error: ' + error.message + '\nPlease try again or contact hello@runeflow.xyz');
                
                // Reset button
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // Dashboard button click
    const dashboardBtn = document.getElementById('dashboardBtn');
    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', () => {
            // Simulate dashboard visit
            setCookie('visitedDashboard', 'true', 365);
            alert('Dashboard feature is coming soon!');
        });
    }

    // Download button
    const downloadBtn = document.getElementById('downloadBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const file = downloadBtn.getAttribute('data-file');
            
            // Track download
            setCookie('downloadedWeek1Rune', 'true', 365);
            
            // Start download
            const link = document.createElement('a');
            link.href = 'assets/downloads/flowrune-asmr-v1.zip';
            link.download = file;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Show success message
            downloadBtn.innerHTML = '✅ Downloaded!';
            downloadBtn.style.background = 'linear-gradient(135deg, #00ff88, #00aa55)';
            
            // Show ASMR video popup after successful download
            setTimeout(() => {
                showASMRVideo();
            }, 1000);
            
            setTimeout(() => {
                downloadBtn.innerHTML = '📥 Download Rune Package';
                downloadBtn.style.background = 'linear-gradient(135deg, #00ff88, #00cc66)';
            }, 3000);
        });
    }
}

// Helper: Set cookie
function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Show ASMR Video Popup
function showASMRVideo() {
    const asmrVideo = document.getElementById('asmrVideoPopup');
    if (asmrVideo) {
        asmrVideo.style.display = 'block';
        asmrVideo.style.opacity = '0';
        asmrVideo.style.transform = 'translateX(400px)';
        
        // Animate in
        setTimeout(() => {
            asmrVideo.style.transition = 'all 0.3s ease';
            asmrVideo.style.opacity = '1';
            asmrVideo.style.transform = 'translateX(0)';
        }, 100);
    }
}

// ASMR Video Management
function initializeASMRVideo() {
    const asmrVideo = document.querySelector('.asmr-video');
    if (asmrVideo) {
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.className = 'asmr-close-btn';
        closeButton.style.cssText = `
            position: absolute;
            top: 8px;
            right: 12px;
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            font-size: 1.5rem;
            cursor: pointer;
            transition: color 0.3s ease;
            z-index: 1001;
        `;
        
        closeButton.addEventListener('mouseover', () => {
            closeButton.style.color = 'rgba(255, 255, 255, 0.9)';
        });
        
        closeButton.addEventListener('mouseout', () => {
            closeButton.style.color = 'rgba(255, 255, 255, 0.6)';
        });
        
        closeButton.addEventListener('click', () => {
            asmrVideo.style.transform = 'translateX(400px)';
            asmrVideo.style.opacity = '0';
            setTimeout(() => {
                asmrVideo.style.display = 'none';
            }, 300);
        });
        
        asmrVideo.appendChild(closeButton);
    }
}

// DEBUG: Test snow immediately
console.log('🔧 SCRIPT LOADED - TESTING SNOW SYSTEM');

// Test function to create a single snowflake for debugging
function debugSnowTest() {
    console.log('🧪 RUNNING DEBUG SNOW TEST');
    const snowContainer = document.getElementById('snowContainer');
    console.log('📦 Snow Container:', snowContainer);
    
    if (snowContainer) {
        const testFlake = document.createElement('div');
        testFlake.innerHTML = '❄';
        testFlake.style.cssText = `
            position: absolute;
            top: 10px;
            left: 50%;
            font-size: 30px;
            color: #00ffff;
            text-shadow: 0 0 20px #00ffff;
            z-index: 10;
            animation: fall 5s linear infinite;
        `;
        
        // Add animation
        if (!document.querySelector('#debug-style')) {
            const style = document.createElement('style');
            style.id = 'debug-style';
            style.textContent = `
                @keyframes fall {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(100vh); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        snowContainer.appendChild(testFlake);
        console.log('✅ DEBUG SNOWFLAKE ADDED');
        
        setTimeout(() => {
            if (testFlake && testFlake.parentNode) {
                testFlake.parentNode.removeChild(testFlake);
            }
        }, 5000);
    } else {
        console.error('❌ SNOW CONTAINER NOT FOUND!');
    }
}

// Initialize all animations, rollout system, and milestone system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM CONTENT LOADED');
    
    // Run debug test first
    debugSnowTest();
    
    // Run main functions
    createSnow();
    createIceCrystals();
    createFloatingRunes();
    initializeRolloutSystem();
    loadProgress();
    updateOverallProgress();
    initializeASMRVideo();
    initializeEmailCapture();
    
    console.log('🎬 ALL SYSTEMS INITIALIZED');
});

// Also run immediately in case DOM is already loaded
if (document.readyState === 'loading') {
    console.log('📋 DOM STILL LOADING');
} else {
    console.log('📋 DOM ALREADY LOADED - RUNNING IMMEDIATE TEST');
    setTimeout(debugSnowTest, 100);
}

// Coinbase Commerce Product IDs
const COINBASE_PRODUCTS = {
    elite: '7d052c71-c392-4f48-9e48-df68f90b76d1',
    pro: '217582f9-25da-472a-9bed-b09e095dcd10',
    founder: '52bc5d8a-bc5d-4257-b17c-20f3b21340ed'
};

// Coinbase Payment Functions
function purchaseElite() {
    console.log('🔥 Elite Access purchase initiated - $999');
    
    // Show loading state
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '🚀 Opening Coinbase Checkout...';
    button.disabled = true;
    
    // Redirect to Coinbase Commerce checkout
    const productId = COINBASE_PRODUCTS.elite;
    const checkoutUrl = `https://commerce.coinbase.com/checkout/${productId}`;
    
    console.log('🔗 Opening Coinbase checkout:', checkoutUrl);
    
    // Track purchase attempt
    setCookie('purchaseAttempt', 'elite', 1);
    
    // Open Coinbase Commerce in new tab
    window.open(checkoutUrl, '_blank');
    
    // Reset button after a short delay
    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
    }, 2000);
}

function purchasePro() {
    console.log('⚡ Pro Access purchase initiated - $297');
    
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '🚀 Opening Coinbase Checkout...';
    button.disabled = true;
    
    const checkoutUrl = `https://commerce.coinbase.com/checkout/${COINBASE_PRODUCTS.pro}`;
    console.log('🔗 Opening Coinbase checkout:', checkoutUrl);
    
    setCookie('purchaseAttempt', 'pro', 1);
    window.open(checkoutUrl, '_blank');
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
    }, 2000);
}

function purchaseFounder() {
    console.log('👑 Founder Access purchase initiated - $199');
    
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '🚀 Opening Coinbase Checkout...';
    button.disabled = true;
    
    const checkoutUrl = `https://commerce.coinbase.com/checkout/${COINBASE_PRODUCTS.founder}`;
    console.log('🔗 Opening Coinbase checkout:', checkoutUrl);
    
    setCookie('purchaseAttempt', 'founder', 1);
    window.open(checkoutUrl, '_blank');
    
    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
    }, 2000);
}

