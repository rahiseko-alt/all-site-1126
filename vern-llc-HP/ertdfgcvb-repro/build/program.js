/**
 * ertdfgcvb.xyz main-page background program — reimplementation.
 *
 * Written from a full read of the original site's delivered code
 * (index.html / js.js / css/main.css, 2026-10-29) and built to run on the
 * unmodified official play.core runner (Apache-2.0, vendored in ./engine).
 * This file is an original implementation of the decoded behaviour,
 * not a copy of the author's minified source.
 *
 * Behaviour decoded from the original:
 *  - A 3-letter word (24x11 bitmap texture) is the source image. The word
 *    changes every 300 frames; its letters split-flap through the charset
 *    with a 6-frame stagger per letter, on odd frames only. The first
 *    words are ERT -> DFG -> CVB, then a shuffled dictionary follows.
 *  - pre() samples that texture through value-noise distortion
 *    (x warp 0.5, y warp 1.8, noise scale breathing with cos(time*4e-4)
 *    remapped to 1.2..0.5). Cell value = max(bilinear sample, hard pixel).
 *  - main() picks a char from one of two ramps, checkerboarded by (x+y)%2.
 *    The displayed value decays: v = 0.95 * max(texture, v) per frame.
 *  - Pointer: speed feeds a radius (r = min(r*0.75 + 0.4*speed, 20)) and an
 *    "activity" level (+0.008/frame while speed > 0.1, -0.003/frame decay).
 *    Activity between 0.3 and 0.8 (smootherstep) crossfades the two greys
 *    (120 and 90) into a randomly picked pair from a 9-colour palette.
 *    Cells at value >= 0.99 take the "hot" colour.
 *  - Cells near the pointer get their flap counter set, so menu letters
 *    under the pointer re-flap through the glyph table.
 *  - post() measures the (invisible) <main> divs, wraps their text to the
 *    column width, and writes it into the buffer over the background,
 *    preserving <a> links via beginHTML/endHTML, with split-flap entry:
 *    a cell with flap counter > 1 counts down showing a cycling glyph,
 *    at 1 it cycles until it reaches its target char. Separators: a
 *    vertical "│" left of each column in cols mode, a horizontal "─"
 *    above each block in rows mode.
 */

export const settings = {
	fps: 60,
	renderer: 'text'
}

// Ensure links inside <pre> remain clickable even while cells under the
// pointer are actively split-flapping (which rewrites row innerHTML at 60fps).
if (typeof window !== 'undefined' && typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
	if ('ontouchstart' in window) {
		document.addEventListener('touchstart', ev => {
			const a = ev.target && ev.target.closest ? ev.target.closest('a') : ev.target
			if (a && a.href) {
				ev.preventDefault()
				location.href = a.href
			}
		})
	} else {
		document.addEventListener('mousedown', ev => {
			if (ev.button !== 0) return
			const a = ev.target && ev.target.closest ? ev.target.closest('a') : ev.target
			if (a && a.href) {
				ev.preventDefault()
				if (a.target === '_blank') window.open(a.href)
				else location.href = a.href
			}
		})
	}
}

// ---------------------------------------------------------------- texture
const GLYPH_W = 8, GLYPH_H = 11, WORD_LEN = 3
const CHARSET = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

// Build 8x11 bitmaps for A-Z0-9 (+space) by rasterising a bold monospace
// font on an offscreen canvas at runtime (no font files involved).
const glyphs = {}
function buildGlyphs() {
	const cv = document.createElement('canvas')
	cv.width = GLYPH_W; cv.height = GLYPH_H
	const cx = cv.getContext('2d', { willReadFrequently: true })
	cx.font = `700 ${GLYPH_H}px ui-monospace, Menlo, monospace`
	cx.textBaseline = 'top'
	for (const ch of CHARSET) {
		cx.clearRect(0, 0, GLYPH_W, GLYPH_H)
		if (ch !== ' ') cx.fillText(ch, 0, 0)
		const d = cx.getImageData(0, 0, GLYPH_W, GLYPH_H).data
		const bits = new Float32Array(GLYPH_W * GLYPH_H)
		for (let i = 0; i < bits.length; i++) bits[i] = d[i * 4 + 3] > 100 ? 1 : 0
		glyphs[ch] = bits
	}
}
buildGlyphs()

