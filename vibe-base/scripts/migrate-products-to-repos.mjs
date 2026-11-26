#!/usr/bin/env node
/**
 * migrate-products-to-repos.mjs
 *
 * vibe-base モノレポの各製品を「独立したローカル git リポジトリ」に分離する。
 * 製品はディスク上 products/<name>/ のまま。各製品が独自 .git を持ち、vibe-base は追跡をやめる。
 *
 * ★ GitHub には push しない（ローカル分離のみ）。
 *   git status のディレクトリ横断汚染を根治するのが目的。共有/バックアップが要る製品が出たら、
 *   その製品だけ後で `gh repo create rahiseko-alt/<name> --private && git -C products/<name> remote add origin <url> && git -C products/<name> push -u origin main` でオンデマンドに上げる。
 *
 * 使い方:
 *   node scripts/migrate-products-to-repos.mjs --dry-run --all       # 全製品の予定を表示（実変更なし）
 *   node scripts/migrate-products-to-repos.mjs --product=x-auto-post # 単一製品
 *   node scripts/migrate-products-to-repos.mjs --all                 # 全製品を実行
 *   node scripts/migrate-products-to-repos.mjs --all --force         # vibe-base index が dirty でも続行（非推奨）
 *
 * 設計（3検証者レビュー反映済み）:
 *   - GUARD で分離済み製品は SKIP（冪等・途中失敗から再実行可）
 *   - 標準 .gitignore（_lib/standard-gitignore.txt）を不在製品に配置 / 既存に冪等追記
 *   - ルート .gitignore の products/<name>/ ルールを製品 .gitignore に移植
 *   - 大型ガード: ステージ済み >10MB ファイルを .gitignore へ自動退避（portfolio 本体・小素材は保持）
 *   - learning-suite-kanji は既存独立リポ＝add/commit せず vibe-base untrack のみ
 *   - vibe-base の untrack は製品ごとに即パス限定 commit して原子化（共有 index dirty 放置を回避）
 *   - 無効 .git の削除は objects/refs/logs 三点空チェック後のみ（価値ある .git を守る）
 *   - 非ASCII名対応: git は -c core.quotepath=false ... -z で取得
 *   - execSync 直実行のため pre-git-staging-gate hook は発火しない
 *
 * 注意: 共有 index を触る。実行前に他の Claude Code セッションを全て閉じること。
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIBE_BASE = path.resolve(__dirname, '..');
const PRODUCTS_DIR = path.join(VIBE_BASE, 'products');
const LARGE_FILE_BYTES = 10 * 1024 * 1024;
const STAGE_COUNT_WARN = 5000;
const STANDARD_GITIGNORE = path.join(__dirname, '_lib', 'standard-gitignore.txt');
const MARKER = '# === vibe-base migration standard ===';
const LSK = 'learning-suite-kanji'; // 既存独立リポ（特例）

const PRODUCTS = [
  'ai-concierge', 'aiueo', 'coach', 'code-review-skills', 'databank', 'foodee',
  'google-slides-gen', 'google-system-dev', 'homepage', 'hp-customizer', 'instagram-auto-ops',
  'kobaraku', 'kosespark', LSK, 'learning-suite-kanji-foreign', 'medguide-rag', 'meishi-maker',
  'n8n', 'new-trimmer-system', 'omotenashi-trainer', 'renai-game', 'review-analysis',
  'shift-ai', 'shiota-karte', 'spire-lite', 'trimmer-system', 'writer-auto-ops',
  'x-auto-post', 'ymm-shorts',
];

// ---- shell helpers ----
function sh(cmd, opts = {}) {
  return execSync(cmd, {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 256 * 1024 * 1024, ...opts,
  }).trim();
}
function shSafe(cmd, opts = {}) {
  try { return { ok: true, out: sh(cmd, opts) }; }
  catch (e) { return { ok: false, out: ((e.stdout || '') + (e.stderr || '')).trim(), code: e.status }; }
}

// ---- git state helpers ----
function hasGitDir(dir) { return fs.existsSync(path.join(dir, '.git')); }
function hasValidGit(dir) { return fs.existsSync(path.join(dir, '.git', 'HEAD')); }
function vibeTrackedCount(name) {
  const r = shSafe(`git -C "${VIBE_BASE}" ls-files "products/${name}/"`);
  return r.ok && r.out ? r.out.split(/\r?\n/).filter(Boolean).length : 0;
}

// .git が「無効（削除して安全）」か判定: HEAD 無し かつ objects/refs/logs/packed-refs が全て空 かつ .git がディレクトリ
function isEmptyGitDir(dir) {
  const g = path.join(dir, '.git');
  if (!fs.existsSync(g) || !fs.statSync(g).isDirectory()) return false; // gitlink ファイルは対象外
  if (fs.existsSync(path.join(g, 'HEAD'))) return false;
  const objDir = path.join(g, 'objects');
  let hasObjects = false;
  if (fs.existsSync(objDir)) {
    try {
      const packDir = path.join(objDir, 'pack');
      if (fs.existsSync(packDir) && fs.readdirSync(packDir).some((f) => f.endsWith('.pack'))) hasObjects = true;
      if (!hasObjects) {
        for (const n of fs.readdirSync(objDir)) {
          if (/^[0-9a-f]{2}$/.test(n) && fs.readdirSync(path.join(objDir, n)).length) { hasObjects = true; break; }
        }
      }
    } catch { hasObjects = true; } // 読めない時は安全側（消さない）
  }
  const refsDir = path.join(g, 'refs');
  let hasRefs = false;
  if (fs.existsSync(refsDir)) {
    const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).some((e) => e.isDirectory() ? walk(path.join(d, e.name)) : true);
    try { hasRefs = walk(refsDir); } catch { hasRefs = true; }
  }
  const hasLogs = fs.existsSync(path.join(g, 'logs'));
  const hasPackedRefs = fs.existsSync(path.join(g, 'packed-refs'));
  return !hasObjects && !hasRefs && !hasLogs && !hasPackedRefs;
}

// ---- .gitignore handling ----
function extractRootGitignoreRules(name) {
  const root = path.join(VIBE_BASE, '.gitignore');
  if (!fs.existsSync(root)) return [];
  const prefix = `products/${name}/`;
  const out = [];
  for (const raw of fs.readFileSync(root, 'utf8').split(/\r?\n/)) {
    const t = raw.trim();
    if (t.startsWith(prefix)) out.push(t.slice(prefix.length));
  }
  return out;
}
function ensureGitignore(dir, name, dryRun) {
  const giPath = path.join(dir, '.gitignore');
  const exists = fs.existsSync(giPath);
  const current = exists ? fs.readFileSync(giPath, 'utf8') : '';
  const curLines = current.split(/\r?\n/).map((s) => s.trim());
  const hasMarker = current.includes(MARKER);
  const rootRules = name === LSK ? [] : extractRootGitignoreRules(name); // lsk の whitelist は移植しない
  const needRules = rootRules.filter((r) => !curLines.includes(r)); // 行単位の完全一致

  if (hasMarker && needRules.length === 0) return { action: 'skip', added: 0 };
  if (dryRun) return { action: exists ? 'append' : 'create', added: (hasMarker ? 0 : 1) + needRules.length };

  let block = '';
  if (!hasMarker) block += fs.readFileSync(STANDARD_GITIGNORE, 'utf8');
  if (needRules.length) block += `\n# migrated from root .gitignore (products/${name}/)\n${needRules.join('\n')}\n`;
  const sep = current && !current.endsWith('\n') ? '\n' : '';
  fs.writeFileSync(giPath, current + sep + block);
  return { action: exists ? 'append' : 'create', added: needRules.length + (hasMarker ? 0 : 1) };
}

// vibe-base .gitignore に products/<name>/ を冪等追記
function appendVibeGitignore(name) {
  const gi = path.join(VIBE_BASE, '.gitignore');
  const line = `products/${name}/`;
  const cur = fs.existsSync(gi) ? fs.readFileSync(gi, 'utf8') : '';
  if (cur.split(/\r?\n/).map((s) => s.trim()).includes(line)) return false;
  const sep = cur && !cur.endsWith('\n') ? '\n' : '';
  fs.appendFileSync(gi, `${sep}${line}\n`);
  return true;
}

// ---- staged files (非ASCII対応・NUL区切り) ----
function listStagedFiles(dir) {
  const r = shSafe(`git -C "${dir}" -c core.quotepath=false diff --cached --name-only -z`);
  if (!r.ok || !r.out) return [];
  return r.out.split('\0').filter(Boolean);
}
function findLargeFiles(dir, files) {
  const large = [];
  for (const f of files) {
    try {
      const st = fs.lstatSync(path.join(dir, f)); // リンク自体を測る（参照先を辿らない）
      if (st.isSymbolicLink()) continue;
      if (st.isFile() && st.size > LARGE_FILE_BYTES) large.push({ f, mb: (st.size / 1048576).toFixed(1) });
    } catch { /* エスケープ名/削除済み: -z 取得済なので通常起きない */ }
  }
  return large;
}

