<?php
/**
 * /srv.php — playground storage API (new implementation of the public contract).
 *
 *   POST {"io":"i","src":"..."}  -> {"error":0,"base":"<n>","meta":{...}}
 *   POST {"io":"o","base":"<n>"} -> {"error":0,"base":"<n>","src":"...","meta":{...}}
 *
 * Programs are stored as one JSON file per base in DATA_DIR, which must be
 * outside the web root (or denied by the web server) so nothing is ever
 * served back as HTML/JS directly. Same rules as tools/srv-core.mjs.
 */

const PLAYGROUND_VERSION = '1.1';
const RUNNER_VERSION     = '1.1';
const MAX_SRC_BYTES      = 262144; // 256 KB
const MAX_BODY_BYTES     = 524288;
const DEFAULT_AUTHOR     = 'ertdfgcvb';
define('DATA_DIR', getenv('PLAY_DATA_DIR') ?: __DIR__ . '/../play-data/programs');

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function out($status, $obj) {
	http_response_code($status);
	echo json_encode($obj, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
	exit;
}

function meta_of($src) {
	$m = [];
	foreach (['author', 'title', 'desc'] as $k) {
		$m[$k] = preg_match('/@' . $k . '[ \t](.+)$/m', $src, $r) ? trim($r[1]) : '';
	}
	return $m;
}

function count_loc($src) {
	$in = false; $n = 0;
	foreach (preg_split('/\r?\n/', $src) as $line) {
		if ($in) { if (preg_match('/\*\//', $line)) $in = false; continue; }
		if (preg_match('/^\s*$/', $line)) continue;
		if (preg_match('/\/\//', $line)) continue;
		if (preg_match('/\/\*.*\*\//', $line)) continue;
		if (preg_match('/\/\*+/', $line)) { $in = true; continue; }
		$n++;
	}
	return $n;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(405, ['error' => 1, 'message' => 'POST only']);

$raw = file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
if (strlen($raw) > MAX_BODY_BYTES) out(413, ['error' => 2, 'message' => 'Payload too large']);
$body = json_decode($raw, true);
if (!is_array($body)) out(400, ['error' => 1, 'message' => 'Invalid JSON']);

if (!is_dir(DATA_DIR)) mkdir(DATA_DIR, 0750, true);

$io = $body['io'] ?? '';

if ($io === 'i') {
	$src = $body['src'] ?? null;
	if (!is_string($src))               out(400, ['error' => 1, 'message' => 'Missing src']);
	if (strlen($src) > MAX_SRC_BYTES)   out(413, ['error' => 2, 'message' => 'Program too large']);
	if (count_loc($src) < 1)            out(422, ['error' => 7, 'message' => 'No code']);
	$m = meta_of($src);
	if ($m['author'] === '' || $m['author'] === DEFAULT_AUTHOR) out(422, ['error' => 8, 'message' => 'Missing @author']);
	if ($m['title'] === '')             out(422, ['error' => 9, 'message' => 'Missing @title']);

	$meta = $m + [
		'time'              => (int) round(microtime(true) * 1000),
		'playgroundVersion' => PLAYGROUND_VERSION,
		'runnerVersion'     => RUNNER_VERSION,
	];

	$max = 0;
	foreach (glob(DATA_DIR . '/*.json') as $f) $max = max($max, (int) basename($f, '.json'));
	for ($base = $max + 1, $t = 0; $t < 100; $t++, $base++) {
		$fh = @fopen(DATA_DIR . "/$base.json", 'x'); // atomic create
		if ($fh === false) continue;
		fwrite($fh, json_encode(['base' => (string) $base, 'src' => $src, 'meta' => $meta], JSON_UNESCAPED_UNICODE));
		fclose($fh);
		out(200, ['error' => 0, 'base' => (string) $base, 'meta' => $meta]);
	}
	out(500, ['error' => 3, 'message' => 'Could not allocate a permalink']);
}

if ($io === 'o') {
	$base = (string) ($body['base'] ?? '');
	if (!preg_match('/^\d{1,15}$/', $base)) out(400, ['error' => 1, 'message' => 'Invalid base']);
	$file = DATA_DIR . "/$base.json";
	if (!is_file($file)) out(404, ['error' => 10, 'message' => 'Not found']);
	$obj = json_decode(file_get_contents($file), true);
	out(200, ['error' => 0, 'base' => $obj['base'], 'src' => $obj['src'], 'meta' => $obj['meta']]);
}

out(400, ['error' => 1, 'message' => 'Unknown io']);
