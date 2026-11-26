#!/usr/bin/env node
/**
 * memory-cleanup.mjs
 * MEMORY.md に参照されていない孤立 .md ファイルをレポートする
 *
 * Usage:
 *   node scripts/memory-cleanup.mjs
 */

import { readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';

const MEMORY_DIR = 'C:\\Users\\user\\.claude\\projects\\C--Users-user-Desktop-ClaudeCode-vibe-base\\memory';
const MEMORY_FILE = join(MEMORY_DIR, 'MEMORY.md');

// MEMORY.md から参照ファイル名を抽出
const memoryContent = readFileSync(MEMORY_FILE, 'utf-8');
const referencedFiles = new Set();
referencedFiles.add('MEMORY.md');

// バッククォート形式: `memory/xxx.md` or `xxx.md`
const backtickPattern = /`(?:memory\/)?([^`]+\.md)`/g;
let match;
while ((match = backtickPattern.exec(memoryContent)) !== null) {
  referencedFiles.add(basename(match[1]));
}

// Markdownリンク形式: [text](memory/xxx.md) or [text](xxx.md)
const linkPattern = /\[([^\]]*)\]\((?:memory\/)?([^)]+\.md)\)/g;
while ((match = linkPattern.exec(memoryContent)) !== null) {
  referencedFiles.add(basename(match[2]));
}

// ルート直下の .md ファイルのみ（archive/ サブディレクトリを除く）
const rootFiles = readdirSync(MEMORY_DIR, { withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
  .map(entry => entry.name);

// 孤立ファイルを抽出
const orphans = rootFiles.filter(name => !referencedFiles.has(name));

console.log(`参照ファイル数: ${referencedFiles.size - 1} 件`);
console.log(`ルート .md ファイル総数: ${rootFiles.length} 件`);
console.log(`孤立ファイル件数: ${orphans.length} 件`);

if (orphans.length > 0) {
  console.log('\n孤立ファイル一覧:');
  orphans.forEach(name => console.log(`  - ${name}`));
  console.log('\nアーカイブするには archive-orphan-memories.mjs --execute を実行してください。');
  process.exit(0);
} else {
  console.log('\n孤立ファイルはありません。');
  process.exit(0);
}
