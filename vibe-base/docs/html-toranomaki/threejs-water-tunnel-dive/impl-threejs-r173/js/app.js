import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { createNoise4D } from 'simplex-noise';

// Initialize Simplex Noise generator
const noise4D = createNoise4D();

// Velocity tracker for camera dynamic effects
let scrollVelocity = 0;

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis smooth scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  touchMultiplier: 2,
  infinite: false,
});

// Connect Lenis to GSAP ScrollTrigger
lenis.on('scroll', (e) => {
  ScrollTrigger.update();
  scrollVelocity = e.velocity;
});

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// --- Three.js Setup ---
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

// Fog for depth fading (creates the "darkness" effect at tunnel ends)
scene.fog = THREE.FogExp2 ? new THREE.FogExp2('#020608', 0.018) : null;
if (!scene.fog) {
  scene.fog = new THREE.Fog('#020608', 10, 70);
}

// Window Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera Setup
const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 120);
camera.position.set(0, 0, 10);
scene.add(camera);

// Renderer Setup
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: false,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(new THREE.Color('#020608'), 1);

// Handle Window Resize
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// --- Lighting ---
// Ambient Light for base visibility
const ambientLight = new THREE.AmbientLight('#0f172a', 0.5);
scene.add(ambientLight);

// Point lights (Neon colors) to color the water tunnel dynamically
const blueLight = new THREE.PointLight('#38bdf8', 20, 50);
blueLight.position.set(0, 5, 0);
scene.add(blueLight);

const purpleLight = new THREE.PointLight('#a78bfa', 25, 60);
purpleLight.position.set(0, -20, -30);
scene.add(purpleLight);

const pinkLight = new THREE.PointLight('#f472b6', 25, 60);
pinkLight.position.set(0, -45, -65);
scene.add(pinkLight);


// --- 3D CatmullRom Path (The Diving Curve) ---

const curvePoints = [
  new THREE.Vector3(0, 0, 15),      // Start / Intro (Scene 0)
  new THREE.Vector3(2, -2, -10),    // Forward motion (Scene 1)
  new THREE.Vector3(-4, -22, -25),  // Deep plunge descent (Middle of Scene 1 -> 2)
  new THREE.Vector3(1, -40, -35),   // Bottom of descent (Scene 2)
  new THREE.Vector3(0, -45, -72),   // Core approach (Scene 3)
];

const path = new THREE.CatmullRomCurve3(curvePoints);


// --- Tube (Water Tunnel) Generation ---

// Memory-generate a water neon texture dynamically using HTML5 Canvas
const createWaterTunnelTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Dark translucent blue base
  ctx.fillStyle = '#01090f';
  ctx.fillRect(0, 0, 512, 512);
  
  // 1. Render wave streams (fluid flow)
  for (let i = 0; i < 16; i++) {
    const startX = (i / 16) * 512;
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    
    const offset = Math.random() * Math.PI * 2;
    for (let y = 0; y <= 512; y += 16) {
      const x = startX + Math.sin(y * 0.04 + offset) * 10;
      ctx.lineTo(x, y);
    }
    
    // Blend purple and blue lights
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(167, 139, 250, 0.35)' : 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = i % 2 === 0 ? 1 : 2;
    ctx.stroke();
  }
  
  // 2. Render glowing bubble/spark dots
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 2 + 1;
    
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = i % 5 === 0 ? 'rgba(244, 114, 182, 0.7)' : 'rgba(255, 255, 255, 0.85)';
    ctx.fill();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 22); // Tile 6 times around circumference, 22 times along tunnel length
  return texture;
};

const tunnelTexture = createWaterTunnelTexture();

const tunnelGeometry = new THREE.TubeGeometry(path, 120, 3.2, 20, false);
const tunnelMaterial = new THREE.MeshBasicMaterial({
  map: tunnelTexture,
  transparent: true,
  opacity: 0.65,
  side: THREE.BackSide, // Render inner wall of tunnel
  blending: THREE.AdditiveBlending,
});

const waterTunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
scene.add(waterTunnel);


// --- Tube Inner Particles (Glowing bubbles floating inside tunnel) ---

const colorOptions = [
  new THREE.Color('#38bdf8'), // Blue
  new THREE.Color('#a78bfa'), // Purple
  new THREE.Color('#f472b6'), // Pink
  new THREE.Color('#ffffff'), // White
];

const particlesCount = 1000;
const positions = new Float32Array(particlesCount * 3);
const particleColors = new Float32Array(particlesCount * 3);

// Arrays to store path progress and radius offset of particles inside tunnel
const particleProgress = new Float32Array(particlesCount);
const particleAngles = new Float32Array(particlesCount);
const particleRadii = new Float32Array(particlesCount);

for (let i = 0; i < particlesCount; i++) {
  const t = Math.random(); // Position along curve path (0.0 to 1.0)
  particleProgress[i] = t;
  
  const angle = Math.random() * Math.PI * 2;
  particleAngles[i] = angle;
  
  // Spawn within tube radius (tube radius is 3.2, so spawn inside 0.0 - 2.8 to avoid clipping walls)
  const radius = Math.random() * 2.8;
  particleRadii[i] = radius;

  // Initial computation
  const posOnPath = path.getPointAt(t);
  const tangent = path.getTangentAt(t);
  
  const normal = new THREE.Vector3();
  const binormal = new THREE.Vector3();
  if (Math.abs(tangent.x) < 0.9) {
    normal.set(1, 0, 0).cross(tangent).normalize();
  } else {
    normal.set(0, 1, 0).cross(tangent).normalize();
  }
  binormal.copy(tangent).cross(normal).normalize();
  
  const cosA = Math.cos(angle) * radius;
  const sinA = Math.sin(angle) * radius;

  positions[i * 3 + 0] = posOnPath.x + normal.x * cosA + binormal.x * sinA;
  positions[i * 3 + 1] = posOnPath.y + normal.y * cosA + binormal.y * sinA;
  positions[i * 3 + 2] = posOnPath.z + normal.z * cosA + binormal.z * sinA;

  // Colors
  const randomColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];
  particleColors[i * 3 + 0] = randomColor.r;
  particleColors[i * 3 + 1] = randomColor.g;
  particleColors[i * 3 + 2] = randomColor.b;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

// Create circle particle glow texture dynamically
const createParticleTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 16, 16);
  return new THREE.CanvasTexture(canvas);
};

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.16,
  sizeAttenuation: true,
  map: createParticleTexture(),
  transparent: true,
  alphaTest: 0.001,
  blending: THREE.AdditiveBlending,
  vertexColors: true,
  depthWrite: false,
});

const bubbleField = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(bubbleField);


// --- Dynamic UI Navigation Indicator ---
const uiOverlay = document.querySelector('.ui-overlay');
const navIndicator = document.createElement('div');
navIndicator.className = 'nav-indicator';
uiOverlay.appendChild(navIndicator);

const sections = document.querySelectorAll('.scene-ui');
const dots = [];

const sectionScrollOffsets = [0, 1, 4, 5]; // multipliers of window.innerHeight

sections.forEach((_, index) => {
  const dot = document.createElement('button');
  dot.className = `nav-dot ${index === 0 ? 'active' : ''}`;
  dot.addEventListener('click', () => {
    const targetScrollY = window.innerHeight * sectionScrollOffsets[index];
    lenis.scrollTo(targetScrollY);
  });
  navIndicator.appendChild(dot);
  dots.push(dot);
});

