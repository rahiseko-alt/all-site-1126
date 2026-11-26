#!/usr/bin/env node
/**
 * scripts/automation/hook-errors-daily.mjs  （リスト③ C-2）
 *
 * hook 実行時故障（hook-errors.jsonl の exit_code=1 隠れ故障）の日次スキャン wrapper。
 * 既存 scripts/check-hook-runtime-errors.mjs --days 1 --list を子プロセス実行し、結果を
 * automation state に記録する（故障>0 で warn セット）。schtasks 日次 08:05。
 *
 * 起源: 2026-06-17 maturity-audit「hook 故障の cron 化未達（検知空白 最大14日）」への回収。
 *       既存 Check-in A-22（--days 14）は残して両輪（A-22=セッション時／本 job=無人日次）。
 *
 * 設計: 「検知・レポートのみ・自動修復なし」（リスト③共通原則）。子スクリプトは無改変で使う。
 *   - 子 exit 0 = 故障なし（またはログ不在）／ exit 1 = 故障検知。
 *   - wrapper 自体は検知を state に記録して EXIT 0（job は正常に「走った」）。spawn 自体の失敗のみ EXIT 1。
 */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { recordRun } from './_lib/state.mjs';

const JOB = 'hook-errors';
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..');
const child = path.join(repoRoot, 'scripts', 'check-hook-runtime-errors.mjs');

function main() {
  const res = spawnSync(process.execPath, [child, '--days', '1', '--list'], {
    encoding: 'utf-8',
    cwd: repoRoot,
  });

  if (res.error) {
    // spawn 自体の失敗（node 不在・子スクリプト不在等）= job が走れていない = completed:false。
    recordRun(JOB, { completed: false, warn: `子スクリプト実行不能: ${res.error.message}` });
    process.stderr.write(`[hook-errors-daily] spawn error: ${res.error.message}\n`);
    process.exit(1);
  }

  const out = (res.stdout || '') + (res.stderr || '');
  process.stdout.write(out);

  // check-hook-runtime-errors: exit 0=健全 / 1=実行時故障検知。それ以外（null=signal kill 等）は
  // スキャン自体の異常＝健全と誤記録しないよう warn 化する（exit code 想定漏れの盲点対応）。
  const failed = res.status !== 0;
  const warn = !failed
    ? null
    : res.status === 1
      ? 'hook 実行時故障を検知（node scripts/check-hook-runtime-errors.mjs --days 1 --list で詳細）'
      : `hook-errors スキャンが異常終了（exit ${res.status}）＝検知が機能していない可能性`;
  recordRun(JOB, {
    completed: true,
    warn,
    metrics: { last_child_exit: res.status ?? null },
  });

  process.stdout.write(`[hook-errors-daily] recorded (child exit=${res.status}, warn=${failed}).\n`);
  process.exit(0);
}

main();
