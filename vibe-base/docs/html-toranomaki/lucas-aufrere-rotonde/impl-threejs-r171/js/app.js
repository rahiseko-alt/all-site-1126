// Lucas Aufrère — Rotonde 3D Carousel (standalone Three.js r171 recreation)
// 出典: 05pz9j49slg7c.js, 00ehrth4vmvp0.js, 15dmpvvfnvsgk.css

import * as THREE from 'three';
import { Text } from 'troika-three-text';

// ─── Project data ────────────────────────────────────────────────
// 出典: 00ehrth4vmvp0.js projects 配列
const PROJECTS = [
  { index:'01', name:'Dexnill Productions', year:'2023', stack:'Next.js · GSAP · WebGL'       },
  { index:'02', name:'Kengo Kuma',          year:'2024', stack:'Next.js · Three.js'            },
  { index:'03', name:'Jacquemus',           year:'2024', stack:'WordPress · GSAP'              },
  { index:'04', name:'Fyconic',             year:'2025', stack:'React · GSAP · WebGL-lite'     },
  { index:'05', name:'Poivre Blanc',        year:'2025', stack:'Next.js · GSAP'                },
  { index:'06', name:'BonBon Sauvage',      year:'2024', stack:'WordPress · Elementor · GSAP'  },
];
const N = PROJECTS.length; // 6

// ─── Scene constants ─────────────────────────────────────────────
// 出典: 05pz9j49slg7c.js Rotonde module (RADIUS, SLOT_ANGLE, hD, hV, hH)
const RADIUS = 9;
const SLOT   = (2 * Math.PI) / N;  // π/3 = SLOT_ANGLE
const AO     = Math.PI / 8;        // angleOffset for non-main rows (hz)
const MAX_DY = Math.PI / 9;        // hD — vertical drag clamp

const FONT_TITLE = 'https://cdn.jsdelivr.net/fontsource/fonts/manrope@latest/latin-500-normal.woff';
const FONT_MONO  = 'https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-400-normal.woff';
const CARD_COLORS = [0x1a2030, 0x201a30, 0x301a1a, 0x1a3020, 0x2a2010, 0x10202a];

// ─── Row definitions ─────────────────────────────────────────────
// 出典: 05pz9j49slg7c.js hV (main rows) + hH (ghost rows)
// shift N: スロット i のプロジェクト = PROJECTS[(i + N) % 6]
const ROWS = [
  // main 3 rows (hV)
  { y:4.5,  w:3,    h:2,   ao:AO, opacity:1.00, mirrorY:false, shift:3, main:false },
  { y:0,    w:8,    h:4.5, ao:0,  opacity:1.00, mirrorY:false, shift:0, main:true  },
  { y:-4.5, w:3,    h:2,   ao:AO, opacity:1.00, mirrorY:false, shift:5, main:false },
  // ghost rows (hH)
  { y:9.5,  w:3,    h:2,   ao:0,  opacity:0.45, mirrorY:true,  shift:1, main:false },
  { y:14,   w:2.55, h:1.7, ao:AO, opacity:0.22, mirrorY:false, shift:0, main:false },
  { y:-9.5, w:3,    h:2,   ao:0,  opacity:0.45, mirrorY:true,  shift:1, main:false },
  { y:-14,  w:2.55, h:1.7, ao:AO, opacity:0.22, mirrorY:false, shift:0, main:false },
];

// ─── Curved geometry h$() ────────────────────────────────────────
// 出典: 05pz9j49slg7c.js h$()
// PlaneGeometry(w, h, 16, 1) + arc Z offset: arr[i+2] = r - sqrt(r²-x²)
function buildGeo(w, h, r = RADIUS) {
  const geo = new THREE.PlaneGeometry(w, h, 16, 1);
  const arr = geo.attributes.position.array;
  const r2  = r * r;
  for (let i = 0; i < arr.length; i += 3) {
    const x = Math.min(Math.abs(arr[i] ?? 0), r);
    arr[i + 2] = r - Math.sqrt(r2 - x * x);
  }
  geo.attributes.position.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

// ─── Material with GLSL uniforms ─────────────────────────────────
// 出典: 05pz9j49slg7c.js onBeforeCompile (uFlatProgress, uSaturation)
function buildMat(color, opacity) {
  const uf  = { value: 0.0 }; // uFlatProgress: 0=curved 1=flat
  const us  = { value: 1.0 }; // uSaturation:   0=gray   1=color
  const mat = new THREE.MeshBasicMaterial({
    color,
    transparent: opacity < 1.0,
    opacity,
    depthWrite: opacity >= 1.0,
  });
  mat.onBeforeCompile = (s) => {
    s.uniforms.uFlatProgress = uf;
    s.uniforms.uSaturation   = us;
    s.vertexShader   = 'uniform float uFlatProgress;\n' + s.vertexShader;
    s.vertexShader   = s.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\ntransformed.z *= 1.0 - uFlatProgress;'
    );
    s.fragmentShader = 'uniform float uSaturation;\n' + s.fragmentShader;
    s.fragmentShader = s.fragmentShader.replace(
      '#include <map_fragment>',
      `#include <map_fragment>
       float luma = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
       diffuseColor.rgb = mix(vec3(luma), diffuseColor.rgb, uSaturation);`
    );
  };
  return { mat, uf, us };
}

