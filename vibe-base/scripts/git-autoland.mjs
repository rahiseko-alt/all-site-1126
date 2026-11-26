#!/usr/bin/env node
/**
 * scripts/git-autoland.mjs
 *
 * feature ブランチを master へ自律統合する。マスターが git を操作せずに済むよう、
 * 統合手順（fetch → rebase → 機械検証 → ff-only merge → push → cleanup）を一括自動化する。
 *
 * 安全境界（.claude/settings.json と整合）:
 *   - push は許可されている（deny ではない）が、--force は使わない・ff-only merge のみ＝履歴を壊さない。
 *   - rebase 衝突時は abort して master に一切触れない。
 *   - 検証 FAIL（fsck / node --check / lint / build）時は merge/push しない。
 *
 * 使い方:
 *   node scripts/git-autoland.mjs            feature → master を統合（実行）
 *   node scripts/git-autoland.mjs --dry-run  fetch + 衝突判定 + 検証予定の表示のみ（master 不変）
 *
 * EXIT: 0=統合成功 or dry 完了 / 1=ガード違反・衝突・検証 FAIL・push 失敗
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VIBE_BASE_ROOT = path.resolve(__dirname, '..');

const dryRun = process.argv.slice(2).includes('--dry-run');

function log(msg) {
  process.stdout.write(`[autoland] ${msg}\n`);
}
function fail(msg) {
  process.stderr.write(`[autoland] FAIL: ${msg}\n`);
  process.exit(1);
}

// git ヘルパ（出力は継承／status を返す）
function git(args, { capture = false } = {}) {
  return spawnSync('git', args, {
    cwd: VIBE_BASE_ROOT,
    encoding: 'utf-8',
    stdio: capture ? ['inherit', 'pipe', 'pipe'] : 'inherit',
  });
}
function gitOut(args) {
  const r = git(args, { capture: true });
  return (r.stdout || '').trim();
}

// ── 1. ガード: feature/* ブランチでのみ実行 ──
const branch = gitOut(['rev-parse', '--abbrev-ref', 'HEAD']);
if (!branch.startsWith('feature/')) {
  fail(`feature/* ブランチでのみ実行可（現在: ${branch}）。git-worktree-new.mjs で feature worktree を作って作業せよ。`);
}
log(`対象ブランチ: ${branch}`);

// ── 2. fetch ──
log('git fetch origin ...');
if (git(['fetch', 'origin']).status !== 0) fail('fetch 失敗（ネットワーク or 認証）。');

// ── 3. rebase origin/master（衝突 = abort して master 不変） ──
log('git rebase origin/master ...');
if (git(['rebase', 'origin/master']).status !== 0) {
  git(['rebase', '--abort']);
  fail('rebase 衝突 → abort（master 不変）。worktree 内で手動解決してから再実行せよ。');
}

// ── 4. 機械検証ゲート ──
log('機械検証: git fsck ...');
if (git(['fsck', '--no-progress']).status !== 0) fail('git fsck 異常。');

const changed = gitOut(['diff', '--name-only', 'origin/master...HEAD'])
  .split('\n')
  .map((s) => s.trim())
  .filter(Boolean);
const jsFiles = changed.filter((f) => /\.(mjs|js|cjs)$/.test(f));
for (const f of jsFiles) {
  const abs = path.join(VIBE_BASE_ROOT, f);
  if (!fs.existsSync(abs)) continue; // 削除ファイルは skip
  log(`機械検証: node --check ${f}`);
  if (spawnSync(process.execPath, ['--check', abs], { stdio: 'inherit' }).status !== 0) {
    fail(`node --check 失敗: ${f}`);
  }
}

// lint / build はルート package.json に scripts があれば実行（無ければ skip）
function pkgScripts() {
  try {
    const p = JSON.parse(fs.readFileSync(path.join(VIBE_BASE_ROOT, 'package.json'), 'utf-8'));
    return p.scripts || {};
  } catch {
    return {};
  }
}
const scripts = pkgScripts();
for (const name of ['lint', 'build']) {
  if (scripts[name]) {
    log(`機械検証: npm run ${name}`);
    if (spawnSync('npm', ['run', name], { cwd: VIBE_BASE_ROOT, stdio: 'inherit', shell: true }).status !== 0) {
      fail(`npm run ${name} 失敗。`);
    }
  } else {
    log(`機械検証: npm run ${name} skip(no script)`);
  }
}

if (dryRun) {
  log('[dry] 検証 PASS。ここで実行を停止（master 不変・以降は ff-merge → push → cleanup の予定）。');
  log(`[dry] 統合予定: ${branch} → master（ff-only）→ git push origin master → branch -d ${branch}`);
  process.exit(0);
}

// ── 5. ff-only merge（master へ） ──
// worktree 設計: 本体は常に master 上。git checkout master は禁止
// （本体 master と二重 checkout になり fatal エラー）。
// git worktree list 先頭エントリ = 本体 root でそこで merge する。
const mainRoot = (() => {
  const out = gitOut(['worktree', 'list', '--porcelain']);
  const m = out.match(/^worktree (.+)$/m);
  return m ? m[1].trim() : VIBE_BASE_ROOT;
})();
log(`git merge --ff-only ${branch} (本体: ${mainRoot}) ...`);
if (spawnSync('git', ['merge', '--ff-only', branch], {
  cwd: mainRoot, encoding: 'utf-8', stdio: 'inherit',
}).status !== 0) {
  fail('ff-only merge 不成立（rebase 後のはずが ff できない）。手動確認せよ。');
}

// ── 6. push（許可済み・--force は使わない） ──
log('git push origin master ...');
if (git(['push', 'origin', 'master']).status !== 0) {
  fail('push 失敗。bot 先行の可能性 → fetch して再 autoland（rebase からやり直し）。');
}

// ── 7. cleanup（feature ブランチ削除・worktree 撤去は別途案内） ──
log(`git branch -d ${branch} ...`);
git(['branch', '-d', branch]);

const aheadBehind = gitOut(['rev-list', '--left-right', '--count', 'origin/master...HEAD']);
log(`完了: ${branch} を master へ統合・push 済み（origin との差分: ${aheadBehind}）。`);
log('worktree を使った場合は: git worktree remove .worktrees/<topic> && git worktree prune');
process.exit(0);
