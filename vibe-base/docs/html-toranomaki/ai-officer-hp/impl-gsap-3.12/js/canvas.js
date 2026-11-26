/* AI_OFFICER canvas */
document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 7. Interactive Canvas: AI Core Neural Net (with Pulses & Binary Streams)
    // ----------------------------------------------------
    const canvas = document.getElementById('ai-core-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    let pulses = [];
    let streams = [];
    let mouse = { x: null, y: null, targetX: null, targetY: null };

    function resizeCanvas() {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
        initStreams();
    }

    // Track mouse
    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.targetX = e.clientX - rect.left;
        mouse.targetY = e.clientY - rect.top;
    });

    // Particle class
    class Particle {
        constructor() {
            this.angle = Math.random() * Math.PI * 2;
            this.baseRadius = 100 + Math.random() * 150;
            this.radius = this.baseRadius;
            this.speed = 0.003 + Math.random() * 0.005;
            this.x = 0;
            this.y = 0;
            this.size = 1 + Math.random() * 2;
            this.pulseSpeed = 0.02 + Math.random() * 0.03;
            this.pulsePhase = Math.random() * Math.PI;
            this.colorPhase = Math.random() * 100;
        }

        update() {
            // Update orbital angle
            this.angle += this.speed;

            // Generate complex organic orbital radius variation (simulating cognitive pulse)
            const time = Date.now() * 0.0005;
            const noise = Math.sin(this.angle * 3 + time) * 30 + Math.cos(this.angle * 5 - time) * 15;
            this.radius = this.baseRadius + noise;

            // Base position around canvas center
            const centerX = width / 2;
            const centerY = height / 2;
            this.x = centerX + Math.cos(this.angle) * this.radius;
            this.y = centerY + Math.sin(this.angle) * this.radius;

            // Interact with Mouse
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    const force = (150 - dist) / 150;
                    this.x += (dx / dist) * force * 40;
                    this.y += (dy / dist) * force * 40;
                }
            }
        }

        draw() {
            const pulse = Math.sin(Date.now() * this.pulseSpeed + this.pulsePhase);
            const size = this.size + pulse * 0.5;

            // Slowly cycle colors around blue-cyan spectrum
            const hue = 210 + Math.sin(Date.now() * 0.0002 + this.colorPhase) * 20;
            ctx.fillStyle = `hsla(${hue}, 85%, 65%, ${0.3 + (pulse + 1) * 0.25})`;

            ctx.beginPath();
            ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Pulse class for network line data packet animations
    class Pulse {
        constructor(startParticle, endParticle) {
            this.start = startParticle;
            this.end = endParticle;
            this.progress = 0;
            this.speed = 0.015 + Math.random() * 0.02; // Travel speed
            this.size = 2 + Math.random() * 1.5;
        }

        update() {
            this.progress += this.speed;
            return this.progress < 1;
        }

        draw() {
            const x = this.start.x + (this.end.x - this.start.x) * this.progress;
            const y = this.start.y + (this.end.y - this.start.y) * this.progress;
            const hue = 210 + Math.sin(Date.now() * 0.0002) * 20;

            ctx.save();
            ctx.fillStyle = `hsla(${hue}, 100%, 80%, 0.8)`;
            ctx.shadowColor = `hsla(${hue}, 100%, 70%, 0.8)`;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(x, y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Binary / Hex Stream class for technical scrolling background
    class BinaryStream {
        constructor(x) {
            this.x = x;
            this.y = Math.random() * -height;
            this.speed = 0.5 + Math.random() * 1.0;
            this.fontSize = 8 + Math.random() * 5;
            this.chars = [];
            this.maxLength = 8 + Math.floor(Math.random() * 12);
            this.opacity = 0.01 + Math.random() * 0.03; // Very subtle, clean backdrop
        }

        update() {
            this.y += this.speed;
            if (this.y > height + 150) {
                this.y = Math.random() * -200;
                this.speed = 0.5 + Math.random() * 1.0;
            }

            // Periodically refresh stream characters
            if (Math.random() < 0.05 || this.chars.length === 0) {
                this.chars = [];
                for (let i = 0; i < this.maxLength; i++) {
                    const isHex = Math.random() < 0.35;
                    const char = isHex
                        ? Math.floor(Math.random() * 256).toString(16).toUpperCase().padStart(2, '0')
                        : (Math.random() < 0.5 ? '0' : '1');
                    this.chars.push(char);
                }
            }
        }

        draw() {
            ctx.font = `${this.fontSize}px 'Share Tech Mono', monospace`;
            for (let i = 0; i < this.chars.length; i++) {
                const charY = this.y - i * (this.fontSize + 3);
                if (charY < 0 || charY > height) continue;

                const ratio = i / this.maxLength;
                const alpha = this.opacity * (1 - ratio);

                ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
                ctx.fillText(this.chars[i], this.x, charY);
            }
        }
    }

    // Initialize Particles
    function initParticles() {
        particles = [];
        const count = 120;
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    // Initialize Binary Streams
    function initStreams() {
        streams = [];
        const count = Math.floor(width / 80);
        for (let i = 0; i < count; i++) {
            streams.push(new BinaryStream(i * 80 + Math.random() * 40));
        }
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    initParticles();

    // Connect particles with thin network lines
    function drawConnections() {
        ctx.lineWidth = 0.5;
        const maxDist = 90;
        const connectedPairs = [];

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < maxDist) {
                    const alpha = (maxDist - dist) / maxDist * 0.12;
                    ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                    connectedPairs.push({ start: particles[i], end: particles[j] });
                }
            }
        }
        return connectedPairs;
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Render technical binary rain in the background first
        streams.forEach(s => {
            s.update();
            s.draw();
        });

        // Interpolate mouse coordinates for smoother interaction
        if (mouse.targetX !== null) {
            if (mouse.x === null) {
                mouse.x = mouse.targetX;
                mouse.y = mouse.targetY;
            } else {
                mouse.x += (mouse.targetX - mouse.x) * 0.1;
                mouse.y += (mouse.targetY - mouse.y) * 0.1;
            }
        }

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        const connections = drawConnections();

        // Spawn new pulses randomly on connected lines
        if (Math.random() < 0.15 && pulses.length < 35 && connections.length > 0) {
            const pair = connections[Math.floor(Math.random() * connections.length)];
            // Decide direction randomly
            if (Math.random() < 0.5) {
                pulses.push(new Pulse(pair.start, pair.end));
            } else {
                pulses.push(new Pulse(pair.end, pair.start));
            }
        }

        // Update and draw pulses
        pulses = pulses.filter(p => {
            const active = p.update();
            if (active) p.draw();
            return active;
        });

        requestAnimationFrame(animate);
    }
    animate();
});