// ---- per-product migration ----
function migrateProduct(name, dryRun) {
  const dir = path.join(PRODUCTS_DIR, name);
  if (!fs.existsSync(dir)) return { name, status: 'ERROR', detail: 'directory not found' };

  const isLsk = name === LSK;
  const tracked = vibeTrackedCount(name);

  // GUARD: 分離済み（独自 git + vibe-base 非追跡）
  if (hasValidGit(dir) && tracked === 0) return { name, status: 'SKIP', detail: 'already split' };

  // .git 状態
  const validGit = hasValidGit(dir);
  const gitExists = hasGitDir(dir);
  const emptyGit = gitExists && !validGit && isEmptyGitDir(dir);
  const suspiciousGit = gitExists && !validGit && !emptyGit;
  if (suspiciousGit) {
    return { name, status: 'WARN', detail: '.git が HEAD 無しだが objects/refs/logs を保持。自動削除を回避＝手動確認要' };
  }

  // plan（dry-run 表示）
  const plan = [];
  if (emptyGit) plan.push('rm-empty-.git');
  const giPlan = ensureGitignore(dir, name, true);
  if (giPlan.action !== 'skip') plan.push(`gitignore:${giPlan.action}`);
  if (isLsk) plan.push('lsk:untrackのみ(init/add無し)');
  else if (!validGit) plan.push('git-init+add+commit');
  if (tracked > 0) plan.push(`vibe-untrack(${tracked})`);
  if (dryRun) return { name, status: 'PLAN', detail: plan.join(', ') || 'nothing-to-do' };

  // ---- 実行 ----
  try {
    if (emptyGit) fs.rmSync(path.join(dir, '.git'), { recursive: true, force: true });
    ensureGitignore(dir, name, false);

    let evicted = [];
    if (!isLsk) {
      if (!hasValidGit(dir)) sh(`git -C "${dir}" init -b main`);

      // E: ステージ
      const addR = shSafe(`git -C "${dir}" add .`);
      if (!addR.ok) return { name, status: 'FAIL', detail: `add failed: ${addR.out.slice(0, 200)}` };

      // F: 大型自動退避（>10MB を .gitignore へ追記して index から外す）
      const large = findLargeFiles(dir, listStagedFiles(dir));
      if (large.length) {
        const block = `\n# === auto-excluded by migration (>10MB) ===\n${large.map((l) => '/' + l.f).join('\n')}\n`;
        fs.appendFileSync(path.join(dir, '.gitignore'), block);
        for (const l of large) shSafe(`git -C "${dir}" rm --cached --quiet -- "${l.f}"`);
        shSafe(`git -C "${dir}" add .gitignore`);
        evicted = large;
      }

      // 総数ガード（保険・停止しない）
      const finalCount = listStagedFiles(dir).length;
      if (finalCount > STAGE_COUNT_WARN) {
        console.log(`\n  ⚠️ ${name}: ${finalCount}件ステージ（node_modules 混入の疑い・要確認）`);
      }

      // G: commit（変更があれば）
      if (shSafe(`git -C "${dir}" status --porcelain`).out) {
        const cR = shSafe(`git -C "${dir}" commit -m "init: split from vibe-base monorepo (local-only, no remote)"`);
        if (!cR.ok) return { name, status: 'FAIL', detail: `commit failed: ${cR.out.slice(0, 200)}` };
      }
    }

    // I: vibe-base から untrack（製品ごとに即 commit して原子化・staged scope assert で混入防止）
    if (tracked > 0) {
      const rmR = shSafe(`git -C "${VIBE_BASE}" rm -r --cached "products/${name}/"`);
      if (!rmR.ok) return { name, status: 'FAIL', detail: `vibe rm --cached failed: ${rmR.out.slice(0, 200)}` };
      appendVibeGitignore(name);
      shSafe(`git -C "${VIBE_BASE}" add .gitignore`);
      // ★ staged スコープ assert: 想定外ファイル混入なら中断（他セッション staged 巻き込み防止）
      const staged = shSafe(`git -C "${VIBE_BASE}" -c core.quotepath=false diff --cached --name-only`).out.split('\n').filter(Boolean);
      const stray = staged.filter((f) => !f.startsWith(`products/${name}/`) && f !== '.gitignore');
      if (stray.length) return { name, status: 'FAIL', detail: `staged に想定外 ${stray.length}件: ${stray.slice(0, 3).join(',')}` };
      // ★ pathspec を付けないプレーン commit で staged 削除を確定する。
      //    旧: commit -- "products/<name>/" は pathspec 部分コミット＝ワークツリー再読込で
      //    rm --cached の削除を打ち消し untrack が空振りしていた（本 assert が保険）。
      const cR = shSafe(`git -C "${VIBE_BASE}" commit -m "chore: untrack products/${name} (split to own local repo)"`);
      if (!cR.ok) return { name, status: 'FAIL', detail: `vibe commit failed: ${cR.out.slice(0, 200)}` };
    }

    const detail = plan.join(', ') + (evicted.length ? ` | 退避${evicted.length}件(>10MB): ${evicted.slice(0, 3).map((l) => `${l.f}(${l.mb}MB)`).join(', ')}` : '');
    return { name, status: 'OK', detail };
  } catch (e) {
    return { name, status: 'FAIL', detail: ((e.stderr || e.message || '') + '').slice(0, 200) };
  }
}

