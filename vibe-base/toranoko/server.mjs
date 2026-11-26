// 虎の子 — 俺専用 技術アーカイブ ローカル配信サーバ。
// vibe-base ルートを配信し、'/' で toranoko/index.html を返す。
// iframe の src=/portfolio/{slug}/index.html は既存デモ実体をそのまま再利用する。
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..'); // vibe-base ルート
const INDEX = path.join(__dirname, 'index.html');
const PORT = 3100;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.woff2': 'font/woff2', '.woff': 'font/woff',
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let filePath = urlPath === '/' ? INDEX : path.join(ROOT, urlPath);

  // ディレクトリトラバーサル防止（ROOT 外アクセス禁止）
  const rel = path.relative(ROOT, filePath);
  if (filePath !== INDEX && (rel.startsWith('..') || path.isAbsolute(rel) && !filePath.startsWith(ROOT))) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(err.code === 'ENOENT' ? `404 Not Found: ${urlPath}` : `500 ${err.code}`);
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store',
    });
    res.end(content);
  });
});

function start(port) {
  server.listen(port, () => {
    console.log('\n==================================================');
    console.log('虎の子 — 俺専用 技術アーカイブ 配信中');
    console.log(`URL: http://localhost:${port}`);
    console.log('==================================================\n停止: Ctrl+C\n');
  });
  server.on('error', (e) => {
    if (e.code === 'EADDRINUSE') { console.log(`Port ${port} occupied → ${port + 1}`); start(port + 1); }
    else console.error('Server error:', e);
  });
}
start(PORT);
