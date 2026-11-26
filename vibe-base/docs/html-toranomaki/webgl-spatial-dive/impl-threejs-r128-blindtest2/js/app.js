// WebGL 空間ダイブ — blindtest2 実装
// concept.md の情報のみを根拠として実装

var DiveRouter = (function () {

  function DiveRouter() {
    this.canvas = document.getElementById('webgl-canvas');
    this.renderer = null;

    // FBO (WebGLRenderTarget)
    this.rt1 = null;
    this.rt2 = null;

    // シーン1: 青いグリッド + パーティクル
    this.scene1 = null;
    this.camera1 = null;
    this.grid = null;
    this.particles = null;

    // シーン2: TorusKnot
    this.scene2 = null;
    this.camera2 = null;
    this.torusKnot = null;

    // ポストプロセス（合成シーン）
    this.postScene = null;
    this.postCamera = null;
    this.postMaterial = null;

    this.clock = new THREE.Clock();

    this._initRenderer();
    this._initScene1();
    this._initScene2();
    this._initPost();
    this._bindEvents();
    this._animate();
  }

  DiveRouter.prototype._initRenderer = function () {
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    var w = window.innerWidth;
    var h = window.innerHeight;
    this.rt1 = new THREE.WebGLRenderTarget(w, h);
    this.rt2 = new THREE.WebGLRenderTarget(w, h);
  };

  DiveRouter.prototype._initScene1 = function () {
    this.scene1 = new THREE.Scene();
    this.scene1.background = new THREE.Color('#000810');
    this.scene1.fog = new THREE.FogExp2('#000810', 0.04);

    // カメラ: PerspectiveCamera(75°), 位置 (0, 2, 8), lookAt(0, 0, 0)
    this.camera1 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera1.position.set(0, 2, 8);
    this.camera1.lookAt(0, 0, 0);

    // GridHelper: 200×40セル, 主線 #00ccff, 副線 #0044aa, y=-2
    this.grid = new THREE.GridHelper(200, 40, new THREE.Color('#00ccff'), new THREE.Color('#0044aa'));
    this.grid.position.y = -2;
    this.scene1.add(this.grid);

    // パーティクル: 500点, size 0.15, color #c6613f, AdditiveBlending, ±25範囲ランダム
    var particleCount = 500;
    var positions = new Float32Array(particleCount * 3);
    for (var i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 50; // ±25
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    var particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    var particleMat = new THREE.PointsMaterial({
      size: 0.15,
      color: new THREE.Color('#c6613f'),
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    this.particles = new THREE.Points(particleGeom, particleMat);
    this.scene1.add(this.particles);
  };

  DiveRouter.prototype._initScene2 = function () {
    this.scene2 = new THREE.Scene();
    this.scene2.background = new THREE.Color('#001122');
    this.scene2.fog = new THREE.FogExp2('#001122', 0.1);

    // カメラ: PerspectiveCamera(75°), position.z = 5
    this.camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera2.position.z = 5;

    // TorusKnot: (1.5, 0.4, 128, 32), MeshNormalMaterial wireframe
    var knotGeom = new THREE.TorusKnotGeometry(1.5, 0.4, 128, 32);
    var knotMat = new THREE.MeshNormalMaterial({ wireframe: true });
    this.torusKnot = new THREE.Mesh(knotGeom, knotMat);
    this.scene2.add(this.torusKnot);
  };

  DiveRouter.prototype._initPost = function () {
    // GLSL Fragment Shader（液状遷移）— concept.md GLSL そのまま
    var fragShader = [
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

    var vertShader = [
      'varying vec2 vUv;',
      'void main() {',
      '    vUv = uv;',
      '    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
      '}'
    ].join('\n');

    this.postMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tScene1: { value: this.rt1.texture },
        tScene2: { value: this.rt2.texture },
        uProgress: { value: 0.0 },
        uTime: { value: 0.0 }
      },
      vertexShader: vertShader,
      fragmentShader: fragShader
    });

    var quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.postMaterial);
    this.postScene = new THREE.Scene();
    this.postScene.add(quad);

    // OrthographicCamera for fullscreen quad
    this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  };

  DiveRouter.prototype._bindEvents = function () {
    var self = this;
    document.getElementById('dive-btn').addEventListener('click', function () {
      self.triggerDive();
    });

    window.addEventListener('resize', function () {
      var w = window.innerWidth;
      var h = window.innerHeight;
      self.renderer.setSize(w, h);
      self.rt1.setSize(w, h);
      self.rt2.setSize(w, h);
      self.camera1.aspect = w / h;
      self.camera1.updateProjectionMatrix();
      self.camera2.aspect = w / h;
      self.camera2.updateProjectionMatrix();
    });
  };

  // GSAP タイムライン（カメラダイブ）— concept.md そのまま
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

  DiveRouter.prototype._animate = function () {
    var self = this;

    function loop() {
      requestAnimationFrame(loop);

      var time = self.clock.getElapsedTime();

      // アニメーション: grid.position.z = (time * 3.0) % 5（無限前進）
      self.grid.position.z = (time * 3.0) % 5;

      // パーティクルY回転 + sin上下揺れ
      self.particles.rotation.y = time * 0.1;
      self.particles.position.y = Math.sin(time * 0.5) * 0.5;

      // TorusKnot X回転 time×0.3 / Y回転 time×0.4
      self.torusKnot.rotation.x = time * 0.3;
      self.torusKnot.rotation.y = time * 0.4;

      // uTime 更新
      self.postMaterial.uniforms.uTime.value = time;

      // FBO レンダリング
      self.renderer.setRenderTarget(self.rt1);
      self.renderer.render(self.scene1, self.camera1);

      self.renderer.setRenderTarget(self.rt2);
      self.renderer.render(self.scene2, self.camera2);

      // ポスト合成
      self.renderer.setRenderTarget(null);
      self.renderer.render(self.postScene, self.postCamera);
    }

    loop();
  };

  return DiveRouter;
})();

// 起動
window.addEventListener('DOMContentLoaded', function () {
  new DiveRouter();
});
