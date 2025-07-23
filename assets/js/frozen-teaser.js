// Minimal JavaScript for RuneFlow.xyz Background Animations

// EPIC Snow Animation System
function createSnow() {
    const snowContainer = document.getElementById('snowContainer');
    let snowflakeIdCounter = 0;
    
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
        snowflake.style.opacity = Math.random() * 0.4 + 0.6; // 0.6-1.0 opacity
        
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
    
    // Create epic initial burst of snowflakes
    for (let i = 0; i < 75; i++) {
        setTimeout(() => createEpicSnowflake(), i * 200);
    }
    
    // Continue creating epic snowflakes
    setInterval(createEpicSnowflake, 600);
    
    // Create occasional blizzard bursts
    setInterval(() => {
        for (let i = 0; i < 15; i++) {
            setTimeout(() => createEpicSnowflake(), i * 100);
        }
    }, 25000);
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

// Initialize all animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    createSnow();
    createIceCrystals();
    createFloatingRunes();
});
