
gsap.registerPlugin(MorphSVGPlugin);
let anim = gsap.timeline({ paused: true });
anim.to("#morph-shape", { duration: 1.5, morphSVG: "#shape-heart", ease: "elastic.out(1, 0.3)" })
    .to("#morph-shape", { duration: 1.5, morphSVG: "#shape-play", ease: "power2.inOut" }, "+=0.5")
    .to("#morph-shape", { duration: 1.5, morphSVG: "#morph-shape", ease: "bounce.out" }, "+=0.5");
anim.restart();
window.playAnim = () => anim.restart();