import { run } from './engine/run.js'
import * as program from './program.js'
const url = new URL(location)
const params = url.searchParams
const mode = (params.get('mode') || '').toLowerCase()
const color = (params.get('color') || '').toLowerCase()
const word = (url.hash.substr(1) || params.get('word') || '').toLowerCase()
const preEl = document.querySelector('pre')
const mainEl2 = document.querySelector('main')
function fitPre() {
	if (mode === 'screensaver') { preEl.style.width = innerWidth + 'px'; preEl.style.height = innerHeight + 'px'; return }
	preEl.style.width = ''
	preEl.style.height = ''
	const lh = parseFloat(getComputedStyle(document.body).lineHeight) || 19
	const left = parseFloat(getComputedStyle(mainEl2).left) || 0
	const r = mainEl2.getBoundingClientRect()
	preEl.style.width = Math.ceil(Math.max(innerWidth, r.right + scrollX + left)) + 'px'
	preEl.style.height = Math.ceil(Math.max(innerHeight, r.bottom + scrollY + lh)) + 'px'
}
fitPre()
addEventListener('resize', fitPre)
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitPre)
run(program, { element: preEl }, { word, mode, color })
const phrases = ['Hi','Yo','Ciao','Viva','Salut','Hello','Grüezi','Cheers','Prosit','Oooooh','Olà olà','Bonjour','Namaste','Guten Tag','Buona notte','Buenas dias','I love you','Life is life','Blue is my favourite color','Pink is my favourite color','Two has three letters','Three has five letters','Five has four letters','Four has four letters','I saw a cat sleeping in a box','The fly flies and the flies fly']
for (let i = phrases.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * i); [phrases[i], phrases[j]] = [phrases[j], phrases[i]] }
let c = 0
const e = document.querySelector('.tiroir')
function swap() { c = ++c % phrases.length; e.href = 'mailto:andreas@ertdfgcvb.xyz?subject=' + phrases[c]; e.innerText = phrases[c] }
if (e) { swap(); setInterval(swap, 9000) }
document.addEventListener('keydown', ev => { if (ev.key === 'f' && document.body.requestFullscreen) document.body.requestFullscreen().catch(() => {}) })
