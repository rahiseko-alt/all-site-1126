/* AI_OFFICER interactions */
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}
document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------
    // 8. 3D Card Tilt & Mouse Tracking Effect (Glow & Back Image Parallax)
    // ----------------------------------------------------
    const tiltCards = document.querySelectorAll('.tilt-card');

    // Dynamic glow colors for each card to enrich premium design
    const glowColors = [
        'rgba(37, 99, 235, 0.45)',  // Card 1: Blue Glow
        'rgba(236, 72, 153, 0.45)', // Card 2: Pink Glow
        'rgba(139, 92, 246, 0.45)', // Card 3: Violet Glow
        'rgba(6, 182, 212, 0.45)'   // Card 4: Cyan Glow
    ];

    tiltCards.forEach((card, index) => {
        // Set dynamic accent glow color to custom variable
        card.style.setProperty('--glow-color', glowColors[index % glowColors.length]);

        // [Case B] tilt target: .card-tilt-content (inner layer, no backdrop-filter ancestor)
        const tiltContent = card.querySelector('.card-tilt-content');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // mouse x relative to card
            const y = e.clientY - rect.top;  // mouse y relative to card

            // Update relative mouse position CSS variables for masks and gradients
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            // Calculate tilt based on center point
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const tiltX = (y - centerY) / centerY * -8; // Max tilt 8deg for subtle, premium feel
            const tiltY = (x - centerX) / centerX * 8;

            // Apply 3D Rotation to inner tilt layer only (prevents backdrop-filter flicker)
            if (tiltContent) {
                gsap.to(tiltContent, {
                    rotateX: tiltX,
                    rotateY: tiltY,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }

            // Parallax image movement (moves opposite to cursor inside the glass back)
            const hoverImage = card.querySelector('.card-hover-image');
            if (hoverImage) {
                // Subtle lag & inverse movement
                const imageX = (x - centerX) * -0.06;
                const imageY = (y - centerY) * -0.06;
                gsap.to(hoverImage, {
                    x: imageX,
                    y: imageY,
                    scale: 1.12, // Slight zoom when hover
                    duration: 0.4,
                    ease: 'power2.out'
                });
            }
        });

        card.addEventListener('mouseleave', () => {
            // Reset inner tilt layer rotation
            if (tiltContent) {
                gsap.to(tiltContent, {
                    rotateX: 0,
                    rotateY: 0,
                    duration: 0.6,
                    ease: 'power2.out'
                });
            }

            // Reset hover image back to center
            const hoverImage = card.querySelector('.card-hover-image');
            if (hoverImage) {
                gsap.to(hoverImage, {
                    x: 0,
                    y: 0,
                    scale: 1.0,
                    duration: 0.6,
                    ease: 'power2.out'
                });
            }
        });
    });

    // ----------------------------------------------------
    // 9. GSAP Scroll-driven 3D Helix Animation (Hakim Scroll-Effects Inspired)
    // ----------------------------------------------------
    const capabilitiesGrid = document.querySelector('.capabilities-grid');
    if (capabilitiesGrid) {
        // Set 3D perspective space on the container
        gsap.set(capabilitiesGrid, {
            perspective: 1200,
            transformStyle: "preserve-3d"
        });

        const cards = capabilitiesGrid.querySelectorAll('.capability-card-wrapper');
        cards.forEach((card, index) => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: card,
                    start: "top 95%",  // Starts when the card top enters the bottom of viewport
                    end: "bottom 5%",  // Reaches fully faded out state near the top
                    scrub: 1.2,        // Smooth follow scroll
                }
            });

            tl.fromTo(card, {
                y: 50,
                opacity: 0.1,
                transformOrigin: "50% 50%"
            }, {
                y: 0,
                opacity: 1,
                duration: 0.35,
                ease: "power1.out"
            })
            .to(card, {
                y: 0,
                opacity: 1,
                duration: 0.3 // Keep straight in the middle of viewport
            })
            .to(card, {
                y: -50,
                opacity: 0.1,
                duration: 0.35,
                ease: "power1.in"
            });
        });
    }

    // ----------------------------------------------------
    // 10. Interactive Telemetry Chat Terminal
    // ----------------------------------------------------
    const logContainer = document.getElementById('terminal-log');

    // Cognitive sequence logs
    const logs = [
        { type: 'input', text: 'ai-officer --eval-portfolio --current-quarter' },
        { type: 'output', text: 'Synthesizing strategy logs... 4.8B permutations evaluated.' },
        { type: 'output', text: 'Risk Threshold: SAFE. Capital optimization: +18.4% predicted.' },
        { type: 'system', text: '[TELEMETRY] Swarm agent swarm-risk-04 launched.' },

        { type: 'input', text: 'check-compliance --iso-27001 --audit' },
        { type: 'output', text: 'Auditing codebase & access logs... All nodes green.' },
        { type: 'output', text: 'Zero leak pattern detected in public repos. Check passed.' },

        { type: 'input', text: 'query "Suggest target assets for liquidity distribution"' },
        { type: 'output', text: 'Synthesizing market trend: reallocation of 12% to Asset Pool-B recommended.' },
        { type: 'output', text: 'Estimated volatility decrease: -4.2%. Max slippage tolerance: 0.05%.' },
        { type: 'system', text: '[CORE] Board notification dispatched. Awaiting human multi-sig.' },

        { type: 'input', text: 'system-status --cpu' },
        { type: 'output', text: 'Cognitive load: 38%. Temperature: Nominal. Network: Encrypted.' },
        { type: 'output', text: 'Model Version: 4.8.2. Epoch integrity: 100%.' }
    ];

    let logIndex = 0;

    function typeWriter(text, element, speed = 15, onComplete = null) {
        let i = 0;
        const interval = setInterval(() => {
            element.textContent += text.charAt(i);
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
            // Keep scrolling log body
            logContainer.scrollTop = logContainer.scrollHeight;
        }, speed);
    }

    function addNextLogLine() {
        if (!logContainer) return;

        const log = logs[logIndex];
        const line = document.createElement('div');
        line.className = `log-line ${log.type}`;

        logContainer.appendChild(line);

        // Add prompt character for input
        if (log.type === 'input') {
            typeWriter(log.text, line, 25, () => {
                logIndex = (logIndex + 1) % logs.length;
                setTimeout(addNextLogLine, 800); // Wait before outputting result
            });
        } else {
            // Instant print for system logs, slight typing for output
            const typingSpeed = log.type === 'system' ? 2 : 12;
            typeWriter(log.text, line, typingSpeed, () => {
                logIndex = (logIndex + 1) % logs.length;
                // Wait longer between complete command sequences
                const nextWait = logs[logIndex].type === 'input' ? 2500 : 1000;
                setTimeout(addNextLogLine, nextWait);
            });
        }

        // Limit lines inside terminal to prevent DOM bloat
        const maxLines = 40;
        while (logContainer.children.length > maxLines) {
            logContainer.removeChild(logContainer.firstChild);
        }
    }

    // Start logs cycle
    setTimeout(addNextLogLine, 2000);
});
