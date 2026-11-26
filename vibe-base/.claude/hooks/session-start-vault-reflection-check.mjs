#!/usr/bin/env node
/**
 * .claude/hooks/session-start-vault-reflection-check.mjs
 *
 * SessionStart 薄ラッパ — vault 反映(内部改善 session-report の堆積)が滞留していないかを検知する
 * 「二重の網」Tier1。無人 schtasks(x-vault-sync) が静かに死んでも、次セッション開始時に AI が必ず気づく。
 *
 * 設計:
 *   - **read-only**: 本 hook 自身は vault も repo も書込まない（marker ファイルのみ・同日重複抑止用）。
 *   - root 専用（司令塔セッションのみ）: registry.json 不在の product セッションでは無通知 exit 0。
 *   - 最終成功(vault-sync-state.json)から STALE_DAYS を超えて成功がなければ additionalContext で警告注入。
 *   - 健全時は無通知。滞留時のみ注入し marker で同日重複を抑止。
 *
 * 入出力: stdin に SessionStart JSON。stdout に { hookSpecificOutput:{hookEventName, additionalContext} }。
 * EXIT: 常に 0（SessionStart を絶対にブロックしない）。
 */
import fs from 'fs';
import path from 'path';
import { daysSinceLastSuccess, readState } from '../../scripts/_lib/vault-sync-state.mjs';

const STALE_DAYS = 7; // この日数を超えて最終成功がなければ滞留として警告。

function emit(context) {
  if (!context) return;
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context },
    })
  );
}

function pad(n) {
  return String(n).padStart(2, '0');
}
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function main() {
  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  // vault 反映は司令塔の関心事。product セッション（registry 不在）は無通知。
  const isOrchestrator = fs.existsSync(path.join(projectDir, 'docs', 'html-toranomaki', 'registry.json'));
  if (!isOrchestrator) process.exit(0);

  const date = today();
  // 同日重複抑止（滞留警告は1日1回）。
  const marker = path.join(projectDir, '.claude', '.vault-last-checked');
  try {
    if (fs.existsSync(marker) && fs.readFileSync(marker, 'utf-8').trim() === date) process.exit(0);
  } catch {}

  const days = daysSinceLastSuccess(date);
  if (days <= STALE_DAYS) process.exit(0); // 健全＝無通知

  // 滞留検知 → 同日 marker を記録し警告注入。
  const s = readState();
  try {
    fs.mkdirSync(path.dirname(marker), { recursive: true });
    fs.writeFileSync(marker, date, 'utf-8');
  } catch {}

  const last = s.last_success_date ?? '記録なし';
  const span = days === Infinity ? '一度も成功していない' : `${days} 日間成功していない`;
  emit(
    [
      `⚠️ vault 反映が滞留しています: 内部改善(session-report)の vault 自動転記が ${span}（最終成功: ${last}）。`,
      '',
      '原因候補: schtasks `x-vault-sync` の停止 / PC初期化でタスク消失 / git fetch 失敗。',
      '対応(マスター承認下で): `node scripts/x-vault-sync.mjs` を手動実行 → 成功で復旧。',
      'タスク消失時は `pwsh scripts/register-vault-sync-tasks.ps1` で再登録。',
      `state: ~/.claude/logs/vault-sync-state.json（連続失敗 ${s.consecutive_failures} 回）`,
    ].join('\n')
  );
  process.exit(0);
}

// stdin を drain（hang 回避）してから実行。
let settled = false;
function run() {
  if (settled) return;
  settled = true;
  try {
    main();
  } catch (e) {
    process.stderr.write('[vault-reflection-check] ' + (e?.message || String(e)) + '\n');
    process.exit(0); // SessionStart は絶対にブロックしない
  }
}
process.stdin.on('data', () => {});
process.stdin.on('end', run);
setTimeout(run, 500);
