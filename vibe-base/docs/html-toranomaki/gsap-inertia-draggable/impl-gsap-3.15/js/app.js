
gsap.registerPlugin(Draggable, InertiaPlugin);
Draggable.create("#drag-box", {
  type: "x,y", bounds: "#drag-container", inertia: true, edgeResistance: 0.65, bounce: true,
  onPress: function() { gsap.to(this.target, { scale: 1.1, duration: 0.2 }); },
  onRelease: function() { gsap.to(this.target, { scale: 1, duration: 0.2 }); }
});