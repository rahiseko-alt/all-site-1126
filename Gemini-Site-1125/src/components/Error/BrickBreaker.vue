<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { sound } from '../../utils/sound'

const GRAVITY = 0.9
const INITIAL_LIVES = 3
const TRAIL_LEN = 6
const CELL_OFFSET_X = 6
const CELL_OFFSET_Y = 7
const BLAST_RADIUS = 13
const MAX_DEBRIS = 1500

const props = defineProps({
  scene: {
    type: Object,
    default: null
  },
  theme: {
    type: String,
    default: 'white'
  }
})

const canvasEl = ref(null)
let ctx = null
let width = 0
let height = 0
let raf = null
let debris = []
let layout = null
let remainingCells = 0

const game = {
  status: 'ready',
  score: 0,
  lives: INITIAL_LIVES,
  baseSpeed: 520,
  speed: 520
}

const paddle = {
  x: 0,
  target: 0,
  y: 0,
  w: 0,
  cell: 12,
  bump: 0
}

const ball = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  r: 5,
  trail: []
}

const keysDown = new Set()
const rand = (min, max) => min + Math.random() * (max - min)
const getEffect = () => props.scene?.effect

const resize = () => {
  const canvas = canvasEl.value
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = window.innerWidth
  height = window.innerHeight
  if (!width || !height || !canvas) return
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const isSmall = width < 800
  paddle.cell = isSmall ? 7 : 12
  paddle.w = paddle.cell * (isSmall ? 9 : 12)
  paddle.y = height - (isSmall ? 50 : 70)
  paddle.x = paddle.target = paddle.x || width / 2
  ball.r = isSmall ? 4 : 5
  game.baseSpeed = isSmall ? 340 : 520
  parkBall()
}

const resetGame = () => {
  game.status = 'ready'
  game.score = 0
  game.lives = INITIAL_LIVES
  game.speed = game.baseSpeed
  parkBall()
}

const parkBall = () => {
  ball.vx = ball.vy = 0
  ball.trail = []
  ball.x = paddle.x
  ball.y = paddle.y - paddle.cell / 2 - ball.r
}

const launch = () => {
  if (game.status === 'won' || game.status === 'over') {
    getEffect()?.resetBroken()
    debris = []
    resetGame()
    sound.whoosh()
    return
  }
  if (game.status !== 'ready') return
  game.status = 'playing'
  const angle = rand(-0.5, 0.5)
  ball.vx = Math.sin(angle) * game.speed
  ball.vy = -Math.cos(angle) * game.speed
  sound.click({ pitch: 1.4 })
}

const isCellSolid = (cells, idx) => cells[idx] > 0 && !getEffect().isBroken(idx)
const cellCenterX = col => layout.originX + col * layout.charSpace + CELL_OFFSET_X / 2
const cellCenterY = row => row * layout.lineHeight - CELL_OFFSET_Y / 2

const findCollision = (bx, by) => {
  const cells = getEffect().getCells()
  const { originX, charSpace, lineHeight, cols, rows } = layout
  const minCol = Math.max(0, Math.floor((bx - ball.r - CELL_OFFSET_X - originX) / charSpace))
  const maxCol = Math.min(cols - 1, Math.ceil((bx + ball.r - originX) / charSpace))
  const minRow = Math.max(0, Math.floor((by - ball.r) / lineHeight))
  const maxRow = Math.min(rows - 1, Math.ceil((by + ball.r + CELL_OFFSET_Y) / lineHeight))
  let hit = null
  let minDist = Infinity
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const idx = r * cols + c
      if (!isCellSolid(cells, idx)) continue
      const dx = bx - cellCenterX(c)
      const dy = by - cellCenterY(r)
      if (Math.abs(dx) > ball.r + charSpace / 2 || Math.abs(dy) > ball.r + lineHeight / 2) continue
      const dist = Math.hypot(dx, dy)
      if (dist < minDist) {
        minDist = dist
        hit = { col: c, row: r, dx, dy }
      }
    }
  }
  return hit
}

