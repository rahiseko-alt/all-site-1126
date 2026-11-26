/**
 * vault-sync-state.mjs — vault 反映の「最終成功日 / 連続失敗」状態を持つ純データモジュール。
 *
 * 設計（failures.md 2026-06-20 の教訓に準拠）:
 *  - 副作用ゼロ（import しただけでは何も起きない。関数呼出でのみ read/write）。
 *  - x-vault-sync.mjs（成功記録）と x-vault-sync-verify.mjs（失敗カウント）の双方が import する単一正本。
 *  - state は PC ローカル運用情報のため git 管理外（~/.claude/logs/）に置く。
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

export const STATE_PATH = join(homedir(), ".claude", "logs", "vault-sync-state.json");

const EMPTY = {
  last_success_date: null,
  last_success_time: null,
  consecutive_failures: 0,
  first_failure_date: null,
  last_written: 0,
  generated_by: null,
};

export function readState() {
  try {
    return { ...EMPTY, ...JSON.parse(readFileSync(STATE_PATH, "utf-8")) };
  } catch {
    return { ...EMPTY };
  }
}

export function writeState(state) {
  // 状態記録は best-effort。書込失敗(ディスク満杯/権限)で呼び出し元(sync/verify)を
  // クラッシュさせない（state は補助証跡であり本処理を止める理由にしない）。
  try {
    if (!existsSync(dirname(STATE_PATH))) mkdirSync(dirname(STATE_PATH), { recursive: true });
    writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + "\n", "utf-8");
  } catch (e) {
    process.stderr.write(`[vault-sync-state] state 書込失敗（無視して続行）: ${e.message}\n`);
  }
}

/** sync 成功時: 連続失敗をリセットし最終成功日を刻む。 */
export function recordSuccess(date, time, written) {
  writeState({
    last_success_date: date,
    last_success_time: time,
    consecutive_failures: 0,
    first_failure_date: null,
    last_written: written,
    generated_by: "x-vault-sync.mjs",
  });
}

/**
 * verify 時: 当日 sync が成功済みかを state で判定する。
 *  - 当日成功済み → { ok:true }（カウント据置）。
 *  - 未成功 → consecutive_failures をインクリメントし first_failure_date を記録して書き戻す。
 */
export function evaluateForDate(date) {
  const s = readState();
  if (s.last_success_date === date) return { ok: true, state: s };
  s.consecutive_failures = (s.consecutive_failures || 0) + 1;
  if (!s.first_failure_date) s.first_failure_date = date;
  s.generated_by = "x-vault-sync-verify.mjs";
  writeState(s);
  return { ok: false, state: s };
}

/** 最終成功日から経過日数（state 不在/未成功は Infinity）。滞留検知 hook 用。 */
export function daysSinceLastSuccess(todayDate) {
  const s = readState();
  if (!s.last_success_date) return Infinity;
  const a = Date.parse(`${s.last_success_date}T00:00:00`);
  const b = Date.parse(`${todayDate}T00:00:00`);
  if (Number.isNaN(a) || Number.isNaN(b)) return Infinity;
  return Math.round((b - a) / 86400000);
}
