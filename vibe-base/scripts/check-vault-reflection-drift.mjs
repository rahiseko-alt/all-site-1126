#!/usr/bin/env node
/**
 * check-vault-reflection-drift.mjs — vault 反映(内部改善の堆積)の滞留を check-in 時に判定する。
 *
 * 「二重の網」Tier2。check-in-verify.sh(A-23) から呼ばれ、/pc-checkin 実行時にマスターが視認する。
 * vault-sync-state.json の最終成功日を見て、--days N（既定7）を超えて成功がなければ EXIT 1（WARN扱い）。
 * read-only・state を読むだけ。
 *
 * 実行: node scripts/check-vault-reflection-drift.mjs [--days 7]
 */
import { daysSinceLastSuccess, readState, STATE_PATH } from "./_lib/vault-sync-state.mjs";

function pad(n) {
  return String(n).padStart(2, "0");
}
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function arg(name, def) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : def;
}

function main() {
  const threshold = parseInt(arg("--days", "7"), 10);
  const date = today();
  const s = readState();
  const days = daysSinceLastSuccess(date);

  console.log(`  走査対象: vault-sync-state.json`);
  console.log(`  最終成功日: ${s.last_success_date ?? "記録なし"}（連続失敗 ${s.consecutive_failures} 回）`);

  if (days <= threshold) {
    console.log(`  OK: vault 反映は健全（最終成功から ${days === Infinity ? "?" : days} 日・閾値 ${threshold}）。`);
    process.exit(0);
  }

  const span = days === Infinity ? "一度も成功なし" : `${days} 日滞留`;
  console.log(`  NG: vault 反映が ${span}（閾値 ${threshold} 超）。内部改善が vault に堆積していない可能性。`);
  console.log(`  対応: node scripts/x-vault-sync.mjs を手動実行 → 復旧。タスク消失時は pwsh scripts/register-vault-sync-tasks.ps1。`);
  process.exit(1);
}

main();