// ---- main ----
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const all = args.includes('--all');
  const force = args.includes('--force');
  const prodArg = args.find((a) => a.startsWith('--product='));
  const product = prodArg ? prodArg.split('=')[1] : null;

  if (all && product) { console.error('ERROR: --all と --product は排他です'); process.exit(1); }
  if (!all && !product) { console.error('ERROR: --all か --product=<name> を指定してください'); process.exit(1); }
  if (product && !PRODUCTS.includes(product)) { console.error(`ERROR: 未知の製品: ${product}`); process.exit(1); }

  // 実行前 index 健全性アサート（並行セッションの staged を巻き込む前に止める）
  if (!dryRun) {
    const dirty = shSafe(`git -C "${VIBE_BASE}" diff --cached --name-only`);
    if (dirty.ok && dirty.out) {
      console.error('⛔ vibe-base の index に staged 変更があります（並行セッションの可能性）:');
      console.error(dirty.out.split(/\r?\n/).slice(0, 10).join('\n'));
      if (!force) { console.error('\n他セッションを閉じて index をクリーンにしてから再実行してください（--force で続行可・非推奨）。'); process.exit(1); }
      console.error('\n--force 指定のため続行します（他セッションの staged を巻き込む恐れあり）。');
    }
  }

  const targets = all ? PRODUCTS : [product];
  console.log(`\n=== migrate-products-to-repos ${dryRun ? '(DRY-RUN)' : ''} — local-only / ${targets.length} product(s) ===\n`);

  const results = [];
  for (const name of targets) {
    process.stdout.write(`• ${name.padEnd(32)} ... `);
    const r = migrateProduct(name, dryRun);
    results.push(r);
    console.log(`[${r.status}] ${r.detail || ''}`);
  }

  const by = {};
  for (const r of results) by[r.status] = (by[r.status] || 0) + 1;
  console.log('\n=== summary ===');
  console.log(Object.entries(by).map(([k, v]) => `${k}:${v}`).join('  '));

  const bad = results.filter((r) => ['WARN', 'FAIL', 'ERROR'].includes(r.status));
  if (bad.length) {
    console.log('\n要対応:');
    for (const r of bad) console.log(`  [${r.status}] ${r.name}: ${r.detail}`);
    process.exit(dryRun ? 0 : 1);
  }
}

main();
