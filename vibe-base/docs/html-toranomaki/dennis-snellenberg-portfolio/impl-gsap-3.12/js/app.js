document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Preloader Animation (Word Cycling & SVG Path morph)
    // ----------------------------------------------------
    const preloader = document.getElementById('preloader');
    const path = document.getElementById('preloader-path');
    const wordEl = document.querySelector('.preloader-word');

    const words = ["Hello", "Bonjour", "Ciao", "Olà", "こんにちは", "Hello"];
    let wordIdx = 0;

    // Word Cycle Sequence
    const wordInterval = setInterval(() => {
        if (wordIdx < words.length - 1) {
            wordIdx++;
            if (wordEl) wordEl.textContent = words[wordIdx];
        } else {
            clearInterval(wordInterval);
            exitLoader();
        }
    }, 220);

    function exitLoader() {
        if (!preloader || !path) return;

        const tl = gsap.timeline({
            onComplete: () => {
                preloader.style.display = 'none';
                document.body.classList.remove('loading');
                // Initialize other dynamic animations
                initScrollTrigger();
                initMagneticInteractions();
                initProjectHoverEffects();
            }
        });

        // 1. Curve upward morphing
        tl.to(path, {
            duration: 0.8,
            attr: { d: "M0 0 L100 0 L100 100 Q50 0 0 100 Z" },
            ease: "power2.inOut"
        })
        // 2. Flatten curve completely to top
        .to(path, {
            duration: 0.4,
            attr: { d: "M0 0 L100 0 L100 0 Q50 0 0 0 Z" },
            ease: "power2.in"
        }, "-=0.2")
        // 3. Slide entire overlay up
        .to(preloader, {
            duration: 1.0,
            yPercent: -100,
            ease: "power4.inOut"
        }, 0);
    }

    // ----------------------------------------------------
    // 2. Smooth Scroll Setup (Lenis)
    // ----------------------------------------------------
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // Connect Lenis to ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // ----------------------------------------------------
    // 3. ScrollTrigger Page-Curve Flattening
    // ----------------------------------------------------
    function initScrollTrigger() {
        const curvePath = document.getElementById('curve-path');
        if (curvePath) {
            gsap.timeline({
                scrollTrigger: {
                    trigger: ".curved-boundary-container",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            }).to(curvePath, {
                attr: { d: "M0 0 C50 0 50 0 100 0 L100 100 L0 100 Z" },
                ease: "none"
            });
        }
    }

    // ----------------------------------------------------
    // 4. Project List Hover Slider Preview (GSAP quickTo)
    // ----------------------------------------------------
    function initProjectHoverEffects() {
        const container = document.getElementById('project-preview-container');
        const slider = document.getElementById('project-preview-slider');
        const items = document.querySelectorAll('.project-item');

        if (!container || !slider || items.length === 0) return;

        // Easing position tracking for mouse follower
        const xTo = gsap.quickTo(container, "x", { duration: 0.45, ease: "power3.out" });
        const yTo = gsap.quickTo(container, "y", { duration: 0.45, ease: "power3.out" });

        // Update target position on mousemove
        window.addEventListener("mousemove", (e) => {
            // Subtract offset to keep preview centered on cursor
            xTo(e.clientX - 140);
            yTo(e.clientY - 175);
        });

        items.forEach(item => {
            item.addEventListener('mouseenter', (e) => {
                const index = e.currentTarget.getAttribute('data-index');
                
                // Vertical transition of preview images
                gsap.to(slider, {
                    yPercent: -25 * index,
                    duration: 0.5,
                    ease: "power2.out"
                });

                // Smooth scaling and showing
                gsap.to(container, {
                    scale: 1,
                    autoAlpha: 1,
                    duration: 0.35,
                    ease: "back.out(1.7)"
                });
            });

            item.addEventListener('mouseleave', () => {
                // Smooth scaling down and hiding
                gsap.to(container, {
                    scale: 0,
                    autoAlpha: 0,
                    duration: 0.3,
                    ease: "power2.inOut"
                });
            });
        });
    }

    // ----------------------------------------------------
    // 5. Magnetic Hover Mechanics (Elastic Release)
    // ----------------------------------------------------
    function initMagneticInteractions() {
        // A. Big dynamic action buttons
        const magneticWraps = document.querySelectorAll('.magnetic-wrap');
        magneticWraps.forEach(wrap => {
            const btn = wrap.querySelector('.magnetic-button');
            const text = wrap.querySelector('.btn-text');

            if (!btn) return;

            wrap.addEventListener('mousemove', (e) => {
                const rect = wrap.getBoundingClientRect();
                const relX = e.clientX - rect.left - rect.width / 2;
                const relY = e.clientY - rect.top - rect.height / 2;

                // Pull the outer button towards cursor (50% intensity)
                gsap.to(btn, {
                    x: relX * 0.45,
                    y: relY * 0.45,
                    duration: 0.35,
                    ease: "power2.out"
                });

                // Pull inner text slightly differently (25% intensity) to create parallax 3D effect
                if (text) {
                    gsap.to(text, {
                        x: relX * 0.25,
                        y: relY * 0.25,
                        duration: 0.35,
                        ease: "power2.out"
                    });
                }
            });

            wrap.addEventListener('mouseleave', () => {
                // Elastic rubber-band spring back to resting place
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.85,
                    ease: "elastic.out(1.2, 0.4)"
                });

                if (text) {
                    gsap.to(text, {
                        x: 0,
                        y: 0,
                        duration: 0.85,
                        ease: "elastic.out(1.2, 0.4)"
                    });
                }
            });
        });

        // B. Smaller nav link items
        const navItems = document.querySelectorAll('.magnetic-nav-item');
        navItems.forEach(item => {
            const span = item.querySelector('span');
            if (!span) return;

            item.addEventListener('mousemove', (e) => {
                const rect = item.getBoundingClientRect();
                const relX = e.clientX - rect.left - rect.width / 2;
                const relY = e.clientY - rect.top - rect.height / 2;

                gsap.to(span, {
                    x: relX * 0.4,
                    y: relY * 0.4,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            item.addEventListener('mouseleave', () => {
                gsap.to(span, {
                    x: 0,
                    y: 0,
                    duration: 0.6,
                    ease: "elastic.out(1.2, 0.4)"
                });
            });
        });
    }
});
