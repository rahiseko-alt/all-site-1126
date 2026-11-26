gsap.registerPlugin(Draggable, InertiaPlugin);

const select = (s) => document.querySelector(s);
const selectAll = (s) => document.querySelectorAll(s);

const liquid = selectAll('.liquid');
const tubeShine = select('.tubeShine');
const label = select('.label');
const follower = select('.follower');
const dragger = select('.dragger');
const dragTip = select('.dragTip');

const minDragY = -380;
let liquidId = 0;
const step = Math.abs(minDragY / 100);
let followerVY = 0;

gsap.set('svg', {
  visibility: 'visible'
});

gsap.set(dragTip, {
  transformOrigin: '20% 50%'
});

const tl = gsap.timeline();
tl.to(liquid, {
  x: '-=200',
  ease: 'none',
  repeat: -1,
  duration: 0.7,
  stagger: 0.9
});

tl.time(100);

document.addEventListener("touchmove", function (event) {
  event.preventDefault();
}, { passive: false });

Draggable.create(dragger, {
  type: 'y',
  bounds: { minY: minDragY, maxY: 0 },
  onDrag: onUpdate,
  inertia: true,
  throwResistance: 2300,
  onThrowUpdate: onUpdate,
  overshootTolerance: 0
});

function onUpdate() {
  const draggerY = gsap.getProperty(dragger, "y");
  liquidId = Math.abs(Math.round(draggerY / step));
  label.textContent = liquidId + '°';
  
  gsap.to(liquid, {
    y: draggerY * 1.12,
    duration: 1.3,
    ease: "elastic.out(1, 0.4)"
  });
}

gsap.to(follower, {
  y: '+=0',
  duration: 1,
  repeat: -1,
  modifiers: {
    y: function () {
      const draggerY = gsap.getProperty(dragger, "y");
      const followerY = gsap.getProperty(follower, "y");
      followerVY += (draggerY - followerY) * 0.23;
      followerVY *= 0.69;
      return followerY + followerVY;
    }
  }
});

gsap.to(dragTip, {
  rotation: '+=0',
  duration: 1,
  repeat: -1,
  modifiers: {
    rotation: function (rotation) {
      return parseFloat(rotation) - followerVY;
    }
  }
});

gsap.to(label, {
  y: '+=0',
  duration: 1,
  repeat: -1,
  modifiers: {
    y: function (y) {
      return parseFloat(y) - followerVY * 0.5;
    }
  }
});

gsap.to(dragger, {
  y: minDragY / 2,
  duration: 1.4,
  onUpdate: onUpdate,
  ease: "expo.inOut"
});
