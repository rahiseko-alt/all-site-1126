#!/usr/bin/env node
/**
 * init-product-repo.mjs
 *
 * 新規製品を「独立したローカル git リポジトリ」として初期化する。
 * scaffold 直後（vibe-base root にまだ tracked されていない新規製品）を対象に:
 *   - git init -b main
 *   - 標準 .gitignore（_lib/standard-gitignore.txt）配置
 *   - 初回 commit（local-only・remote 無し）
 *   - vibe-base root .gitignore に products/<name>/ を追記（今後 root が拾わない）
 *
 * ★ GitHub には push しない（ローカル独立スタート）。共有/公開が要る時に
 *   `gh repo create rahiseko-alt/<name> --private && git -C products/<name> remote add origin <url> && git -C products/<name> push -u origin main`
 *   でオンデマンドに上げる（docs/ops/git-branching-guide.md 参照）。
 *
 * migrate-products-to-repos.mjs の「製品側処理」を新規製品向けに抽出したもの。
 * 既存 tracked 製品の分離は本スクリプトでなく migrate-products-to-repos.mjs を使う
 * （root untrack を伴うため）。本スクリプトは root 未追跡の新規専用で、
 * tracked を検出したら ERROR で migrate へ誘導する。
 *
 * 副作用ある module の import を避けるため self-contained（standard-gitignore.txt のみ共有）。
 *
 * 使い方:
 *   node scripts/init-product-repo.mjs --product=<name>            # 実行
 *   node scripts/init-product-repo.mjs --product=<name> --dry-run  # 予定表示（実変更なし）
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIBE_BASE = path.resolve(__dirname, '..');
const PRODUCTS_DIR = path.join(VIBE_BASE, 'products');
const STANDARD_GITIGNORE = path.join(__dirname, '_lib', 'standard-gitignore.txt');
const MARKER = '# === vibe-base migration standard ===';

// ---- shell helpers ----
function sh(cmd, opts = {}) {
  return execSync(cmd, {
    encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024, ...opts,
  }).trim();
}
function shSafe(cmd, opts = {}) {
  try { return { ok: true, out: sh(cmd, opts) }; }
  catch (e) { return { ok: false, out: ((e.stdout || '') + (e.stderr || '')).trim(), code: e.status }; }
}

// ---- git state helpers ----
function hasValidGit(dir) { return fs.existsSync(path.join(dir, '.git', 'HEAD')); }
// commit が1件でも存在するか（.git/HEAD の有無だけでは中途失敗を弾けないため）
function hasCommit(dir) { return shSafe(`git -C "${dir}" rev-parse --verify HEAD`).ok; }
// 中途失敗で生成された .git をロールバック（原子性確保）。commit 未完の .git のみ対象。
function rollbackGit(dir) {
  try { fs.rmSync(path.join(dir, '.git'), { recursive: true, force: true }); } catch { /* best-effort */ }
}
function vibeTrackedCount(name) {
  const r = shSafe(`git -C "${VIBE_BASE}" ls-files "products/${name}/"`);
  return r.ok && r.out ? r.out.split(/\r?\n/).filter(Boolean).length : 0;
}

// ---- .gitignore handling ----
// 標準 .gitignore を不在製品に配置（MARKER 済なら冪等 skip）
function ensureStandardGitignore(dir) {
  const giPath = path.join(dir, '.gitignore');
  const current = fs.existsSync(giPath) ? fs.readFileSync(giPath, 'utf8') : '';
  if (current.includes(MARKER)) return false;
  const block = fs.readFileSync(STANDARD_GITIGNORE, 'utf8');
  const sep = current && !current.endsWith('\n') ? '\n' : '';
  fs.writeFileSync(giPath, current + sep + block);
  return true;
}
// vibe-base root .gitignore に products/<name>/ を冪等追記
function appendVibeGitignore(name) {
  const gi = path.join(VIBE_BASE, '.gitignore');
  const line = `products/${name}/`;
  const cur = fs.existsSync(gi) ? fs.readFileSync(gi, 'utf8') : '';
  if (cur.split(/\r?\n/).map((s) => s.trim()).includes(line)) return false;
  const sep = cur && !cur.endsWith('\n') ? '\n' : '';
  fs.appendFileSync(gi, `${sep}${line}\n`);
  return true;
}

