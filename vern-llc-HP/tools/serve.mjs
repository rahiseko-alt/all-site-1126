/**
Local server for the playground (zero dependencies, Node >= 18).

- Serves the site statically (ES modules + fetch need http://, not file://).
- Implements the /srv.php contract (spec §8.3) so Share and permalinks work
  locally exactly like on the PHP host:

    POST /srv.php  {"io":"i","src":"..."}  -> {"error":0,"base":"<n>","meta":{...}}
    POST /srv.php  {"io":"o","base":"<n>"} -> {"error":0,"base":"<n>","src":"...","meta":{...}}

Programs are stored as one JSON file per base in ./data/programs/ (outside the
web root of the static handler: /data is never served).

Usage:  node tools/serve.mjs [port]
*/

import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { saveProgram, loadProgram } from './srv-core.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PORT = Number(process.argv[2] || process.env.PORT || 8000)

const MIME = {
	'.html' : 'text/html; charset=utf-8',
	'.js'   : 'text/javascript; charset=utf-8',
	'.mjs'  : 'text/javascript; charset=utf-8',
	'.css'  : 'text/css; charset=utf-8',
	'.json' : 'application/json; charset=utf-8',
	'.png'  : 'image/png',
	'.svg'  : 'image/svg+xml',
	'.ico'  : 'image/x-icon',
	'.txt'  : 'text/plain; charset=utf-8',
	'.md'   : 'text/plain; charset=utf-8',
}

// Only these top-level entries are publicly served.
const PUBLIC = new Set(['index.html', 'abc.html', 'lsd.html', 'css', 'lib', 'src', 'ico', 'tests', 'LICENSE'])

const MAX_BODY = 512 * 1024

function sendJSON(res, status, obj) {
	res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
	res.end(JSON.stringify(obj))
}

async function handleSrv(req, res) {
	if (req.method !== 'POST') return sendJSON(res, 405, { error: 1, message: 'POST only' })
	let size = 0
	const chunks = []
	for await (const c of req) {
		size += c.length
		if (size > MAX_BODY) return sendJSON(res, 413, { error: 2, message: 'Payload too large' })
		chunks.push(c)
	}
	let body
	try {
		body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
	} catch (e) {
		return sendJSON(res, 400, { error: 1, message: 'Invalid JSON' })
	}
	const dataDir = path.join(ROOT, 'data', 'programs')
	const result = body && body.io === 'i' ? await saveProgram(dataDir, body.src)
	             : body && body.io === 'o' ? await loadProgram(dataDir, body.base)
	             : { status: 400, json: { error: 1, message: 'Unknown io' } }
	sendJSON(res, result.status, result.json)
}

async function handleStatic(req, res) {
	const url = new URL(req.url, 'http://localhost')
	let rel = decodeURIComponent(url.pathname).replace(/^\/+/, '')
	if (rel === '') rel = 'index.html'
	const top = rel.split('/')[0]
	const file = path.normalize(path.join(ROOT, rel))
	if (!PUBLIC.has(top) || !file.startsWith(ROOT + path.sep)) {
		res.writeHead(404); return res.end('Not found')
	}
	try {
		const stat = await fs.stat(file)
		if (stat.isDirectory()) { res.writeHead(404); return res.end('Not found') }
		const data = await fs.readFile(file)
		res.writeHead(200, {
			'Content-Type'  : MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
			'Cache-Control' : 'no-cache',
		})
		res.end(data)
	} catch (e) {
		res.writeHead(404); res.end('Not found')
	}
}

http.createServer((req, res) => {
	const pathname = req.url.split('?')[0]
	if (pathname === '/srv.php') return handleSrv(req, res).catch(err => {
		console.error(err)
		sendJSON(res, 500, { error: 3, message: 'Server error' })
	})
	return handleStatic(req, res)
}).listen(PORT, '127.0.0.1', () => {
	console.log(`Playground: http://localhost:${PORT}/`)
})
