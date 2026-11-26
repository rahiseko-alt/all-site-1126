import * as THREE from 'three'

const CELL_W = 12
const CELL_H = 16
const ORIGIN_X = 1
const ORIGIN_Y = 12
const MAX_RIPPLES = 4
const MAX_TRAIL = 24
const RIPPLE_DURATION = 1.6
const RIPPLE_SPEED = 900

const VERTEX_SHADER = `
  attribute vec2 aCell;

  uniform sampler2D tScene;
  uniform sampler2D tBroken;
  uniform float uRows;
  uniform vec2 uSceneSize;
  uniform vec2 uScreen;
  uniform vec2 uCell;
  uniform vec2 uCellOrigin;
  uniform float uInitialX;
  uniform float uCharSpace;
  uniform float uLineHeight;
  uniform float uMaxIdx;
  uniform float uCharCount;
  uniform float uCharsetCount;
  uniform float uCharsetFrom;
  uniform float uCharsetTo;
  uniform float uCharsetProgress;
  uniform float uInvert;
  uniform vec3 uPointer;
  uniform float uMagnet;
  uniform float uWobble;
  uniform float uMelt;
  uniform float uStatic;
  uniform vec2 uStaticKey;
  uniform float uStaticTone;
  uniform float uTime;
  uniform vec4 uRipples[${MAX_RIPPLES}];
  uniform vec3 uTrail[${MAX_TRAIL}];

  varying vec2 vUv;
  varying float vAlpha;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    // only every other scene row is turned into characters
    float sceneRow = aCell.y * 2.0;
    vec2 st = vec2(
      (aCell.x + 0.5) / uSceneSize.x,
      (uSceneSize.y - 1.0 - sceneRow + 0.5) / uSceneSize.y
    );
    vec3 color = texture2D(tScene, st).rgb;
    float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
    float idx = floor((1.0 - brightness) * uMaxIdx);
    if (uInvert > 0.5) idx = uMaxIdx - idx;

    vec2 cellPos = vec2(uInitialX + aCell.x * uCharSpace, aCell.y * uLineHeight);
    vec2 offset = vec2(sin(cellPos.y * 0.02 + uTime * 5.0) * uWobble, 0.0);
    float boost = 0.0;

    // characters scatter away from a moving cursor (or get pulled in by the magnet)
    if (uPointer.z > 0.004) {
      vec2 d = cellPos - uPointer.xy;
      float len = length(d);
      // the bulge widens with speed as well as pushing harder
      float lensRadius = 160.0 + 40.0 * uPointer.z;
      if (len < lensRadius) {
        float f = 1.0 - len / lensRadius;
        f *= f;
        // displacement scales with distance, so it is zero right under the
        // cursor (no characters flipping sides as it passes) and peaks
        // around a third of the radius; the factor maps that peak to "push" px
        float push = mix(40.0, -55.0, uMagnet);
        offset += d * f * push * (6.75 / lensRadius) * uPointer.z;
      }
    }

    // fading wake behind the cursor: overlapping soft blobs, keeping only the
    // strongest one per cell so the wake reads as one continuous ribbon
    float trailForce = 0.0;
    vec2 trailPush = vec2(0.0);
    for (int i = 0; i < ${MAX_TRAIL}; i++) {
      vec3 trail = uTrail[i];
      if (trail.z <= 0.0) continue;
      vec2 d = cellPos - trail.xy;
      float len = length(d);
      float radius = mix(40.0, 90.0, trail.z);
      if (len < radius) {
        float f = smoothstep(radius, 0.0, len) * trail.z;
        if (f > trailForce) {
          trailForce = f;
          // like the cursor push: zero at the center, so nothing flips sides
          trailPush = d / radius * (1.0 - len / radius);
        }
      }
    }
    offset += trailPush * trailForce * 48.0;

    // click shockwaves: a ring of denser characters pushing outwards
    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
      vec4 ripple = uRipples[i];
      if (ripple.w <= 0.0) continue;
      vec2 d = cellPos - ripple.xy;
      float len = max(length(d), 1.0);
      float band = (len - ripple.z) / 60.0;
      if (abs(band) < 1.0) {
        float wave = (1.0 - band * band) * ripple.w;
        offset += d / len * wave * 14.0;
        boost += wave * 5.0;
      }
    }

    // idle melt: columns drip down at their own pace, lower rows sag more
    if (uMelt > 0.0) {
      float column = hash(vec2(aCell.x, 7.0));
      float drip = (0.25 + 0.75 * column * column) * (0.3 + cellPos.y / uScreen.y);
      offset.y += uMelt * drip * 260.0;
      offset.x += sin(uTime * 2.0 + aCell.x * 0.3) * uMelt * 3.0;
    }

    // stepping a character up or down the density ramp is a visible pop, so
    // the cursor trail never does it: on blank cells it fades in one light
    // character, elsewhere it only moves them. Only shockwaves change density
    vAlpha = 1.0;
    if (idx < 0.5 && boost > 0.0) {
      vAlpha = smoothstep(0.0, 1.0, boost);
      idx = min(uMaxIdx, ceil(boost));
    } else if (idx < 0.5 && trailForce > 0.0) {
      // one bold-ish character (';'), only its opacity follows the trail
      vAlpha = smoothstep(0.0, 0.45, trailForce);
      idx = 4.0;
    } else {
      idx = min(uMaxIdx, idx + floor(boost + 0.5));
    }

    // key press static: random characters flicker in a pattern that belongs
    // to the pressed key (uStaticKey.x = pattern 0-6, .y = the key's seed).
    // The sound's pitch (uStaticTone, -1 low .. 1 high) sets its texture:
    // low notes are slow, chunky and heavy, high notes fast, fine and light
    if (uStatic > 0.0) {
      float tone = uStaticTone;
      float frame = floor(uTime * 24.0 * pow(2.0, tone));
      float grain = pow(2.0, -tone * 1.5);
      float style = uStaticKey.x;
      float seed = uStaticKey.y;
      vec2 cell = floor(aCell / grain);
      float mask = 1.0; // 0: full static
      if (style > 0.5 && style < 1.5) {
        // scanlines
        mask = step(0.5, hash(vec2(cell.y, seed + frame)));
      } else if (style < 2.5 && style > 1.5) {
        // vertical bars
        mask = step(0.55, hash(vec2(floor(cell.x / 3.0), seed + frame)));
      } else if (style < 3.5 && style > 2.5) {
        // moving diagonal stripes
        mask = step(0.5, fract((cell.x + cell.y * 2.0) / 14.0 + frame * 0.15 + seed * 0.1));
      } else if (style < 4.5 && style > 3.5) {
        // rings spreading from the middle
        vec2 c = (cell - vec2(uSceneSize.x * 0.5, uSceneSize.y * 0.25) / grain) * vec2(1.0, 2.0);
        mask = step(0.5, fract(length(c) / 10.0 - frame * 0.2));
      } else if (style < 5.5 && style > 4.5) {
        // big blocks
        mask = step(0.55, hash(floor(cell / vec2(8.0, 4.0)) + seed + frame));
      } else if (style > 5.5) {
        // checkerboard
        mask = mod(floor(cell.x / 6.0) + floor(cell.y / 3.0) + mod(frame, 2.0), 2.0);
      }
      if (mask > 0.5 && hash(cell + frame + seed) < uStatic * 0.75) {
        // each key also has its own weight: light dots, letters or blocks
        float low = clamp(1.0 + mod(seed, 3.0) * 5.0 - tone * 4.0, 1.0, uMaxIdx - 6.0);
        idx = min(uMaxIdx, low + floor(hash(cell * 1.7 + frame + seed) * 7.0));
        vAlpha = 1.0;
        offset.x += (hash(cell + frame + 3.1) - 0.5) * 6.0 * uStatic;
      }
    }

    // charset switch: each cell flips at its own random moment
    float charset = hash(aCell) < uCharsetProgress ? uCharsetTo : uCharsetFrom;
    vUv = vec2((idx + uv.x) / uCharCount, (charset + uv.y) / uCharsetCount);

    vec2 p = cellPos + offset - uCellOrigin + position.xy * uCell;
    gl_Position = vec4(p.x / uScreen.x * 2.0 - 1.0, 1.0 - p.y / uScreen.y * 2.0, 0.0, 1.0);
    // blank cells, and cells broken in the 404 brick breaker, are pushed out
    // of clip space
    float broken = texture2D(tBroken, (aCell + 0.5) / vec2(uSceneSize.x, uRows)).r;
    if (idx < 0.5 || broken > 0.5) gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  }
`

