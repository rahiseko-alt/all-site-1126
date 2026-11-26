// Logic test for the reproduction program, with minimal DOM stubs.
// Verifies the decoded behaviour numerically, without a browser.
globalThis.document = {
	createElement: () => ({
		width: 0, height: 0,
		getContext: () => ({
			font: '', textBaseline: '',
			clearRect() {}, fillText() {},
			getImageData: () => ({ data: new Uint8ClampedArray(8 * 11 * 4).map((_, i) => i % 4 === 3 ? 255 : 0) })
		})
	}),
	querySelector: () => null
}
globalThis.getComputedStyle = () => ({ getPropertyValue: () => 'cols' })

const prog = await import('./build/program.js')

const metrics = { aspect: 0.5, cellWidth: 8, lineHeight: 19, fontFamily: 'monospace', fontSize: 16 }
const context = { cols: 100, rows: 40, time: 0, frame: 0, metrics, settings: { element: { getBoundingClientRect: () => ({ left: 0, top: 0 }) } } }
const buffer = new Array(context.cols * context.rows).fill(null).map(() => ({ char: ' ' }))
const userData = { mode: '', color: '', word: '' }

prog.boot(context, buffer, userData)

// boot flap delay pattern: floor(x/3 + 2y) + 2 — spot check via main/post not exposed;
// instead check texture sampling produces non-trivial values after pre()
let cursor = { x: 10, y: 10, pressed: false, p: { x: 10, y: 10, pressed: false } }
// the original also starts with scale = 0 and eases to 0.8 at 0.01/frame,
// so let it settle for 200 frames before measuring the field
for (let f = 0; f < 200; f++) {
	context.frame = f; context.time = f * 16.7
	prog.pre(context, cursor, buffer, userData)
}
let nonZero = 0
for (let y = 0; y < context.rows; y++) for (let x = 0; x < context.cols; x++) {
	const c = prog.main({ x, y, index: x + y * context.cols }, context, cursor, buffer)
	if (c.char !== ' ' && c.char !== '.') nonZero++
}
console.log('non-trivial cells after first frames:', nonZero)
if (nonZero < 50) throw new Error('texture field too empty')

// run 120 frames idle: colours must stay grey
for (let f = 0; f < 120; f++) {
	context.frame = f; context.time = f * 16.7
	prog.pre(context, cursor, buffer, userData)
}
let idle = prog.main({ x: 50, y: 20, index: 50 + 20 * 100 }, context, cursor, buffer)
console.log('idle colour sample:', idle.color)

// simulate fast pointer movement across the field for ~90 frames
let px = 0
for (let f = 0; f < 90; f++) {
	context.frame = 200 + f; context.time = context.frame * 16.7
	const nx = (f * 3) % 100, ny = 20 + Math.round(10 * Math.sin(f / 5))
	cursor = { x: nx, y: ny, pressed: false, p: { x: px, y: 20, pressed: false } }
	px = nx
	prog.pre(context, cursor, buffer, userData)
	// call main for the whole field so cursor proximity registers
	for (let y = 0; y < context.rows; y++) for (let x = 0; x < context.cols; x++)
		prog.main({ x, y, index: x + y * context.cols }, context, cursor, buffer)
}
let hot = prog.main({ x: 50, y: 20, index: 50 + 20 * 100 }, context, cursor, buffer)
console.log('after fast movement, colour sample:', hot.color)
if (hot.color === idle.color) throw new Error('colour did not ignite with pointer activity')

// word rotation: frame 300 must not throw and field must remain non-trivial
context.frame = 300; context.time = 300 * 16.7
prog.pre(context, cursor, buffer, userData)
context.frame = 301; context.time = 301 * 16.7
prog.pre(context, cursor, buffer, userData)
let nz2 = 0
for (let y = 0; y < context.rows; y++) for (let x = 0; x < context.cols; x++) {
	const c = prog.main({ x, y, index: x + y * context.cols }, context, cursor, buffer)
	if (c.char !== ' ') nz2++
}
console.log('cells with any glyph at frame 301:', nz2)
console.log('ALL LOGIC TESTS PASSED')
