/* Flip QR Popout — GSAP Flip / data-flip-id 共有エレメント
 * サムネ(.qr-mini) と フル(.qr-full) に同じ data-flip-id を付け、
 * Flip.getState → クラス切替 → Flip.from で「枠は残り中身だけ飛ぶ」を実現する。 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined' || typeof Flip === 'undefined') return;
    gsap.registerPlugin(Flip);

    const backdrop = document.querySelector('.qr-backdrop');
    const buttons = document.querySelectorAll('.qr-dock-btn');
    if (!backdrop || !buttons.length) return;

    let openId = null;

    function pair(id) {
        return {
            thumb: document.querySelector(`.qr-mini[data-flip-id="${id}"]`),
            full: document.querySelector(`.qr-full[data-flip-id="${id}"]`)
        };
    }

    function reset(id) {
        const { thumb, full } = pair(id);
        if (full) full.classList.remove('active');
        if (thumb) thumb.classList.remove('hidden');
    }

    function open(id) {
        const { thumb, full } = pair(id);
        if (!thumb || !full) return;
        if (openId && openId !== id) reset(openId);

        const state = Flip.getState([thumb, full]);
        full.classList.add('active');     // フル: display:block
        thumb.classList.add('hidden');    // サムネ: visibility:hidden（枠は残る）
        backdrop.classList.add('show');
        Flip.from(state, { duration: 0.55, fade: true, absolute: true, ease: 'power2.inOut' });
        openId = id;
    }

    function close() {
        if (!openId) return;
        const { thumb, full } = pair(openId);
        if (!thumb || !full) { openId = null; return; }

        const state = Flip.getState([thumb, full]);
        full.classList.remove('active');
        thumb.classList.remove('hidden');
        backdrop.classList.remove('show');
        Flip.from(state, { duration: 0.5, fade: true, absolute: true, ease: 'power2.inOut' });
        openId = null;
    }

    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = `qr-${btn.dataset.qr}`;
            if (openId === id) close(); else open(id);
        });
    });

    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
});
