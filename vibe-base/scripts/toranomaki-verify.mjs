#!/usr/bin/env node
/**
 * toranomaki-verify.mjs — HTML虎の巻 三者一致 機械検証
 *
 * 単一正本（registry.json）→ 知識層（docs/html-toranomaki/{slug}/）→ 公開ビュー（portfolio/{slug}/）
 * の三者が完全一致しているかを検証する。leak（手編集・orphan・未登録・矛盾）を機械検出する。
 *
 * 検査項目:
 *   1. registry.json が parse 可能（json-canary 相当・壊れ JSON で連鎖崩壊しない）
 *   2. order が 1..N 連番（欠番・重複なし）
 *   3. slug 重複なし
 *   4. 各 entry の docs/{slug}/{impl}/ が実在
 *   5. 未登録0: docs/html-toranomaki/{theme}/ が全て registry に登録済み
 *   6. docs不在0: registry slug が全て docs に実在
 *   7. orphan0: portfolio/{dir}/ が全て registry portfolio:true に対応
 *   8. 出力欠落0: portfolio:true slug が全て portfolio/ に出力済み
 *   9. 矛盾0（dennis解消）: portfolio:false なのに portfolio/ に出力が残っていない
 *  10. .md非混入: portfolio/{slug}/ に知識層（*.md）が混入していない
 *  11. AUTO整合: portal の AUTO-CARD 数 == portfolio:true 数、かつ手動カード（区画外 class="card"）0
 *
 * EXIT: 0=全PASS / 1=1件以上の不整合
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TORANOMAKI = path.join(ROOT, 'docs', 'html-toranomaki');
const REGISTRY = path.join(TORANOMAKI, 'registry.json');
const PORTFOLIO = path.join(ROOT, 'portfolio');
const PORTAL = path.join(PORTFOLIO, 'creative-portfolio-portal.html');

// portfolio/ 直下の非テーマ（原本・生成 portal）。orphan 判定から除外。
const PORTFOLIO_NON_THEME = new Set([
  'creative-portfolio-portal.html',
  '_portal-shell.html',
  'server.mjs',
  'vercel.json',
]);

const errors = [];
const oks = [];

function listDirs(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith('.'))
    .map((d) => d.name);
}

function walkFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkFiles(p, acc);
    else acc.push(p);
  }
  return acc;
}

// ── 1. registry parse（json-canary 相当）──
let registry;
try {
  registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf-8'));
  oks.push('registry.json parse OK');
} catch (e) {
  console.error(`[verify] FATAL: registry.json parse 失敗: ${e.message}`);
  process.exit(1);
}
const entries = Array.isArray(registry.entries) ? registry.entries : [];
const publishedSlugs = new Set(entries.filter((e) => e.portfolio === true).map((e) => e.slug));

// ── 2. order 連番 ──
const orders = entries.map((e) => e.order).slice().sort((a, b) => a - b);
orders.forEach((o, i) => {
  if (o !== i + 1) errors.push(`order 不連番/欠番: ${o}（期待 ${i + 1}）`);
});

// ── 3. slug 重複 ──
const slugSeen = new Set();
for (const e of entries) {
  if (slugSeen.has(e.slug)) errors.push(`slug 重複: ${e.slug}`);
  slugSeen.add(e.slug);
}

// ── 4/6. impl 実在 + docs 実在 ──
const docsThemes = listDirs(TORANOMAKI);
const docsThemeSet = new Set(docsThemes);
for (const e of entries) {
  if (!docsThemeSet.has(e.slug)) {
    errors.push(`docs不在: registry slug=${e.slug} に docs/html-toranomaki/${e.slug}/ が無い`);
    continue;
  }
  const implDir = path.join(TORANOMAKI, e.slug, e.impl);
  if (!fs.existsSync(implDir)) errors.push(`impl不在: ${e.slug}/${e.impl}`);
}

// ── 5. 未登録0 ──
const regSlugSet = new Set(entries.map((e) => e.slug));
for (const t of docsThemes) {
  if (!regSlugSet.has(t)) errors.push(`未登録docs: docs/html-toranomaki/${t}/ が registry に未登録`);
}

// ── 7/8/9. portfolio orphan / 出力欠落 / 矛盾 ──
const portfolioDirs = listDirs(PORTFOLIO);
const portfolioDirSet = new Set(portfolioDirs);
for (const d of portfolioDirs) {
  if (PORTFOLIO_NON_THEME.has(d)) continue;
  if (!publishedSlugs.has(d)) errors.push(`portfolio orphan: portfolio/${d}/ が registry portfolio:true に無い`);
}
for (const s of publishedSlugs) {
  if (!portfolioDirSet.has(s)) errors.push(`portfolio 出力欠落: ${s}（portfolio:true だが portfolio/${s}/ 無し）`);
}
for (const e of entries) {
  if (e.portfolio !== true && portfolioDirSet.has(e.slug)) {
    errors.push(`矛盾(dennis型): ${e.slug} は portfolio:false なのに portfolio/${e.slug}/ に出力が残存`);
  }
}

// ── 10. .md 非混入 ──
for (const s of publishedSlugs) {
  const dir = path.join(PORTFOLIO, s);
  const mdFiles = walkFiles(dir).filter((f) => /\.md$/i.test(f));
  for (const f of mdFiles) errors.push(`.md混入: ${path.relative(ROOT, f)}（知識層は公開ビルドへ非コピー）`);
}

// ── 11. AUTO 整合 ──
if (!fs.existsSync(PORTAL)) {
  errors.push(`portal 不在: ${path.relative(ROOT, PORTAL)}（build-portfolio.mjs 未実行）`);
} else {
  const portal = fs.readFileSync(PORTAL, 'utf-8');
  const autoCount = (portal.match(/AUTO-CARD/g) || []).length;
  const cardCount = (portal.match(/class="card"/g) || []).length;
  if (autoCount !== publishedSlugs.size) {
    errors.push(`AUTO整合: AUTO-CARD 数=${autoCount} != portfolio:true 数=${publishedSlugs.size}`);
  }
  if (cardCount !== autoCount) {
    errors.push(`手動カード検出: class="card" 総数=${cardCount} != AUTO-CARD 数=${autoCount}（区画外カード ${cardCount - autoCount} 枚）`);
  }
}

// ── 結果 ──
console.log(`[verify] entries=${entries.length} published=${publishedSlugs.size} docsThemes=${docsThemes.length} portfolioDirs=${portfolioDirs.filter((d) => !PORTFOLIO_NON_THEME.has(d)).length}`);
if (errors.length === 0) {
  console.log('[verify] PASS — 三者一致（registry ↔ docs ↔ portfolio）・AUTO整合・.md非混入・order連番');
  process.exit(0);
}
console.error(`[verify] FAIL — ${errors.length} 件の不整合:`);
errors.forEach((e) => console.error(`  ✗ ${e}`));
process.exit(1);
