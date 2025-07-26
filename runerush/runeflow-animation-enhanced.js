/**
 * RuneFlow Logo Animation - Enhanced Edition
 * Adds sound effects, advanced particle systems, and interactive features
 */

class RuneFlowAnimation {
    constructor() {
        this.audioContext = null;
        this.isPlaying = false;
        this.particles = [];
        this.soundEnabled = false;
        
        this.init();
    }
    
    init() {
        this.setupAudio();
        this.createAdvancedParticles();
        this.addKeyboardControls();
        this.setupSequencer();
    }
    
    // Audio System
    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.soundEnabled = true;
        } catch (e) {
            console.log('Audio not supported, using visual-only mode');
            this.soundEnabled = false;
        }
    }
    
    playTone(frequency, duration, type = 'sine') {
        if (!this.soundEnabled || !this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    // Enhanced Particle System
    createAdvancedParticles() {
        const container = document.querySelector('.animation-container');
        
        // Matrix-style digital rain
        this.createMatrixRain(container);
        
        // Floating rune fragments
        this.createRuneFragments(container);
        
        // Energy orbs
        this.createEnergyOrbs(container);
    }
    
    createMatrixRain(container) {
        for (let i = 0; i < 15; i++) {
            const column = document.createElement('div');
            column.style.cssText = `
                position: absolute;
                top: 0;
                left: ${Math.random() * 100}%;
                width: 20px;
                height: 100vh;
                font-family: 'JetBrains Mono', monospace;
                font-size: 14px;
                color: #00ff41;
                opacity: 0.3;
                animation: matrix-fall ${8 + Math.random() * 4}s linear infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            
            // Generate random characters
            let content = '';
            for (let j = 0; j < 50; j++) {
                const chars = '01ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
                content += chars[Math.floor(Math.random() * chars.length)] + '<br>';
            }
            column.innerHTML = content;
            container.appendChild(column);
        }
        
        // Add CSS animation for matrix fall
        const style = document.createElement('style');
        style.textContent = `
            @keyframes matrix-fall {
                0% { transform: translateY(-100vh); opacity: 0; }
                10% { opacity: 0.3; }
                90% { opacity: 0.3; }
                100% { transform: translateY(100vh); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    createRuneFragments(container) {
        const runes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ'];
        
        for (let i = 0; i < 20; i++) {
            const fragment = document.createElement('div');
            fragment.textContent = runes[Math.floor(Math.random() * runes.length)];
            fragment.style.cssText = `
                position: absolute;
                font-size: ${20 + Math.random() * 30}px;
                color: #00ffff;
                opacity: 0.4;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float-fragment ${15 + Math.random() * 10}s linear infinite;
                animation-delay: ${Math.random() * 8}s;
                text-shadow: 0 0 10px #00ffff;
                z-index: 1;
            `;
            container.appendChild(fragment);
        }
        
        // Add fragment animation
        const style = document.createElement('style');
        style.textContent += `
            @keyframes float-fragment {
                0% { 
                    transform: translateX(-50px) translateY(100vh) rotate(0deg);
                    opacity: 0;
                }
                10% { opacity: 0.4; }
                50% { 
                    transform: translateX(50px) translateY(50vh) rotate(180deg);
                }
                90% { opacity: 0.4; }
                100% { 
                    transform: translateX(100px) translateY(-100px) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    createEnergyOrbs(container) {
        for (let i = 0; i < 8; i++) {
            const orb = document.createElement('div');
            orb.style.cssText = `
                position: absolute;
                width: ${10 + Math.random() * 20}px;
                height: ${10 + Math.random() * 20}px;
                background: radial-gradient(circle, #00ffff, transparent);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: orb-drift ${20 + Math.random() * 15}s ease-in-out infinite;
                animation-delay: ${Math.random() * 5}s;
                opacity: 0.6;
                box-shadow: 0 0 20px #00ffff;
            `;
            container.appendChild(orb);
        }
        
        const style = document.createElement('style');
        style.textContent += `
            @keyframes orb-drift {
                0%, 100% { 
                    transform: translate(0, 0) scale(1);
                    opacity: 0.6;
                }
                25% { 
                    transform: translate(100px, -50px) scale(1.5);
                    opacity: 0.8;
                }
                50% { 
                    transform: translate(-50px, 100px) scale(0.8);
                    opacity: 0.4;
                }
                75% { 
                    transform: translate(80px, 30px) scale(1.2);
                    opacity: 0.7;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Animation Sequencer with Sound
    setupSequencer() {
        const sequence = [
            { time: 500, action: () => this.playTone(220, 0.5, 'triangle') }, // Rune 1 appear
            { time: 1000, action: () => this.playTone(277, 0.5, 'triangle') }, // Rune 2 appear
            { time: 1500, action: () => this.playTone(330, 0.5, 'triangle') }, // Rune 3 appear
            { time: 3000, action: () => this.playCircuitSounds() }, // Circuit phase
            { time: 6000, action: () => this.playLogoFormation() }, // Logo formation
            { time: 8000, action: () => this.playTone(500, 1, 'sine') }, // Subtitle appear
            { time: 9000, action: () => this.playTone(80, 2, 'sawtooth') }, // Bass sweep
        ];
        
        sequence.forEach(step => {
            setTimeout(step.action, step.time);
        });
    }
    
    playCircuitSounds() {
        // Circuit activation sounds
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.playTone(440 + (i * 110), 0.3, 'square');
            }, i * 300);
        }
    }
    
    playLogoFormation() {
        // Power-up sweep
        const startFreq = 80;
        const endFreq = 800;
        const duration = 2;
        
        if (this.soundEnabled && this.audioContext) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);
            oscillator.type = 'sawtooth';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        }
        
        // Activation chime
        setTimeout(() => {
            this.playTone(523, 0.8, 'sine'); // C5
        }, 1500);
    }
    
    // Keyboard Controls
    addKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case ' ': // Spacebar - restart animation
                    e.preventDefault();
                    location.reload();
                    break;
                case 's': // S - toggle sound
                case 'S':
                    this.toggleSound();
                    break;
                case 'f': // F - fullscreen
                case 'F':
                    this.toggleFullscreen();
                    break;
                case 'r': // R - random rune effect
                case 'R':
                    this.triggerRandomRuneEffect();
                    break;
            }
        });
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        console.log('Sound:', this.soundEnabled ? 'ON' : 'OFF');
        this.showNotification(this.soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF');
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    triggerRandomRuneEffect() {
        const runes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ'];
        const container = document.querySelector('.animation-container');
        
        for (let i = 0; i < 5; i++) {
            const rune = document.createElement('div');
            rune.textContent = runes[Math.floor(Math.random() * runes.length)];
            rune.style.cssText = `
                position: absolute;
                font-size: 60px;
                color: #ff00ff;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: rune-burst 2s ease-out forwards;
                text-shadow: 0 0 20px #ff00ff;
                z-index: 100;
            `;
            container.appendChild(rune);
            
            setTimeout(() => rune.remove(), 2000);
            
            if (this.soundEnabled) {
                this.playTone(440 + Math.random() * 880, 0.5, 'triangle');
            }
        }
        
        // Add burst animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes rune-burst {
                0% {
                    transform: scale(0) rotate(0deg);
                    opacity: 1;
                }
                50% {
                    transform: scale(1.5) rotate(180deg);
                    opacity: 1;
                }
                100% {
                    transform: scale(0) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ffff;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: 'JetBrains Mono', monospace;
            z-index: 1000;
            animation: notification-fade 3s ease-out forwards;
        `;
        
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes notification-fade {
                0% { opacity: 0; transform: translateX(100px); }
                20% { opacity: 1; transform: translateX(0); }
                80% { opacity: 1; transform: translateX(0); }
                100% { opacity: 0; transform: translateX(100px); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Export for Lottie/After Effects template generation
class RuneFlowExporter {
    static generateLottieConfig() {
        return {
            v: "5.7.4",
            fr: 30,
            ip: 0,
            op: 300, // 10 seconds at 30fps
            w: 1920,
            h: 1080,
            nm: "RuneFlow Logo Animation",
            ddd: 0,
            assets: [],
            layers: [
                {
                    ddd: 0,
                    ind: 1,
                    ty: 4,
                    nm: "Rune Layer 1",
                    sr: 1,
                    ks: {
                        o: { a: 1, k: [
                            { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [0] },
                            { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 15, s: [100] },
                            { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 90, s: [100] },
                            { t: 105, s: [0] }
                        ]},
                        r: { a: 1, k: [
                            { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [180] },
                            { t: 45, s: [0] }
                        ]},
                        p: { a: 0, k: [960, 440, 0] },
                        a: { a: 0, k: [0, 0, 0] },
                        s: { a: 1, k: [
                            { i: { x: [0.833, 0.833, 0.833], y: [0.833, 0.833, 0.833] }, o: { x: [0.167, 0.167, 0.167], y: [0.167, 0.167, 0.167] }, t: 0, s: [0, 0, 100] },
                            { i: { x: [0.833, 0.833, 0.833], y: [0.833, 0.833, 0.833] }, o: { x: [0.167, 0.167, 0.167], y: [0.167, 0.167, 0.167] }, t: 30, s: [120, 120, 100] },
                            { t: 45, s: [100, 100, 100] }
                        ]}
                    },
                    ao: 0,
                    ef: [
                        {
                            ty: 25, // Glow effect
                            nm: "Glow",
                            np: 3,
                            mn: "ADBE Glow",
                            ix: 1,
                            en: 1,
                            ef: [
                                { ty: 0, nm: "Glow Based On", mn: "ADBE Glow-0001", ix: 1, v: { a: 0, k: 1, ix: 1 } },
                                { ty: 0, nm: "Glow Threshold", mn: "ADBE Glow-0002", ix: 2, v: { a: 0, k: 20, ix: 2 } },
                                { ty: 0, nm: "Glow Radius", mn: "ADBE Glow-0003", ix: 3, v: { a: 0, k: 25, ix: 3 } }
                            ]
                        }
                    ],
                    shapes: [],
                    ip: 0,
                    op: 300,
                    st: 0,
                    bm: 0
                }
                // Additional layers would be defined here...
            ]
        };
    }
    
    static exportToFile() {
        const config = this.generateLottieConfig();
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'runeflow-animation.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const animation = new RuneFlowAnimation();
    
    // Add controls info
    const controls = document.createElement('div');
    controls.innerHTML = `
        <div style="position: fixed; bottom: 20px; left: 20px; color: #666; font-family: 'JetBrains Mono', monospace; font-size: 12px; z-index: 1000;">
            Controls: [SPACE] Restart | [S] Sound | [F] Fullscreen | [R] Random Runes
        </div>
    `;
    document.body.appendChild(controls);
    
    // Add export button for developers
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export Lottie';
    exportBtn.style.cssText = `
        position: fixed; top: 20px; left: 20px; 
        background: #00ffff; color: #000; border: none; 
        padding: 8px 16px; border-radius: 4px; 
        font-family: 'JetBrains Mono', monospace; 
        cursor: pointer; z-index: 1000;
    `;
    exportBtn.onclick = () => RuneFlowExporter.exportToFile();
    document.body.appendChild(exportBtn);
});

// Export classes for external use
window.RuneFlowAnimation = RuneFlowAnimation;
window.RuneFlowExporter = RuneFlowExporter;
