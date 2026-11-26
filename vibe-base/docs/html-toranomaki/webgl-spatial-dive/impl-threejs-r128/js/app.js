// js/app.js

// ----------------------------------------------------
// 1. Shaders
// ----------------------------------------------------

const liquidFragmentShader = `
uniform sampler2D tScene1;
uniform sampler2D tScene2;
uniform float uProgress;
uniform float uTime;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    float p = uProgress;

    // 1. Radial Bulge / Pinch (Dive Impact)
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(uv, center);
    float diveImpact = sin(p * 3.14159);
    vec2 dir = normalize(uv - center);
    vec2 warpedUV = uv - dir * (diveImpact * 0.4 * dist);

    // 2. Water Ripple Noise
    float rippleFreq = 20.0 + diveImpact * 40.0;
    float noise = sin(warpedUV.x * rippleFreq + uTime * 15.0)
                * cos(warpedUV.y * rippleFreq + uTime * 15.0)
                * diveImpact * 0.08;

    // 3. Chromatic Aberration (RGB Channel Split)
    float ca = diveImpact * 0.06;
    vec2 finalUV = warpedUV + vec2(noise);
    float r = texture2D(tScene1, finalUV + vec2(ca, 0.0)).r;
    float g = texture2D(tScene1, finalUV).g;
    float b = texture2D(tScene1, finalUV - vec2(ca, 0.0)).b;

    // 4. Non-linear crossfade for splash feel
    float fade = smoothstep(0.4, 0.6, p);
    gl_FragColor = mix(vec4(r, g, b, 1.0), texture2D(tScene2, finalUV), fade);
}
`;

const postVertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;


// ----------------------------------------------------
// 2. Main Application
// ----------------------------------------------------

class DiveRouter {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.clock = new THREE.Clock();

    // Setup Scenes
    this.initScene1(); // Hero Scene
    this.initScene2(); // Target Slide Scene
    
    // Setup Post Processing FBO Router
    this.initPostProcessing();

    // Events
    window.addEventListener('resize', this.onResize.bind(this));
    document.getElementById('dive-btn').addEventListener('click', this.triggerDive.bind(this));

    // Start Loop
    this.render();
  }

  initScene1() {
    this.scene1 = new THREE.Scene();
    // Add some fog for depth
    this.scene1.fog = new THREE.FogExp2('#000810', 0.015);
    this.scene1.background = new THREE.Color('#000810');
    this.camera1 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera1.position.set(0, 2, 50);
    this.camera1.lookAt(0, 0, 0);

    // Create a highly vivid, infinite-looking neon grid
    const gridHelper = new THREE.GridHelper(200, 40, 0x00ccff, 0x0044aa);
    gridHelper.position.y = -2;
    this.scene1.add(gridHelper);

    // Add some floating glowing particles
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 500;
    const posArray = new Float32Array(particleCount * 3);
    for(let i=0; i < particleCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 50;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({
        size: 0.15,
        color: 0xc6613f,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    this.particles = new THREE.Points(particleGeo, particleMat);
    this.scene1.add(this.particles);
    
    this.heroGrid = gridHelper;
  }

  initScene2() {
    this.scene2 = new THREE.Scene();
    // Deep underwater background color
    this.scene2.background = new THREE.Color('#001122');
    this.scene2.fog = new THREE.FogExp2('#001122', 0.1);
    this.camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera2.position.z = 5;

    // A distinct slide to show we successfully transitioned (underwater structure)
    const geometry = new THREE.TorusKnotGeometry(1.5, 0.4, 128, 32);
    const material = new THREE.MeshNormalMaterial({ wireframe: true });
    this.slideObject = new THREE.Mesh(geometry, material);
    this.scene2.add(this.slideObject);
  }

  initPostProcessing() {
    // Render targets for both scenes
    this.renderTarget1 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    this.renderTarget2 = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);

    // Orthographic scene for the final output
    this.postScene = new THREE.Scene();
    this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.postMaterial = new THREE.ShaderMaterial({
      vertexShader: postVertexShader,
      fragmentShader: liquidFragmentShader,
      uniforms: {
        tScene1: { value: this.renderTarget1.texture },
        tScene2: { value: this.renderTarget2.texture },
        uProgress: { value: 0.0 },
        uTime: { value: 0.0 }
      }
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.postMaterial);
    this.postScene.add(quad);
  }

  triggerDive() {
    const tl = gsap.timeline();
    tl.to(this.camera1.position, {
      z: 0.1,
      duration: 60.0,
      ease: "linear"
    }, 0);
    tl.to(this.postMaterial.uniforms.uProgress, {
      value: 1.0,
      duration: 1.5,
      ease: "power3.inOut",
      onComplete: () => {
        document.querySelector('.hero-content').style.opacity = '0';
      }
    }, 0.5);
  }

  onResize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera1.aspect = window.innerWidth / window.innerHeight;
    this.camera1.updateProjectionMatrix();
    this.camera2.aspect = window.innerWidth / window.innerHeight;
    this.camera2.updateProjectionMatrix();
    this.renderTarget1.setSize(window.innerWidth, window.innerHeight);
    this.renderTarget2.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    const time = this.clock.getElapsedTime();

    // Animate scene elements
    if (this.heroGrid) {
        this.heroGrid.position.z = (time * 3.0) % 5;
    }
    if (this.particles) {
        this.particles.rotation.y = time * 0.05;
        this.particles.position.y = Math.sin(time) * 0.5;
    }
    
    this.slideObject.rotation.x = time * 0.3;
    this.slideObject.rotation.y = time * 0.4;

    this.postMaterial.uniforms.uTime.value = time;

    // Render Scene 1 to Target 1
    this.renderer.setRenderTarget(this.renderTarget1);
    this.renderer.render(this.scene1, this.camera1);

    // Render Scene 2 to Target 2
    this.renderer.setRenderTarget(this.renderTarget2);
    this.renderer.render(this.scene2, this.camera2);

    // Render Post-Processing quad to screen
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.postScene, this.postCamera);

    requestAnimationFrame(this.render.bind(this));
  }
}

// Start app
document.addEventListener('DOMContentLoaded', () => {
  new DiveRouter();
});
