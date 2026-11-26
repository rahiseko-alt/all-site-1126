/**
Playground — site wiring (reproduction of /src/play.js, Playground 1.1)

Connects the CodeMirror editor, the double <iframe> output buffer, the router
(hash URLs), local / remote storage, bang commands and the build-error display.
The runner itself is play.core (Apache License 2.0), vendored unmodified in /src.
*/

import { saveSourceAsFile } from '/src/modules/filedownload.js'
import { RUNNER_VERSION } from '/src/run.js?20220625075245'

// -- Constants ----------------------------------------------------------------

const PLAYGROUND_VERSION     = '1.1'
const RUNNER_LOCATION        = '/src/run.js?20220625075245'
const SAMPLE_FOLDER_LOCATION = '/src/programs/'
const HELP_LOCATION          = '/abc.html'
const LSD_LOCATION           = '/lsd.html'
const SERVER_PATH            = '/srv.php'
const REMOTE_PREFIX          = '/#/'
const LOCAL_PREFIX           = '/#/local/'
const PROGRAM_PREFIX         = '/#/src/'
const DEFAULT_SCRIPT         = 'basics/coordinates_xy'
const DEFAULT_AUTHOR         = 'ertdfgcvb'

const LOCAL_STORAGE_KEY_PREFIX      = 'local_'
const LOCAL_STORAGE_KEY_REMOTE_INFO = 'remoteInfo'

const BUILD_ERROR_TIMEOUT    = 800   // error display delay in immediate mode
const BANG_COMMAND_TIMEOUT   = 200   // delay before a ?bang is executed
const ERROR_SUPPORT_TIMEOUT  = 1600  // WebKit bug 218284 notice

// -- Messages (alert / confirm) -----------------------------------------------

const CONFIRM = beautify({
	new        : 'Do you want to open a new project?\nAll changes will be lost.',
	remoteSave : 'Do you want to save a new version of this script?\nThis page will be redirected to a new permalink after save.',
})

const ALERTS = beautify({
	localSave        : 'The program has been saved locally!\nYou can access it trought the current URL.\nSee the manual for more options.',
	couldntSaveLocal : 'Couldn’t save locally!',
	immediateOn      : 'Immediate mode is ON.',
	immediateOff     : 'Immediate mode is OFF.',
	noCode           : 'There seems to be no code to run or to save.',
	noOutput         : 'The code doesn’t seem to generate any output.',
	noAuthor         : 'Please insert an @author tag\nfollowed by a name different from “ertdfgcvb”.',
	noTitle          : 'Please insert a @title tag\nfollowed by a title.',
	couldntUpload    : 'Couldn’t upload!',
	fullscreenError  : 'Fullscreen request denied!',
	contentCopyWarn  : 'Please click on the output area and try again.\nNOTE: Works only with the hotkey combo.',
	versionMismatch  : `
The program has been saved on a different version of the plaground:
Playground version: ${PLAYGROUND_VERSION}
Runner version: ${RUNNER_VERSION}
Save the program again to dismiss this alert.
Please refer to the changelog (link in manual) for eventual compatibility issues.
`,
})

// Pads every message to the same height so the native modal doesn't jump.
function beautify(obj) {
	Object.keys(obj).forEach(k => {
		obj[k] = obj[k].trim()
		const nl = obj[k].match(/\n/g)
		const pad = 6 - (nl ? nl.length : 0)
		obj[k] = '\n' + obj[k] + ''.padStart(pad, '\n')
	})
	return obj
}

// -- Storage helpers ----------------------------------------------------------

const storage = {
	store(key, obj) {
		try {
			localStorage.setItem(key, JSON.stringify(obj))
			return true
		} catch (e) {
			return false
		}
	},
	restore(key, target = {}) {
		const obj = JSON.parse(localStorage.getItem(key))
		Object.assign(target, obj)
		return target
	},
	clear(key) {
		localStorage.removeItem(key)
	},
}

function processNetworkError(res) {
	if (!res.ok) throw Error(res.statusText)
	return res
}

// Plain file loader (examples)
const fileIO = {
	load(path) {
		return fetch(path)
			.then(processNetworkError)
			.then(res => res.text())
			.then(src => ({ error: 0, src }))
			.catch(() => { console.log('-- Offline Error --'); return { error: 6 } })
	},
}

// localStorage: one key per program
const storageIO = {
	save(obj) {
		return new Promise(resolve => {
			const key = LOCAL_STORAGE_KEY_PREFIX + obj.base
			resolve(storage.store(key, obj) ? { error: 0, ...obj } : { error: 5 })
		})
	},
	load(base) {
		return new Promise(resolve => {
			const obj = storage.restore(LOCAL_STORAGE_KEY_PREFIX + base)
			resolve(obj.src ? { error: 0, ...obj } : { error: 5 })
		})
	},
}

