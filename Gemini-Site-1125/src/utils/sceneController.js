import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import gsap from 'gsap'
import { AsciiEffect } from './asciiEffect'
import { sound, ECHO_DECAY } from './sound'
import { useEventBus } from './eventBus'

const ROMO_Z = -3

const BASE_URL = import.meta.env.BASE_URL || '/'

class RomoShape {
  constructor() {
    this.root = new THREE.Group()
    this.root.position.x = -0.75
    this.model = null
    this.isLoading = false
  }

  load() {
    if (this.isLoading) return
    this.isLoading = true
    new GLTFLoader().load(
      `${BASE_URL}glbs/test.glb`,
      gltf => {
        this.model = gltf.scene.children[0]
        this.root.add(this.model)
        this.model.traverse(child => {
          if (child.isMesh) child.scale.set(1.1, 1.1, 1.1)
        })
      },
      () => {},
      err => {
        console.log('An error happened:', err)
      }
    )
  }

  tick() {
    if (this.model !== null) {
      this.model.rotation.z += 0.005
    }
  }

  tilt(nx, ny) {
    this.root.rotation.y += (nx * 0.9 - this.root.rotation.y) * 0.08
    this.root.rotation.x += (ny * 0.5 - this.root.rotation.x) * 0.08
  }

  show() {
    gsap.killTweensOf(this.root.position)
    gsap.fromTo(
      this.root.position,
      { z: -4.4 },
      { z: ROMO_Z, ease: 'back.out(2)', duration: 0.9, overwrite: 'all' }
    )
  }

  hide() {
    gsap.killTweensOf(this.root.position)
    gsap
      .to(this.root.position, { z: -4.4, ease: 'power1.out', duration: 0.4 })
      .then(() => {
        this.root.position.z = -33
      })
  }
}

const SHAPE_Z = -3
const textureLoader = new THREE.TextureLoader()

const LOCAL_IMAGE_MAP = {
  'https://www.datocms-assets.com/161518/1757799426-ra.jpg': `${BASE_URL}images/ra.jpg`,
  'https://www.datocms-assets.com/161518/1757799569-lets-talk.jpg': `${BASE_URL}images/lets-talk.jpg`,
  'https://www.datocms-assets.com/161518/1759807008-lets-talk-mobile.jpg': `${BASE_URL}images/lets-talk-mobile.jpg`,
  'https://www.datocms-assets.com/161518/1757799559-select-projects.jpg': `${BASE_URL}images/select-projects.jpg`,
  'https://www.datocms-assets.com/161518/1759807004-select-projects-sml.jpg': `${BASE_URL}images/select-projects-sml.jpg`
}

class TitleShape {
  constructor(data) {
    this.slug = data.slug
    this.src = LOCAL_IMAGE_MAP[data.url] || `${data.url}?invert=true`
    this.width = data.width
    this.height = data.height
    this.root = new THREE.Group()
    this.reveal = null
    this.init()
  }

  init() {
    this.material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x000000,
      metalness: 0.8,
      roughness: 0.5,
      transparent: true,
      side: THREE.DoubleSide,
      alphaMap: textureLoader.load(this.src),
      opacity: 1
    })
    const divisor = window.innerWidth > 1024 ? 450 : 650
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(this.width / divisor, this.height / divisor),
      this.material
    )
    this.root.add(mesh)
  }

  show() {
    this.root.position.z = SHAPE_Z
    gsap.killTweensOf(this.material)
    if (this.reveal === null) {
      gsap.fromTo(
        this.material,
        { opacity: 0 },
        { opacity: 1, ease: 'power3.out', duration: 1, overwrite: 'all' }
      )
    } else {
      this.material.opacity = this.reveal
    }
  }

  hide() {
    gsap.killTweensOf(this.material)
    gsap
      .to(this.material, { opacity: 0, ease: 'power3.out', duration: 1, overwrite: 'all' })
      .then(() => {
        this.root.position.z = -33
      })
  }

  animateIn() {
    gsap.fromTo(
      this.root.scale,
      { x: 10, y: 10 },
      {
        x: window.innerWidth < 1024 ? 0.4 : 1,
        y: window.innerWidth < 1024 ? 0.4 : 1,
        duration: 6,
        ease: 'power3.out'
      }
    )
  }

  dispose() {
    gsap.killTweensOf(this.material)
    gsap.killTweensOf(this.root.scale)
    this.root.traverse(child => child.geometry?.dispose())
    this.material.alphaMap?.dispose()
    this.material.dispose()
  }

  setReveal(val) {
    this.reveal = val
    gsap.killTweensOf(this.material)
    this.root.position.z = SHAPE_Z
    this.material.opacity = val
  }

  setProgress(progress) {
    this.root.position.y = -0.75 + progress
  }
}