const shatterArea = (cx, cy, radius) => {
  const cells = getEffect().getCells()
  const { charSpace, lineHeight, cols, rows, charset } = layout
  const minCol = Math.max(0, Math.floor((cx - radius - layout.originX) / charSpace) - 1)
  const maxCol = Math.min(cols - 1, Math.ceil((cx + radius - layout.originX) / charSpace))
  const minRow = Math.max(0, Math.floor((cy - radius) / lineHeight))
  const maxRow = Math.min(rows - 1, Math.ceil((cy + radius) / lineHeight) + 1)
  let count = 0
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      const idx = r * cols + c
      if (!isCellSolid(cells, idx)) continue
      const px = cellCenterX(c)
      const py = cellCenterY(r)
      if (Math.hypot(px - cx, py - cy) <= radius) {
        getEffect().breakCell(idx)
        count++
        if (debris.length < MAX_DEBRIS) {
          debris.push({
            x: px,
            y: py,
            vx: ball.vx / 120 + rand(-2.5, 2.5),
            vy: ball.vy / 120 + rand(-5, -1),
            rot: 0,
            vr: rand(-0.3, 0.3),
            glyph: charset[cells[idx]]
          })
        }
      }
    }
  }
  return count
}

const countRemaining = () => {
  const cells = getEffect().getCells()
  let count = 0
  for (let i = 0; i < cells.length; i++) {
    if (isCellSolid(cells, i)) count++
  }
  return count
}

const onHitCell = hit => {
  const broken = shatterArea(cellCenterX(hit.col), cellCenterY(hit.row), BLAST_RADIUS)
  const noteIdx = Math.max(0, Math.min(25, Math.floor((1 - ball.y / height) * 26)))
  sound.key(String.fromCharCode(97 + noteIdx))
  game.score += broken
  game.speed = Math.min(game.baseSpeed * 1.6, game.speed + game.baseSpeed * 0.01)
  const spd = Math.hypot(ball.vx, ball.vy)
  ball.vx *= game.speed / spd
  ball.vy *= game.speed / spd
}

const stepBall = dt => {
  const steps = Math.ceil((game.speed * dt) / 3)
  for (let s = 0; s < steps; s++) {
    const prevX = ball.x
    const prevY = ball.y
    ball.x += (ball.vx * dt) / steps
    ball.y += (ball.vy * dt) / steps
    if (ball.x < ball.r) {
      ball.x = ball.r
      ball.vx = Math.abs(ball.vx)
    }
    if (ball.x > width - ball.r) {
      ball.x = width - ball.r
      ball.vx = -Math.abs(ball.vx)
    }
    if (ball.y < ball.r) {
      ball.y = ball.r
      ball.vy = Math.abs(ball.vy)
    }
    const hit = layout && getEffect().getCells() && findCollision(ball.x, ball.y)
    if (hit) {
      if (Math.abs(hit.dx) / layout.charSpace > Math.abs(hit.dy) / layout.lineHeight) {
        ball.vx = Math.sign(hit.dx || -ball.vx) * Math.abs(ball.vx)
      } else {
        ball.vy = Math.sign(hit.dy || -ball.vy) * Math.abs(ball.vy)
      }
      ball.x = prevX
      ball.y = prevY
      onHitCell(hit)
      return
    }
    const paddleTop = paddle.y - paddle.cell / 2
    if (
      ball.vy > 0 &&
      ball.y + ball.r >= paddleTop &&
      prevY + ball.r <= paddleTop + 1 &&
      Math.abs(ball.x - paddle.x) <= paddle.w / 2 + ball.r
    ) {
      const offset = Math.max(-1, Math.min(1, (ball.x - paddle.x) / (paddle.w / 2)))
      const angle = (Math.PI / 3) * offset
      ball.vx = Math.sin(angle) * game.speed
      ball.vy = -Math.cos(angle) * game.speed
      ball.y = paddleTop - ball.r
      paddle.bump = 1
      sound.click({ pitch: 1.2 + Math.abs(offset) * 0.6 })
    }
    if (ball.y > height + ball.r * 4) {
      game.lives--
      sound.whoosh()
      game.status = game.lives <= 0 ? 'over' : 'ready'
      parkBall()
      return
    }
  }
}