// Server: POST /srv.php, JSON in / JSON out
const remoteIO = {
	load(base) {
		return post({ io: 'o', base })
	},
	save(src) {
		return post({ io: 'i', src })
	},
}

function post(body) {
	return fetch(SERVER_PATH, {
		method  : 'POST',
		headers : { 'Accept': 'application/json', 'Content-Type': 'application/json' },
		body    : JSON.stringify(body),
	})
		.then(processNetworkError)
		.then(res => res.json())
		.catch(() => { console.log('-- Offline Error --'); return { error: 4 } })
}

// -- Code helpers -------------------------------------------------------------

// Rewrites every import path so that it resolves against this origin
// (the module is loaded from a blob: URL, which has no base path).
function fixPath(src) {
	const origin = location.origin
	return src.replace(/(import|from)(.*?)(\/)(.*?)(['"])/gm, '$1$2' + origin + '/$4$5')
}

let objectURL = null

// Builds the program inside the (hidden) iframe via srcdoc.
function runModule(frame, src, settings) {
	const encoder = new TextEncoder()
	const data = encoder.encode(fixPath(src))
	URL.revokeObjectURL(objectURL)
	objectURL = URL.createObjectURL(new Blob([data], { type: 'text/JavaScript' }))

	frame.srcdoc = `
		<!DOCTYPE html>
		<head>
			<meta charset="utf-8">
			<title>ascii</title>
			<link rel="stylesheet" href="/css/simple_console.css">
			<style type="text/css" media="screen">
				canvas, pre {
					font-family: "Simple Console", monospace;
					line-height: 1.2;
					position: absolute;
					left: 0;
					top: 0;
					margin: 0;
					overflow: hidden;
					width: 100%;
					height: 100%;
				}
			</style>
		</head>
		<body>
			<script type="module">
				import { copyContent } from '${RUNNER_LOCATION}'
				const p = window.parent

				addEventListener('error', e => {
					p.dispatchEvent(new CustomEvent('build', {
						detail: { status : 'error', error : e }
					}))
					e.preventDefault()
				})

				p.dispatchEvent(new CustomEvent('build', {
					detail: { status : 'started' }
				}))

				addEventListener('keydown', e => {
					if (e.key.toUpperCase() == 'C' && (e.metaKey || e.ctrlKey) && e.shiftKey) {
						const target = document.querySelector('pre')
						if (target) {
							copyContent(target)
							e.preventDefault()
						}
					} else {
						p.dispatchEvent(new KeyboardEvent('keydown', e))
					}
				})
			<\/script>
			<script type='module'>
				import * as program from '${objectURL}'
				import { run } from '${RUNNER_LOCATION}'
				const p = window.parent

				run(program, ${JSON.stringify(settings)}).then(e => {
					p.dispatchEvent(new CustomEvent('build', {
						detail: { status : 'succeded' }
					}))
				})
			<\/script>
		</body>
	`
}

function getMeta(src) {
	const author = src.match(/@author[ \t](.+)$/m)
	const title  = src.match(/@title[ \t](.+)$/m)
	const desc   = src.match(/@desc[ \t](.+)$/m)
	return {
		author : author ? author[1].trim() : '',
		title  : title  ? title[1].trim()  : '',
		desc   : desc   ? desc[1].trim()   : '',
	}
}

// Load-time bangs: !immediate on, !video night
function getBangs(src) {
	const out = {}
	const list = src.match(/!([a-z]+)[ \t]([a-z]+)/g)
	if (list !== null) {
		for (const b of list) {
			const m = b.match(/!([a-z]+)[ \t]([a-z]+)/)
			if (m.length == 3) out[m[1]] = m[2]
		}
	}
	return out
}

// Lines of code, without empty lines, single-line and block comments.
function countLOC(src) {
	const empty        = /^\s*$/
	const lineComment  = /\/\//
	const inlineBlock  = /\/\*.*\*\//
	const blockStart   = /\/\*+/
	const blockEnd     = /\*\//
	const lines = src.split(/\r?\n/g)
	let inBlock = false
	let count = 0
	for (const line of lines) {
		if (inBlock) {
			if (line.match(blockEnd)) inBlock = false
			continue
		}
		if (line.match(empty))       continue
		if (line.match(lineComment)) continue
		if (line.match(inlineBlock)) continue
		if (line.match(blockStart)) { inBlock = true; continue }
		count++
	}
	return count
}

function generateTS() {
	return Date.now()
}

// -- Router -------------------------------------------------------------------

function parseLocation() {
	const hash = location.hash
	if (!hash) return { type: 'index' }
	const local = hash.match(/#\/local\/(\d+)$/)
	if (local) return { type: 'local', base: local[1] }
	const remote = hash.match(/#\/(\d+)$/)
	if (remote) return { type: 'remote', base: remote[1] }
	const example = hash.match(/#\/src\/([a-z0-9_\/\-]+)$/)
	if (example) return { type: 'example', base: example[1] }
	return { type: 'invalid' }
}

// -- Playground ---------------------------------------------------------------

console.log(`
Playground version: ${PLAYGROUND_VERSION}
Runner version: ${RUNNER_VERSION}
`.trim())

const OUTPUT_ELEMENT = document.querySelector('#output')
const EDITOR_ELEMENT = document.querySelector('#editor')
const GRID_ELEMENT   = document.querySelector('.grid')

let editor
let renderer // undefined: the runner default ('text') is used
let immediateMode = false
let frameVisible = document.querySelector('#targetA')
let frameHidden  = document.querySelector('#targetB')

export function boot(cm) {

	editor = cm

	addEventListener('hashchange', () => load(parseLocation()))
	load(parseLocation())

	// -- ?bang commands (executed while typing) -------------------------------
	const bangs = {
		immediate : { opt : {
			on  : () => { alert(ALERTS.immediateOn);  immediateMode = true },
			off : () => { alert(ALERTS.immediateOff); immediateMode = false },
		}},
		video : { opt : {
			day   : () => setTheme('day'),
			night : () => setTheme('night'),
		}},
		new        : () => { if (confirm(CONFIRM.new)) reset() },
		help       : () => window.open(HELP_LOCATION, 'help'),
		abc        : () => window.open(HELP_LOCATION, 'help'),
		lsd        : () => window.open(LSD_LOCATION, 'lsd'),
		save       : () => saveLocal(),
		fullscreen : () => fullscreen(),
		version    : () => {},
	}

	editor.on('change', (() => {
		const re = new RegExp('\\?(\\w+)\\s?(\\w+)?')
		let timeout
		return cm => {
			const line = cm.getCursor().line
			const m = cm.getLineHandle(line).text.match(re)
			if (m) {
				clearTimeout(timeout)
				timeout = setTimeout(() => {
					const cmd = m[1]
					const opt = m[2]
					if (typeof bangs[cmd] == 'function') {
						bangs[cmd]()
					} else if (typeof bangs[cmd] == 'object' && typeof bangs[cmd].opt[opt] == 'function') {
						bangs[cmd].opt[opt]()
					}
				}, BANG_COMMAND_TIMEOUT)
			}
			if (immediateMode) {
				runModule(frameHidden, cm.getValue(), { renderer, restoreState: true })
			}
		}
	})())

	// -- Build events from the iframe -----------------------------------------
	const errorMarks = []
	let errorTimeout, supportTimeout

	function showError(msg) {
		const label = EDITOR_ELEMENT.querySelector('.error-label')
		label.classList.remove('hidden')
		label.innerText = msg
	}

	addEventListener('build', e => {
		const status = e.detail.status
		if (status == 'started') {
			clearTimeout(errorTimeout)
			clearTimeout(supportTimeout)
			supportTimeout = setTimeout(() => {
				const msg = 'Error highlighting is not (yet) supported in this browser.'
				showError(msg)
				console.warn(msg + '\nSee also: https://bugs.webkit.org/show_bug.cgi?id=218284')
			}, ERROR_SUPPORT_TIMEOUT)
		} else if (status == 'succeded') {
			clearTimeout(errorTimeout)
			clearTimeout(supportTimeout);
			// Swap the buffers
			[frameHidden, frameVisible] = [frameVisible, frameHidden]
			frameHidden.classList.remove('bring-to-front')
			frameVisible.classList.add('bring-to-front')
			frameHidden.srcdoc = ''
			errorMarks.forEach(m => m.clear())
			EDITOR_ELEMENT.querySelector('.error-label').classList.add('hidden')
		} else if (status == 'error') {
			clearTimeout(errorTimeout)
			clearTimeout(supportTimeout)
			errorTimeout = setTimeout(() => {
				const err = e.detail.error
				const line = err.lineno - 1
				const col = err.colno
				const msg = err.message
				showError(msg)
				console.warn('Program: ' + msg + ' [' + line + ':' + col + ']')
				const mark = editor.markText({ line, ch: 0 }, { line }, { className: 'syntax-error', title: msg })
				errorMarks.push(mark)
			}, immediateMode ? BUILD_ERROR_TIMEOUT : 0)
		}
	})
}

function load(loc) {
	if (loc.type == 'index' || loc.type == 'example') {
		const path = SAMPLE_FOLDER_LOCATION + (loc.base || DEFAULT_SCRIPT) + '.js'
		fileIO.load(path).then(res => {
			if (res.error === 0) {
				editor.setValue(res.src)
				runModule(frameHidden, editor.getValue(), { renderer, restoreState: false })
			} else if (loc.type == 'example') {
				reset()
			}
		})
	} else if (loc.type == 'remote') {
		remoteIO.load(loc.base).then(res => {
			if (res.error === 0) {
				editor.setValue(res.src)
				if (res.meta.runnerVersion !== RUNNER_VERSION) alert(ALERTS.versionMismatch)
				runModule(frameHidden, editor.getValue(), { renderer, restoreState: false })
			} else {
				reset()
			}
		})
	} else if (loc.type == 'local') {
		storageIO.load(loc.base).then(res => {
			if (res.error === 0) {
				const b = getBangs(res.src)
				if (b.immediate == 'on') immediateMode = true
				if (b.video == 'night') setTheme('night')
				editor.setValue(res.src)
				if ((res.meta.runnerVersion || '1.0') !== RUNNER_VERSION) alert(ALERTS.versionMismatch)
				runModule(frameHidden, editor.getValue(), { renderer, restoreState: false })
			} else {
				reset()
			}
		})
	} else if (loc.type == 'invalid') {
		reset()
	}
}

function reset() {
	history.replaceState(null, '', ' ')
	location.reload()
}

function setTheme(theme) {
	editor.setOption('theme', theme)
	const style = getComputedStyle(EDITOR_ELEMENT.querySelector('.CodeMirror'))
	EDITOR_ELEMENT.style.backgroundColor = style.backgroundColor
}

// -- Public actions (menu + hotkeys) ------------------------------------------

export function run() {
	runModule(frameHidden, editor.getValue(), { renderer, restoreState: true })
}

export function toggleImmediateMode() {
	immediateMode = !immediateMode
	alert(immediateMode ? ALERTS.immediateOn : ALERTS.immediateOff)
}

export function saveScriptToFile() {
	const src = editor.getValue()
	const name = (getMeta(src).title || 'untitled_script')
		.toLowerCase()
		.split(/[ \\,./+:]+/)
		.join('_') + '.js'
	console.log('Downloading: ' + name)
	saveSourceAsFile(src, name)
}

export function saveLocal() {
	const loc = parseLocation()
	const src = editor.getValue()
	const meta = getMeta(src)
	meta.time = generateTS()
	meta.playgroundVersion = PLAYGROUND_VERSION
	meta.runnerVersion = RUNNER_VERSION
	const obj = {
		src,
		meta,
		base : loc.type == 'local' && loc.base ? loc.base : meta.time,
	}
	storageIO.save(obj).then(res => {
		if (res.error === 0) {
			location = LOCAL_PREFIX + res.base
			alert(ALERTS.localSave)
		} else {
			alert(ALERTS.couldntSaveLocal)
		}
	})
}

export function saveRemote() {
	const src = editor.getValue()
	if (countLOC(src) < 1) {
		alert(ALERTS.noCode)
		return
	}
	const doc = frameVisible && frameVisible.contentDocument
	if (doc) {
		const pre = doc.querySelector('pre')
		const canvas = doc.querySelector('canvas')
		if (!canvas && (!pre || pre.textContent.replace(/\s+/g, '').length < 1)) {
			alert(ALERTS.noOutput)
			return
		}
	}
	const meta = getMeta(src)
	if (meta.author === '' || meta.author === DEFAULT_AUTHOR) {
		alert(ALERTS.noAuthor)
		return
	}
	if (meta.title === '') {
		alert(ALERTS.noTitle)
		return
	}
	if (!confirm(CONFIRM.remoteSave)) return
	remoteIO.save(src).then(res => {
		if (res.error === 0) {
			delete res.error
			const info = storage.restore(LOCAL_STORAGE_KEY_REMOTE_INFO)
			info[res.base] = res
			storage.store(LOCAL_STORAGE_KEY_REMOTE_INFO, info)
			location = REMOTE_PREFIX + res.base
		} else {
			alert(ALERTS.couldntUpload)
		}
	})
}

export function fullscreen() {
	if (OUTPUT_ELEMENT.requestFullscreen) {
		OUTPUT_ELEMENT.requestFullscreen().catch(() => alert(ALERTS.fullscreenError))
	} else if (OUTPUT_ELEMENT.webkitRequestFullscreen) {
		OUTPUT_ELEMENT.webkitRequestFullscreen()
	}
}

export function toggleView() {
	const g = GRID_ELEMENT.classList
	if (g.contains('three')) {
		g.remove('three'); g.add('two')
	} else if (g.contains('two')) {
		g.remove('two'); g.add('one')
	} else {
		g.remove('one'); g.add('three')
	}
}

// From the menu the copy can't reach into the iframe: the hotkey is handled
// inside the output frame instead (see runModule).
export function copyContent() {
	alert(ALERTS.contentCopyWarn)
}
