#!/usr/bin/env node
/**
 * .claude/hooks/portfolio-pii-gate.mjs  （リスト③ C-5）
 *
 * 顧客 PII マスキングのイベント駆動ゲート。PreToolUse:Write|Edit|MultiEdit。**root 専用**
 * （scripts/_lib/root-only-hooks.mjs に登録・products へ非伝播）。
 *
 * 対象は docs/deliverables/ 配下（＝外部共有前提物）のみ。他パスは即 exit 0（secret-write-gate と同じ早期 return）。
 *
 * 辞書: PII 辞書はそれ自体が PII のため **リポジトリに置かない**。~/.claude/private/pii-deny-list.json
 *   （git 管理外・repo 外）を読む。スキーマ: { names:[], aliases:[], industries:[] }。
 *   - hit 時 → JSON block（{decision:'block',reason}＋exit 0）。reason に実名は載せない（ログ再露出防止）。
 *   - parse 例外 → exit 2（fail-closed・secret-write-gate 踏襲）。
 *   - **辞書不在 or 空（実名未投入）→ ブロックせず** automation state に「PII 辞書未整備」warn を記録（誤ブロック
 *     多発で hook 無効化される危険への対策＝fail-open + 可視化）。辞書整備は別途マスター立会いで実名投入する。
 *
 * 限界: 表記ゆれ（漢字/カナ/ローマ字）は文字列一致では捕捉しきれない。手動マスキング grep（従来運用）は
 *   廃止しない両輪。詳細は runbook docs/ops/automation-jobs.md。
 *
 * EXIT: 0（pass or block）/ 2（fail-closed）。state 記録は best-effort でゲート判定を止めない。
 */
import fs from 'fs';
import path from 'path';
import { homedir } from 'os';

const JOB = 'portfolio-pii';
const DICT_PATH = path.join(homedir(), '.claude', 'private', 'pii-deny-list.json');

// state 記録は best-effort（import/書込失敗でゲートを壊さない）。
async function recordState(warn) {
  try {
    const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
    const mod = await import(
      'file://' + path.join(projectDir, 'scripts', 'automation', '_lib', 'state.mjs').replace(/\\/g, '/')
    );
    mod.recordRun(JOB, { completed: true, warn });
  } catch {
    /* 無視（可視化は付随機能・ゲート本体を止めない） */
  }
}

function collectTerms(dict) {
  const terms = [];
  for (const key of ['names', 'aliases', 'industries']) {
    if (Array.isArray(dict[key])) {
      for (const t of dict[key]) {
        if (typeof t === 'string' && t.trim()) terms.push(t.trim());
      }
    }
  }
  return terms;
}

function extractTexts(toolInput) {
  const texts = [];
  if (typeof toolInput.content === 'string') texts.push(toolInput.content);
  if (typeof toolInput.new_string === 'string') texts.push(toolInput.new_string);
  if (Array.isArray(toolInput.edits)) {
    for (const e of toolInput.edits) {
      if (e && typeof e.new_string === 'string') texts.push(e.new_string);
    }
  }
  return texts;
}

async function handle(input) {
  const toolInput = input.tool_input || {};
  const rawPath = (toolInput.file_path || '').replace(/\\/g, '/');
  // パス正規化（security-reviewer advisory 対応）: `..` 解決・冗長スラッシュ潰し・小文字化してから照合する。
  // Windows は大小文字非区別・冗長スラッシュ同一視のため、`Docs//Deliverables/x` 等の変形で辞書照合を
  // 丸ごとバイパスされるのを防ぐ（gate 素通りより過剰照合側に倒す）。
  const norm = path.posix.normalize(rawPath).replace(/\/+/g, '/').toLowerCase();

  // 対象は docs/deliverables/ 配下のみ。他は素通り。
  if (!/(^|\/)docs\/deliverables\//.test(norm)) {
    process.exit(0);
  }

  // 辞書ロード。不在 → 未整備（fail-open + warn）。parse 失敗 → fail-closed(exit2)。
  let dict = null;
  if (!fs.existsSync(DICT_PATH)) {
    await recordState('PII 辞書が未整備（不在）: ~/.claude/private/pii-deny-list.json をマスター立会いで整備せよ');
    process.exit(0);
  }
  try {
    dict = JSON.parse(fs.readFileSync(DICT_PATH, 'utf-8'));
  } catch (e) {
    process.stderr.write('[portfolio-pii-gate] 辞書 parse 失敗（fail-closed）: ' + (e.message || e) + '\n');
    process.exit(2);
  }

  const terms = collectTerms(dict);
  if (terms.length === 0) {
    await recordState('PII 辞書が未整備（空・実名未投入）: マスター立会いで names/aliases/industries を投入せよ');
    process.exit(0);
  }

  // 辞書が整備済みなら未整備 warn を解除。
  await recordState(null);

  const texts = extractTexts(toolInput);
  const hay = texts.join('\n').toLowerCase();
  let hitCount = 0;
  for (const t of terms) {
    if (hay.includes(t.toLowerCase())) hitCount++;
  }

  if (hitCount > 0) {
    // reason に実名を載せない（hook-errors ログ等への PII 再露出防止）。件数のみ。
    const reason =
      `[portfolio-pii-gate] PII 辞書に ${hitCount} 件一致。docs/deliverables/ は外部共有前提物です。` +
      `顧客実名/社名/業種の混入を確認し、マスキングしてから保存してください（表記ゆれは手動 grep でも確認）。`;
    console.log(JSON.stringify({ decision: 'block', reason }));
  }
  process.exit(0);
}

let data = '';
process.stdin.on('data', (chunk) => (data += chunk));
process.stdin.on('end', () => {
  let input;
  try {
    input = JSON.parse(data || '{}');
  } catch (e) {
    // 入力 parse 失敗は fail-closed（シークレット/PII 検査の silent skip 防止・secret-write-gate 踏襲）。
    process.stderr.write('[portfolio-pii-gate] 入力 parse 失敗（fail-closed）: ' + (e.message || e) + '\n');
    process.exit(2);
  }
  handle(input).catch((e) => {
    process.stderr.write('[portfolio-pii-gate] error: ' + (e && e.message ? e.message : String(e)) + '\n');
    process.exit(2);
  });
});