const update = dt => {
  if (getEffect()) {
    getEffect().requestCells()
    const nextLayout = getEffect().getLayout()
    if (layout && (nextLayout.cols !== layout.cols || nextLayout.rows !== layout.rows)) {
      debris = []
      resetGame()
    }
    layout = nextLayout
    if (getEffect().getCells()) {
      remainingCells = countRemaining()
      if (
        game.status === 'playing' &&
        game.score > 0 &&
        remainingCells <= Math.max(3, (game.score + remainingCells) * 0.003)
      ) {
        game.score += shatterArea(width / 2, height / 2, Math.hypot(width, height))
        remainingCells = 0
        game.status = 'won'
        parkBall()
        sound.chime()
      }
    }
  }

  const moveDir = +!!keysDown.has('ArrowRight') - !!keysDown.has('ArrowLeft')
  if (moveDir) paddle.target += moveDir * 900 * dt
  paddle.target = Math.max(paddle.w / 2, Math.min(width - paddle.w / 2, paddle.target))
  paddle.x += (paddle.target - paddle.x) * Math.min(1, dt * 22)
  paddle.bump = Math.max(0, paddle.bump - dt * 5)

  if (game.status === 'playing') {
    stepBall(dt)
    ball.trail.unshift({ x: ball.x, y: ball.y })
    ball.trail.length = Math.min(ball.trail.length, TRAIL_LEN)
  } else {
    parkBall()
  }

  for (const p of debris) {
    p.vy += GRAVITY
    p.x += p.vx
    p.y += p.vy
    p.rot += p.vr
  }
  debris = debris.filter(p => p.y < height + 40)
}

const draw = () => {
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = props.theme === 'black' ? '#ffffff' : '#000000'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '10px andale-mono, monospace'
  for (const p of debris) {
    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rot)
    ctx.fillText(p.glyph, 0, 0)
    ctx.restore()
  }
  ctx.font = `${paddle.cell * 1.2}px andale-mono, monospace`
  const segments = Math.round(paddle.w / paddle.cell)
  for (let i = 0; i < segments; i++) {
    const px = paddle.x - paddle.w / 2 + (i + 0.5) * paddle.cell
    const curve = 1 - Math.abs(i - (segments - 1) / 2) / (segments / 2)
    ctx.fillText('▀', px, paddle.y + paddle.bump * curve * 6)
  }
  ctx.font = `${ball.r * 3}px andale-mono, monospace`
  ball.trail.forEach((pt, idx) => {
    ctx.globalAlpha = 0.5 * (1 - idx / TRAIL_LEN)
    ctx.fillText(idx < 2 ? 'o' : '·', pt.x, pt.y)
  })
  ctx.globalAlpha = 1
  if (game.status === 'playing' || game.status === 'ready') {
    ctx.fillText('●', ball.x, ball.y)
  }
}

let lastTime = 0
const loop = now => {
  const dt = Math.min(0.033, (now - (lastTime || now)) / 1000)
  lastTime = now
  if (ctx) {
    update(dt)
    draw()
  }
  raf = requestAnimationFrame(loop)
}

const onPointerMove = e => {
  paddle.target = e.clientX
}

const onPointerDown = e => {
  if (e.target.closest?.('a, button')) return
  if (e.pointerType !== 'mouse') paddle.target = e.clientX
  launch()
}

const onKeyDown = e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    keysDown.add(e.key)
    e.preventDefault()
  } else if (e.key === ' ' || e.key === 'Enter') {
    if (e.target.closest?.('a, button')) return
    e.preventDefault()
    launch()
  }
}

const onKeyUp = e => keysDown.delete(e.key)
const onBlur = () => keysDown.clear()

onMounted(() => {
  resize()
  resetGame()
  window.addEventListener('resize', resize)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', onBlur)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerdown', onPointerDown, { passive: true })
  raf = requestAnimationFrame(loop)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('blur', onBlur)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerdown', onPointerDown)
})
</script>

<template>
  <canvas
    ref="canvasEl"
    class="fixed top-0 left-0 pointer-events-none"
    aria-hidden="true"
  ></canvas>
</template>
