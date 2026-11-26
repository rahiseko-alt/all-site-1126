#!/usr/bin/env node
// check-hook-runtime-errors.mjs — hook の「実行時隠れ故障」を hook-errors.jsonl から検知する。
//
// 背景: hook-runner pass-through は hook 本体がクラッシュ（ERR_MODULE_NOT_FOUND 等）しても
//       tool を素通りさせるため、ブロックすべき hook が無言で機能停止しても気付けない
//       （kosespark secret-write-gate の前例 = failures.md）。
//       静的検査（check-hooks-syntax.mjs / check-hook-integrity.mjs）では「実際に動かして失敗したか」は分からない。
//       本 script は実行ログ hook-errors.jsonl を走査し exit_code=1（非ブロッキングエラー＝tool 素通り）と
//       error フィールド非 null を「実行時故障シグナル」として集計する。
//
// ログ形式（1 行 1 JSON）: {ts, hook_name, tool_name, event, decision, duration_ms, exit_code, cwd, error}
//   exit_code 0 = 正常 / 2 = 意図的ブロック（deny）/ 1 = 非ブロッキングエラー（hook 自身の異常終了）
//
// 使い方: node scripts/check-hook-runtime-errors.mjs [--days N] [--list]
//   --days N : 直近 N 日を対象（既定 7）。0 で全期間。
//   --list   : 故障 hook ごとの最新エントリ ts を表示。
// 終了コード: 0 = 直近窓に実行時故障なし / 1 = 故障検知（check-in は WARN 扱い）

import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const LOG_PATH = join(homedir(), '.claude', 'logs', 'hook-errors.jsonl');

function parseArgs() {
  const argv = process.argv.slice(2);
  const days = argv.includes('--days')
    ? Number(argv[argv.indexOf('--days') + 1])
    : 7;
  return { days: Number.isFinite(days) ? days : 7, list: argv.includes('--list') };
}

function main() {
  const { days, list } = parseArgs();

  if (!existsSync(LOG_PATH)) {
    console.log(`hook-errors.jsonl 不在: ${LOG_PATH}（hook ログ未生成・スキップ）`);
    process.exit(0); // ログが無いだけで check-in は止めない
  }

  const cutoff = days > 0 ? Date.now() - days * 86400000 : 0;
  const text = readFileSync(LOG_PATH, 'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean);

  let scanned = 0;
  let inWindow = 0;
  const failByHook = new Map(); // hook_name -> { count, latestTs }

  for (const line of lines) {
    let rec;
    try { rec = JSON.parse(line); } catch { continue; }
    scanned++;
    const t = Date.parse(rec.ts);
    if (cutoff && (!Number.isFinite(t) || t < cutoff)) continue;
    inWindow++;
    const failed = rec.exit_code === 1 || (rec.error != null && rec.error !== '');
    if (!failed) continue;
    const name = rec.hook_name || '(unknown)';
    const cur = failByHook.get(name) || { count: 0, latestTs: '' };
    cur.count++;
    if (!cur.latestTs || (rec.ts && rec.ts > cur.latestTs)) cur.latestTs = rec.ts;
    failByHook.set(name, cur);
  }

  const totalFails = [...failByHook.values()].reduce((a, b) => a + b.count, 0);
  const windowLabel = days > 0 ? `直近 ${days} 日` : '全期間';

  console.log('hook 実行時故障スキャン (hook-errors.jsonl)');
  console.log(`  走査行         : ${scanned}`);
  console.log(`  対象窓(${windowLabel}) : ${inWindow} 件`);
  console.log(`  実行時故障     : ${totalFails} 件 / ${failByHook.size} hook`);

  if (failByHook.size === 0) {
    console.log('  OK: 対象窓に exit_code=1 / error 非null の hook なし');
    process.exit(0);
  }

  const sorted = [...failByHook.entries()].sort((a, b) => b[1].count - a[1].count);
  console.log(`\n  NG 候補（exit_code=1 ＝ ブロックすべき hook の無言素通り疑い）:`);
  for (const [name, info] of sorted) {
    const tail = list ? `  最新: ${info.latestTs}` : '';
    console.log(`   - ${name}: ${info.count} 件${tail}`);
  }
  console.log('   → 各 hook を CLI 単体起動 `echo "{}" | node .claude/hooks/<hook>.mjs` で再現し原因切り分け。');
  console.log('   → 廃止済 hook が残存発火している場合は登録解除（settings.json）と本体退避を確認。');
  process.exit(1);
}

main();
