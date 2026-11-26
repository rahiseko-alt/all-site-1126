#!/usr/bin/env node
/**
 * scripts/generate-hook-manifest.mjs
 *
 * vibe-base + 全 product (untracked / 独立 git 含む) の hook 実体を網羅し、
 * scripts/hook-integrity-manifest.json を自動生成する。
 *
 * 検出ソース:
 *   - git ls-files (tracked)
 *   - git ls-files --others --exclude-standard (untracked)
 *   - 各 products/X/ で git -C status (独立 git 検出 → 中身を find で取得)
 *
 * 使い方:
 *   node scripts/generate-hook-manifest.mjs --dry-run --format=json
 *   node scripts/generate-hook-manifest.mjs --write
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { ROOT_ONLY_HOOK_NAMES } from './_lib/root-only-hooks.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VIBE_BASE_ROOT = path.resolve(__dirname, '..');

// root .claude/settings.json に登録されるが expected_hooks から除外したい hook。
// expected は root 登録駆動 (parseRootRegisteredHooks) のため、ここに挙げるのは
// 「root には登録されるが全 product 共通ではない hook」= ROOT_ONLY ∪ {wrapper}。
// これらを expected に入れると per-product 検査 (mode③) が当該 hook 不在で偽陽性になる。
// ROOT_ONLY_HOOK_NAMES は propagate-hooks.mjs と共有の single source
// (./_lib/root-only-hooks.mjs) から import するため二重管理＝ドリフトは構造的に排除済。
// hook-runner は wrapper 自身のため ROOT_ONLY とは別に追加する。
const SKIP_HOOKS = new Set(['hook-runner', ...ROOT_ONLY_HOOK_NAMES]);

// 主モジュール判定 (import 時には main logic を実行しない)
const isMain = (() => {
  try {
    const argv1 = (process.argv[1] || '').replace(/\\/g, '/');
    return argv1.endsWith('generate-hook-manifest.mjs');
  } catch {
    return false;
  }
})();

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const writeMode = args.includes('--write');
const formatJson = args.includes('--format=json');

function safeExec(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: 'utf-8', cwd: VIBE_BASE_ROOT, ...opts }).trim();
  } catch {
    return '';
  }
}

// 全 .mjs hook ファイルを 4 経路で収集
function collectHookFiles() {
  const files = new Set();

  // 1. tracked
  const tracked = safeExec('git ls-files');
  for (const f of tracked.split('\n')) {
    if (f && /\.claude\/hooks\/.+\.mjs$/.test(f)) files.add(f);
  }

  // 2. untracked (vibe-base 側)
  const untracked = safeExec('git ls-files --others --exclude-standard');
  for (const f of untracked.split('\n')) {
    if (f && /\.claude\/hooks\/.+\.mjs$/.test(f)) files.add(f);
  }

  // 3. 各 products/*/ で独立 git を検出 (.git directory or file)
  const productsDir = path.join(VIBE_BASE_ROOT, 'products');
  if (fs.existsSync(productsDir)) {
    for (const d of fs.readdirSync(productsDir, { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      const productPath = path.join(productsDir, d.name);
      const independentGit = fs.existsSync(path.join(productPath, '.git'));
      if (independentGit) {
        // 独立 git: 中の .claude/hooks/*.mjs を find で列挙
        const hooksDir = path.join(productPath, '.claude', 'hooks');
        if (fs.existsSync(hooksDir)) {
          for (const f of fs.readdirSync(hooksDir)) {
            if (f.endsWith('.mjs')) {
              files.add(`products/${d.name}/.claude/hooks/${f}`);
            }
          }
        }
      }
    }
  }

  // 4. find による fallback (上記いずれかから漏れた case 用)
  // 直接 fs.readdir で products/*/.claude/hooks/ と products/*/*/.claude/hooks/ を scan
  function scanDir(dir, depth) {
    if (!fs.existsSync(dir)) return;
    for (const d of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      const sub = path.join(dir, d.name);
      const hooksDir = path.join(sub, '.claude', 'hooks');
      if (fs.existsSync(hooksDir)) {
        for (const f of fs.readdirSync(hooksDir)) {
          if (f.endsWith('.mjs')) {
            const rel = path.relative(VIBE_BASE_ROOT, path.join(hooksDir, f)).split(path.sep).join('/');
            files.add(rel);
          }
        }
      }
      if (depth > 0) scanDir(sub, depth - 1);
    }
  }
  scanDir(path.join(VIBE_BASE_ROOT, 'products'), 1);

  return [...files].sort();
}

// hook 名 (basename without .mjs) でグループ化
function groupByName(files) {
  const map = new Map();
  for (const f of files) {
    const name = path.basename(f, '.mjs');
    if (!map.has(name)) {
      map.set(name, { name, files: [], products: new Set() });
    }
    const entry = map.get(name);
    entry.files.push(f);
    // products/X/... または products/X/Y/... なら product 名抽出
    const m = f.match(/^products\/([^/]+(?:\/[^/]+)?)\/\.claude\/hooks/);
    if (m) entry.products.add(m[1]);
    else entry.products.add('root');
  }
  return [...map.values()]
    .map((e) => ({ name: e.name, files: e.files, products: [...e.products].sort() }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// root .claude/settings.json を解析し、登録された .mjs hook の Map(name → {event, matcher}) を返す。
// 抽出規則は check-hook-integrity.mjs L251-263 と逐語一致させること (両者がズレると expected と
// registeredNames が食い違い (c) 検査が偽陽性/偽陰性化する)。.sh hook は checker が認識しないため
// ここでも .mjs のみ対象とする。同名 hook が複数 (event,matcher) で登録される場合は最初を採用し
// 2 つ目以降は stderr warning (生成は継続)。
function parseRootRegisteredHooks() {
  const settingsPath = path.join(VIBE_BASE_ROOT, '.claude', 'settings.json');
  const map = new Map();
  if (!fs.existsSync(settingsPath)) return map;
  let settings;
  try { settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8')); } catch { return map; }

  const hooksSection = settings.hooks ?? {};
  for (const [event, matchers] of Object.entries(hooksSection)) {
    if (!Array.isArray(matchers)) continue;
    for (const matcherEntry of matchers) {
      const matcher = matcherEntry.matcher ?? '';
      for (const h of matcherEntry.hooks ?? []) {
        if (h.type !== 'command') continue;
        const command = h.command ?? '';
        // hook-runner ラップ形式: 最後の " -- " 以降を target command として扱う
        const wrapperSplit = command.split(' -- ');
        const targetCmd = wrapperSplit.length > 1 ? wrapperSplit[wrapperSplit.length - 1] : command;
        const nodeMatch = targetCmd.match(/node\s+"?\$CLAUDE_PROJECT_DIR"?[/\\](.+\.mjs)/);
        if (!nodeMatch) continue; // bash/.sh/.js は対象外 (.mjs のみ)
        const name = path.basename(nodeMatch[1]).replace(/\.mjs$/, '');
        if (map.has(name)) {
          const prev = map.get(name);
          if (prev.event !== event || prev.matcher !== matcher) {
            process.stderr.write(
              `[warn] root hook "${name}" は複数 (event,matcher) で登録: ` +
                `採用=${prev.event}/${prev.matcher} 無視=${event}/${matcher}\n`
            );
          }
          continue;
        }
        map.set(name, { event, matcher });
      }
    }
  }
  return map;
}

// expected_hooks に変換 (root 登録駆動)。
// expected = root .claude/settings.json に登録された .mjs hook のうち SKIP_HOOKS 非該当。
// matcher_pattern / event は実登録から取得 (借用/推定不要 → (unknown) は発生しない)。
// 引数 groups は dry-run レポート用に保持されるが expected 算出には使わない (ディスク駆動廃止)。
function toExpectedHooks(_groups) {
  const rootHooks = parseRootRegisteredHooks();
  return [...rootHooks.entries()]
    .filter(([name]) => !SKIP_HOOKS.has(name))
    .map(([name, info]) => ({
      name,
      matcher_pattern: info.matcher || '(none)',
      event: info.event,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

if (!isMain) {
  // import 時はここで終了 (関数 export のみ目的)
} else {

const files = collectHookFiles();
const groups = groupByName(files);
const expectedHooks = toExpectedHooks(groups);
const expectedScripts = ['check-secret-patterns.mjs'];

if (formatJson) {
  // dry-run 出力用 JSON
  const out = {
    hooks: groups.map((g) => ({
      name: g.name,
      files: g.files,
      products: g.products,
    })),
    expected_hooks: expectedHooks,
  };
  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
}

if (dryRun && !writeMode) {
  if (!formatJson) {
    process.stdout.write(`hooks=${groups.length} files=${files.length}\n`);
    for (const g of groups) {
      process.stdout.write(`  ${g.name}: ${g.products.length} product(s) / ${g.files.length} file(s)\n`);
    }
  }
  process.exit(0);
}

if (writeMode) {
  const manifestPath = path.join(VIBE_BASE_ROOT, 'scripts', 'hook-integrity-manifest.json');
  // backup
  if (fs.existsSync(manifestPath)) {
    const backupPath = manifestPath + '.backup-' + new Date().toISOString().replace(/[:.]/g, '-');
    fs.copyFileSync(manifestPath, backupPath);
    process.stdout.write(`backed up: ${path.relative(VIBE_BASE_ROOT, backupPath)}\n`);
  }
  fs.writeFileSync(manifestPath, JSON.stringify({ expected_hooks: expectedHooks, expected_scripts: expectedScripts }, null, 2) + '\n', 'utf-8');
  process.stdout.write(`written: ${path.relative(VIBE_BASE_ROOT, manifestPath)} (${expectedHooks.length} hooks)\n`);
  process.exit(0);
}

// 引数なし
process.stderr.write('usage: --dry-run [--format=json] | --write\n');
process.exit(2);

} // end isMain
