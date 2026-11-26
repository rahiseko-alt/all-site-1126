<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import gsap from 'gsap'
import { useMainStore } from '../../stores/main'
import { useEventBus } from '../../utils/eventBus'
import { sound } from '../../utils/sound'

const CELL_SCREEN = 18
const CELL_CANVAS = 6
const BAND_WIDTH = 220
const JITTER = 160
const SPEED = 900
const BAR_LEN = 27
const SCRAMBLE_CHARS = '░▒▓█'
const NAME_TEXT = 'Romain Avalle'
const ROLE_TEXT = 'Interactive Developer'
const HINT_TEXT = 'Type to play · 1-0 instrument · ↑↓ pitch · ←→ echo'

const mainStore = useMainStore()
const { setLoaderDone } = mainStore
const { theme, isSceneReady } = storeToRefs(mainStore)

const rootEl = ref(null)
const canvasEl = ref(null)
const nameEl = ref(null)
const roleEl = ref(null)
const barEl = ref(null)
const hintEl = ref(null)
const progress = ref(0)
const isRevealing = ref(false)

const barChars = computed(() => {
  const filled = Math.round((progress.value / 100) * BAR_LEN)
  return '█'.repeat(filled) + '░'.repeat(BAR_LEN - filled)
})

const randomBlock = () => SCRAMBLE_CHARS[Math.floor(Math.random() * 4)]

const scrambleSpans = (containerEl, { duration = 0.9, out = false } = {}) => {
  const spans = [...containerEl.querySelectorAll('[data-char]')]
  const ranges = spans.map((_, idx) => {
    const start = ((out ? spans.length - 1 - idx : idx) / spans.length) * 0.6 + Math.random() * 0.1
    return [start, start + 0.3]
  })
  const state = { t: 0 }
  return gsap.to(state, {
    t: 1,
    duration,
    ease: 'none',
    onUpdate: () => {
      spans.forEach((span, idx) => {
        const [start, end] = ranges[idx]
        const ch = span.dataset.char
        const before = state.t < start
        const after = state.t >= end
        if (ch !== ' ') {
          if (out ? after : before) {
            span.textContent = ch
            span.style.opacity = 0
          } else if (out ? before : after) {
            span.textContent = ch
            span.style.opacity = 1
          } else {
            span.textContent = randomBlock()
            span.style.opacity = 1
          }
        }
      })
    }
  })
}

const animateProgressBar = () => {
  const tl = gsap.timeline()
  let p = 0
  while (p < 100) {
    p = Math.min(100, p + gsap.utils.random(4, 19, 1))
    tl.to(progress, {
      value: p,
      duration: gsap.utils.random(0.04, 0.16),
      ease: 'steps(3)'
    }).to({}, { duration: gsap.utils.random(0, 0.18) })
  }
  return tl
}

const revealCanvas = () =>
  new Promise(resolve => {
    const w = window.innerWidth
    const h = window.innerHeight
    const cx = w / 2
    const cy = h / 2
    const cols = Math.ceil(w / CELL_SCREEN)
    const rows = Math.ceil(h / CELL_SCREEN)
    const canvas = canvasEl.value
    canvas.width = cols * CELL_CANVAS
    canvas.height = rows * CELL_CANVAS
    canvas.style.width = `${cols * CELL_SCREEN}px`
    canvas.style.height = `${rows * CELL_SCREEN}px`

    const ctx = canvas.getContext('2d')
    ctx.fillStyle = theme.value === 'black' ? '#000000' : '#ffffff'

    const noise = Float32Array.from({ length: cols * rows }, () => Math.random())
    const duration = ((Math.hypot(cx, cy) + BAND_WIDTH + JITTER) / SPEED) * 1000
    const labels = [nameEl.value, roleEl.value].map(el => {
      const rect = el.getBoundingClientRect()
      return {
        el,
        distance: Math.hypot(
          Math.max(Math.abs(rect.left + rect.width / 2 - cx) - rect.width / 2, 0),
          rect.top + rect.height / 2 - cy
        )
      }
    })

    const drawFrame = radius => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = (c + 0.5) * CELL_SCREEN
          const py = (r + 0.5) * CELL_SCREEN
          const dist = Math.hypot(px - cx, py - cy) + noise[r * cols + c] * JITTER
          const progressVal = Math.min(1, Math.max(0, (radius - dist) / BAND_WIDTH + 1))
          if (progressVal >= 1) continue
          const size = Math.round((1 - progressVal) * CELL_CANVAS)
          if (!size) continue
          const offset = Math.floor((CELL_CANVAS - size) / 2)
          ctx.fillRect(c * CELL_CANVAS + offset, r * CELL_CANVAS + offset, size, size)
        }
      }
      labels.forEach(item => {
        if (radius > item.distance + JITTER * 0.5) {
          item.el.style.opacity = 0
        }
      })
    }

    drawFrame(-380)
    isRevealing.value = true
    useEventBus('LOADER:START').emit()
    useEventBus('CANVAS:RIPPLE').emit({ x: cx, y: cy, power: 2 })
    sound.whoosh()

    const start = performance.now()
    const tick = () => {
      const elapsed = performance.now() - start
      drawFrame((elapsed / 1000) * SPEED - BAND_WIDTH)
      if (elapsed < duration) {
        requestAnimationFrame(tick)
      } else {
        resolve()
      }
    }
    requestAnimationFrame(tick)
  })