const updateNavIndicator = (index) => {
  dots.forEach((dot, idx) => {
    if (idx === index) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
};


// --- GSAP Camera Timeline (Scroll-Linked) ---

// Dynamic effect parameters for animation synchronization
const effects = {
  progress: 0.0,       // Camera position along 3D path (0.0 to 1.0)
  particleSpeed: 0.002,// Speed particles flow backwards inside the tube
  flowSpeed: 0.004,    // Scroll-triggered texture offset slide speed
};

// Define camera animation timeline synced with page scroll height
const cameraTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: '.scroll-container',
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1.5, // High momentum value for smooth scrolling
  }
});

// Sync progress along path linearly with scroll progress
cameraTimeline.to(effects, {
  progress: 1.0,
  ease: 'none',
  duration: 15,
}, 0);


// --- Dynamic speed-ups during descent segment (Scene 1 -> 2: 2s to 12s on timeline) ---

// Accelerate particle speed and texture fluid flow during plunge
cameraTimeline.to(effects, {
  particleSpeed: 0.015,  // Fast particles
  flowSpeed: 0.08,       // Fast water texture flowing backwards
  ease: 'power2.in',
  duration: 3,
}, 2);

cameraTimeline.to(effects, {
  particleSpeed: 0.002,  // Decelerate back to normal
  flowSpeed: 0.004,
  ease: 'power2.out',
  duration: 4,
}, 8);


// --- GSAP UI Overlay Text Fade Transitions ---
const sceneUIs = document.querySelectorAll('.scene-ui');

// Set initial values
gsap.set(sceneUIs[0], { opacity: 1, y: 0 });

// Scene 0 Fade Out
cameraTimeline.to(sceneUIs[0], {
  opacity: 0,
  y: -50,
  ease: 'power1.out',
  duration: 1.5,
}, 0);

// Scene 1 (The Descent): Fade in at start of descent, fade out at bottom
cameraTimeline.fromTo(sceneUIs[1], 
  { opacity: 0, y: 50 },
  { opacity: 1, y: 0, ease: 'power1.out', duration: 1.5 },
  2.5
);
cameraTimeline.to(sceneUIs[1], {
  opacity: 0,
  y: -50,
  ease: 'power1.in',
  duration: 1.5,
}, 10.5);

// Scene 2 (Floating Essence)
cameraTimeline.fromTo(sceneUIs[2], 
  { opacity: 0, y: 50 },
  { opacity: 1, y: 0, ease: 'power1.out', duration: 1.5 },
  12.0
);
cameraTimeline.to(sceneUIs[2], {
  opacity: 0,
  y: -50,
  ease: 'power1.in',
  duration: 1.2,
}, 13.5);

// Scene 3 (The Core)
cameraTimeline.fromTo(sceneUIs[3], 
  { opacity: 0, y: 50 },
  { opacity: 1, y: 0, ease: 'power1.out', duration: 1.5 },
  14.0
);


// Update active indicator dot on scroll trigger checkpoints
ScrollTrigger.create({
  trigger: '.scroll-container',
  start: 'top top',
  end: 'bottom bottom',
  onUpdate: (self) => {
    const progress = self.progress;
    let activeIndex = 0;
    if (progress > 0.166 && progress <= 0.666) activeIndex = 1;
    else if (progress > 0.666 && progress <= 0.833) activeIndex = 2;
    else if (progress > 0.833) activeIndex = 3;
    
    updateNavIndicator(activeIndex);
  }
});


// --- Animation Loop ---
const clock = new THREE.Clock();

// Reusable temporary mathematical structures to prevent GC overhead/allocations in frame loop
const tempTangent = new THREE.Vector3();
const tempNormal = new THREE.Vector3();
const tempBinormal = new THREE.Vector3();

