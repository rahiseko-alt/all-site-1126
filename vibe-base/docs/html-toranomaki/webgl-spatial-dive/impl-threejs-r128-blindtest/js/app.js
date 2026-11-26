// WebGL 空間ダイブ — Spatial 3D Router
// Three.js r128 + GSAP 3.12.2
// concept.md のみを根拠とした盲目実装

var DiveRouter = (function () {

  // ===== GLSL Fragment Shader（液状遷移）=====
  // concept.md「GLSL Fragment Shader（液状遷移）」節より
  var fragmentShader = [
    'uniform sampler2D tScene1;',
    'uniform sampler2D tScene2;',
    'uniform float uProgress;',
    'uniform float uTime;',
    'varying vec2 vUv;',
    '',
    'void main() {',
    '    vec2 uv = vUv;',
    '    float p = uProgress;',
    '',
    '    // 1. Radial Bulge / Pinch (Dive Impact)',
    '    vec2 center = vec2(0.5, 0.5);',
    '    float dist = distance(uv, center);',
    '    float diveImpact = sin(p * 3.14159);',
    '    vec2 dir = normalize(uv - center);',
    '    vec2 warpedUV = uv - dir * (diveImpact * 0.4 * dist);',
    '',
    '    // 2. Water Ripple Noise',
    '    float rippleFreq = 20.0 + diveImpact * 40.0;',
    '    float noise = sin(warpedUV.x * rippleFreq + uTime * 15.0)',
    '                * cos(warpedUV.y * rippleFreq + uTime * 15.0)',
    '                * diveImpact * 0.08;',
    '',
    '    // 3. Chromatic Aberration (RGB Channel Split)',
    '    float ca = diveImpact * 0.06;',
    '    vec2 finalUV = warpedUV + vec2(noise);',
    '    float r = texture2D(tScene1, finalUV + vec2(ca, 0.0)).r;',
    '    float g = texture2D(tScene1, finalUV).g;',
    '    float b = texture2D(tScene1, finalUV - vec2(ca, 0.0)).b;',
    '',
    '    // 4. Non-linear crossfade for splash feel',
    '    float fade = smoothstep(0.4, 0.6, p);',
    '    gl_FragColor = mix(vec4(r, g, b, 1.0), texture2D(tScene2, finalUV), fade);',
    '}'
  ].join('\n');

  var vertexShader = [
    'varying vec2 vUv;',
    'void main() {',
    '    vUv = uv;',
    '    gl_Position = vec4(position, 1.0);',
    '}'
  ].join('\n');

  // ===== DiveRouter クラス =====
  function DiveRouter() {
    this.renderer = null;
    this.renderTarget1 = null;
    this.renderTarget2 = null;
    this.scene1 = null;
    this.scene2 = null;
    this.camera1 = null;
    this.camera2 = null;
    this.postScene = null;
    this.postCamera = null;
    this.postMaterial = null;
    this.grid = null;
    this.particles = null;
    this.torusKnot = null;
    this.clock = new THREE.Clock();

    this.init();
  }

  DiveRouter.prototype.init = function () {
    var canvas = document.getElementById('webgl-canvas');
    var w = window.innerWidth;
    var h = window.innerHeight;

    // ===== Renderer =====
    this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // ===== FBO（WebGLRenderTarget）=====
    // concept.md「1. バーチャル・キャンバス（Virtual Canvas / FBO）」より
    this.renderTarget1 = new THREE.WebGLRenderTarget(w, h);
    this.renderTarget2 = new THREE.WebGLRenderTarget(w, h);

    // ===== Scene1 =====
    // concept.md「シーン設計」表より
    // 背景色: #000810 / FogExp2 #000810 密度0.04
    // カメラ: PerspectiveCamera(75°), 位置(0,2,8), lookAt(0,0,0)
    // GridHelper: 200×40セル, 主線#00ccff, 副線#0044aa, y=-2
    // パーティクル: 500点, size0.15, color#c6613f, AdditiveBlending, ±25範囲ランダム
    this.scene1 = new THREE.Scene();
    this.scene1.background = new THREE.Color(0x000810);
    this.scene1.fog = new THREE.FogExp2(0x000810, 0.04);

    this.camera1 = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    this.camera1.position.set(0, 2, 8);
    this.camera1.lookAt(0, 0, 0);

    // GridHelper: size=200, divisions=40, colorCenterLine=#00ccff, colorGrid=#0044aa
    this.grid = new THREE.GridHelper(200, 40, 0x00ccff, 0x0044aa);
    this.grid.position.y = -2;
    this.scene1.add(this.grid);

    // パーティクル: 500点, ±25範囲ランダム
    var particleCount = 500;
    var positions = new Float32Array(particleCount * 3);
    for (var i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 50; // ±25
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    var particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var particleMat = new THREE.PointsMaterial({
      size: 0.15,
      color: 0xc6613f,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.particles = new THREE.Points(particleGeo, particleMat);
    this.scene1.add(this.particles);

    // ===== Scene2 =====
    // concept.md「シーン設計」表より
    // 背景色: #001122 / FogExp2 #001122 密度0.1
    // カメラ: PerspectiveCamera(75°), position.z=5
    // TorusKnot: (1.5, 0.4, 128, 32), MeshNormalMaterial wireframe
    this.scene2 = new THREE.Scene();
    this.scene2.background = new THREE.Color(0x001122);
    this.scene2.fog = new THREE.FogExp2(0x001122, 0.1);

    this.camera2 = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    this.camera2.position.z = 5;

    var torusGeo = new THREE.TorusKnotGeometry(1.5, 0.4, 128, 32);
    var torusMat = new THREE.MeshNormalMaterial({ wireframe: true });
    this.torusKnot = new THREE.Mesh(torusGeo, torusMat);
    this.scene2.add(this.torusKnot);

    // ===== Post-processing Scene（全画面クワッド）=====
    // concept.md「Shader uniforms: uProgress, uTime, tScene1, tScene2」より
    this.postScene = new THREE.Scene();
    this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.postMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        tScene1: { value: this.renderTarget1.texture },
        tScene2: { value: this.renderTarget2.texture },
        uProgress: { value: 0.0 },
        uTime: { value: 0.0 }
      },
      depthWrite: false
    });

    var quadGeo = new THREE.PlaneGeometry(2, 2);
    var quad = new THREE.Mesh(quadGeo, this.postMaterial);
    this.postScene.add(quad);

    // ===== リサイズ =====
    window.addEventListener('resize', this.onResize.bind(this));

    // ===== ボタン =====
    document.getElementById('dive-btn').addEventListener('click', this.triggerDive.bind(this));

    // ===== アニメーションループ =====
    this.animate();
  };

  // ===== triggerDive =====
  // concept.md「GSAP タイムライン（カメラダイブ）」節より完全転写
  DiveRouter.prototype.triggerDive = function () {
    var self = this;
    var tl = gsap.timeline();
    tl.to(this.camera1.position, {
      z: 0.1,
      duration: 1.5,
      ease: 'power3.in'
    }, 0);
    tl.to(this.postMaterial.uniforms.uProgress, {
      value: 1.0,
      duration: 1.5,
      ease: 'power3.inOut',
      onComplete: function () {
        document.querySelector('.hero-content').style.opacity = '0';
      }
    }, 0.5);
  };

  // ===== アニメーション =====
  // concept.md「アニメーション」行より
  // grid.position.z = (time * 3.0) % 5（無限前進）
  // パーティクルY回転 + sin上下揺れ
  // TorusKnot X回転 time×0.3・Y回転 time×0.4
  DiveRouter.prototype.animate = function () {
    var self = this;
    requestAnimationFrame(function () { self.animate(); });

    var time = this.clock.getElapsedTime();

    // グリッド無限前進
    this.grid.position.z = (time * 3.0) % 5;

    // パーティクルY回転 + sin上下揺れ
    this.particles.rotation.y = time * 0.1;
    this.particles.position.y = Math.sin(time * 0.5) * 0.5;

    // TorusKnot
    this.torusKnot.rotation.x = time * 0.3;
    this.torusKnot.rotation.y = time * 0.4;

    // uTime 更新
    this.postMaterial.uniforms.uTime.value = time;

    // FBO レンダリング
    this.renderer.setRenderTarget(this.renderTarget1);
    this.renderer.render(this.scene1, this.camera1);

    this.renderer.setRenderTarget(this.renderTarget2);
    this.renderer.render(this.scene2, this.camera2);

    // 最終合成
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.postScene, this.postCamera);
  };

  DiveRouter.prototype.onResize = function () {
    var w = window.innerWidth;
    var h = window.innerHeight;

    this.renderer.setSize(w, h);
    this.renderTarget1.setSize(w, h);
    this.renderTarget2.setSize(w, h);

    this.camera1.aspect = w / h;
    this.camera1.updateProjectionMatrix();
    this.camera2.aspect = w / h;
    this.camera2.updateProjectionMatrix();
  };

  return DiveRouter;
})();

// エントリーポイント
window.addEventListener('DOMContentLoaded', function () {
  new DiveRouter();
});
