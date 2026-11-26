#!/usr/bin/env node
// scripts/install-git-hooks.mjs
// scripts/git-hooks/* を .git/hooks/* にコピー（チーム共有 git hooks の正本同期）
// 新規 clone 時 + Check-in 時に冪等実行可能

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'scripts', 'git-hooks');
const DST_DIR = path.join(ROOT, '.git', 'hooks');

if (!fs.existsSync(DST_DIR)) {
  console.error(`ERROR: .git/hooks ディレクトリが見つかりません: ${DST_DIR}`);
  process.exit(1);
}
if (!fs.existsSync(SRC_DIR)) {
  console.error(`ERROR: scripts/git-hooks ディレクトリが見つかりません: ${SRC_DIR}`);
  process.exit(1);
}

let updated = 0;
let unchanged = 0;
for (const name of fs.readdirSync(SRC_DIR)) {
  const src = path.join(SRC_DIR, name);
  const dst = path.join(DST_DIR, name);
  if (!fs.statSync(src).isFile()) continue;

  const srcContent = fs.readFileSync(src, 'utf-8');
  let dstContent = '';
  if (fs.existsSync(dst)) dstContent = fs.readFileSync(dst, 'utf-8');

  if (srcContent === dstContent) {
    console.log(`OK   ${name} (already synced)`);
    unchanged++;
    continue;
  }

  fs.writeFileSync(dst, srcContent);
  try { fs.chmodSync(dst, 0o755); } catch { /* Windows では失敗するが問題ない */ }
  console.log(`SYNC ${name}`);
  updated++;
}

console.log('');
console.log(`${updated}/${updated + unchanged} git hooks updated`);
