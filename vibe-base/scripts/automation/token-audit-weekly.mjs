#!/usr/bin/env node
/**
 * scripts/automation/token-audit-weekly.mjs  （リスト③ C-6）
 *
 * token-audit の週次実行 + 走査ファイル数の異常減少 WARN。schtasks 週次 月曜 08:10（ExecutionTimeLimit PT30M）。
 *
 * 役割分担（BK-10 との二重管理回避）:
 *   - BK-10 = SessionStart 自動注入の「行数」計測。
 *   - C-6（本 job）= transcript の「トークン/コスト実測」。加えて走査ファイル数の回帰を検知する。
 *
 * 異常減少 WARN の目的: 2026-07-04 の非再帰バグ（listAllUsageFiles が subagents/*.jsonl 1,597 ファイルを
 *   丸ごと見落とし「サブ消費は算出不能」と誤結論）型の再発検知。走査面（= listAllUsageFiles().length）を
 *   毎週 state に刻み、前回比 DECREASE_THRESHOLD 超の減少で warn。audit.mjs 本体は無改変（バグは lib.mjs で
 *   2026-07-04 修正済と実査確認済）。
 *
 * 設計: 「検知・レポートのみ・自動修復なし」。走査面計測は本 wrapper が listAllUsageFiles() を直接呼ぶ
 *   （token-audit-raw.json は日付キーの {out,cr} のみで走査ファイル数を持たないため・実査確認済）。
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, statSync } from 'node:fs';
import { listAllUsageFiles, OUT_DIR } from '../token-audit/lib.mjs';
import { recordRun, readState } from './_lib/state.mjs';

const JOB = 'token-audit';
const DECREASE_THRESHOLD = 0.2; // 前回比 20% 超の走査ファイル減少で warn（定数・調整可）。
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..');
const auditScript = path.join(repoRoot, 'scripts', 'token-audit', 'audit.mjs');
const reportPath = path.join(OUT_DIR, 'token-audit-report.md');

function main() {
  const prev = readState(JOB);
  const prevScanned = typeof prev.metrics?.scanned_files === 'number' ? prev.metrics.scanned_files : null;

  // 走査面を実測（audit.mjs と同じ lib 関数・軽量な readdir のみ）。
  let scanned = null;
  try {
    scanned = listAllUsageFiles().length;
  } catch (e) {
    process.stderr.write(`[token-audit-weekly] listAllUsageFiles failed: ${e.message}\n`);
  }

  // audit.mjs を実行して outputs/token-audit-*.{md,csv,json} を更新（PT30M 内で打ち切り）。
  const res = spawnSync(process.execPath, [auditScript], {
    encoding: 'utf-8',
    cwd: repoRoot,
    timeout: 28 * 60 * 1000,
  });
  const auditOk = !res.error && res.status === 0;
  if (res.stdout) process.stdout.write(res.stdout);
  if (res.stderr) process.stderr.write(res.stderr);

  // 走査面の異常減少判定。
  let decreaseWarn = null;
  if (scanned !== null && prevScanned !== null && prevScanned > 0) {
    const ratio = (prevScanned - scanned) / prevScanned;
    if (ratio > DECREASE_THRESHOLD) {
      decreaseWarn = `走査ファイル数が前回比 ${(ratio * 100).toFixed(1)}% 減（${prevScanned} → ${scanned}）＝非再帰バグ型の回帰疑い`;
    }
  }

  const reportFresh = existsSync(reportPath);
  let warn = null;
  if (!auditOk) {
    warn = `token-audit 実行失敗（${res.error ? res.error.message : 'exit ' + res.status}）`;
  } else if (scanned === null) {
    // 走査面計測が例外で失敗＝本 job の存在意義（2026-07-04 型の非再帰バグ回帰検知）が機能していない。
    // 例外で静かに看過されないよう明示 warn（scanned が null の時に減少判定がスキップされる盲点への対応）。
    warn = '走査面の計測に失敗（listAllUsageFiles 例外）＝走査数の回帰検知が機能していない。要調査';
  } else if (decreaseWarn) {
    warn = decreaseWarn;
  }

  recordRun(JOB, {
    completed: auditOk,
    warn,
    metrics: {
      scanned_files: scanned ?? prevScanned,
      report_generated: reportFresh,
      report_mtime: reportFresh ? statSync(reportPath).mtime.toISOString() : null,
    },
  });

  process.stdout.write(
    `[token-audit-weekly] recorded (auditOk=${auditOk}, scanned=${scanned}, prev=${prevScanned}, warn=${warn ? 'yes' : 'no'}).\n`
  );
  process.exit(auditOk ? 0 : 1);
}

main();
