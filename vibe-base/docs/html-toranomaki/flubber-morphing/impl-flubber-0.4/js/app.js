// --- Flubber Demo ---
const starPath = "M50 5 L61 38 L95 38 L67 59 L78 95 L50 75 L22 95 L33 59 L5 38 L39 38 Z";
const circlePath = "M 50, 50 m -45, 0 a 45,45 0 1,0 90,0 a 45,45 0 1,0 -90,0";
const trianglePath = "M50 10 L90 90 L10 90 Z";

const interpolator1 = flubber.interpolate(starPath, circlePath);
const interpolator2 = flubber.interpolate(circlePath, trianglePath);
const interpolator3 = flubber.interpolate(trianglePath, starPath);

const flubberShape = document.getElementById("flubber-shape");
flubberShape.setAttribute("d", starPath);

let flubberProxy = { t: 0 };
let flubberAnim = gsap.timeline({ paused: true });

flubberAnim.to(flubberProxy, {
  duration: 1.5,
  t: 1,
  ease: "power2.inOut",
  onUpdate: () => flubberShape.setAttribute("d", interpolator1(flubberProxy.t))
})
.to(flubberProxy, {
  duration: 1.5,
  t: 2,
  ease: "power2.inOut",
  onUpdate: () => flubberShape.setAttribute("d", interpolator2(flubberProxy.t - 1))
}, "+=0.5")
.to(flubberProxy, {
  duration: 1.5,
  t: 3,
  ease: "power2.inOut",
  onUpdate: () => flubberShape.setAttribute("d", interpolator3(flubberProxy.t - 2))
}, "+=0.5");

// Start animation on load
flubberAnim.restart();

// Replay function for button
window.playFlubber = () => flubberAnim.restart();
