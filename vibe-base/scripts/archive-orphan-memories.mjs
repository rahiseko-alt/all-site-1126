#!/usr/bin/env node
/**
 * archive-orphan-memories.mjs
 * MEMORY.md に参照されていない孤立 .md ファイルを archive/ へ移動する
 *
 * Usage:
 *   node scripts/archive-orphan-memories.mjs --dry-run
 *   node scripts/archive-orphan-memories.mjs --execute
 */

import { readFileSync, readdirSync, mkdirSync, renameSync, existsSync } from 'fs';
import { join, basename } from 'path';

const MEMORY_DIR = 'C:\\Users\\user\\.claude\\projects\\C--Users-user-Desktop-ClaudeCode-vibe-base\\memory';
const MEMORY_FILE = join(MEMORY_DIR, 'MEMORY.md');
const ARCHIVE_DATE = '2026-06-06';
const ARCHIVE_DIR = join(MEMORY_DIR, 'archive', `memory-orphans-${ARCHIVE_DATE}`);

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isExecute = args.includes('--execute');

if (!isDryRun && !isExecute) {
  console.error('Usage: node scripts/archive-orphan-memories.mjs --dry-run | --execute');
  process.exit(1);
}

// MEMORY.md から参照ファイル名を抽出
// 形式1: `memory/xxx.md` （バッククォート形式）
// 形式2: [text](memory/xxx.md) （Markdownリンク形式）
const memoryContent = readFileSync(MEMORY_FILE, 'utf-8');
const referencedFiles = new Set();
referencedFiles.add('MEMORY.md'); // 自分自身を除外

// バッククォート形式: `memory/xxx.md` or `xxx.md`
const backtickPattern = /`(?:memory\/)?([^`]+\.md)`/g;
let match;
while ((match = backtickPattern.exec(memoryContent)) !== null) {
  const fileName = basename(match[1]);
  referencedFiles.add(fileName);
}

// Markdownリンク形式: [text](memory/xxx.md) or [text](xxx.md)
const linkPattern = /\[([^\]]*)\]\((?:memory\/)?([^)]+\.md)\)/g;
while ((match = linkPattern.exec(memoryContent)) !== null) {
  const fileName = basename(match[2]);
  referencedFiles.add(fileName);
}

console.log(`MEMORY.md から抽出した参照ファイル数: ${referencedFiles.size - 1} 件`);

// ディレクトリ内の全 .md ファイルを列挙（archive/ サブディレクトリを除く）
const allFiles = readdirSync(MEMORY_DIR, { withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
  .map(entry => entry.name);

console.log(`memory/ 内の .md ファイル総数: ${allFiles.length} 件`);

// 孤立ファイルを抽出
const orphans = allFiles.filter(name => !referencedFiles.has(name));

if (orphans.length === 0) {
  console.log('孤立ファイルは 0 件です。');
  process.exit(0);
}

console.log(`\n孤立ファイル: ${orphans.length} 件`);
orphans.forEach(name => console.log(`  - ${name}`));

if (isDryRun) {
  console.log('\n[dry-run] 上記ファイルをアーカイブ対象として検出しました。実行するには --execute を指定してください。');
  process.exit(0);
}

// --execute: archive ディレクトリへ移動
if (!existsSync(ARCHIVE_DIR)) {
  mkdirSync(ARCHIVE_DIR, { recursive: true });
  console.log(`\nアーカイブディレクトリを作成: ${ARCHIVE_DIR}`);
}

let movedCount = 0;
for (const name of orphans) {
  const src = join(MEMORY_DIR, name);
  const dst = join(ARCHIVE_DIR, name);
  renameSync(src, dst);
  console.log(`  moved: ${name}`);
  movedCount++;
}

console.log(`\n完了: ${movedCount} 件を ${ARCHIVE_DIR} へ移動しました。`);
