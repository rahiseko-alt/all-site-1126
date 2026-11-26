
gsap.registerPlugin(DrawSVGPlugin);
gsap.set("#draw-demo", { drawSVG: "0%" });
let anim = gsap.to("#draw-demo", { duration: 3, drawSVG: "100%", ease: "power2.inOut", paused: true });
anim.restart();
window.playAnim = () => anim.restart();