const TEX_W = GLYPH_W * WORD_LEN, TEX_H = GLYPH_H
const texture = new Float32Array(TEX_W * TEX_H)
function stampWord(word) {
	texture.fill(0)
	for (let i = 0; i < WORD_LEN; i++) {
		const g = glyphs[word[i]] || glyphs[' ']
		for (let y = 0; y < GLYPH_H; y++)
			for (let x = 0; x < GLYPH_W; x++)
				texture[x + i * GLYPH_W + y * TEX_W] = g[x + y * GLYPH_W]
	}
}
function texGet(x, y) {
	return (x < 0 || y < 0 || x >= TEX_W || y >= TEX_H) ? 0 : texture[x + y * TEX_W]
}
function texSample(u, v) {
	const fx = u * TEX_W - 0.5, fy = v * TEX_H - 0.5
	const ax = Math.floor(fx), ay = Math.floor(fy), tx = fx - ax, ty = fy - ay
	const top = lerp(texGet(ax, ay), texGet(ax + 1, ay), tx)
	const bot = lerp(texGet(ax, ay + 1), texGet(ax + 1, ay + 1), tx)
	return lerp(top, bot, ty)
}

// Word rotation with split-flap letters (decoded timings).
const DICT = ('cat dog sun sky sea art code play text node wave flux glow zoom jazz quiz ' +
	'wolf bear lion fish bird tree leaf rock sand snow rain wind fire star moon mars venus ' +
	'pixel vector raster shader kernel binary analog digital signal static cosmic atomic ' +
	'neon laser ultra hyper mega nano pico femto mono dual trio quad penta hexa octa deca').split(' ')
for (let i = DICT.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [DICT[i], DICT[j]] = [DICT[j], DICT[i]] }
const WORDS = ['ert', 'dfg', 'cvb', ...DICT]
let wordIdx = 0
const curLetter = [0, 0, 0], targetLetter = [0, 0, 0], letterWait = [0, 0, 0]
function updateWord(frame, forced) {
	if (frame % 300 === 0) {
		let w = null
		if (typeof forced === 'string' && forced.length === WORD_LEN &&
			[...forced.toUpperCase()].every(c => CHARSET.includes(c))) w = forced.toUpperCase()
		else w = WORDS[wordIdx % WORDS.length].toUpperCase()
		wordIdx++
		for (let i = 0; i < WORD_LEN; i++) {
			targetLetter[i] = CHARSET.indexOf(w[i])
			letterWait[i] = 6 * i
		}
	}
	if (frame % 2 === 1) {
		for (let i = 0; i < WORD_LEN; i++) {
			if (letterWait[i] > 0) letterWait[i]--
			else if (curLetter[i] !== targetLetter[i]) curLetter[i] = (curLetter[i] + 1) % CHARSET.length
		}
		stampWord(curLetter.map(n => CHARSET[n]).join(''))
	}
}

// ------------------------------------------------------------------ noise
// Value noise with a shuffled permutation table (classic technique).
const PERM = new Uint8Array(512), GRAD = new Float32Array(256)
{
	const p = [...Array(256).keys()]
	for (let i = 255; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [p[i], p[j]] = [p[j], p[i]] }
	for (let i = 0; i < 512; i++) PERM[i] = p[i & 255]
	for (let i = 0; i < 256; i++) GRAD[i] = Math.random()
}
function smoother(t) { return t * t * t * (t * (t * 6 - 15) + 10) }
function noise2(x, y) {
	const xi = Math.floor(x), yi = Math.floor(y)
	const xf = x - xi, yf = y - yi
	const X = ((xi % 256) + 256) % 256, Y = ((yi % 256) + 256) % 256
	const X1 = (X + 1) & 255, Y1 = (Y + 1) & 255
	const v00 = GRAD[PERM[PERM[X] + Y]], v10 = GRAD[PERM[PERM[X1] + Y]]
	const v01 = GRAD[PERM[PERM[X] + Y1]], v11 = GRAD[PERM[PERM[X1] + Y1]]
	const u = smoother(xf), v = smoother(yf)
	return lerp(lerp(v00, v10, u), lerp(v01, v11, u), v)
}

// ---------------------------------------------------------------- helpers
function lerp(a, b, t) { return a + (b - a) * t }
function clamp(v, a, b) { return Math.min(b, Math.max(a, v)) }
function hexRGB(hex) { return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)] }
function toHex([r, g, b]) { return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('') }
function lerpColor(c1, c2, t) { return toHex([lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)]) }

const PALETTE = ['#00aaaa', '#aa0000', '#aa5500', '#5555ff', '#55ff55', '#55ffff', '#ff5555', '#ff55ff', '#ffffff'].map(hexRGB)
const GREY_HI = [120, 120, 120], GREY_LO = [90, 90, 90]

