#!/usr/bin/env node
// serena-finalize-setup.mjs
// Serena MCP 導入の「マスター手動2件」を冪等に適用する。
// AI の Edit はゲート（outside-vibe-base-gate / 自己改変ブロック）で不可なため、
// マスターが `!node scripts/serena-finalize-setup.mjs` で実行する想定。
// 正本 runbook: docs/ops/serena-mcp-setup.md
//
// 何をするか:
//   #3 ~/.serena/serena_config.yml の `ignored_paths: []` を5パターンへ置換
//   #6 ~/.claude/settings.json に Serena 3 hook を追記（既存キー・シークレットは保全）
// 冪等: 既に適用済みなら skip。シークレット値は一切表示しない。

import fs from 'fs';
import os from 'os';
import path from 'path';

const home = os.homedir();
const serenaCfg = path.join(home, '.serena', 'serena_config.yml');
const settingsJson = path.join(home, '.claude', 'settings.json');

const IGNORE_BLOCK = `ignored_paths:
- "**/.worktrees/**"
- "**/node_modules/**"
- "**/archive/**"
- "**/backups/**"
- "**/outputs/**"`;

const SERENA_HOOKS = {
  SessionStart: [
    { hooks: [{ type: 'command', command: 'serena-hooks activate --client claude-code' }] },
  ],
  PreToolUse: [
    { matcher: 'Read|Grep|Glob', hooks: [{ type: 'command', command: 'serena-hooks remind --client claude-code' }] },
  ],
  SessionEnd: [
    { hooks: [{ type: 'command', command: 'serena-hooks cleanup --client claude-code' }] },
  ],
};

const results = [];

// ---- #3 serena_config.yml ----
try {
  if (!fs.existsSync(serenaCfg)) {
    results.push(['#3 serena_config.yml', 'SKIP (file not found)']);
  } else {
    let txt = fs.readFileSync(serenaCfg, 'utf8');
    if (txt.includes('**/.worktrees/**')) {
      results.push(['#3 serena_config.yml', 'ALREADY APPLIED']);
    } else if (/^ignored_paths:\s*\[\s*\]\s*$/m.test(txt)) {
      txt = txt.replace(/^ignored_paths:\s*\[\s*\]\s*$/m, IGNORE_BLOCK);
      fs.writeFileSync(serenaCfg, txt);
      results.push(['#3 serena_config.yml', 'APPLIED (5 patterns)']);
    } else {
      results.push(['#3 serena_config.yml', 'MANUAL: `ignored_paths: []` の行が見つからない（既に編集済の可能性）。runbook 参照']);
    }
  }
} catch (e) {
  results.push(['#3 serena_config.yml', 'ERROR: ' + e.message]);
}

// ---- #6 settings.json ----
function mergeEvent(existingArr, addArr) {
  // 同一 command を含むエントリは重複追加しない
  const cmds = new Set();
  for (const grp of existingArr) for (const h of grp.hooks || []) cmds.add(h.command);
  const merged = existingArr.slice();
  for (const grp of addArr) {
    const newGrp = (grp.hooks || []).every((h) => cmds.has(h.command));
    if (!newGrp) merged.push(grp);
  }
  return merged;
}

try {
  if (!fs.existsSync(settingsJson)) {
    results.push(['#6 settings.json', 'SKIP (file not found)']);
  } else {
    const raw = fs.readFileSync(settingsJson, 'utf8');
    const cfg = JSON.parse(raw); // シークレット含む既存値はそのまま保持
    cfg.hooks = cfg.hooks || {};
    let changed = false;
    for (const [evt, addArr] of Object.entries(SERENA_HOOKS)) {
      const before = JSON.stringify(cfg.hooks[evt] || []);
      cfg.hooks[evt] = mergeEvent(cfg.hooks[evt] || [], addArr);
      if (JSON.stringify(cfg.hooks[evt]) !== before) changed = true;
    }
    if (changed) {
      fs.writeFileSync(settingsJson, JSON.stringify(cfg, null, 2) + '\n');
      results.push(['#6 settings.json', 'APPLIED (3 hooks merged, secrets preserved)']);
    } else {
      results.push(['#6 settings.json', 'ALREADY APPLIED']);
    }
  }
} catch (e) {
  results.push(['#6 settings.json', 'ERROR: ' + e.message]);
}

// ---- 検証出力（シークレットは出さない）----
console.log('=== Serena finalize 結果 ===');
for (const [k, v] of results) console.log(`  ${k}: ${v}`);

// #3 検証: 5語の存在
try {
  const t = fs.readFileSync(serenaCfg, 'utf8');
  const words = ['.worktrees', 'node_modules', 'archive', 'backups', 'outputs'];
  const ok = words.every((w) => t.includes(w));
  console.log(`  [verify #3] ignored_paths 5語: ${ok ? 'OK' : 'NG'}`);
} catch {}

// #6 検証: hooks キー3イベントの存在（コマンド名のみ・値は出さない）
try {
  const cfg = JSON.parse(fs.readFileSync(settingsJson, 'utf8'));
  const has = (e, sub) => JSON.stringify(cfg.hooks?.[e] || []).includes(sub);
  console.log(`  [verify #6] SessionStart/activate: ${has('SessionStart', 'serena-hooks activate') ? 'OK' : 'NG'}`);
  console.log(`  [verify #6] PreToolUse/remind:    ${has('PreToolUse', 'serena-hooks remind') ? 'OK' : 'NG'}`);
  console.log(`  [verify #6] SessionEnd/cleanup:   ${has('SessionEnd', 'serena-hooks cleanup') ? 'OK' : 'NG'}`);
} catch {}

console.log('=== done ===');
