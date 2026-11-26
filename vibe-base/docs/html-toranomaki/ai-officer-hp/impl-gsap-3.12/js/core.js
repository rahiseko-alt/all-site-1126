/* AI_OFFICER core */

// Register GSAP plugins
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // ----------------------------------------------------
    // 1. Lenis Smooth Scroll
    // ----------------------------------------------------
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smoothHover: true,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        // Integrate Lenis with GSAP ScrollTrigger
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
    }

    // ----------------------------------------------------
    // 3. Magnet Effect
    // ----------------------------------------------------
    const magnets = document.querySelectorAll('.magnet');
    magnets.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const bound = btn.getBoundingClientRect();
            const x = e.clientX - (bound.left + bound.width / 2);
            const y = e.clientY - (bound.top + bound.height / 2);

            // Move button slightly towards cursor
            gsap.to(btn, {
                x: x * 0.35,
                y: y * 0.35,
                duration: 0.3,
                ease: "power2.out"
            });

            // Move inner text elements if any for parallax depth
            const text = btn.querySelector('.btn-giant-text, .logo-dot');
            if (text) {
                gsap.to(text, {
                    x: x * 0.15,
                    y: y * 0.15,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });

        btn.addEventListener('mouseleave', () => {
            // Reset position
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.4)"
            });

            const text = btn.querySelector('.btn-giant-text, .logo-dot');
            if (text) {
                gsap.to(text, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.4)"
                });
            }
        });
    });

    // ----------------------------------------------------
    // 4. Intro Loader Animation
    // ----------------------------------------------------
    const percentEl = document.getElementById('loader-percent');
    const loaderPath = document.getElementById('loader-svg-path');
    let count = 0;

    // Fast but structured count up
    const interval = setInterval(() => {
        count += Math.floor(Math.random() * 4) + 1;
        if (count >= 100) {
            count = 100;
            clearInterval(interval);
            triggerLoaderFadeOut();
        }
        percentEl.textContent = count;
    }, 30);

    function triggerLoaderFadeOut() {
        const tl = gsap.timeline({
            onComplete: () => {
                document.getElementById('loader').style.display = 'none';
                triggerHeroEntrance();
            }
        });

        // Fade out inner content
        tl.to('.loader-content', {
            opacity: 0,
            y: -50,
            duration: 0.6,
            ease: 'power3.in'
        });

        // Morph SVG path upwards (liquid slide out effect)
        // Q point starts at x=50, y=100. Animating to x=50, y=-20 (curving up)
        tl.to(loaderPath, {
            attr: { d: "M0,0 L100,0 L100,0 Q50,-30 0,0 Z" },
            duration: 0.8,
            ease: "power4.in"
        }, "-=0.2");
    }

    // ----------------------------------------------------
    // 5. Hero Entrance Animation
    // ----------------------------------------------------
    function triggerHeroEntrance() {
        const tl = gsap.timeline();

        // Header fade down
        tl.fromTo('header', {
            y: -50,
            opacity: 0
        }, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out'
        });

        // Reveal Hero Text
        const revealSpans = document.querySelectorAll('.hero-content .reveal-text span');
        tl.fromTo(revealSpans, {
            yPercent: 100
        }, {
            yPercent: 0,
            duration: 1.0,
            stagger: 0.15,
            ease: 'power4.out'
        }, "-=0.6");

        // Reveal Canvas Background opacity
        tl.fromTo('.canvas-container', {
            opacity: 0
        }, {
            opacity: 0.8,
            duration: 2.0,
            ease: 'power2.out'
        }, "-=1.0");
    }

    // ----------------------------------------------------
    // 6. Text split & ScrollTrigger Reveals
    // ----------------------------------------------------
    // 6.1 Split Words for Identity Section
    const splitWordsElement = document.querySelector('.reveal-words');
    if (splitWordsElement) {
        const text = splitWordsElement.textContent.trim();
        const words = text.split(/\s+/);
        splitWordsElement.innerHTML = words.map(word => `<span style="display:inline-block; overflow:hidden;"><span class="word-span" style="display:inline-block; transform:translateY(100%); transition:transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); margin-right: 0.25em;">${word}</span></span>`).join(' ');

        ScrollTrigger.create({
            trigger: splitWordsElement,
            start: 'top 85%',
            onEnter: () => {
                const wordSpans = splitWordsElement.querySelectorAll('.word-span');
                gsap.to(wordSpans, {
                    yPercent: 0,
                    stagger: 0.02,
                    duration: 0.8,
                    ease: 'power3.out'
                });
            }
        });
    }

    // 6.2 Generic reveal items
    const revealItems = document.querySelectorAll('.reveal-item');
    revealItems.forEach(item => {
        gsap.fromTo(item, {
            opacity: 0,
            y: 50
        }, {
            opacity: 1,
            y: 0,
            duration: 1.0,
            scrollTrigger: {
                trigger: item,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });

});
