const CELL_SCREEN = 18
const CELL_CANVAS = 6
const BAND_WIDTH = 170
const JITTER = 140
const SPEED = 900

export async function startPixelTransition(originX, originY, callback) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reducedMotion) {
    await callback()
    return
  }

  const w = window.innerWidth
  const h = window.innerHeight
  const cols = Math.ceil(w / CELL_SCREEN)
  const rows = Math.ceil(h / CELL_SCREEN)
  const canvas = document.createElement('canvas')
  canvas.width = cols * CELL_CANVAS
  canvas.height = rows * CELL_CANVAS
  const ctx = canvas.getContext('2d')
  const noise = Float32Array.from({ length: cols * rows }, () => Math.random())
  const duration =
    ((Math.hypot(Math.max(originX, w - originX), Math.max(originY, h - originY)) +
      BAND_WIDTH +
      JITTER) /
      SPEED) *
    1000

  const style = document.createElement('style')
  document.head.appendChild(style)

  const updateStyle = () => {
    const dataUrl = canvas.toDataURL()
    style.textContent = `::view-transition-new(root){-webkit-mask-image:url(${dataUrl});mask-image:url(${dataUrl});-webkit-mask-size:${cols * CELL_SCREEN}px ${rows * CELL_SCREEN}px;mask-size:${cols * CELL_SCREEN}px ${rows * CELL_SCREEN}px;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;}`
  }

  const drawMask = radius => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#000'
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = (c + 0.5) * CELL_SCREEN
        const cy = (r + 0.5) * CELL_SCREEN
        const dist = Math.hypot(cx - originX, cy - originY) + noise[r * cols + c] * JITTER
        const progress = Math.min(1, Math.max(0, (radius - dist) / BAND_WIDTH + 1))
        if (progress <= 0) continue
        const size = Math.max(1, Math.round(progress * CELL_CANVAS))
        const offset = Math.floor((CELL_CANVAS - size) / 2)
        ctx.fillRect(c * CELL_CANVAS + offset, r * CELL_CANVAS + offset, size, size)
      }
    }
    updateStyle()
  }

  drawMask(-310)
  const transition = document.startViewTransition(callback)
  try {
    await transition.ready
  } catch {
    style.remove()
    return
  }

  document.documentElement.animate(
    { opacity: [1, 1] },
    { duration, pseudoElement: '::view-transition-new(root)' }
  )

  const start = performance.now()
  const tick = () => {
    const elapsed = performance.now() - start
    drawMask((elapsed / 1000) * SPEED)
    if (elapsed < duration) {
      requestAnimationFrame(tick)
    }
  }
  requestAnimationFrame(tick)
  transition.finished.finally(() => style.remove())
}