// ---- init ----
function initProduct(name, dryRun) {
  const dir = path.join(PRODUCTS_DIR, name);
  if (!fs.existsSync(dir)) return { status: 'ERROR', detail: `directory not found: products/${name}` };

  // GUARD: 既に独立リポ化済み（.git + commit あり）→ root .gitignore を冪等補完して SKIP。
  //   .git はあるが commit 0 件 = 前回の中途失敗（commit 失敗で宙ぶらりん）。
  //   この状態を「分離済み」と誤認して SKIP すると永久に修復されないため、ロールバックして再作成する。
  if (hasValidGit(dir)) {
    if (hasCommit(dir)) {
      const appended = dryRun ? false : appendVibeGitignore(name);
      return { status: 'SKIP', detail: 'already split' + (appended ? '（root .gitignore を補完追記）' : '') };
    }
    if (dryRun) {
      return { status: 'PLAN', detail: 'rollback-incomplete-.git, git-init(-b main), standard-gitignore, initial-commit, root-gitignore-append' };
    }
    rollbackGit(dir); // commit 未完の中途 .git を除去してやり直す
  }

  // GUARD: root に tracked されている＝新規でなく既存 → migrate へ誘導
  const tracked = vibeTrackedCount(name);
  if (tracked > 0) {
    return { status: 'ERROR', detail: `root に ${tracked} 件 tracked。新規でなく既存分離＝migrate-products-to-repos.mjs --product=${name} を使え` };
  }

  const plan = ['git-init(-b main)', 'standard-gitignore', 'initial-commit', 'root-gitignore-append'];
  if (dryRun) return { status: 'PLAN', detail: plan.join(', ') };

  try {
    sh(`git -C "${dir}" init -b main`);
    ensureStandardGitignore(dir);

    const addR = shSafe(`git -C "${dir}" add .`);
    if (!addR.ok) { rollbackGit(dir); return { status: 'FAIL', detail: `add failed (rolled back .git): ${addR.out.slice(0, 200)}` }; }

    // 変更があれば commit（空ディレクトリ scaffold でも .gitignore は入る）
    if (shSafe(`git -C "${dir}" status --porcelain`).out) {
      const cR = shSafe(`git -C "${dir}" commit -m "init: new product local repo (local-only, no remote)"`);
      // commit 失敗時は .git をロールバック（原子性確保・宙ぶらりん防止）。root .gitignore は未追記のまま。
      if (!cR.ok) { rollbackGit(dir); return { status: 'FAIL', detail: `commit failed (rolled back .git): ${cR.out.slice(0, 200)}` }; }
    }

    // commit 成功後にのみ root .gitignore へ追記（完了マーカー）
    appendVibeGitignore(name);
    return { status: 'OK', detail: plan.join(', ') };
  } catch (e) {
    rollbackGit(dir);
    return { status: 'FAIL', detail: ((e.stderr || e.message || '') + '').slice(0, 200) };
  }
}

// ---- main ----
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const prodArg = args.find((a) => a.startsWith('--product='));
  const product = prodArg ? prodArg.split('=')[1] : null;

  if (!product) { console.error('ERROR: --product=<name> を指定してください'); process.exit(1); }

  console.log(`\n=== init-product-repo ${dryRun ? '(DRY-RUN)' : ''} — ${product} ===\n`);
  process.stdout.write(`• ${product.padEnd(28)} ... `);
  const r = initProduct(product, dryRun);
  console.log(`[${r.status}] ${r.detail || ''}`);

  if (['ERROR', 'FAIL'].includes(r.status)) process.exit(1);
}

main();
