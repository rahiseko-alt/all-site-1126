#!/usr/bin/env node
/**
 * x-vault-sync-verify.mjs — vault 自動転記が当日走ったかを state で確認する（ローカル定期タスク）。
 *
 * 設計方針（自己検証ループ・例外時アラート）:
 *  - x-vault-sync の後（08:15）に走り、当日 sync が成功済みかを vault-sync-state.json で判定する。
 *    （sync は origin/master 全件を冪等全同期するため、成功＝全反映。個別ファイル走査でなく state を見る）
 *  - 補助として当日付の analytics サマリが vault 分析/ に在るかも確認する（クラウド側の証跡）。
 *  - 成功時は静か（EXIT 0）。未成功時は consecutive_failures をインクリメントし、
 *    3 連続失敗で Desktop にマーカーを書いて可視化し EXIT 1（単発失敗ではマーカーを出さずノイズ抑制）。
 *  - Task Scheduler の Last Run Result（0x0/0x1）でも合否が残る。
 *
 * 実行: node scripts/x-vault-sync-verify.mjs
 */
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { evaluateForDate, STATE_PATH } from "./_lib/vault-sync-state.mjs";

const DEFAULT_VAULT = "C:/Users/user/Desktop/倉庫/事業戦略/ナレッジ";
const VAULT_ROOT = process.env.MASTER_VAULT_ROOT || DEFAULT_VAULT;
const DESKTOP = "C:/Users/user/Desktop";
const FAIL_THRESHOLD = 3; // この連続失敗回数に達したらマーカーで可視化。

function pad(n) {
  return String(n).padStart(2, "0");
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function main() {
  const date = today();
  const { ok, state } = evaluateForDate(date);
  const analyticsFile = join(VAULT_ROOT, "分析", `${date}_x-auto-post-analytics-summary.md`);
  const analyticsOk = existsSync(analyticsFile);

  if (ok) {
    console.log(
      `[vault-verify] OK: ${date} の sync 成功を確認（state）。analytics サマリ=${analyticsOk ? "あり" : "なし"}。`
    );
    process.exit(0);
  }

  // 未成功＝当日 sync の成功証跡なし。連続失敗数で重大度を判定。
  const fails = state.consecutive_failures;
  if (fails < FAIL_THRESHOLD) {
    console.error(
      `[vault-verify] WARN: ${date} の sync 成功が未確認（連続 ${fails} 回・閾値 ${FAIL_THRESHOLD}）。マーカーは未生成。`
    );
    process.exit(1);
  }

  // 3 連続以上＝静かな停止の疑い。Desktop マーカーで可視化。
  const marker = join(DESKTOP, `vault連携_要確認_${date}.txt`);
  const reason = [
    `内部改善/X分析の vault 連携が ${fails} 日連続で確認できていません（最後の成功: ${state.last_success_date ?? "記録なし"}）。`,
    `最初の失敗日: ${state.first_failure_date ?? "不明"}`,
    `state: ${STATE_PATH}`,
    "",
    "確認手順:",
    "1. タスク x-vault-sync が走っているか（タスクスケジューラの Last Run Result）",
    "2. `node scripts/x-vault-sync.mjs` を手動実行してエラー内容を確認",
    "3. PC初期化等でタスクが消えていれば `pwsh scripts/register-vault-sync-tasks.ps1` で再登録",
    "",
    "復旧すれば次回 sync 成功でこのマーカーは不要（削除して構いません）。",
  ].join("\n");
  try {
    writeFileSync(marker, reason, "utf-8");
    console.error(`[vault-verify] FAIL(${fails}連続): マーカーを書き出し: ${marker}`);
  } catch (e) {
    console.error(`[vault-verify] FAIL(${fails}連続) かつマーカー書込失敗: ${e.message}`);
  }
  process.exit(1);
}

main();