// Character ramps (checkerboard pair). The last slot of each ramp is a
// special symbol that slowly flaps to the next pair, as in the original.
const SPECIALS = [['*', '*'], ['+', '·'], ['•', ':'], ['π', '~'], ['#', '*'], ['@', '!'], ['*', '✦']]
const rampA = ' .·•-+=:;*ABC0123!'.split('')
const rampB = ' ·-•~+:*abcXYZ'.split('')
let specialIdx = 0
const GLYPH_TABLE = ' .,·-•─~+:;=*π\'""┐┌┘└┼├┤┴┬│╗╔╝╚╬╠╣╩╦║░▒▓█▄▀▌▐■!?&#$@abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%()'.split('')
const glyphIndex = ch => { const i = GLYPH_TABLE.indexOf(ch); return i < 0 ? 0 : i }

// ------------------------------------------------------------------ state
let cells = [], cols = 0, rows = 0
let radiusSq = 0, activity = 0, scale = 0
let palA = PALETTE[0], palB = PALETTE[1]
let colorHi = '#787878', colorLo = '#5a5a5a'
let lastFontSizeChange = '1'

function syncMetrics(context) {
	if (typeof document === 'undefined' || !context || !context.metrics) return
	const el = context.settings && context.settings.element
	if (!el || typeof getComputedStyle !== 'function') return
	const style = getComputedStyle(el)
	const fontFamily = style.getPropertyValue('font-family')
	const fontSize = parseFloat(style.getPropertyValue('font-size')) || 16
	const lineHeight = parseFloat(style.getPropertyValue('line-height')) || 19
	let cellWidth = context.metrics.cellWidth
	if (el.nodeName === 'CANVAS') {
		const ctx = el.getContext('2d')
		ctx.font = fontSize + 'px ' + fontFamily
		cellWidth = ctx.measureText(''.padEnd(50, 'X')).width / 50
	} else if (typeof el.appendChild === 'function') {
		const span = document.createElement('span')
		el.appendChild(span)
		span.innerHTML = ''.padEnd(50, 'X')
		const measured = span.getBoundingClientRect().width / 50
		el.removeChild(span)
		if (measured > 0) cellWidth = measured
	}
	if (!Number.isFinite(cellWidth) || cellWidth <= 0) cellWidth = fontSize * 0.6
	context.metrics.fontFamily = fontFamily
	context.metrics.fontSize = fontSize
	context.metrics.lineHeight = lineHeight
	context.metrics.cellWidth = cellWidth
	context.metrics.aspect = cellWidth / lineHeight
}

function initCells(context, withBootFlap = false) {
	cols = (Number.isFinite(context.cols) && context.cols > 0) ? context.cols : 0
	rows = (Number.isFinite(context.rows) && context.rows > 0) ? context.rows : 0
	cells = new Array(cols * rows)
	for (let y = 0; y < rows; y++)
		for (let x = 0; x < cols; x++)
			cells[x + y * cols] = { src: 0, v: 0, flap: withBootFlap ? Math.floor(x / 3 + 2 * y) + 2 : 0, glyph: 0, it: 0, lt: 0 }
}

export function boot(context, buffer, userData) {
	if (context.metrics && (!Number.isFinite(context.metrics.lineHeight) || context.metrics.lineHeight <= 0 || !Number.isFinite(context.metrics.cellWidth) || context.metrics.cellWidth <= 0)) {
		syncMetrics(context)
	}
	initCells(context, true)
	stampWord('ERT')
}

