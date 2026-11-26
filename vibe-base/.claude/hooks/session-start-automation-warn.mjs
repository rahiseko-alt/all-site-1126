#!/usr/bin/env node
/**
 * .claude/hooks/session-start-automation-warn.mjs
 *
 * C-R Tier1 — 自動実行 job（feed-fetch / hook-errors / token-audit / gsap-watch / settings-inventory）の
 * state を SessionStart で走査し、warn 非 null または last_success 滞留（job 別閾値）を検知したら
 * additionalContext に注入する。無人 schtasks が静かに死んでも次セッション開始時に必ず気づける。
 *
 * 設計（session-start-vault-reflection-check.mjs を踏襲）:
 *   - **read-only**: 本 hook 自身は state も repo も書込まない（marker ファイルのみ・同日重複抑止用）。
 *   - **root 専用**: registry.json 不在の product セッションでは無通知 exit 0（scripts/_lib/root-only-hooks.mjs に登録）。
 *   - 健全時（warn/滞留なし・state 不在含む）は無通知。差分ありのみ注入し marker で同日重複を抑止。
 *   - EXIT: 常に 0（SessionStart を絶対にブロックしない）。
 */
import fs from 'fs';
import path from 'path';
import { evaluateStates } from '../../scripts/automation/_lib/state.mjs';

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
  // 自動実行 job の監視は司令塔の関心事。product セッション（registry 不在）は無通知。
  const isOrchestrator = fs.existsSync(path.join(projectDir, 'docs', 'html-toranomaki', 'registry.json'));
  if (!isOrchestrator) process.exit(0);

  const warnings = evaluateStates();
  if (warnings.length === 0) process.exit(0); // 健全＝無通知

  const date = today();
  // 同日重複抑止（滞留警告は1日1回）。
  const marker = path.join(projectDir, '.claude', '.automation-last-checked');
  try {
    if (fs.existsSync(marker) && fs.readFileSync(marker, 'utf-8').trim() === date) process.exit(0);
  } catch {}
  try {
    fs.mkdirSync(path.dirname(marker), { recursive: true });
    fs.writeFileSync(marker, date, 'utf-8');
  } catch {}

  const lines = warnings.map((w) => {
    const since = w.since ? `（since ${w.since}）` : '';
    return `  - [${w.job}] ${w.kind}: ${w.message}${since}`;
  });
  emit(
    [
      `⚠️ 自動実行 job に異常/滞留が ${warnings.length} 件あります:`,
      ...lines,
      '',
      '対応: runbook `docs/ops/automation-jobs.md` を参照。該当 wrapper を手動実行（`node scripts/automation/<job>.mjs`）で切り分け、',
      'タスク消失時は `pwsh scripts/register-automation-tasks.ps1` で再登録。',
      'state: ~/.claude/logs/automation/<job>-state.json',
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
    process.stderr.write('[automation-warn] ' + (e?.message || String(e)) + '\n');
    process.exit(0); // SessionStart は絶対にブロックしない
  }
}
process.stdin.on('data', () => {});
process.stdin.on('end', run);
setTimeout(run, 500);