const FRAGMENT_SHADER = `
  uniform sampler2D tAtlas;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying float vAlpha;

  void main() {
    float alpha = texture2D(tAtlas, vUv).a * vAlpha;
    gl_FragColor = vec4(uColor * alpha, alpha);
  }
`

export function AsciiEffect(renderer, ctx2d, charsets, options = {}) {
  let dpr = window.devicePixelRatio || 1
  charsets = [].concat(charsets ?? ' .:-=+*#%@')
  const charCount = charsets[0].length
  charsets = charsets.map(s => s.padEnd(charCount, s[s.length - 1]).slice(0, charCount))

  const invert = !!options.invert
  let bg = options.bg ? options.bg : 'white'
  let fontName = 'andale-mono'
  const motion = options.motion !== false
  const strokes = options.strokes || []

  let width, height, cols, sceneRows, rows
  const resolution = 0.2

  const atlasCanvas = document.createElement('canvas')
  const atlasCtx = atlasCanvas.getContext('2d')
  const atlasTexture = new THREE.CanvasTexture(atlasCanvas)
  atlasTexture.flipY = false

  let currentFont = null
  let sceneTexture = null
  let brokenArray = new Uint8Array(1)
  let brokenTexture = new THREE.DataTexture(brokenArray, 1, 1, THREE.RedFormat)
  brokenTexture.needsUpdate = true

  let pixelBuffer = null
  let cellsArray = null
  let cellsRequested = false

  const zeroVec = new THREE.Vector2(0, 0)
  const ripples = []
  const rippleUniforms = Array.from({ length: MAX_RIPPLES }, () => new THREE.Vector4())
  const trailUniforms = Array.from({ length: MAX_TRAIL }, () => new THREE.Vector3())
  let activeCharset = 0

  const material = new THREE.ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    uniforms: {
      tScene: { value: null },
      tAtlas: { value: atlasTexture },
      uSceneSize: { value: new THREE.Vector2() },
      uScreen: { value: new THREE.Vector2() },
      uCell: { value: new THREE.Vector2(CELL_W, CELL_H) },
      uCellOrigin: { value: new THREE.Vector2(ORIGIN_X, ORIGIN_Y) },
      uInitialX: { value: 0 },
      uCharSpace: { value: 26 * resolution },
      uLineHeight: { value: 50 * resolution },
      uMaxIdx: { value: charCount - 1 },
      uCharCount: { value: charCount },
      uCharsetCount: { value: charsets.length },
      uCharsetFrom: { value: 0 },
      uCharsetTo: { value: 0 },
      uCharsetProgress: { value: 1 },
      uInvert: { value: +!!invert },
      uPointer: { value: new THREE.Vector3(-9999, -9999, 0) },
      uMagnet: { value: 0 },
      uWobble: { value: 0 },
      uMelt: { value: 0 },
      uStatic: { value: 0 },
      uStaticKey: { value: new THREE.Vector2() },
      uStaticTone: { value: 0 },
      uTime: { value: 0 },
      uRipples: { value: rippleUniforms },
      uTrail: { value: trailUniforms },
      tBroken: { value: brokenTexture },
      uRows: { value: 1 },
      uColor: { value: new THREE.Color() }
    },
    transparent: true,
    premultipliedAlpha: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide
  })

  const uniforms = material.uniforms
  const geometry = new THREE.InstancedBufferGeometry()
  geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0], 3)
  )
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 1, 1], 2))
  geometry.setIndex([0, 2, 1, 2, 3, 1])

  const quad = new THREE.Mesh(geometry, material)
  quad.frustumCulled = false
  const postScene = new THREE.Scene()
  postScene.add(quad)
  const postCamera = new THREE.OrthographicCamera()

  this.isMotionEnabled = motion
  this.rippleSpeed = RIPPLE_SPEED

  this.setTheme = theme => {
    bg = theme
  }

  this.setKonami = () => {
    fontName = 'comic-mono'
  }

  this.setPointer = (x, y, amount) => {
    uniforms.uPointer.value.set(x, y, motion ? amount : 0)
  }

  this.setMagnet = val => {
    uniforms.uMagnet.value = val
  }

  this.setTrail = (head, trail) => {
    for (let i = 0; i < MAX_TRAIL; i++) {
      const pt = motion && (i ? trail[i - 1] : head)
      if (pt) {
        trailUniforms[i].set(pt.x, pt.y, pt.strength)
      } else {
        trailUniforms[i].z = 0
      }
    }
  }

  this.setScrollVelocity = vel => {
    uniforms.uWobble.value = motion ? vel : 0
  }

  this.setMelt = val => {
    uniforms.uMelt.value = motion ? val : 0
  }

  this.setStatic = val => {
    uniforms.uStatic.value = motion ? val : 0
  }

  this.setStaticKey = key => {
    const code = key.toLowerCase().codePointAt(0) || 0
    uniforms.uStaticKey.value.set(code % 7, code)
  }

  this.setStaticTone = tone => {
    uniforms.uStaticTone.value = tone
  }

  this.setCharset = targetIdx => {
    if (targetIdx === activeCharset) return null
    const progress = uniforms.uCharsetProgress.value
    uniforms.uCharsetFrom.value = progress < 0.5 ? uniforms.uCharsetFrom.value : activeCharset
    uniforms.uCharsetTo.value = targetIdx
    uniforms.uCharsetProgress.value = 0
    activeCharset = targetIdx
    return uniforms.uCharsetProgress
  }

  this.addRipple = (x, y, power = 1) => {
    if (motion) {
      ripples.push({ x, y, power, start: performance.now() })
      if (ripples.length > MAX_RIPPLES) ripples.shift()
    }
  }

  this.setSize = function (w, h) {
    width = w
    height = h
    cols = Math.ceil(width * resolution)
    sceneRows = Math.ceil(height * resolution)
    const nextDpr = window.devicePixelRatio || 1
    if (nextDpr !== dpr) {
      dpr = nextDpr
      currentFont = null
    }
    renderer.setPixelRatio(dpr)
    renderer.setSize(width, height, false)
    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0)

    sceneTexture?.dispose()
    sceneTexture = new THREE.FramebufferTexture(cols, sceneRows)
    uniforms.tScene.value = sceneTexture
    uniforms.uSceneSize.value.set(cols, sceneRows)
    uniforms.uScreen.value.set(width, height)
    uniforms.uInitialX.value = (-width * resolution) / 10

    const halfRows = Math.ceil(sceneRows / 2)
    const existingAttr = geometry.getAttribute('aCell')
    if (!(existingAttr && existingAttr.count === cols * halfRows && rows === halfRows)) {
      rows = halfRows
      if (existingAttr) geometry.dispose()
      const cellData = new Float32Array(cols * halfRows * 2)
      let ptr = 0
      for (let r = 0; r < halfRows; r++) {
        for (let c = 0; c < cols; c++, ptr += 2) {
          cellData[ptr] = c
          cellData[ptr + 1] = r
        }
      }
      geometry.setAttribute('aCell', new THREE.InstancedBufferAttribute(cellData, 2))
      brokenTexture.dispose()
      brokenArray = new Uint8Array(cols * halfRows)
      brokenTexture = new THREE.DataTexture(brokenArray, cols, halfRows, THREE.RedFormat)
      brokenTexture.needsUpdate = true
      uniforms.tBroken.value = brokenTexture
      uniforms.uRows.value = halfRows
      pixelBuffer = new Uint8Array(cols * sceneRows * 4)
      cellsArray = new Uint8Array(cols * halfRows)
      geometry.instanceCount = cols * halfRows
    }
  }

  function buildAtlas() {
    const fontSpec = `10px ${fontName}`
    if (!document.fonts.check(fontSpec)) {
      document.fonts.load(fontSpec).then(() => (currentFont = null))
    }
    atlasCanvas.width = CELL_W * charCount * dpr
    atlasCanvas.height = CELL_H * charsets.length * dpr
    atlasCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
    atlasCtx.font = fontSpec
    atlasCtx.fillStyle = 'white'
    atlasCtx.strokeStyle = 'white'
    atlasCtx.lineJoin = 'round'

    charsets.forEach((charset, rowIdx) => {
      const strokeWidth = strokes[rowIdx] || 0
      atlasCtx.lineWidth = strokeWidth
      for (let c = 0; c < charset.length; c++) {
        const x = c * CELL_W + ORIGIN_X
        const y = rowIdx * CELL_H + ORIGIN_Y
        atlasCtx.fillText(charset[c], x, y)
        if (strokeWidth) atlasCtx.strokeText(charset[c], x, y)
      }
    })
    atlasTexture.needsUpdate = true
    currentFont = fontName
  }

  function updateRipples(now) {
    for (let i = ripples.length - 1; i >= 0; i--) {
      if ((now - ripples[i].start) * 0.001 > RIPPLE_DURATION) {
        ripples.splice(i, 1)
      }
    }
    for (let i = 0; i < MAX_RIPPLES; i++) {
      const r = ripples[i]
      if (!r) {
        rippleUniforms[i].w = 0
      } else {
        const age = (now - r.start) * 0.001
        const fade = 1 - age / RIPPLE_DURATION
        rippleUniforms[i].set(r.x, r.y, age * RIPPLE_SPEED, fade * fade * r.power)
      }
    }
  }

  this.hasActiveRipples = () => ripples.length > 0

  this.dispose = () => {
    geometry.dispose()
    material.dispose()
    atlasTexture.dispose()
    brokenTexture.dispose()
    sceneTexture?.dispose()
  }

  this.getLayout = () => ({
    cols,
    rows,
    originX: uniforms.uInitialX.value,
    charSpace: uniforms.uCharSpace.value,
    lineHeight: uniforms.uLineHeight.value,
    charset: charsets[activeCharset]
  })

  this.requestCells = () => {
    cellsRequested = true
  }

  this.getCells = () => cellsArray
  this.isBroken = idx => brokenArray[idx] > 0
  this.breakCell = idx => {
    brokenArray[idx] = 255
    brokenTexture.needsUpdate = true
  }
  this.resetBroken = () => {
    brokenArray.fill(0)
    brokenTexture.needsUpdate = true
  }

  function readCells() {
    const gl = renderer.getContext()
    gl.readPixels(0, 0, cols, sceneRows, gl.RGBA, gl.UNSIGNED_BYTE, pixelBuffer)
    const maxIdx = charCount - 1
    for (let r = 0; r < rows; r++) {
      const y = sceneRows - 1 - r * 2
      for (let c = 0; c < cols; c++) {
        const p = (y * cols + c) * 4
        const lum =
          (pixelBuffer[p] * 0.2126 + pixelBuffer[p + 1] * 0.7152 + pixelBuffer[p + 2] * 0.0722) /
          255
        const idx = Math.floor((1 - lum) * maxIdx)
        cellsArray[r * cols + c] = invert ? maxIdx - idx : idx
      }
    }
  }

  this.render = function (scene, camera) {
    if (currentFont !== fontName) buildAtlas()
    const now = performance.now()
    uniforms.uTime.value = now * 0.001
    uniforms.uColor.value.set(bg === 'white' ? 0x000000 : 0xffffff)
    updateRipples(now)

    renderer.setScissorTest(true)
    renderer.setViewport(0, 0, cols / dpr, sceneRows / dpr)
    renderer.setScissor(0, 0, cols / dpr, sceneRows / dpr)
    renderer.setClearColor(0xffffff, 1)
    renderer.render(scene, camera)
    renderer.copyFramebufferToTexture(sceneTexture, zeroVec)
    if (cellsRequested && pixelBuffer) {
      cellsRequested = false
      readCells()
    }
    renderer.setScissorTest(false)
    renderer.setViewport(0, 0, width, height)
    renderer.setClearColor(0x000000, 0)
    renderer.render(postScene, postCamera)
    ctx2d.clearRect(0, 0, width, height)
    ctx2d.drawImage(renderer.domElement, 0, 0, width, height)
  }
}
