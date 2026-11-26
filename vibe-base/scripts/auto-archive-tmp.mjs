#!/usr/bin/env node
/**
 * scripts/auto-archive-tmp.mjs
 *
 * vibe-base 配下の `.tmp-*` (root) と `tmp/` 配下のファイルで mtime が 30 日超のものを
 * archive 候補としてリストアップ。--exec で `archive/tmp-YYYYMMDD/` に移動する。
 *
 * 使い方:
 *   node scripts/auto-archive-tmp.mjs --dry-run    # 候補列挙 (JSON 出力)
 *   node scripts/auto-archive-tmp.mjs --exec       # 実 archive 移動
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VIBE_BASE_ROOT = path.resolve(__dirname, '..');

const isMain = (() => {
  try {
    const argv1 = (process.argv[1] || '').replace(/\\/g, '/');
    return argv1.endsWith('auto-archive-tmp.mjs');
  } catch {
    return false;
  }
})();
if (!isMain) process.exit(0);

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const exec = args.includes('--exec');

const THRESHOLD_DAYS = 30;
const NOW_MS = Date.now();
const THRESHOLD_MS = THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

function collectCandidates() {
  const candidates = [];

  // 1. root 直下の .tmp-*
  for (const f of fs.readdirSync(VIBE_BASE_ROOT, { withFileTypes: true })) {
    if (!f.name.startsWith('.tmp-')) continue;
    const fullPath = path.join(VIBE_BASE_ROOT, f.name);
    try {
      const stats = fs.statSync(fullPath);
      const ageMs = NOW_MS - stats.mtimeMs;
      if (ageMs > THRESHOLD_MS) {
        candidates.push({
          path: f.name,
          type: f.isDirectory() ? 'dir' : 'file',
          size: f.isDirectory() ? null : stats.size,
          mtime: new Date(stats.mtimeMs).toISOString(),
          ageDays: Math.floor(ageMs / (24 * 60 * 60 * 1000)),
        });
      }
    } catch {}
  }

  // 2. tmp/ 配下
  const tmpDir = path.join(VIBE_BASE_ROOT, 'tmp');
  if (fs.existsSync(tmpDir)) {
    for (const f of fs.readdirSync(tmpDir, { withFileTypes: true })) {
      const fullPath = path.join(tmpDir, f.name);
      try {
        const stats = fs.statSync(fullPath);
        const ageMs = NOW_MS - stats.mtimeMs;
        if (ageMs > THRESHOLD_MS) {
          candidates.push({
            path: `tmp/${f.name}`,
            type: f.isDirectory() ? 'dir' : 'file',
            size: f.isDirectory() ? null : stats.size,
            mtime: new Date(stats.mtimeMs).toISOString(),
            ageDays: Math.floor(ageMs / (24 * 60 * 60 * 1000)),
          });
        }
      } catch {}
    }
  }

  return candidates;
}

const candidates = collectCandidates();

if (dryRun) {
  process.stdout.write(JSON.stringify({
    archive_candidates: candidates.length,
    threshold_days: THRESHOLD_DAYS,
    candidates,
  }, null, 2) + '\n');
  process.exit(0);
}

if (exec) {
  if (candidates.length === 0) {
    process.stdout.write('no candidates to archive\n');
    process.exit(0);
  }
  const now = new Date();
  const tag =
    `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const archiveDir = path.join(VIBE_BASE_ROOT, 'archive', `tmp-${tag}`);
  fs.mkdirSync(archiveDir, { recursive: true });
  for (const c of candidates) {
    const src = path.join(VIBE_BASE_ROOT, c.path);
    const dest = path.join(archiveDir, c.path.replace(/\//g, '_'));
    fs.renameSync(src, dest);
    process.stdout.write(`moved: ${c.path} -> archive/tmp-${tag}/${path.basename(dest)}\n`);
  }
  process.exit(0);
}

process.stderr.write('usage: --dry-run | --exec\n');
process.exit(2);
