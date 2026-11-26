#!/usr/bin/env node
/**
 * toranomaki-blindtest.mjs — html-toranomaki 補完ゼロ実装テスト
 *
 * 使い方:
 *   node scripts/toranomaki-blindtest.mjs <テーマ名> <implフォルダ名>
 *
 * 例:
 *   node scripts/toranomaki-blindtest.mjs webgl-card-distortion impl-curtainsjs-8.1
 *   node scripts/toranomaki-blindtest.mjs webgl-spatial-dive impl-threejs-r128
 *
 * 判定:
 *   黒ピクセル率 95% 超 → FAIL (WebGL 未描画) → exit 1
 *   黒ピクセル率 95% 以下 → PASS               → exit 0
 */
import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, extname, resolve as resolvePath } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PNG } = require('pngjs');

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PROJECT_ROOT = resolvePath(__dirname, '..');

const [theme, impl] = process.argv.slice(2);

if (!theme || !impl) {
  console.error('使い方: node scripts/toranomaki-blindtest.mjs <テーマ名> <implフォルダ名>');
  console.error('例:   node scripts/toranomaki-blindtest.mjs webgl-card-distortion impl-curtainsjs-8.1');
  process.exit(1);
}

const implDir = resolvePath(join(PROJECT_ROOT, 'docs', 'html-toranomaki', theme, impl));

if (!existsSync(implDir)) {
  console.error(`エラー: フォルダが見つかりません → ${implDir}`);
  process.exit(1);
}

const MIME_MAP = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
};

// ローカルサーバー起動（type="module" は file:// 不可のため必須）
const server = createServer(async (req, res) => {
  const urlPath = req.url.split('?')[0];
  const filePath = resolvePath(join(implDir, urlPath === '/' ? 'index.html' : urlPath));
  if (!filePath.startsWith(implDir)) { res.writeHead(403); res.end('Forbidden'); return; }

  if (!existsSync(filePath)) {
    // favicon はブラウザが自動要求するテーマ無関係のリソース。
    // 404 にすると「JS エラー 0」基準を無害な雑音で汚すため 204 で握り潰す。
    if (urlPath === '/favicon.ico') { res.writeHead(204); res.end(); return; }
    res.writeHead(404);
    res.end('Not Found');
    return;
  }

  try {
    const content = await readFile(filePath);
    const ext = extname(filePath).toLowerCase();
    const mime = MIME_MAP[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': mime,
      'Access-Control-Allow-Origin': '*',
    });
    res.end(content);
  } catch {
    res.writeHead(500);
    res.end('Server Error');
  }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const pageUrl = `http://127.0.0.1:${port}/`;

console.log(`[blindtest] テーマ: ${theme} / impl: ${impl}`);
console.log(`[blindtest] サーバー → ${pageUrl}`);

const outputDir = join(PROJECT_ROOT, 'test-results');
await mkdir(outputDir, { recursive: true });
const screenshotPath = join(outputDir, `toranomaki-${theme}-${impl}.png`);

let exitCode = 1;

try {
  // headless:false + GPU フラグ必須（headless は WebGL 非描画）
  const browser = await chromium.launch({
    headless: false,
    args: [
      '--enable-gpu',
      '--use-gl=angle',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--disable-gpu-sandbox',
    ],
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 15000 });

  // 初期化待機（WebGL / GSAP plugin register / 初回アニメ）
  await page.waitForTimeout(3000);

  // 操作前スナップ（liveness 差分比較用・ファイル出力なし）
  const beforeBuf = await page.screenshot();

  // ── 深い操作: 各プラグインの実ハンドラを発火させる ──
  //   ScrollSmoother/ScrollTrigger → wheel、Draggable/Inertia → pointer drag、
  //   クリック起点アニメ → click。操作中に投げられた例外は interactionErrors に分離記録。
  //   page 全体の console.error/pageerror は上の consoleErrors が継続捕捉する。
  const interactionErrors = [];
  try {
    await page.mouse.move(640, 450);
    await page.mouse.wheel(0, 1400);           // 下スクロール（ScrollSmoother/Trigger）
    await page.waitForTimeout(900);
    await page.mouse.wheel(0, -1400);          // 上スクロール
    await page.waitForTimeout(600);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.mouse.move(640, 450);           // ドラッグ gesture（Draggable/Inertia）
    await page.mouse.down();
    await page.mouse.move(780, 470, { steps: 12 });
    await page.mouse.move(520, 520, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(600);
    await page.mouse.click(640, 450);          // クリック起点アニメ
    await page.waitForTimeout(900);
  } catch (e) {
    interactionErrors.push(`interaction: ${e.message}`);
  }

  // スクリーンショット取得（操作後）
  const screenshotBuffer = await page.screenshot({ path: screenshotPath });
  console.log(`[blindtest] スクリーンショット → ${screenshotPath}`);

  // pngjs で黒ピクセル率を計算
  const png = PNG.sync.read(screenshotBuffer);
  const totalPixels = png.width * png.height;
  let blackCount = 0;
  for (let i = 0; i < png.data.length; i += 4) {
    const r = png.data[i];
    const g = png.data[i + 1];
    const b = png.data[i + 2];
    if (r < 10 && g < 10 && b < 10) blackCount++;
  }
  const blackRatio = blackCount / totalPixels;
  console.log(
    `[blindtest] 黒ピクセル率: ${(blackRatio * 100).toFixed(1)}%` +
    ` (${blackCount}/${totalPixels})`
  );

  // liveness: 操作前後のピクセル差分（情報用・gate ではない＝静的でも正のテーマを誤殺しない）
  try {
    const pb = PNG.sync.read(beforeBuf);
    const n = Math.min(pb.data.length, png.data.length);
    let changed = 0;
    for (let i = 0; i < n; i += 4) {
      if (Math.abs(pb.data[i] - png.data[i]) > 12 ||
          Math.abs(pb.data[i + 1] - png.data[i + 1]) > 12 ||
          Math.abs(pb.data[i + 2] - png.data[i + 2]) > 12) changed++;
    }
    console.log(`[blindtest] 操作前後ピクセル変化: ${((changed / totalPixels) * 100).toFixed(1)}%`);
  } catch { /* 差分計算失敗は無視（情報用） */ }

  // ── エラー集計（favicon は 204 化済のため計上されない）──
  const allErrors = [...consoleErrors, ...interactionErrors];
  if (allErrors.length > 0) {
    console.log('[blindtest] JS エラー検出:');
    allErrors.slice(0, 8).forEach(e => console.log(`  - ${e}`));
  }

  // ── 判定（格上げ）: 描画されている AND 操作中の JS エラー 0 ──
  const drew = blackRatio <= 0.95;
  const noErr = allErrors.length === 0;
  if (drew && noErr) {
    console.log('[blindtest] PASS — 描画確認＋操作中 JS エラー 0');
    exitCode = 0;
  } else {
    const reasons = [];
    if (!drew) reasons.push(`黒ピクセル率 ${(blackRatio * 100).toFixed(1)}% > 95%`);
    if (!noErr) reasons.push(`JS エラー ${allErrors.length} 件`);
    console.log(`[blindtest] FAIL — ${reasons.join(' / ')}`);
    exitCode = 1;
  }

  await browser.close();
} catch (err) {
  console.error('[blindtest] 実行エラー:', err.message);
  exitCode = 1;
} finally {
  server.close();
}

process.exit(exitCode);
