/* Glassmorphism Tilt Card — homepage interactions.js の card 制御を verbatim 抽出
 * Modified from verbatim: カスタムカーソル(#7)を削除。tilt は .card-tilt-content に適用
 *   （backdrop-filter を持つカード本体を回さないことでちらつきを回避）。
 *   出典: products/homepage/js/interactions.js L10–L137 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
    if (window.lucide) lucide.createIcons();

    const hasGsap = typeof gsap !== 'undefined';
    if (hasGsap && typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

    // Lenis スムーススクロール + ScrollTrigger 連動
    if (typeof Lenis !== 'undefined' && hasGsap) {
        const lenis = new Lenis();
        lenis.on('scroll', () => { if (window.ScrollTrigger) ScrollTrigger.update(); });
        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
    }

    // カードごとの glow 色（Blue / Pink / Violet / Cyan）
    const glowColors = [
        'rgba(37, 99, 235, 0.45)',
        'rgba(236, 72, 153, 0.45)',
        'rgba(139, 92, 246, 0.45)',
        'rgba(6, 182, 212, 0.45)'
    ];

    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach((card, index) => {
        card.style.setProperty('--glow-color', glowColors[index % glowColors.length]);

        // tilt 対象は内側コンテンツ層（backdrop-filter を持つ祖先が無い＝ちらつかない）
        const tiltContent = card.querySelector('.card-tilt-content');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // spotlight / border-glow が追従する CSS 変数
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const tiltX = (y - centerY) / centerY * -8;
            const tiltY = (x - centerX) / centerX * 8;

            if (tiltContent && hasGsap) {
                gsap.to(tiltContent, { rotateX: tiltX, rotateY: tiltY, duration: 0.3, ease: 'power2.out' });
            }

            // 背面画像パララックス（逆方向 ×-0.06）
            const hoverImage = card.querySelector('.card-hover-image');
            if (hoverImage && hasGsap) {
                gsap.to(hoverImage, {
                    x: (x - centerX) * -0.06,
                    y: (y - centerY) * -0.06,
                    scale: 1.12,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            }
        });

        card.addEventListener('mouseleave', () => {
            if (tiltContent && hasGsap) gsap.to(tiltContent, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power2.out' });
            const hoverImage = card.querySelector('.card-hover-image');
            if (hoverImage && hasGsap) gsap.to(hoverImage, { x: 0, y: 0, scale: 1.0, duration: 0.6, ease: 'power2.out' });
        });
    });

    // スクロール連動フェード（wrapper に scrub・3D Tilt と transform 競合を回避）
    if (hasGsap && typeof ScrollTrigger !== 'undefined') {
        document.querySelectorAll('.capability-card-wrapper').forEach((wrap) => {
            const tl = gsap.timeline({
                scrollTrigger: { trigger: wrap, start: 'top 95%', end: 'bottom 5%', scrub: 1.2 }
            });
            tl.fromTo(wrap, { y: 50, opacity: 0.1, transformOrigin: '50% 50%' },
                            { y: 0, opacity: 1, duration: 0.35, ease: 'power1.out' })
              .to(wrap, { y: 0, opacity: 1, duration: 0.3 })
              .to(wrap, { y: -50, opacity: 0.1, duration: 0.35, ease: 'power1.in' });
        });
    }
});
