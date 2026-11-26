#!/usr/bin/env node
// scripts/memory-prune-check.mjs
//
// MEMORY.md(auto-memory) 内の「完了済み/放置決定/訂正済み」マーカーを検出し archival を勧告する。
// MEMORY.md は全セッション auto-load されるため、完了済みエントリの死蔵は全 product の context を恒常圧迫する。
// checkout / check-in で走らせる想定。非破壊・advisory（exit は常に 0・勧告のみ）。
//
// 使い方:
//   node scripts/memory-prune-check.mjs            # auto-memory パスを自動解決
//   node scripts/memory-prune-check.mjs <path>     # 明示パス（テスト用）
//
// 参照: docs/ops/plans/2026-06-23-memory-context-bloat-fix.md

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// 死蔵候補マーカー（完了/放置/訂正系）。退避済みポインタ「【退避済」は対象外。
const MARKER_RE = /【(完了|放置決定|訂正済|脅威モデル訂正済)/;

function resolveMemoryPath() {
  if (process.argv[2]) return process.argv[2];
  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const slug = projectDir.replace(/[\\/:]/g, '-'); // 各区切りを個別に '-'（C:\ → C-- 形式に一致させる）
  return path.join(os.homedir(), '.claude', 'projects', slug, 'memory', 'MEMORY.md');
}

function main() {
  const mp = resolveMemoryPath();
  if (!fs.existsSync(mp)) {
    console.log(`memory-prune-check: MEMORY.md not found (${mp}) — skip`);
    return 0;
  }
  const lines = fs.readFileSync(mp, 'utf8').split(/\r?\n/);
  const hits = [];
  lines.forEach((ln, i) => {
    const m = ln.match(MARKER_RE);
    if (m) hits.push({ n: i + 1, marker: m[1], text: ln.slice(0, 80) });
  });

  if (hits.length === 0) {
    console.log('memory-prune-check: clean（死蔵マーカーなし）');
    return 0;
  }

  console.log(`⚠️ memory-prune-check: 死蔵候補 ${hits.length} 件（MEMORY.md は全セッション auto-load・archive 退避を勧告）`);
  console.log(`   対象: ${mp}`);
  for (const h of hits) console.log(`   L${h.n} 【${h.marker}…  ${h.text}`);
  console.log('   → archive/ へ退避し本文を 1 行ポインタ化（context 削減）');
  return 0; // advisory・非破壊
}

process.exit(main());