const LETTER_Z = -2.6
const ECHO_COUNT = 4
const letterTextureCache = new Map()
const letterGeometry = new THREE.PlaneGeometry(1, 1)
let letterFont = 'RemusVariableVF, Arial, sans-serif'

class LetterPop {
  static setKonami() {
    letterFont = '"Comic Sans MS", "Comic Sans", cursive'
  }

  static play(parent, char, { tone = 0, echo = 0 } = {}) {
    const first = new LetterPop(parent, char, { tone })
    if (echo > 0) {
      for (let i = 1; i <= ECHO_COUNT; i++) {
        gsap.delayedCall(i * echo, () => {
          new LetterPop(parent, char, {
            tone,
            level: ECHO_DECAY ** +i,
            position: first.mesh.position,
            rotation: first.mesh.rotation.z + i * 0.06,
            drift: i
          })
        })
      }
    }
  }

  constructor(parent, char, { tone = 0, level = 1, position, rotation, drift = 0 } = {}) {
    this.parent = parent
    this.level = level
    this.size = 2 ** (-tone * 0.6)
    this.speed = 2 ** (tone * 0.6)
    this.material = new THREE.MeshBasicMaterial({
      map: LetterPop.getTexture(char),
      color: 0xffffff,
      transparent: true,
      fog: false,
      depthTest: false,
      depthWrite: false,
      blending: THREE.CustomBlending,
      blendEquation: THREE.AddEquation,
      blendSrc: THREE.OneMinusDstColorFactor,
      blendDst: THREE.OneMinusSrcColorFactor
    })
    this.mesh = new THREE.Mesh(letterGeometry, this.material)
    if (position) {
      this.mesh.position.set(position.x + drift * 0.04, position.y - drift * 0.02, LETTER_Z)
      this.mesh.rotation.z = rotation
    } else {
      this.mesh.position.set(
        (Math.random() - 0.5) * 0.9,
        tone * 0.15 + (Math.random() - 0.5) * 0.25,
        LETTER_Z
      )
      this.mesh.rotation.z = (Math.random() - 0.5) * 0.5
    }
    this.mesh.renderOrder = 2
    parent.add(this.mesh)
    this.animate()
  }

