// ascii-flow-field — three.js AsciiEffect + 手続き生成 flow ノイズの全画面 ASCII 背景
// 被写体は写真でなく生成パターン場。元ネタ調査: maximiliankaspar.com（手法のみ再実装・コードは独自）
import * as THREE from 'three';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';

const CHARS = ' .:-=+*1#%@0$!*';   // 輝度マップ用文字セット（明→暗）
const CONFIG = {
  resolution: 0.18,   // AsciiEffect グリッド密度（大きいほど細かい）
  speed: 0.35,        // 流れの速さ
  scale: 2.6,         // うねりの空間周波数
  contrast: 1.4,      // 構造の締まり
  density: 0.55,      // 構造の量
  ink: '#ADADAD',     // 文字色
  capFps: 30,         // DOM 更新の上限 fps（負荷制御）
};

const stage = document.getElementById('ascii-stage');

// フルスクリーンクワッド: 平面 2x2 を正射影カメラ -1..1 でクリップ空間いっぱいに描く
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const uniforms = {
  u_time:     { value: 0 },
  u_aspect:   { value: window.innerWidth / window.innerHeight },
  u_speed:    { value: CONFIG.speed },
  u_scale:    { value: CONFIG.scale },
  u_contrast: { value: CONFIG.contrast },
  u_density:  { value: CONFIG.density },
};

const vertexShader = `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// domain-warped fbm（外部依存なしの value noise）。明るい地に暗い流れの構造が湧く。
const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform float u_time, u_aspect, u_speed, u_scale, u_contrast, u_density;

  float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i+vec2(1.,0.)), c = hash(i+vec2(0.,1.)), d = hash(i+vec2(1.,1.));
    vec2 u = f*f*(3.-2.*f);
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }
  float fbm(vec2 p){ float v=0., a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=0.5; } return v; }

  void main(){
    vec2 p = (vUv - 0.5);
    p.x *= u_aspect;
    p *= u_scale;
    float t = u_time * u_speed;

    // 二段ドメインワープで「流れる」有機構造を作る
    vec2 q = vec2(fbm(p + vec2(0.0, t*0.6)), fbm(p + vec2(5.2, 1.3) - t*0.4));
    vec2 r = vec2(fbm(p + 3.5*q + vec2(1.7, 9.2) + t*0.5),
                  fbm(p + 3.5*q + vec2(8.3, 2.8) - t*0.3));
    float f = fbm(p + 3.5*r);

    // 構図マスク: 左（テキスト側）をクリアにし、右へ構造を寄せる
    float mask = smoothstep(0.12, 0.62, vUv.x);

    float structure = smoothstep(1.0 - u_density, 1.0, f) * mask;
    float lum = 1.0 - pow(structure, 1.0/u_contrast) * 0.92;
    gl_FragColor = vec4(vec3(lum), 1.0);
  }
`;

const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);

// AsciiEffect: renderer の出力輝度を CHARS の濃淡へ変換し DOM テキスト層を生成する
const effect = new AsciiEffect(renderer, CHARS, { invert: false, resolution: CONFIG.resolution });
effect.setSize(window.innerWidth, window.innerHeight);
effect.domElement.style.color = CONFIG.ink;
effect.domElement.style.backgroundColor = '#ffffff';
stage.appendChild(effect.domElement);

function onResize() {
  uniforms.u_aspect.value = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
  effect.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onResize);

// render loop: 動きは実時間ベース、DOM 更新は capFps で間引く（重い DOM 再構築の負荷制御）
let last = performance.now(), acc = 0;
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min((now - last) / 1000, 0.05); last = now;
  uniforms.u_time.value += dt;
  acc += dt * 1000;
  const interval = 1000 / CONFIG.capFps;
  if (acc >= interval) { acc -= interval; effect.render(scene, camera); }
}
loop(performance.now());
