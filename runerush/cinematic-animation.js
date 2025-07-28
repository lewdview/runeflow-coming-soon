/**
 * Cinematic Logo Animation
 * A 6-second violently cinematic transformation from RuneFlow to RuneRUSH
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Audio Context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Canvas Setup
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Elements
    const runeFlowLogo = document.getElementById('runeFlowLogo');
    const templatesText = document.getElementById('templatesText');
    const priceText = document.getElementById('priceText');
    const runeRushText = document.getElementById('runeRushText');
    const ctaContainer = document.getElementById('ctaContainer');
    const ctaButton = document.querySelector('.cta-button');
    const countdown = document.getElementById('countdown');
    const swordSlash = document.getElementById('swordSlash');
    const moltenContainer = document.getElementById('moltenContainer');

    // Particle Systems
    let particles = [];
    let bloodSplatterToggle = true; // Optional blood splatter

    // Sound Effects
    const playSound = (frequency, type, duration, gain = 0.3) => {
        try {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(gain, audioContext.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            console.warn('Audio not supported in this environment');
        }
    };

    // Particle Class
    class Particle {
        constructor(x, y, color = '#ff4500', size = 3) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 10;
            this.vy = (Math.random() - 0.5) * 10;
            this.size = size;
            this.color = color;
            this.life = 1.0;
            this.decay = 0.02;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.2; // Gravity
            this.life -= this.decay;
            this.size *= 0.99;
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        isDead() {
            return this.life <= 0 || this.size <= 0.1;
        }
    }

    // Create Shatter Effect
    const createShatterEffect = (element) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Create obsidian-like shards
        for (let i = 0; i < 30; i++) {
            particles.push(new Particle(
                centerX + (Math.random() - 0.5) * rect.width,
                centerY + (Math.random() - 0.5) * rect.height,
                '#00ffff',
                Math.random() * 5 + 2
            ));
        }
    };

    // Create Blood Splatter Effect
    const createBloodSplatter = () => {
        if (!bloodSplatterToggle) return;
        
        for (let i = 0; i < 20; i++) {
            particles.push(new Particle(
                canvas.width / 2 + (Math.random() - 0.5) * 200,
                canvas.height / 2 + (Math.random() - 0.5) * 200,
                '#8B0000',
                Math.random() * 4 + 1
            ));
        }
    };

    // Animation Phases - FIXED TIMING TO PREVENT OVERLAPS
    const phase1 = () => {
        // 0-3s: Opening - RuneFlow logo pulses ominously
        console.log('Phase 1: Logo pulse starts');
        playSound(20, 'sawtooth', 3, 0.2); // Deep bass drone
        runeFlowLogo.style.animation = 'logoPulse 1s ease-in-out infinite';
    };

    const phase2 = () => {
        // 3-7s: Destruction - Logo shatters with SWORD SLASH
        setTimeout(() => {
            console.log('Phase 2: Destruction begins');
            playSound(1200, 'square', 0.5, 0.4); // Glass shatter (pitched down)
            playSound(800, 'triangle', 0.8, 0.3); // Tesla coil discharge
            
            createShatterEffect(runeFlowLogo);
            runeFlowLogo.style.animation = 'logoShatter 2s ease-in forwards';
            
            // SWORD SLASH EFFECT - PERFECTLY TIMED
            setTimeout(() => {
                console.log('Phase 2: Sword slash!');
                swordSlash.style.opacity = '1';
                swordSlash.style.visibility = 'visible';
                swordSlash.style.display = 'block';
                swordSlash.style.zIndex = '30';
                playSound(400, 'sawtooth', 0.3, 0.5); // Sword slash sound
                
                // Force the animation to restart
                const blade = swordSlash.querySelector('.blade');
                const trail = swordSlash.querySelector('.blade-trail');
                if (blade) {
                    blade.style.animation = 'none';
                    blade.offsetHeight; // Trigger reflow
                    blade.style.animation = 'swordSlash 2s ease-out forwards';
                }
                if (trail) {
                    trail.style.animation = 'none';
                    trail.offsetHeight; // Trigger reflow
                    trail.style.animation = 'swordTrail 2s 0.2s ease-out forwards';
                }
            }, 1000);
            
            // Reveal floating elements with proper spacing
            setTimeout(() => {
                console.log('Phase 2: Templates text reveals');
                templatesText.classList.remove('hidden');
                templatesText.style.visibility = 'visible';
                templatesText.style.animation = 'floatIn 1.5s ease-out forwards';
            }, 1500);
            
            setTimeout(() => {
                console.log('Phase 2: Price text reveals');
                priceText.classList.remove('hidden');
                priceText.style.visibility = 'visible';
                priceText.style.animation = 'floatIn 1.5s ease-out forwards';
            }, 2200);
            
        }, 3000);
    };

    const phase3 = () => {
        // 7-10s: Rebirth - RuneRUSH emerges like a FORGED WEAPON with MOLTEN METAL
        setTimeout(() => {
            console.log('Phase 3: RuneRUSH forging begins');
            playSound(150, 'sawtooth', 1.5, 0.4); // Forging hammer strikes
            playSound(600, 'sine', 1.2, 0.2); // Sword unsheathing
            playSound(300, 'square', 0.8, 0.3); // Metal clashing
            
            // MOLTEN METAL EFFECTS
            moltenContainer.style.opacity = '1';
            
            createBloodSplatter();
            
            // REVEAL THE RUNERUSH - Remove all hiding
            runeRushText.classList.remove('hidden');
            runeRushText.style.opacity = '0';
            runeRushText.style.visibility = 'visible';
            runeRushText.style.pointerEvents = 'auto';
            
            // Apply the forged weapon animation - LONGER
            runeRushText.style.animation = 'runerushForge 3s ease-out forwards';
            
        }, 7000);
    };

    const phase4 = () => {
        // 10-14s: CTA Impact - EXTENDED FINALE WITH PROPER SPACING
        setTimeout(() => {
            console.log('Phase 4: CTA impact begins');
            playSound(80, 'square', 0.8, 0.3); // Kinetic typography slam
            
            ctaContainer.classList.remove('hidden');
            ctaContainer.style.visibility = 'visible';
            ctaButton.style.animation = 'ctaSlam 1.5s ease-out forwards';
            
            setTimeout(() => {
                console.log('Phase 4: Countdown burns in');
                countdown.style.animation = 'countdownBurn 1.5s ease-out forwards';
                countdown.innerHTML = '<div class="countdown-label">TIME LEFT:</div><div class="countdown-time" style="animation: detonatorBlink 1s infinite;">72H LEFT</div>';
            }, 1200);
            
        }, 10000);
    };

    // Particle Animation Loop
    const animateParticles = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles = particles.filter(particle => {
            particle.update();
            particle.draw();
            return !particle.isDead();
        });
        
        requestAnimationFrame(animateParticles);
    };

    // Start Animation Sequence
    const startAnimation = () => {
        phase1();
        phase2();
        phase3();
        phase4();
        animateParticles();
    };

    // User interaction to start audio context
    document.body.addEventListener('click', () => {
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        startAnimation();
    }, { once: true });

    // Auto-start after a brief delay if no interaction
    setTimeout(startAnimation, 1000);

    // Test button for sword effect
    const testSwordBtn = document.getElementById('testSword');
    if (testSwordBtn) {
        testSwordBtn.addEventListener('click', () => {
            console.log('Manual sword test triggered!');
            
            // Reset and show sword
            swordSlash.style.opacity = '1';
            swordSlash.style.visibility = 'visible';
            swordSlash.style.display = 'block';
            swordSlash.style.zIndex = '50';
            
            // Reset animations
            const blade = swordSlash.querySelector('.blade');
            const trail = swordSlash.querySelector('.blade-trail');
            
            if (blade) {
                blade.style.animation = 'none';
                blade.offsetHeight; // Force reflow
                blade.style.animation = 'swordSlash 2s ease-out forwards';
            }
            
            if (trail) {
                trail.style.animation = 'none';
                trail.offsetHeight; // Force reflow  
                trail.style.animation = 'swordTrail 2s 0.2s ease-out forwards';
            }
            
            // Play sound
            playSound(400, 'sawtooth', 0.3, 0.5);
            
            // Hide sword after animation
            setTimeout(() => {
                swordSlash.style.opacity = '0';
            }, 3000);
        });
    }

    // Resize handler
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
});
