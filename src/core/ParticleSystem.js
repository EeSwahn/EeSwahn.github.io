export class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.introParticles = [];
        this.speedMultiplier = 1.0;
        this.isIntro = false;
        this.resize();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setSpeedMultiplier(multiplier) {
        this.speedMultiplier = multiplier;
    }

    // Generate particles from text
    async playIntro(text, onComplete) {
        this.isIntro = true;
        this.particles = []; // Clear existing

        // Create off-screen canvas for text analysis
        const offCanvas = document.createElement('canvas');
        offCanvas.width = this.canvas.width;
        offCanvas.height = this.canvas.height;
        const ctx = offCanvas.getContext('2d');

        ctx.font = 'normal 80px "Microsoft YaHei", sans-serif'; // Larger and not bold
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, offCanvas.width / 2, offCanvas.height / 2);

        const imageData = ctx.getImageData(0, 0, offCanvas.width, offCanvas.height).data;

        // Sample points
        const step = 2; // Reduced step for higher density (more particles)
        for (let y = 0; y < offCanvas.height; y += step) {
            for (let x = 0; x < offCanvas.width; x += step) {
                const index = (y * offCanvas.width + x) * 4;
                if (imageData[index + 3] > 128) { // If alpha > 128
                    // Start from random position on screen (shorter path than off-screen)
                    const startX = Math.random() * this.canvas.width;
                    const startY = Math.random() * this.canvas.height;

                    this.introParticles.push({
                        x: startX,
                        y: startY,
                        targetX: x,
                        targetY: y,
                        vx: 0,
                        vy: 0,
                        ease: Math.random() * 0.02 + 0.01, // Slower convergence
                        state: 'converging', // converging, holding, dissipating
                        holdTime: 200, // Fixed hold time for synchronization
                        delay: Math.random() * 100, // Random delay for sequential appearance
                        colorH: 180 + Math.random() * 40,
                        alpha: 0 // Start invisible
                    });
                }
            }
        }

        // Animation loop for intro
        const animateIntro = () => {
            if (!this.isIntro) return;

            this.ctx.fillStyle = 'rgba(5, 5, 5, 0.3)'; // Trail
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.globalCompositeOperation = 'lighter';

            let activeCount = 0;

            for (let i = 0; i < this.introParticles.length; i++) {
                const p = this.introParticles[i];

                // Handle delay
                if (p.delay > 0) {
                    p.delay--;
                    activeCount++; // Count as active so loop doesn't end
                    continue;
                }

                if (p.state === 'converging') {
                    // Fade in
                    if (p.alpha < 1) p.alpha += 0.02;

                    const dx = p.targetX - p.x;
                    const dy = p.targetY - p.y;
                    p.x += dx * p.ease;
                    p.y += dy * p.ease;

                    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
                        p.state = 'holding';
                    }
                    activeCount++;
                } else if (p.state === 'holding') {
                    p.holdTime--;
                    if (p.holdTime <= 0) {
                        p.state = 'dissipating';
                        // Move right slowly
                        p.vx = Math.random() * 1 + 0.5;

                        // Vertical spread based on position relative to center
                        const centerY = this.canvas.height / 2;
                        const distY = p.y - centerY;
                        // Particles further from center have MUCH more vertical velocity (curve)
                        // Increased factor from 0.01 to 0.03 for larger arcs
                        p.vy = distY * 0.03 * (Math.random() + 0.5);
                    }
                    activeCount++;
                } else if (p.state === 'dissipating') {
                    p.x += p.vx;
                    p.y += p.vy;

                    // Physics for "curve then straight"
                    p.vx *= 1.02; // Slight acceleration
                    p.vy *= 0.9;  // Dampen vertical movement

                    p.alpha -= 0.04; // Slower fade out (was 0.08) for slightly longer path
                    if (p.alpha > 0) activeCount++;
                }

                if (p.alpha > 0) {
                    this.ctx.fillStyle = `hsla(${p.colorH}, 80%, 60%, ${p.alpha})`;
                    this.ctx.fillRect(p.x, p.y, 2, 2);
                }
            }

            this.ctx.globalCompositeOperation = 'source-over';

            if (activeCount === 0) {
                this.isIntro = false;
                this.introParticles = [];
                // Clear the canvas and stop all animations
                this.ctx.fillStyle = 'rgba(5, 5, 5, 1)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                if (onComplete) onComplete();
            } else {
                requestAnimationFrame(animateIntro);
            }
        };

        animateIntro();
    }

    spawn(count, intensity) {
        if (this.isIntro) return; // Don't spawn music particles during intro

        // After intro is complete, don't spawn any particles
        if (!this.isIntro && this.introParticles.length === 0) {
            return;
        }

        const centerY = this.canvas.height / 2;

        for (let i = 0; i < count; i++) {
            const ySpread = this.canvas.height * 0.4;
            const y = centerY + (Math.random() - 0.5) * ySpread;
            // Spawn randomly within a left-side zone (10% to 25% of width)
            const x = (Math.random() * 0.15 + 0.1) * this.canvas.width;

            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() * 5 + 2) * (intensity / 255 + 0.5) * this.speedMultiplier, // Apply multiplier
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                life: 1.0,
                decay: Math.random() * 0.01 + 0.005,
                colorH: 180 + Math.random() * 40, // Cyan to Blue range
                colorS: 80 + Math.random() * 20,
                colorL: 50 + Math.random() * 30
            });
        }
    }

    update() {
        if (this.isIntro) return; // Intro handled by separate loop

        // After intro is complete, don't run any animations
        if (!this.isIntro && this.introParticles.length === 0 && this.particles.length === 0) {
            return;
        }

        // Clear with trail effect
        this.ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Add glow
        this.ctx.globalCompositeOperation = 'lighter';

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            // Slight gravity/curve?
            // p.vy += 0.01;

            if (p.life <= 0 || p.x > this.canvas.width) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.fillStyle = `hsla(${p.colorH}, ${p.colorS}%, ${p.colorL}%, ${p.life})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.globalCompositeOperation = 'source-over';
    }
}