// -------------------------------------------------------------------- pre
export function pre(context, cursor, buffer, userData) {
	if (context.metrics && (!Number.isFinite(context.metrics.lineHeight) || context.metrics.lineHeight <= 0 || !Number.isFinite(context.metrics.cellWidth) || context.metrics.cellWidth <= 0)) {
		syncMetrics(context)
	}
	if (typeof document !== 'undefined' && document.body && typeof getComputedStyle === 'function') {
		const fsc = getComputedStyle(document.body).getPropertyValue('--font-size-change').trim()
		if (fsc && fsc !== lastFontSizeChange) {
			lastFontSizeChange = fsc
			syncMetrics(context)
		}
	}
	if (context.cols !== cols || context.rows !== rows) initCells(context, false)

	// Pointer dynamics (decoded constants)
	const speed = Math.hypot(cursor.x - cursor.p.x, cursor.y - cursor.p.y)
	radiusSq = Math.min(radiusSq * 0.75 + 0.4 * speed, 20)
	if (speed > 0.1) activity = Math.min(activity + 0.008, 1)
	if (activity < 0.3) {
		palA = PALETTE[Math.floor(Math.random() * PALETTE.length)]
		do { palB = PALETTE[Math.floor(Math.random() * PALETTE.length)] } while (palB === palA)
	}

	// Colours
	if (userData.color === 'white') {
		colorHi = '#ffffff'; colorLo = '#d3d3d3'
	} else if (userData.color) {
		if (context.frame % 2000 === 0) {
			palA = PALETTE[Math.floor(Math.random() * PALETTE.length)]
			palB = PALETTE[Math.floor(Math.random() * PALETTE.length)]
		}
		colorHi = lerpColor(hexRGB(colorHi === '#787878' ? '#787878' : colorHi), palA, 0.01)
		colorLo = lerpColor(hexRGB(colorLo === '#5a5a5a' ? '#5a5a5a' : colorLo), palB, 0.01)
	} else {
		const t0 = clamp((activity - 0.3) / (0.8 - 0.3), 0, 1)
		const f = t0 * t0 * t0 * (t0 * (t0 * 6 - 15) + 10)
		colorHi = lerpColor(GREY_HI, palA, f)
		colorLo = lerpColor(GREY_LO, palB, f)
	}
	activity = Math.max(activity - 0.003, 0)

	// Special symbol cycling at the end of both ramps
	if (activity >= 1 || (userData.mode === 'screensaver' && context.frame % 3000 === 0)) {
		specialIdx = Math.floor(Math.random() * SPECIALS.length)
		activity = Math.min(activity, 0.999)
	}
	for (const [ramp, k] of [[rampA, 0], [rampB, 1]]) {
		const target = SPECIALS[specialIdx][k]
		if (ramp[ramp.length - 1] !== target) {
			const cur = glyphIndex(ramp[ramp.length - 1])
			ramp[ramp.length - 1] = GLYPH_TABLE[(cur + 1) % GLYPH_TABLE.length]
		}
	}

	// Texture sampling through noise
	updateWord(context.frame, userData.word)
	const targetScale = context.cols < 80 ? 1.3 : 0.8
	scale += 0.01 * (targetScale - scale)
	const aspect = context.metrics.aspect
	const texAspect = (TEX_W / TEX_H) / aspect
	let l, u
	if (texAspect < context.cols / context.rows) { l = 1 / context.rows / texAspect / scale; u = 1 / context.rows / scale }
	else { l = 1 / context.cols / scale; u = 1 / context.cols * texAspect / scale }
	const f = 0.0004 * context.time
	const s = 1.2 + ((Math.cos(f) + 1) / 2) * (0.5 - 1.2)
	for (let y = 0; y < rows; y++) {
		for (let x = 0; x < cols; x++) {
			const c = l * (x - 0.5 * cols) + 0.5
			const h = u * (y - 0.5 * rows) + 0.5
			const d = c + 0.5 * (noise2(c * s + f, h * s) - 0.5)
			const p = h + 1.8 * (noise2(c * s, h * s + f) - 0.5)
			const cell = cells[x + y * cols]
			cell.src = Math.max(texSample(d, p), texGet(Math.floor(d * TEX_W), Math.floor(p * TEX_H)))
		}
	}
}

// ------------------------------------------------------------------- main
export function main(coord, context, cursor, buffer) {
	const cell = cells[coord.index]
	const i = Math.max(cell.src, cell.v)

	const dx = (coord.x - cursor.x) * context.metrics.aspect
	const dy = coord.y - cursor.y
	if (dx * dx + dy * dy < radiusSq) {
		cell.lt = glyphIndex(' ') + Math.floor(radiusSq - (dx * dx + dy * dy))
		cell.it = 1
	}
	cell.v = 0.95 * i

	const ramp = ((coord.x + coord.y) % 2 === 0) ? rampB : rampA
	return {
		char: ramp[Math.floor(i * (ramp.length - 1))],
		color: i >= 0.99 ? colorHi : colorLo
	}
}

// ------------------------------------------------------------------- post
const mainEl = () => document.querySelector('main')

