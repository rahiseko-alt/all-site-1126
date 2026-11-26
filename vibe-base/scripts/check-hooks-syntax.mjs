#!/usr/bin/env node
// scripts/check-hooks-syntax.mjs
//
// 目的: hook-runner pass-through 設計の機能停止隠蔽リスク恒久対策
//
// 背景: area-gate.mjs 等の hook に syntax error があると、hook-runner.mjs が
//   EXIT 0 で pass-through する設計のため、hook 機能停止が harness に表面化しない。
//   これにより「hook 配備済だが事実上機能停止」状態を放置するリスクがある。
//
// 動作: vibe-base 配下の全 hook .mjs を再帰検出して `node --check` で構文検査。
//   NG (SyntaxError) を 1 件でも検出したら exit 1 + 詳細表示。
//
// 検査対象:
//   - .claude/hooks/*.mjs (vibe-base root)
//   - products/*/.claude/hooks/*.mjs
//   - products/*/*/.claude/hooks/*.mjs (ネスト product 配下)
//
// 用途:
//   - check-in-verify.sh の A 系列として組み込み (毎セッション Check-in で実行)
//   - pre-commit hook で実行 (commit 前に syntax 保証)
//   - 単発 `node scripts/check-hooks-syntax.mjs` で実行可能

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

/** 再帰的に .claude/hooks/*.mjs を収集 */
function collectHooks(root) {
  const hooks = [];
  function walk(dir) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // node_modules / .git / archive をスキップ
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'archive') continue;
        // .claude/hooks/ ディレクトリにヒットしたら配下の .mjs を全件採集
        if (path.basename(dir) === '.claude' && entry.name === 'hooks') {
          try {
            for (const f of fs.readdirSync(full, { withFileTypes: true })) {
              if (f.isFile() && f.name.endsWith('.mjs')) {
                hooks.push(path.join(full, f.name));
              }
            }
          } catch {}
          // 配下を再帰する必要なし
          continue;
        }
        walk(full);
      }
    }
  }
  walk(root);
  return hooks.sort();
}

const hooks = collectHooks(ROOT);

if (hooks.length === 0) {
  console.error('WARN: hook が 1 件も見つかりませんでした。検出ロジック異常の可能性。');
  process.exit(1);
}

const failures = [];
let okCount = 0;

for (const hookPath of hooks) {
  const rel = path.relative(ROOT, hookPath);
  try {
    execFileSync(process.execPath, ['--check', hookPath], { stdio: 'pipe' });
    okCount++;
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString() : '';
    const stdout = err.stdout ? err.stdout.toString() : '';
    const detail = (stderr || stdout || err.message).split('\n').slice(0, 3).join(' | ');
    failures.push({ rel, detail });
  }
}

console.log(`=== hook syntax check ===`);
console.log(`scanned: ${hooks.length}`);
console.log(`OK:      ${okCount}`);
console.log(`NG:      ${failures.length}`);

if (failures.length > 0) {
  console.log('');
  console.log('=== NG 詳細 ===');
  for (const f of failures) {
    console.log(`- ${f.rel}`);
    console.log(`    ${f.detail}`);
  }
  console.log('');
  console.log('修正後に再実行してください。hook-runner pass-through で隠蔽されない設計です。');
  process.exit(1);
}

console.log('全 hook 構文 OK');
process.exit(0);