  static getTexture(char) {
    const key = `${letterFont}|${char}`
    if (!letterTextureCache.has(key)) {
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 256
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, 256, 256)
      ctx.fillStyle = '#fff'
      ctx.font = `220px ${letterFont}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(char, 128, 140)
      letterTextureCache.set(key, new THREE.CanvasTexture(canvas))
    }
    return letterTextureCache.get(key)
  }

  animate() {
    const fromScale = 0.4 * this.size
    const toScale = 1.1 * this.size
    gsap.fromTo(
      this.mesh.scale,
      { x: fromScale, y: fromScale },
      { x: toScale, y: toScale, duration: 1.1 / this.speed, ease: 'power3.out' }
    )
    const fade = { value: this.level }
    this.material.color.setScalar(fade.value)
    gsap.to(fade, {
      value: 0,
      duration: 0.6 / this.speed,
      delay: 0.5 / this.speed,
      ease: 'power1.in',
      onUpdate: () => this.material.color.setScalar(fade.value),
      onComplete: () => this.dispose()
    })
  }

  dispose() {
    this.parent.remove(this.mesh)
    this.material.dispose()
  }
}

const round2 = v => Math.round(v * 100) / 100

const mouseTracker = new (class {
  constructor() {
    this.isFirst = true
    this.x = Math.random() * 1200
    this.y = Math.random() * 800
    this.easeMouseX = this.x
    this.easeMouseY = this.y
    window.addEventListener('pointermove', e => this.onPointerMove(e), { passive: true })
    gsap.ticker.add(() => this.tick())
  }

  onPointerMove(e) {
    this.x = e.clientX
    this.y = e.clientY
    if (this.isFirst) {
      this.easeMouseX = this.x
      this.easeMouseY = this.y
    }
    this.isFirst = false
  }

  tick() {
    this.easeMouseX = round2(this.easeMouseX + (this.x - this.easeMouseX) / 3.3)
    this.easeMouseY = round2(this.easeMouseY + (this.y - this.easeMouseY) / 3.3)
  }
})()

const NOISE_STEP = 0.005
const NOISE_VERT = `
  varying vec2 vUv;

  void main() {
    vUv = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const NOISE_FRAG = `
precision highp float;

uniform float time;
varying vec2 vUv;

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec2 P)
{
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;

  vec4 i = permute(permute(ix) + iy);

  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
  vec4 gy = abs(gx) - 0.5 ;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;

  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);

  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x;
  g01 *= norm.y;
  g10 *= norm.z;
  g11 *= norm.w;

  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));

  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

void main() {
  float noise = cnoise(vUv * .1 + time * .5) * 100.;
  float opacity = cnoise(vUv * .2 - time * .2) * noise * 5.;
  gl_FragColor = vec4(vec3(noise), opacity * .0025);
}
`

class BackgroundNoise {
  constructor(scene) {
    this.scene = scene
    this.time = 0
    this.geometry = new THREE.PlaneGeometry(30, 30, 1, 1)
    this.material = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: NOISE_VERT,
      fragmentShader: NOISE_FRAG,
      transparent: true
    })
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.position.set(0, 0, -15)
    this.scene.add(this.mesh)
  }

  update() {
    this.time += NOISE_STEP
    this.material.uniforms.time.value = this.time
  }

  dispose() {
    this.geometry.dispose()
    this.material.dispose()
    this.scene.remove(this.mesh)
  }
}

const BASE_LIGHT_INTENSITY = 200
const CHARSETS = [' .,:;i1tL0@▒▓▓▓███', ' ..::0101010101010', ' .,:;-+=*#@▓██████']
const SHAPE_CHARSET_INDEX = {
  hero: 0,
  projects: 1,
  mail: 2
}
const CHARSET_STROKES = [0, 0.8, 0]
const IDLE_THROTTLE_MS = 2000
const STATIC_PULSE_DURATION = 0.6
const MELT_DELAY_MS = 4000
const TRAIL_LIFETIME_MS = 650
const POINTER_SPEED_DIVISOR = 10
const MAX_POINTER_AMOUNT = 2.2
const progressEase = gsap.parseEase('power3.inOut')
const PROJECTS_START_X = -3
const MAIL_REVEAL_END = 0.5

const onIdle = cb =>
  window.requestIdleCallback
    ? window.requestIdleCallback(cb, { timeout: 4000 })
    : setTimeout(cb, 1500)

export class SceneController {
  constructor(theme, images) {
    this.theme = theme
    this.currentShape = 'hero'
    this.images = images
    this.isMotionEnabled = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    this.isTouch = window.matchMedia('(pointer: coarse)').matches
    this.pointerAmount = 0
    this.scrollVelocity = 0
    this.magnet = 0
    this.isMagnet = false
    this.isGame = false
    this.melt = { value: 0 }
    this.staticNoise = { value: 0 }
    this.isMelting = false
    this.trail = []
    this.trailHead = { x: 0, y: 0, strength: 0 }
    this.isPointerInside = false
    this.lastPointer = { x: 0, y: 0 }
    this.tilt = { x: 0, y: 0, targetX: 0, targetY: 0, base: null }
    this.frame = 0
    this.lastActivity = performance.now()
    this.lastScrollY = window.scrollY
    this.width = window.innerWidth
    this.height = window.innerHeight
    this.isMobile = this.width < 1024
    this.isFooterVisible = false
    this.animate = this.animate.bind(this)
    this.init()
  }