function collectTokens(el) {
	const tokens = []
	const walk = node => {
		for (const child of node.childNodes) {
			if (child.nodeType === Node.TEXT_NODE) {
				const text = child.textContent.replace(/\s+/g, ' ').trim()
				if (text) tokens.push({ text, tag: child.parentNode.tagName, link: null })
			} else if (child.nodeType === Node.ELEMENT_NODE) {
				if (child.tagName === 'BR') tokens.push({ br: true })
				else if (child.tagName === 'A') {
					const text = child.textContent.replace(/\s+/g, ' ').trim()
					if (text) tokens.push({
						text, tag: 'A',
						link: {
							href: child.getAttribute('href'),
							target: child.getAttribute('target'),
							flap: child.dataset && child.dataset.flap ? 1 : 0
						}
					})
				} else walk(child)
			}
		}
	}
	walk(el)
	return tokens
}

function wrapTokens(tokens, width) {
	// Returns rows of {ch, link} cells, following the original's word wrap.
	const rowsOut = []
	let row = []
	const pushWord = (word, link) => {
		if (word.length > width) word = word.slice(0, width)
		if (row.length > 0 && row.length + 1 + word.length > width) { rowsOut.push(row); row = [] }
		if (row.length > 0) {
			const prevLink = row[row.length - 1].link
			row.push({ ch: ' ', link: (link && prevLink === link) ? link : null })
		}
		for (const ch of word) row.push({ ch, link })
	}
	for (const tok of tokens) {
		if (tok.br) { rowsOut.push(row); row = []; continue }
		for (const word of tok.text.split(' ')) if (word) pushWord(word, tok.link)
	}
	if (row.length) rowsOut.push(row)
	return rowsOut
}

export function post(context, cursor, buffer, userData) {
	if (userData.mode === 'screensaver') return
	const m = mainEl()
	if (!m) return
	const metrics = context.metrics
	const preRect = context.settings.element.getBoundingClientRect()
	const mode = (typeof document !== 'undefined' && document.body ? getComputedStyle(document.body).getPropertyValue('--display-mode').trim() : '') || 'cols'
	const divs = [...m.querySelectorAll(':scope > div')]
	const blocks = []
	let contentBottom = 0

	for (const div of divs) {
		const r = div.getBoundingClientRect()
		const x = Math.round((r.left - preRect.left) / metrics.cellWidth)
		const y = Math.round((r.top - preRect.top) / metrics.lineHeight)
		const w = Math.max(1, Math.round(r.width / metrics.cellWidth))
		const wrapped = wrapTokens(collectTokens(div), w)
		blocks.push({ x, y, w, wrapped })
		contentBottom = Math.max(contentBottom, y + wrapped.length)
	}

	// Separators
	for (const b of blocks) {
		if (mode === 'rows') {
			for (let x = 0; x < b.w; x++) setOverlay(buffer, b.x + x, b.y - 1, { ch: '─' }, context)
		} else {
			for (let y = 0; y < contentBottom; y++) setOverlay(buffer, b.x - 1, y, { ch: '│' }, context)
		}
	}

	// Text with split-flap
	for (const b of blocks) {
		b.wrapped.forEach((rowCells, ri) => {
			rowCells.forEach((cell, ci) => {
				const prev = rowCells[ci - 1], next = rowCells[ci + 1]
				const flags = {
					first: !!cell.link && (!prev || prev.link !== cell.link),
					last: !!cell.link && (!next || next.link !== cell.link)
				}
				setOverlay(buffer, b.x + ci, b.y + ri, cell, context, flags)
			})
		})
	}
}

function setOverlay(buffer, x, y, cell, context, flags = {}) {
	if (x < 0 || y < 0 || x >= context.cols || y >= context.rows) return
	const idx = x + y * context.cols
	const s = cells[idx]
	if (!s) return
	if (cell.ch === '─' || cell.ch === '│') {
		buffer[idx] = { char: cell.ch }
		return
	}
	// Split-flap state machine (decoded): flap counter from boot/cursor,
	// link cells flagged data-flap keep a minimum of 1.
	s.it = Math.max(s.it, (cell.link && cell.link.flap) ? 1 : 0, s.flap || 0)
	s.flap = 0
	let display = cell.ch
	if (s.it === 1) {
		if (s.lt !== glyphIndex(cell.ch)) {
			display = GLYPH_TABLE[s.lt % GLYPH_TABLE.length]
			s.lt = (s.lt + 1) % GLYPH_TABLE.length
		} else s.it = 0
	} else if (s.it > 1) {
		s.it--
		display = GLYPH_TABLE[s.lt % GLYPH_TABLE.length]
	}
	const out = { char: display }
	if (cell.link && flags.first) {
		out.beginHTML = `<a href='${cell.link.href}'${cell.link.target ? ` target='${cell.link.target}'` : ''}>`
	}
	if (cell.link && flags.last) out.endHTML = '</a>'
	buffer[idx] = out
}
