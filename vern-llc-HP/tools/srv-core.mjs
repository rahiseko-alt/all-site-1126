/**
Storage core for the /srv.php contract (shared by tools/serve.mjs and tests).
Mirrors srv.php: same validation, same response shapes.
*/

import fs from 'node:fs/promises'
import path from 'node:path'

export const PLAYGROUND_VERSION = '1.1'
export const RUNNER_VERSION     = '1.1'
export const MAX_SRC_BYTES      = 256 * 1024
export const DEFAULT_AUTHOR     = 'ertdfgcvb'

export function getMeta(src) {
	const author = src.match(/@author[ \t](.+)$/m)
	const title  = src.match(/@title[ \t](.+)$/m)
	const desc   = src.match(/@desc[ \t](.+)$/m)
	return {
		author : author ? author[1].trim() : '',
		title  : title  ? title[1].trim()  : '',
		desc   : desc   ? desc[1].trim()   : '',
	}
}

// Same rules as the client (play.js countLOC)
export function countLOC(src) {
	let inBlock = false
	let count = 0
	for (const line of src.split(/\r?\n/g)) {
		if (inBlock) { if (/\*\//.test(line)) inBlock = false; continue }
		if (/^\s*$/.test(line)) continue
		if (/\/\//.test(line)) continue
		if (/\/\*.*\*\//.test(line)) continue
		if (/\/\*+/.test(line)) { inBlock = true; continue }
		count++
	}
	return count
}

function fail(status, error, message) {
	return { status, json: { error, message } }
}

export async function saveProgram(dir, src) {
	if (typeof src !== 'string') return fail(400, 1, 'Missing src')
	if (Buffer.byteLength(src, 'utf8') > MAX_SRC_BYTES) return fail(413, 2, 'Program too large')
	if (countLOC(src) < 1) return fail(422, 7, 'No code')
	const m = getMeta(src)
	if (m.author === '' || m.author === DEFAULT_AUTHOR) return fail(422, 8, 'Missing @author')
	if (m.title === '') return fail(422, 9, 'Missing @title')

	const meta = { ...m, time: Date.now(), playgroundVersion: PLAYGROUND_VERSION, runnerVersion: RUNNER_VERSION }
	await fs.mkdir(dir, { recursive: true })

	// Next free number; 'wx' makes creation atomic, so collisions retry.
	const existing = (await fs.readdir(dir)).map(f => parseInt(f, 10)).filter(n => !isNaN(n))
	let base = existing.length ? Math.max(...existing) + 1 : 1
	for (let tries = 0; tries < 100; tries++, base++) {
		try {
			await fs.writeFile(path.join(dir, base + '.json'), JSON.stringify({ base: String(base), src, meta }), { flag: 'wx' })
			return { status: 200, json: { error: 0, base: String(base), meta } }
		} catch (e) {
			if (e.code !== 'EEXIST') throw e
		}
	}
	return fail(500, 3, 'Could not allocate a permalink')
}

export async function loadProgram(dir, base) {
	if (!/^\d{1,15}$/.test(String(base))) return fail(400, 1, 'Invalid base')
	try {
		const obj = JSON.parse(await fs.readFile(path.join(dir, String(base) + '.json'), 'utf8'))
		return { status: 200, json: { error: 0, base: obj.base, src: obj.src, meta: obj.meta } }
	} catch (e) {
		return fail(404, 10, 'Not found')
	}
}