  init() {
    this.asciiCanvas = document.getElementById('c')
    this.invertedCanvas = document.querySelector('.footer-canvas')
    this.group = new THREE.Group()
    this.setUpScene()
    this.setAsciiEffect()
    this.setTitleShape()
    if (!this.isMobile) this.setRomoShape()
    this.animate()
    this.showShape(this.currentShape)
    this.setEvents()
    this.setBackgroundNoise()
  }

  setUpScene() {
    this.camera = new THREE.PerspectiveCamera(
      35,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.Fog(0xffffff, 3.5, 4)
    this.lightGroup = new THREE.Group()
    this.light = new THREE.PointLight(0xffffff, BASE_LIGHT_INTENSITY, 100, 10)
    this.lightGroup.add(this.light)
    this.lightGroup.position.x = -1.2
    this.lightGroup.position.y = -1.2
    this.lightGroup.position.z = -1.5
    this.scene.add(this.lightGroup)

    const ambient = new THREE.AmbientLight(0xffffff, 1)
    this.scene.add(ambient)
    this.renderer = new THREE.WebGLRenderer({ alpha: true })
    this.renderer.setClearColor(0xffffff, 1)
  }

  setRomoShape() {
    this.romoShape = new RomoShape()
    this.romoShape.root.position.z = 1
    this.group.add(this.romoShape.root)
    const scheduleLoad = () => onIdle(() => !this.isDestroyed && this.romoShape.load())
    if (document.readyState === 'complete') {
      scheduleLoad()
    } else {
      window.addEventListener('load', scheduleLoad, { once: true })
    }
  }

  setGame(isGame) {
    this.isGame = isGame
    if (this.backgroundNoise) {
      this.backgroundNoise.mesh.visible = !isGame
    }
    if (isGame) {
      const s = this.isMobile ? 0.4 : 1
      this.shapes.forEach(shape => shape.root.scale.set(s, s, 1))
    }
  }

  setKonami() {
    this.effect.setKonami()
    LetterPop.setKonami()
  }

  setTheme(theme) {
    this.theme = theme
    this.effect.setTheme(this.theme)
  }

  setAsciiEffect() {
    const dpr = window.devicePixelRatio || 1
    this.asciiCanvas.width = window.innerWidth * dpr
    this.asciiCanvas.height = window.innerHeight * dpr
    this.asciiCanvas.style.width = `${window.innerWidth}px`
    this.asciiCanvas.style.height = `${window.innerHeight}px`
    this.effect = new AsciiEffect(this.renderer, this.asciiCanvas.getContext('2d'), CHARSETS, {
      invert: false,
      color: false,
      bg: this.theme,
      motion: this.isMotionEnabled,
      strokes: CHARSET_STROKES
    })
    this.effect.setSize(window.innerWidth, window.innerHeight)
  }

  setTitleShape() {
    this.shapes?.forEach(shape => {
      this.group.remove(shape.root)
      shape.dispose()
    })
    this.shapes = []
    const filtered = this.images.filter(img => img.isMobile === this.isMobile)
    for (let i = 0; i < filtered.length; i++) {
      const item = filtered[i]
      const shape = new TitleShape(item)
      this.shapes.push(shape)
      this.group.add(shape.root)
    }
    if (this.isMobile && this.shapes.length > 0) {
      this.shapes[this.shapes.length - 1].root.position.x = -0.04
    }
    this.scene.add(this.group)
  }

  animateIn() {
    this.shapes?.[0]?.animateIn()
  }

  animate() {
    this.raf = requestAnimationFrame(this.animate)
    this.checkSize()
    this.backgroundNoise?.update()
    if (this.isMotionEnabled) this.updateMotion()
    this.romoShape?.tick()
    this.frame++
    if (
      performance.now() - this.lastActivity > IDLE_THROTTLE_MS &&
      !this.effect.hasActiveRipples() &&
      this.frame % 2
    ) {
      return
    }
    this.render()
  }

  render() {
    this.effect?.render(this.scene, this.camera)
    if (!this.invertedCanvas || !this.isFooterVisible) return
    this.invertedCtx ??= this.invertedCanvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const pad = (this.width / 1440) * 20
    const { width, height } = this.invertedCanvas
    this.invertedCtx.clearRect(0, 0, width, height)
    this.invertedCtx.drawImage(
      this.asciiCanvas,
      pad * dpr,
      pad * dpr,
      width,
      height,
      0,
      0,
      width,
      height
    )
  }

  updateMotion() {
    const now = performance.now()
    let px = mouseTracker.easeMouseX
    let py = mouseTracker.easeMouseY

    if (this.isTouch) {
      this.tilt.x += (this.tilt.targetX - this.tilt.x) * 0.1
      this.tilt.y += (this.tilt.targetY - this.tilt.y) * 0.1
      px = this.width * (0.5 + this.tilt.x * 0.45)
      py = this.height * (0.5 + this.tilt.y * 0.45)
      const amt = Math.min(1, Math.hypot(this.tilt.x, this.tilt.y) * 1.4)
      this.pointerAmount += (amt - this.pointerAmount) * 0.1
    } else {
      const dist = Math.hypot(
        mouseTracker.easeMouseX - this.lastPointer.x,
        mouseTracker.easeMouseY - this.lastPointer.y
      )
      this.lastPointer.x = mouseTracker.easeMouseX
      this.lastPointer.y = mouseTracker.easeMouseY
      const targetAmt = this.isPointerInside
        ? Math.min(MAX_POINTER_AMOUNT, dist / POINTER_SPEED_DIVISOR)
        : 0
      this.pointerAmount += (targetAmt - this.pointerAmount) * 0.35
      if (Math.abs(mouseTracker.x - mouseTracker.easeMouseX) > 0.5) {
        this.lastActivity = now
      }
      if (!this.isGame) this.updateTrail(now)
    }

    const dy = window.scrollY - this.lastScrollY
    this.lastScrollY = window.scrollY
    if (dy !== 0) this.lastActivity = now

    const clampedVel = gsap.utils.clamp(-6, 6, dy * 0.3)
    this.scrollVelocity += (clampedVel - this.scrollVelocity) * 0.15
    this.magnet += (+!!this.isMagnet - this.magnet) * 0.06
    this.updateMelt(now)

    this.effect.setPointer(px, py, this.isGame ? 0 : this.pointerAmount)
    this.effect.setMagnet(this.magnet)
    this.effect.setScrollVelocity(this.scrollVelocity)
    this.effect.setMelt(this.melt.value)

    const nx = px / this.width - 0.5
    const ny = py / this.height - 0.5
    this.romoShape?.tilt(nx, ny)

    const scaleX = this.shapes?.[0]?.root.scale.x ?? 0
    const baseScale = this.isMobile ? 0.4 : 1
    const zoomNorm = gsap.utils.clamp(0, 1, (scaleX - baseScale) / (10 - baseScale))
    const zoomSqrt = Math.sqrt(zoomNorm)
    const zoomBoost = zoomSqrt * 2.5
    const isHero = this.currentShape === 'hero'

    if (isHero) {
      const pos = this.lightGroup.position
      const tx = gsap.utils.interpolate(-1.2 + nx * 0.5, 0.4, zoomSqrt)
      const ty = gsap.utils.interpolate(-1.2 - ny * 0.5, 0.4, zoomSqrt)
      const lerp = 0.03 + zoomSqrt * 0.2
      pos.x += (tx - pos.x) * lerp
      pos.y += (ty - pos.y) * lerp
      pos.z += (-1.5 - pos.z) * lerp
    }

    const targetIntensity =
      BASE_LIGHT_INTENSITY *
      (1 + (isHero ? Math.min(1, this.pointerAmount) * 0.4 : 0) + zoomBoost)
    const intensityLerp = targetIntensity > this.light.intensity ? 0.08 : 0.02
    this.light.intensity += (targetIntensity - this.light.intensity) * intensityLerp
  }

  updateTrail(now) {
    const px = mouseTracker.easeMouseX
    const py = mouseTracker.easeMouseY
    const head = this.trailHead
    head.x = px
    head.y = py
    head.strength = Math.min(1, this.pointerAmount) * 0.9

    const first = this.trail[0]
    const dist = first ? Math.hypot(px - first.x, py - first.y) : Infinity
    if (dist > 10) {
      const steps = first ? Math.min(4, Math.floor(dist / 10)) : 1
      for (let i = steps; i >= 1; i--) {
        const t = i / steps
        this.trail.unshift({
          x: first ? first.x + (px - first.x) * (1 - t + 1 / steps) : px,
          y: first ? first.y + (py - first.y) * (1 - t + 1 / steps) : py,
          time: now,
          base: head.strength
        })
      }
      this.trail.length = Math.min(this.trail.length, 23)
    }

    const trail = this.trail
    while (trail.length && now - trail[trail.length - 1].time >= TRAIL_LIFETIME_MS) {
      trail.pop()
    }
    for (let i = 0; i < trail.length; i++) {
      const pt = trail[i]
      const rem = 1 - (now - pt.time) / TRAIL_LIFETIME_MS
      pt.strength = rem * rem * (3 - 2 * rem) * pt.base
    }
    this.effect.setTrail(head, trail)
  }

  updateMelt(now) {
    const idleTime = this.isGame ? 0 : now - this.lastActivity
    if (!this.isMelting && idleTime > MELT_DELAY_MS) {
      this.isMelting = true
      gsap.to(this.melt, { value: 1, duration: 8, ease: 'power2.in', overwrite: 'auto' })
    } else if (this.isMelting && idleTime < MELT_DELAY_MS) {
      this.isMelting = false
      gsap.to(this.melt, { value: 0, duration: 0.9, ease: 'back.out(2.5)', overwrite: 'auto' })
    }
  }

  markActivity() {
    this.lastActivity = performance.now()
  }

  setCharset(idx) {
    const uniform = this.effect.setCharset(idx)
    if (uniform) {
      gsap.to(uniform, { value: 1, duration: 0.8, ease: 'power1.inOut', overwrite: true })
    }
  }

  ripple(x, y, power = 1) {
    this.markActivity()
    if (!this.isGame) this.effect.addRipple(x, y, power)
  }

  setTilt() {
    const onOrientation = e => {
      if (e.gamma === null || e.beta === null) return
      this.tilt.base ??= { gamma: e.gamma, beta: e.beta }
      const tx = gsap.utils.clamp(-1, 1, (e.gamma - this.tilt.base.gamma) / 25)
      const ty = gsap.utils.clamp(-1, 1, (e.beta - this.tilt.base.beta) / 25)
      if (Math.hypot(tx - this.tilt.targetX, ty - this.tilt.targetY) > 0.02) {
        this.markActivity()
      }
      this.tilt.targetX = tx
      this.tilt.targetY = ty
    }
    const { signal } = this.abort
    const bind = () =>
      window.addEventListener('deviceorientation', onOrientation, { passive: true, signal })
    const DOE = window.DeviceOrientationEvent
    if (DOE && typeof DOE.requestPermission === 'function') {
      window.addEventListener(
        'pointerdown',
        () =>
          DOE.requestPermission()
            .then(state => state === 'granted' && bind())
            .catch(() => {}),
        { once: true, signal }
      )
    } else if (DOE) {
      bind()
    }
  }

  onKeyDown(e) {
    this.markActivity()
    if (
      e.metaKey ||
      e.ctrlKey ||
      e.altKey ||
      e.target.closest?.('input, textarea, select, [contenteditable]')
    ) {
      return
    }
    const arrows = {
      ArrowUp: () => sound.shiftPitch(1),
      ArrowDown: () => sound.shiftPitch(-1),
      ArrowRight: () => sound.shiftEcho(1),
      ArrowLeft: () => sound.shiftEcho(-1)
    }
    if (!this.isGame || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) {
      if (arrows[e.key]) {
        arrows[e.key]()
        if (this.isMotionEnabled) {
          this.playLetter(sound.lastChar)
          this.playStatic(sound.lastChar)
        }
        return
      }
      if (/^[0-9]$/.test(e.key)) {
        sound.setInstrument(e.key)
        if (this.isMotionEnabled) {
          this.playLetter(sound.lastChar)
          this.playStatic(sound.lastChar)
        }
        return
      }
      if (e.key.length === 1 && /[\p{L}\p{N}?!&@#]/u.test(e.key)) {
        sound.key(e.key)
        if (this.isMotionEnabled) {
          this.playLetter(e.key)
          this.playStatic(e.key)
        }
      }
    }
  }

  playLetter(char) {
    LetterPop.play(this.scene, char, { tone: sound.tone, echo: sound.echo })
  }

  playStatic(char) {
    if (!this.isMotionEnabled) return
    this.effect.setStaticKey(char)
    this.effect.setStaticTone(sound.tone)
    const echo = sound.echo
    const echoCount = echo > 0 ? 4 : 0
    const envelopeAt = t => {
      let maxVal = 0
      for (let i = 0; i <= echoCount; i++) {
        const phase = (t - i * echo) / STATIC_PULSE_DURATION
        if (phase >= 0 && phase <= 1) {
          maxVal = Math.max(maxVal, ECHO_DECAY ** +i * (1 - phase) * (1 - phase))
        }
      }
      return maxVal
    }
    gsap.fromTo(
      this.staticNoise,
      { value: 0 },
      {
        value: 1,
        duration: STATIC_PULSE_DURATION + echoCount * echo,
        ease: 'none',
        overwrite: true,
        onUpdate: () => {
          this.markActivity()
          this.effect.setStatic(
            envelopeAt(this.staticNoise.value * (STATIC_PULSE_DURATION + echoCount * echo))
          )
        },
        onComplete: () => this.effect.setStatic(0)
      }
    )
  }

  setEvents() {
    this.abort = new AbortController()
    const { signal } = this.abort

    window.addEventListener(
      'pointerdown',
      e => {
        sound.click()
        this.ripple(e.clientX, e.clientY)
      },
      { passive: true, signal }
    )
    window.addEventListener('keydown', e => this.onKeyDown(e), { signal })
    window.addEventListener('pointermove', () => (this.isPointerInside = true), {
      passive: true,
      signal
    })
    document.documentElement.addEventListener(
      'pointerleave',
      () => (this.isPointerInside = false),
      { signal }
    )

    if (this.isTouch && this.isMotionEnabled) this.setTilt()

    if (this.invertedCanvas) {
      this.footerObserver = new IntersectionObserver(
        ([entry]) => (this.isFooterVisible = entry.isIntersecting),
        { rootMargin: '300px' }
      )
      this.footerObserver.observe(this.invertedCanvas)
    }

    this.busOffs = [
      useEventBus('CANVAS:RIPPLE').on(({ x, y, power }) => {
        this.ripple(x, y, power)
      }),
      useEventBus('LOADER:START').on(() => {
        this.shapes?.[0]?.animateIn()
      }),
      useEventBus('CANVAS:ENTER').on(slug => {
        this.currentShape = slug
        this.showShape(slug)
        this.setCharset(SHAPE_CHARSET_INDEX[slug] ?? 0)
        if (slug === 'mail') this.isMagnet = true
      }),
      useEventBus('CANVAS:LEAVE').on(slug => {
        this.hideShape(slug)
        if (slug === 'mail') this.isMagnet = false
      }),
      useEventBus('CANVAS:PROGRESS').on((slug, progress) => {
        this.currentShape = slug
        this.progressShape(slug, progress)
      }),
      useEventBus('CANVAS:ENTER_ROMO').on(() => {
        this.romoShape?.load()
        this.romoShape?.show()
        this.setCharset(0)
      }),
      useEventBus('CANVAS:LEAVE_ROMO').on(() => {
        this.romoShape?.hide()
      }),
      useEventBus('WORK:ENTER').on(() => sound.hover())
    ]
  }

  destroy() {
    this.isDestroyed = true
    cancelAnimationFrame(this.raf)
    this.abort.abort()
    this.busOffs.forEach(off => off())
    this.footerObserver?.disconnect()
    gsap.killTweensOf([this.melt, this.staticNoise])
    this.shapes.forEach(s => s.dispose())
    this.backgroundNoise?.dispose()
    this.effect.dispose()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
  }

  showShape(slug) {
    this.currentShape = slug
    this.shapes.find(s => s.slug === slug)?.show()
  }

  hideShape(slug) {
    this.currentShape = null
    this.shapes.find(s => s.slug === slug)?.hide()
  }

  progressShape(slug, progress) {
    if (slug === 'hero') return
    const shape = this.shapes.find(s => s.slug === slug)
    if (slug === 'mail') {
      shape?.setReveal(gsap.utils.clamp(0, 1, progress / MAIL_REVEAL_END))
    } else {
      shape?.setProgress(progress)
    }
    const eased = progressEase(progress)
    const startX = slug === 'projects' && !this.isMobile ? PROJECTS_START_X : -1.2
    this.lightGroup.position.x = startX + eased * (1.3 - startX)
    this.lightGroup.position.y = -1.2 + eased * 2.5
    this.lightGroup.position.z = -2.2 + Math.sin(eased * Math.PI) * 1.5
  }

  resize(w, h) {
    if (!w || !h) return
    this.width = w
    this.height = h
    const dpr = window.devicePixelRatio || 1
    this.dpr = dpr
    this.asciiCanvas.width = w * dpr
    this.asciiCanvas.height = h * dpr
    this.asciiCanvas.style.width = `${w}px`
    this.asciiCanvas.style.height = `${h}px`

    const pad = (w / 1440) * 20
    if (this.invertedCanvas) {
      const iw = Math.round(w - pad * 2)
      const ih = Math.round(h - pad * 2)
      this.invertedCanvas.width = Math.round(iw * dpr)
      this.invertedCanvas.height = Math.round(ih * dpr)
      this.invertedCanvas.style.width = `${iw}px`
      this.invertedCanvas.style.height = `${ih}px`
    }

    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.effect?.setSize(w, h)
    this.updateBreakpoint()
    this.markActivity()
    this.render()
  }

  checkSize() {
    const parent = this.asciiCanvas.parentElement
    if (!parent) return
    const w = parent.clientWidth
    const h = parent.clientHeight
    const dpr = window.devicePixelRatio || 1
    if (w !== this.width || h !== this.height || dpr !== this.dpr) {
      this.resize(w, h)
    }
  }

  updateBreakpoint() {
    const isMobile = this.width < 1024
    if (isMobile === this.isMobile) return
    this.isMobile = isMobile
    this.setTitleShape()
    const s = isMobile ? 0.4 : 1
    this.shapes.forEach(shape => shape.root.scale.set(s, s, 1))
    if (this.currentShape) this.showShape(this.currentShape)
    if (isMobile) {
      this.romoShape?.hide()
    } else if (!this.romoShape) {
      this.setRomoShape()
    }
  }

  setBackgroundNoise() {
    this.backgroundNoise = new BackgroundNoise(this.scene)
  }
}
