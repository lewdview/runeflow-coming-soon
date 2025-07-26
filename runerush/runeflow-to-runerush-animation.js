/**
 * RuneFlow to RuneRUSH Animation - Interactive and Sound Enhanced Edition
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialization
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Trigger sounds like deep "power down" and sharp "alert chime"
    const playSound = (frequency, type, duration) => {
        const osc = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioContext.destination);
        osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
        osc.type = type;
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        osc.start(audioContext.currentTime);
        osc.stop(audioContext.currentTime + duration);
    };

    // Play initial "power down" sound when logo appears
    setTimeout(() => playSound(80, 'sawtooth', 1.5), 0);

    // Play "alert chime" when RuneRUSH appears
    setTimeout(() => playSound(1200, 'triangle', 0.3), 5000);

    // Hover-trigger replays the animation
    const ctaButton = document.querySelector('.cta-button');
    ctaButton.addEventListener('mouseenter', () => {
        document.querySelector('.animation-container').style.animation = 'none';
        setTimeout(() => {
            document.querySelector('.animation-container').style.animation = '';
        }, 20);
    });
    
    // Integrating rune symbols subliminally
    const addSubliminalRunes = () => {
        const runes = ['ᚠ', 'ᚢ'];
        const container = document.querySelector('.animation-container');
        runes.forEach(rune => {
            const div = document.createElement('div');
            div.textContent = rune;
            div.style.cssText = `
                position: absolute;
                font-size: 50px;
                color: #00ff00;
                opacity: 0.1;
                top: ${Math.random() * 80 + 10}%;
                left: ${Math.random() * 80 + 10}%;
                animation: floatRune 5s infinite alternate ease-in-out;
            `;
            container.appendChild(div);
        });

        const style = document.createElement('style');
        style.textContent = `
            @keyframes floatRune {
                from { transform: translateY(0); }
                to { transform: translateY(10px); }
            }
        `;
        document.head.appendChild(style);
    };

    addSubliminalRunes();
});
