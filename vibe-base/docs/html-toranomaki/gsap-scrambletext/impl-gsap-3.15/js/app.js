
gsap.registerPlugin(ScrambleTextPlugin);
let phrases = ["ACCESS GRANTED", "SYSTEM OVERRIDE", "CYBERSPACE UNLOCKED"];
let idx = 0;
window.playAnim = () => {
  idx = (idx + 1) % phrases.length;
  gsap.to("#scramble-demo", {
    duration: 2,
    scrambleText: { text: phrases[idx], chars: "0123456789!@#$%^&*", revealDelay: 0.2 },
    ease: "none"
  });
};
playAnim();