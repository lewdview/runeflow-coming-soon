/**
 * Advanced RuneFlow to RuneRUSH Animation
 * Featuring 3D transitions, particles, and enhanced effects
 */

document.addEventListener('DOMContentLoaded', () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const playSound = (frequency, type, duration) => {
        if (!audioContext) return;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    };

    // Sound Effects
    setTimeout(() => playSound(80, 'sawtooth', 1.5), 0);  // Power down
    setTimeout(() => playSound(1200, 'triangle', 0.3), 5000);  // Alert chime

    // Particle Effects
    const createParticle = () => {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: 4px;
            height: 4px;
            background: #00ff00;
            border-radius: 50%;
            top: ${Math.random() * 100}vh;
            left: ${Math.random() * 100}vw;
            opacity: 0.8;
            animation: float 5s infinite ease-in-out;
            filter: blur(1px);
        `;
        document.body.appendChild(particle);

        const duration = 4000;
        setTimeout(() => particle.remove(), duration);
    };

    const createParticles = () => {
        for (let i = 0; i < 100; i++) {
            setTimeout(createParticle, i * 50);
        }
    };

    createParticles();
    setInterval(createParticles, 5000);

    // Subliminal Runes Floating by Mouse Movement
    const handleMouseMove = (event) => {
        const runes = document.querySelectorAll('.subliminal-rune');
        runes.forEach(rune => {
            const speed = rune.getAttribute('data-speed');
            const x = (window.innerWidth - event.pageX * speed) / 100;
            const y = (window.innerHeight - event.pageY * speed) / 100;

            rune.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });
    };
    document.addEventListener('mousemove', handleMouseMove);
});
