
gsap.registerPlugin(SplitText);
let splitObj = new SplitText("#split-demo", { type: "chars,words" });
let anim = gsap.timeline({ paused: true });
anim.from(splitObj.chars, {
  duration: 1, opacity: 0, scale: 0, y: 80, rotationX: 180,
  transformOrigin: "0% 50% -50", ease: "back.out(1.5)", stagger: 0.05
});
anim.restart();
window.playAnim = () => anim.restart();