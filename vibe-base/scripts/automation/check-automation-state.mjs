#!/usr/bin/env node
/**
 * scripts/automation/check-automation-state.mjs
 *
 * C-R Tier2 判定実体 — check-in（A-28）から呼ばれ、自動実行 job の state を評価する。
 *  - EXIT 0: 健全（warn なし・滞留なし・state 破損なし。state ファイルが 1 つも無い場合も健全）。
 *  - EXIT 1: 1 件以上の WARN（job の warn / 最終成功の滞留 / state 破損）。
 *
 * check-in-verify.sh A-22/A-23 と同じ「exit code で OK/WARN を判定」パターンに合わせる。
 * 出力は行頭 2 スペース（check-in の sed 's/^/  /' と体裁を揃える）。
 */
import { evaluateStates, STATE_DIR } from './_lib/state.mjs';

const warnings = evaluateStates();

if (warnings.length === 0) {
  console.log('  走査対象: ' + STATE_DIR);
  console.log('  OK: automation jobs 健全（warn なし・滞留なし）');
  process.exit(0);
}

console.log('  走査対象: ' + STATE_DIR);
for (const w of warnings) {
  const since = w.since ? `（since ${w.since}）` : '';
  console.log(`  WARN [${w.job}] ${w.kind}: ${w.message}${since}`);
}
console.log(`集計: WARN ${warnings.length} 件`);
process.exit(1);