const animate = () => {
  const elapsedTime = clock.getElapsedTime();
  const positionsArray = particlesGeometry.attributes.position.array;

  // 1. Move camera along 3D Path
  const t = effects.progress;
  const cameraPos = path.getPointAt(t);
  
  // Point camera slightly ahead along the path curve
  const lookAtPos = path.getPointAt(Math.min(t + 0.012, 1.0));
  
  camera.position.copy(cameraPos);
  camera.lookAt(lookAtPos);
  
  // Dynamic FOV based on scroll velocity (Speed Stretch effect)
  const baseFov = 60;
  const maxFovDelta = 25;
  const targetFov = baseFov + Math.min(Math.abs(scrollVelocity) * 1.5, maxFovDelta);
  camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.1);
  camera.updateProjectionMatrix();

  // Camera Shake based on high velocity descent
  const velocityThreshold = 1.0;
  if (Math.abs(scrollVelocity) > velocityThreshold) {
    const shakeStrength = (Math.abs(scrollVelocity) - velocityThreshold) * 0.0006;
    camera.rotation.x += Math.sin(elapsedTime * 50) * shakeStrength;
    camera.rotation.y += Math.cos(elapsedTime * 45) * shakeStrength;
    camera.rotation.z += Math.sin(elapsedTime * 40) * (shakeStrength * 0.5);
  }
  
  // Decay velocity smoothly frame by frame
  scrollVelocity = THREE.MathUtils.lerp(scrollVelocity, 0, 0.1);
  
  // Add subtle organic roll/tilt to camera to simulate floatation / swimming
  camera.up.set(Math.sin(elapsedTime * 0.15) * 0.04, 1, 0);

  // 2. Scroll/animate the water tube inner texture map (UV offset)
  tunnelTexture.offset.y -= effects.flowSpeed;

  // 3. Move and wrap particles inside the tube geometry path
  for (let i = 0; i < particlesCount; i++) {
    // Progress particle along path (flows backwards relative to camera motion)
    particleProgress[i] -= effects.particleSpeed;
    
    // Wrap around path curve infinitely
    if (particleProgress[i] < 0.0) {
      particleProgress[i] += 1.0;
    }

    const pt = particleProgress[i];
    const posOnPath = path.getPointAt(pt);
    
    // Compute local coordinate frame coordinates on curve path
    path.getTangentAt(pt, tempTangent);
    
    if (Math.abs(tempTangent.x) < 0.9) {
      tempNormal.set(1, 0, 0).cross(tempTangent).normalize();
    } else {
      tempNormal.set(0, 1, 0).cross(tempTangent).normalize();
    }
    tempBinormal.copy(tempTangent).cross(tempNormal).normalize();
    
    const angle = particleAngles[i];
    const radius = particleRadii[i];
    const cosA = Math.cos(angle) * radius;
    const sinA = Math.sin(angle) * radius;

    // Compute base position inside tube
    const baseX = posOnPath.x + tempNormal.x * cosA + tempBinormal.x * sinA;
    const baseY = posOnPath.y + tempNormal.y * cosA + tempBinormal.y * sinA;
    const baseZ = posOnPath.z + tempNormal.z * cosA + tempBinormal.z * sinA;

    // Apply Simplex Noise for dynamic wobbly fluid flow (turbulence)
    const ns = 0.08; // Noise scale
    const ts = 0.6;  // Time scale
    const noiseX = noise4D(baseX * ns, baseY * ns, baseZ * ns, elapsedTime * ts);
    const noiseY = noise4D((baseX + 100) * ns, (baseY + 100) * ns, (baseZ + 100) * ns, elapsedTime * ts);
    const noiseZ = noise4D((baseX + 200) * ns, (baseY + 200) * ns, (baseZ + 200) * ns, elapsedTime * ts);

    // Turbulence displacement strength (stays inside tube radius limit)
    const turbulence = 0.25;

    positionsArray[i * 3 + 0] = baseX + noiseX * turbulence;
    positionsArray[i * 3 + 1] = baseY + noiseY * turbulence;
    positionsArray[i * 3 + 2] = baseZ + noiseZ * turbulence;
  }
  
  particlesGeometry.attributes.position.needsUpdate = true;

  // Render Scene
  renderer.render(scene, camera);

  // Call animate again on the next frame
  window.requestAnimationFrame(animate);
};

// Start Animation Loop
animate();
