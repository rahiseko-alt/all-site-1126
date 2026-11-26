#!/usr/bin/env node
/**
 * scripts/git-worktree-new.mjs
 *
 * ADR-0003 準拠の feature worktree を生成する。
 *   - ブランチ: feature/<topic>-<yyyymmdd>
 *   - 置き場所: vibe-base/.worktrees/<topic>（本体配下。兄弟配置は outside-vibe-base-gate に弾かれるため不可）
 *   - 起点: origin/master（bot 最新を含み、本体の未 push ahead を含まないクリーン起点）
 * 作業後は `node scripts/git-autoland.mjs` で master へ自律統合する（PR 経由・本体直編集はしない）。
 *
 * 使い方:
 *   node scripts/git-worktree-new.mjs <topic> [yyyymmdd]
 *     例: node scripts/git-worktree-new.mjs git-pipeline
 *
 * EXIT: 0=作成成功 / 1=引数不正・二重作成・git 失敗
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VIBE_BASE_ROOT = path.resolve(__dirname, '..');

function log(msg) {
  process.stdout.write(`[worktree-new] ${msg}\n`);
}
function fail(msg) {
  process.stderr.write(`[worktree-new] FAIL: ${msg}\n`);
  process.exit(1);
}
function git(args, { capture = false } = {}) {
  return spawnSync('git', args, {
    cwd: VIBE_BASE_ROOT,
    encoding: 'utf-8',
    stdio: capture ? ['inherit', 'pipe', 'pipe'] : 'inherit',
  });
}

const args = process.argv.slice(2);
const topic = (args[0] || '').trim();
if (!topic) {
  fail('usage: node scripts/git-worktree-new.mjs <topic> [yyyymmdd]');
}
if (!/^[a-z0-9-]+$/.test(topic)) {
  fail(`topic は kebab-case 必須（^[a-z0-9-]+$）: ${topic}`);
}

// 日付: 第2引数 or env or 今日
function today() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}
const stamp = (args[1] || process.env.WORKTREE_DATE || today()).trim();
if (!/^\d{8}$/.test(stamp)) {
  fail(`日付は yyyymmdd（8桁）: ${stamp}`);
}

const branch = `feature/${topic}-${stamp}`;
const relPath = path.join('.worktrees', topic);
const absPath = path.join(VIBE_BASE_ROOT, relPath);

// 最新 origin/master 取得
log('git fetch origin ...');
if (git(['fetch', 'origin']).status !== 0) fail('fetch 失敗（ネットワーク or 認証）。');

// 二重作成チェック
if (fs.existsSync(absPath)) {
  fail(`worktree パスが既に存在: ${relPath}（撤去するには git worktree remove ${relPath}）`);
}
if (git(['rev-parse', '--verify', '--quiet', branch], { capture: true }).status === 0) {
  fail(`ブランチが既に存在: ${branch}`);
}

// worktree 作成
log(`git worktree add ${relPath} -b ${branch} origin/master ...`);
if (git(['worktree', 'add', relPath, '-b', branch, 'origin/master']).status !== 0) {
  fail('git worktree add 失敗。');
}

log('');
log('作成しました:');
log(`  worktree: ${absPath}`);
log(`  branch:   ${branch}（起点 origin/master）`);
log('');
log('次の手順:');
log(`  1) この worktree 内で作業し、path-scoped で commit（git add -- <明示パス>）`);
log(`  2) 完了したら本体に戻り: node scripts/git-autoland.mjs（feature→検証→ff-merge→push を自動）`);
log(`  3) 撤去: git worktree remove ${relPath} && git worktree prune`);
process.exit(0);