const waitForScene = () =>
  new Promise(resolve => {
    if (isSceneReady.value) return resolve()
    let stopWatch
    let timer
    const done = () => {
      stopWatch?.()
      clearTimeout(timer)
      resolve()
    }
    stopWatch = watch(isSceneReady, ready => ready && done())
    timer = setTimeout(done, 6000)
  })

onMounted(async () => {
  await nextTick()
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    progress.value = 100
    await Promise.all([document.fonts.ready, waitForScene()])
    useEventBus('LOADER:START').emit()
    await gsap.to(rootEl.value, { opacity: 0, duration: 0.6, delay: 0.4 })
    setLoaderDone()
  } else {
    scrambleSpans(nameEl.value, { duration: 1 }).delay(0.2)
    scrambleSpans(roleEl.value, { duration: 1.1 }).delay(0.35)
    scrambleSpans(hintEl.value, { duration: 1.1 }).delay(0.5)
    await Promise.all([animateProgressBar().delay(0.3), document.fonts.ready, waitForScene()])
    await gsap.delayedCall(0.6, () => {})
    scrambleSpans(hintEl.value, { duration: 0.35, out: true }).delay(0.25)
    await scrambleSpans(barEl.value, { duration: 0.35, out: true }).delay(0.25)
    await revealCanvas()
    setLoaderDone()
  }
})
</script>

<template>
  <div
    ref="rootEl"
    :class="[
      'common-loader fixed top-0 left-0 w-screen h-screen z-[10] regular pointer-events-none',
      { 'is-revealing': isRevealing }
    ]"
    aria-hidden="true"
  >
    <canvas ref="canvasEl" class="absolute top-0 left-0"></canvas>
    <div class="absolute w-full h-full site-grid items-center">
      <div ref="nameEl" class="col-span-4 l:col-span-3 l:text-right">
        <span
          v-for="(ch, i) in NAME_TEXT"
          :key="i"
          :data-char="ch"
          class="inline-block whitespace-pre opacity-0"
          >{{ ch }}</span
        >
      </div>
      <div
        ref="barEl"
        class="loader-bar absolute left-20 top-1/2 mt-30 l:static l:mt-0 l:col-span-6 flex justify-center gap-12"
      >
        <span>
          <span v-for="(ch, i) in barChars" :key="i" :data-char="ch">{{ ch }}</span>
        </span>
      </div>
      <div
        ref="roleEl"
        class="col-span-4 text-right l:text-left l:col-span-3 col-start-5 l:col-start-10"
      >
        <span
          v-for="(ch, i) in ROLE_TEXT"
          :key="i"
          :data-char="ch"
          class="inline-block whitespace-pre opacity-0"
          >{{ ch }}</span
        >
      </div>
    </div>
    <div
      ref="hintEl"
      class="absolute bottom-40 left-0 w-full justify-center text-12 hidden has-hover:flex"
    >
      <span
        v-for="(ch, i) in HINT_TEXT"
        :key="i"
        :data-char="ch"
        class="whitespace-pre opacity-0"
        >{{ ch }}</span
      >
    </div>
  </div>
</template>

<style scoped>
canvas {
  image-rendering: pixelated;
}
.loader-bar {
  animation: 0.3s ease-out both loader-bar-in;
}
@keyframes loader-bar-in {
  0% {
    opacity: 0;
  }
}
.common-loader.is-revealing {
  background: 0 0 !important;
}
</style>
