#!/usr/bin/env node
// 虎の子 — 俺専用 技術アーカイブ生成。
// docs/html-toranomaki/registry.json（虎の巻 単一正本）の技術デモを、3カラム・白基調・大きめの
// ライブ iframe プレビュー＋名前だけで toranoko/index.html に焼き込む。デモ実体は既存
// portfolio/{slug}/ を server.mjs（vibe-base ルート配信）経由で再利用する。
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const REGISTRY = join(ROOT, 'docs', 'html-toranomaki', 'registry.json');
const PORTFOLIO_DIR = join(ROOT, 'portfolio');
const OUT = join(HERE, '..', 'index.html');

const reg = JSON.parse(readFileSync(REGISTRY, 'utf8'));
const entries = (reg.entries || [])
  .filter((e) => e.portfolio === true)
  .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const demoHref = (slug) => `/portfolio/${slug}/index.html`;
const hasDemo = (slug) => existsSync(join(PORTFOLIO_DIR, slug, 'index.html'));

const cards = entries.map((e) => {
  const live = hasDemo(e.slug)
    ? `<iframe src="${demoHref(e.slug)}" title="${esc(e.titleEn || e.title)}" loading="lazy" scrolling="no"></iframe>`
    : `<div class="noprev">実体未配置<br><code>${esc(e.slug)}</code></div>`;
  return `
      <article class="card">
        <a class="frame" href="${demoHref(e.slug)}" target="_blank" rel="noopener">${live}<span class="hint">クリックで全画面 ↗</span></a>
        <h3>${esc(e.title)}</h3>
      </article>`;
}).join('\n');

const builtAt = (() => {
  const d = new Date(Date.now());
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
})();

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>虎の子 — 俺専用 技術アーカイブ</title>
<style>
  :root{ color-scheme:light; --bg:#f4f5f7; --card:#ffffff; --line:#e2e5ea; --txt:#1a1d24; --mut:#6b7280; --accent:#0ea5e9; --accent2:#6366f1; }
  *{ box-sizing:border-box; margin:0; padding:0; }
  body{ background:var(--bg); color:var(--txt); font-family:"Segoe UI",system-ui,sans-serif; }
  header{ padding:20px 32px; border-bottom:1px solid var(--line); background:#fff; }
  h1{ font-size:19px; letter-spacing:.04em; }
  h1 b{ background:linear-gradient(90deg,var(--accent),var(--accent2)); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent; }
  .sub{ color:var(--mut); font-size:12px; margin-top:3px; }
  main{ padding:28px 32px 56px; }
  .grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:28px; }
  .card{ background:var(--card); border:1px solid var(--line); border-radius:14px; overflow:hidden; transition:transform .25s, border-color .25s, box-shadow .25s; }
  .card:hover{ transform:translateY(-5px); border-color:#c7ccd6; box-shadow:0 16px 32px rgba(20,30,50,.12); }
  .frame{ display:block; position:relative; aspect-ratio:16/9; background:#000; border-bottom:1px solid var(--line); overflow:hidden; cursor:pointer; }
  .frame iframe{ width:100%; height:100%; border:0; display:block; pointer-events:none; }
  .frame .hint{ position:absolute; right:12px; bottom:12px; font-size:12px; color:#fff; background:rgba(15,20,30,.78); border-radius:7px; padding:5px 10px; opacity:0; transition:opacity .2s; }
  .card:hover .hint{ opacity:1; }
  .noprev{ width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#9aa4b2; font-size:13px; gap:8px; }
  .card h3{ font-size:18px; color:#111418; font-weight:700; padding:16px 18px 18px; letter-spacing:.01em; }
  footer{ padding:0 32px 32px; color:var(--mut); font-size:11px; }
  footer code{ color:#4b5563; }
</style>
</head>
<body>
  <header>
    <h1><b>虎の子</b> — 俺専用 技術アーカイブ</h1>
    <div class="sub">虎の巻の技術デモ ${entries.length} 件（ローカル専用）。生成 ${builtAt}</div>
  </header>
  <main>
    <div class="grid">${cards}
    </div>
  </main>
  <footer>
    再生成 <code>node toranoko/scripts/build-toranoko.mjs</code> ／ 配信 <code>node toranoko/server.mjs</code>（http://localhost:3100）
  </footer>
</body>
</html>
`;

writeFileSync(OUT, html, 'utf8');
console.log(`[toranoko] 生成完了: ${OUT}`);
console.log(`[toranoko] 技術デモ ${entries.length} 件 / 3カラム・白基調`);
