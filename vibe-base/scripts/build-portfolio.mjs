#!/usr/bin/env node
/**
 * scripts/build-portfolio.mjs
 *
 * HTML虎の巻 registry（単一正本）→ Creative Portfolio Portal（公開ビュー）ビルド。
 *
 * 役割:
 *   1. docs/html-toranomaki/registry.json を読込（parse 失敗で EXIT≠0 = 連鎖崩壊防止）
 *   2. portfolio:true のエントリを order 昇順で抽出
 *   3. 各エントリの impl 実行ファイル（index.html / css / js / 静的アセット）のみを
 *      portfolio/{slug}/ へコピー。**知識層（*.md = concept / research）は一切コピーしない**
 *      （公開ビルドでコードの知識層を秘匿する＝マスター方針 6。実行 JS はブラウザ上どうせ
 *        可視のためそのまま。完全秘匿は物理的に不可、という現実解）
 *   4. テンプレ原本 portfolio/_portal-shell.html（tracked・手動カードゼロ・AUTO マーカーのみ）の
 *      <!-- AUTO:registry-cards --> … <!-- /AUTO --> 区画へ registry 由来カードを注入し、
 *      portfolio/creative-portfolio-portal.html（.gitignore 対象の生成物）として完全生成。
 *      **手動カードは構造的に存在し得ない**（in-place 編集を廃止＝leak 封鎖）。
 *
 * 使い方:
 *   node scripts/build-portfolio.mjs            本番ビルド
 *   node scripts/build-portfolio.mjs --dry-run  生成内容を表示するだけ（ファイル未変更）
 *
 * EXIT: 0=成功 / 1=registry 不正・マーカー不在・impl 不在等
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VIBE_BASE_ROOT = path.resolve(__dirname, '..');

const REGISTRY_PATH = path.join(VIBE_BASE_ROOT, 'docs', 'html-toranomaki', 'registry.json');
const TORANOMAKI_DIR = path.join(VIBE_BASE_ROOT, 'docs', 'html-toranomaki');
// 公開ビュー出力先。原本は docs/html-toranomaki/（単一正本）、ここはそこから生成する派生物。
// 旧 agent-ag/ から portfolio/ へ移行済（別エージェント領域から切り離し・git管理＋冪等再生成で二重に安全）。
const PORTFOLIO_DIR = path.join(VIBE_BASE_ROOT, 'portfolio');
// テンプレ原本（tracked・手動カードゼロ・AUTO マーカーのみ）。これが portal の唯一のソース。
const SHELL_PATH = path.join(PORTFOLIO_DIR, '_portal-shell.html');
// 生成物（.gitignore 対象・冪等再生成）。SHELL_PATH ＋ registry から毎回完全生成する。
const PORTAL_PATH = path.join(PORTFOLIO_DIR, 'creative-portfolio-portal.html');

const MARKER_START = '<!-- AUTO:registry-cards -->';
const MARKER_END = '<!-- /AUTO -->';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');

function fail(msg) {
  process.stderr.write(`[build-portfolio] ERROR: ${msg}\n`);
  process.exit(1);
}

function log(msg) {
  process.stdout.write(`[build-portfolio] ${msg}\n`);
}

// ── registry 読込（parse 失敗で停止）──
if (!fs.existsSync(REGISTRY_PATH)) fail(`registry not found: ${REGISTRY_PATH}`);
let registry;
try {
  registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
} catch (e) {
  fail(`registry JSON.parse failed: ${e.message}`);
}
const entries = Array.isArray(registry.entries) ? registry.entries : [];

// ── portfolio:true を order 昇順で抽出 ──
const published = entries
  .filter((e) => e.portfolio === true)
  .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));

log(`registry entries=${entries.length} / published=${published.length}`);

// ── 知識層判定（公開ビルドへコピーしないファイル）──
// *.md は知識層（concept / research / 技術解説）として一律除外する。
function isKnowledgeLayer(fileName) {
  return /\.md$/i.test(fileName);
}

// impl ディレクトリを dest へ再帰コピー（*.md を除外）
function copyImpl(srcDir, destDir, { dry }) {
  const copied = [];
  const skipped = [];
  function walk(rel) {
    const absSrc = path.join(srcDir, rel);
    for (const ent of fs.readdirSync(absSrc, { withFileTypes: true })) {
      const childRel = path.join(rel, ent.name);
      if (ent.isDirectory()) {
        walk(childRel);
      } else if (ent.isFile()) {
        if (isKnowledgeLayer(ent.name)) {
          skipped.push(childRel);
          continue;
        }
        const absDest = path.join(destDir, childRel);
        if (!dry) {
          fs.mkdirSync(path.dirname(absDest), { recursive: true });
          fs.copyFileSync(path.join(srcDir, childRel), absDest);
        }
        copied.push(childRel);
      }
    }
  }
  walk('.');
  return { copied, skipped };
}

const SVG_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" ' +
  'fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" ' +
  'stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6">' +
  '</path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3">' +
  '</line></svg>';

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function cardHtml(e) {
  const slug = e.slug;
  const title = escapeHtml(e.title || slug);
  const titleAttr = escapeHtml(e.titleEn || e.title || slug);
  const blurb = escapeHtml(e.blurb || '');
  return [
    `            <!-- AUTO-CARD: ${slug} -->`,
    `            <div class="card">`,
    `                <div class="iframe-container">`,
    `                    <iframe src="./${slug}/index.html" title="${titleAttr}" loading="lazy"></iframe>`,
    `                </div>`,
    `                <div class="card-content">`,
    `                    <h3 class="card-title">${title}</h3>`,
    `                    <p class="card-desc">${blurb}</p>`,
    `                    <a href="./${slug}/index.html" target="_blank" class="card-btn">`,
    `                        <span>全画面表示</span>`,
    `                        ${SVG_ICON}`,
    `                    </a>`,
    `                </div>`,
    `            </div>`,
  ].join('\n');
}

// ── 各エントリの impl をコピー ──
let copyErrors = 0;
for (const e of published) {
  const implName = e.impl;
  if (!implName) {
    process.stderr.write(`[build-portfolio] WARN: ${e.slug} に impl 未指定 → skip\n`);
    copyErrors++;
    continue;
  }
  const srcDir = path.join(TORANOMAKI_DIR, e.slug, implName);
  if (!fs.existsSync(srcDir)) {
    process.stderr.write(`[build-portfolio] impl not found: ${path.relative(VIBE_BASE_ROOT, srcDir)}\n`);
    copyErrors++;
    continue;
  }
  const destDir = path.join(PORTFOLIO_DIR, e.slug);
  if (!dryRun && fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  const { copied, skipped } = copyImpl(srcDir, destDir, { dry: dryRun });
  log(
    `${dryRun ? '[dry] ' : ''}${e.slug}: impl=${implName} ` +
    `copied=${copied.length} skipped(md)=${skipped.length} → portfolio/${e.slug}/`
  );
  if (skipped.length > 0) {
    log(`  skipped(知識層): ${skipped.join(', ')}`);
  }
}
if (copyErrors > 0) fail(`${copyErrors} 件の impl コピーに失敗`);

// ── テンプレ（_portal-shell.html）＋ registry → portal を完全生成 ──
// 生成物 portal は読まない（in-place 編集を廃止）。手動カードは構造的に存在し得ない。
if (!fs.existsSync(SHELL_PATH)) {
  fail(
    `テンプレ原本が見つかりません: ${path.relative(VIBE_BASE_ROOT, SHELL_PATH)}。` +
    `手動カードゼロ・AUTO マーカーのみの shell を tracked 原本として配置してください。`
  );
}
const shell = fs.readFileSync(SHELL_PATH, 'utf-8');
const startIdx = shell.indexOf(MARKER_START);
const endIdx = shell.indexOf(MARKER_END);
if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
  fail(
    `テンプレに AUTO マーカーが見つかりません（${MARKER_START} … ${MARKER_END}）。`
  );
}

// テンプレの AUTO マーカー間に手動カードが紛れていないか検査（leak 封鎖）。
const shellBetween = shell.slice(startIdx + MARKER_START.length, endIdx);
if (/AUTO-CARD|class="card"/.test(shellBetween)) {
  fail('テンプレ AUTO マーカー間に手動カードが混入しています。shell は空のマーカー対のみ許可。');
}

const cards = published.map(cardHtml).join('\n\n');
const before = shell.slice(0, startIdx + MARKER_START.length);
const after = shell.slice(endIdx);
const newPortal = `${before}\n${cards}\n            ${after}`;

if (dryRun) {
  log('--- dry-run: 生成カード ---');
  process.stdout.write(cards + '\n');
  log('dry-run 終了（ファイル未変更）');
  process.exit(0);
}

fs.writeFileSync(PORTAL_PATH, newPortal, 'utf-8');
log(`ポータル生成: ${path.relative(VIBE_BASE_ROOT, PORTAL_PATH)}（テンプレ ${path.basename(SHELL_PATH)} ＋ ${published.length} カード）`);

log('ビルド完了');
process.exit(0);