// ─── Text label ──────────────────────────────────────────────────
// 出典: 05pz9j49slg7c.js troika-three-text props
function makeLabel(text, font, size, lsp, px, py) {
  const t       = new Text();
  t.text          = text;
  t.font          = font;
  t.fontSize      = size;
  t.letterSpacing = lsp;
  t.curveRadius   = -9;
  t.anchorX       = 'left';
  t.anchorY       = 'middle';
  t.color         = 0xffffff;
  t.position.set(px, py, 0);
  t.sync();
  return t;
}

// ─── Card builder ────────────────────────────────────────────────
// main:true のロウのみラベルを追加
function buildCard(proj, row, colorIdx) {
  const { mat, uf, us } = buildMat(CARD_COLORS[colorIdx], row.opacity);
  const mesh = new THREE.Mesh(buildGeo(row.w, row.h), mat);
  if (row.mirrorY) mesh.scale.y = -1;

  if (row.main) {
    // 出典: 05pz9j49slg7c.js label positions, fonts, sizes
    mesh.add(makeLabel(`${proj.index} / 0${N}`,       FONT_MONO,  0.16,  0.12, -4,  3.05));
    mesh.add(makeLabel(proj.name,                      FONT_TITLE, 0.38, -0.02, -4,  2.45));
    mesh.add(makeLabel(`${proj.stack} — ${proj.year}`, FONT_MONO,  0.13,  0.12, -4, -2.45));
  }

  return { mesh, uf, us };
}

// ─── Renderer + Scene + Camera ───────────────────────────────────
// 出典: 05pz9j49slg7c.js Canvas props (dpr, fov, near, far, antialias, alpha)
const canvas   = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050505);
scene.fog        = new THREE.FogExp2(0x050505, 0.035); // 出典: 05pz9j49slg7c.js FogExp2

const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.01, 60);
// initial position [0,0,0] (出典: R3F Canvas camera prop)

// ─── Build scene cards ───────────────────────────────────────────
// projectOrder: PROJECTS[(i + row.shift) % N]  (出典: hG(hB, shift))
const rowGroups = ROWS.map((row) => {
  const cards = [];
  for (let i = 0; i < N; i++) {
    const pi = (i + row.shift) % N;
    const { mesh, uf, us } = buildCard(PROJECTS[pi], row, pi);
    scene.add(mesh);
    cards.push({ mesh, uf, us });
  }
  return { row, cards };
});

// ─── Animation state ─────────────────────────────────────────────
// 出典: 05pz9j49slg7c.js useFrame
let rot   = 0;   // current carousel rotation
let tgt   = 0;   // target rotation (arrow-key snap)
let vel   = 0;   // wheel inertia
let dragY = 0;   // vertical drag clamped to ±hD
let prevT = performance.now();

// ─── Position update ─────────────────────────────────────────────
function updatePositions() {
  rowGroups.forEach(({ row, cards }) => {
    cards.forEach((card, i) => {
      const angle = rot + i * SLOT + row.ao;
      card.mesh.position.set(
        RADIUS * Math.sin(angle),
        row.y,
        -RADIUS * Math.cos(angle)
      );
      card.mesh.rotation.y = -angle;
    });
  });
  // dragY → camera Y offset (hD downstream approximation)
  camera.position.y = -dragY * 1.5;
}

// ─── RAF loop ────────────────────────────────────────────────────
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min((now - prevT) / 1000, 0.05);
  prevT = now;

  // 慣性 (出典: velocity *= pow(0.9, 60*dt))
  vel *= Math.pow(0.9, 60 * dt);
  rot += vel;
  // スナップ補間 (出典: r.current += 0.14 * (target - r.current))
  rot += 0.14 * (tgt - rot);

  updatePositions();
  renderer.render(scene, camera);
}

// ─── Wheel handler ───────────────────────────────────────────────
// 出典: 05pz9j49slg7c.js (velocity -= 2e-4 * wheelDelta)
window.addEventListener('wheel', (e) => {
  vel -= 2e-4 * e.deltaY;
}, { passive: true });

// ─── Keyboard handler ────────────────────────────────────────────
// 出典: 05pz9j49slg7c.js (arrow keys ±SLOT_ANGLE)
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft')  tgt -= SLOT;
  if (e.key === 'ArrowRight') tgt += SLOT;
});

// ─── Pointer drag handler ────────────────────────────────────────
// 出典: 05pz9j49slg7c.js (0.002*dx 水平回転, 0.0015*dy vertical, clamp ±hD)
let dragging = false, lastX = 0, lastY = 0;

canvas.addEventListener('pointerdown', (e) => {
  dragging = true;
  lastX    = e.clientX;
  lastY    = e.clientY;
  canvas.setPointerCapture(e.pointerId);
  canvas.dataset.dragging = 'true';
});

canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  lastX = e.clientX;
  lastY = e.clientY;
  rot  -= 0.002 * dx;
  tgt   = rot;
  vel   = -0.002 * dx;
  dragY = Math.max(-MAX_DY, Math.min(MAX_DY, dragY + 0.0015 * dy));
});

canvas.addEventListener('pointerup', () => {
  dragging = false;
  canvas.dataset.dragging = 'false';
});

// ─── Resize handler ──────────────────────────────────────────────
window.addEventListener('resize', () => {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

// ─── Start ───────────────────────────────────────────────────────
updatePositions();
requestAnimationFrame((t) => { prevT = t; loop(t); });
