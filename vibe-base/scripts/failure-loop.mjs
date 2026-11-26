#!/usr/bin/env node
// scripts/failure-loop.mjs
//
// 失敗自己学習・自己改善ループ本体スクリプト。
// 本 script は read-only（書込は ~/.claude/logs/failure-loop/ のみ）。
// subagents/*.jsonl は意図的に走査対象外（オーケストレータ指示文でありマスター発話でない・引用誤検知源。
// failures.md の"ネスト見落とし事故"とは逆向きの意図的除外）。
//
// 実装範囲（plan Step 4 まで）: transcript 走査/FB event 抽出部 + `--full --dry-run` +
// `--checkout`（増分スキャン+fb-events記録+失敗自己学習の候補レポート）+ `--mark-recorded`/`--mark-rejected` +
// `--effect`（§6-4・[S✓]機構デッドリンク検知/昇格後再発検知）+ `--check`（§6-6・鮮度/自己回復/hook棚卸し）。
//
// 設計方針:
//   - 走査対象: ~/.claude/projects/C--Users-user-Desktop-ClaudeCode-vibe-base 直下の *.jsonl のみ
//     （`*/subagents/` 配下は見ない・再帰しない）。home は os.homedir() で解決。
//   - 全 fs read は encoding 'utf-8' 明示（cp932 環境の既知罠）。
//   - 辞書（S/W 2層・除外マーカー・閾値）は scripts/_lib/negative-feedback-dict.mjs が単一正本。
//   - データ層（scan-state.json / fb-events.jsonl / ledger.json の読み書き・排他ロック・
//     §6-5 再発照合アルゴリズム・failures.md パース・§6-4 デッドリンク検知・§6-6 hook 棚卸し）は
//     scripts/_lib/failure-loop-core.mjs に分離（plan Step 3 の分離許可枠を継続使用）。
//
// CLI:
//   node scripts/failure-loop.mjs --full --dry-run
//     state を無視して全 transcript を走査し、event をどこにも書かず（fs write 一切なし）
//     stdout に1行ずつ FB-EVENT を出力する（バックテスト・recall/precision 検証用）。
//   node scripts/failure-loop.mjs --checkout
//     増分スキャン（前回 size より大きいファイルのみ再走査）→ fb-events.jsonl 追記 →
//     failures.md 照合 → 記録漏れ候補/昇格候補レポートを stdout に出力。EXIT は常に 0。
//   node scripts/failure-loop.mjs --mark-recorded <ts> / --mark-rejected <ts>
//     fb-events.jsonl の該当 ts 行の status を書換え、ledger.dictFeedback を更新する。
//   node scripts/failure-loop.mjs --effect
//     failures.md の [S✓] 行の機構デッドリンク検知・昇格済み対策の再発検知（check-in A-21+ 用）。EXIT 常に 0。
//   node scripts/failure-loop.mjs --check
//     鮮度・自己回復スキャン（取りこぼし回収）・hook 棚卸し（check-in A-27 用）。EXIT 常に 0。

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import {
  STRONG_PATTERNS,
  WEAK_PATTERNS,
  EXCLUDE_MARKERS,
  THRESHOLDS,
} from './_lib/negative-feedback-dict.mjs';
import {
  withLock,
  loadScanState,
  saveScanStateAtomic,
  loadFbEvents,
  appendFbEvents,
  updateFbEventStatus,
  loadLedger,
  saveLedgerAtomic,
  parseFailuresMd,
  buildLedgerFromFailuresMd,
  linkEventsToLedger,
  applyPart1bFiledMarks,
  computeMissingRecordCandidates,
  computePromotionCandidates,
  printCheckoutReport,
  checkPromotedDeadLinks,
  checkPromotedRecurrence,
  capWarnLines,
  scanHookInventory,
  computeHookCandidates,
} from './_lib/failure-loop-core.mjs';

const PROJECT_DIR = path.join(
  os.homedir(),
  '.claude',
  'projects',
  'C--Users-user-Desktop-ClaudeCode-vibe-base'
);

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// シークレット様文字列の接頭辞（quote への漏洩混入防止）
const SECRET_PREFIXES = ['sk-', 'ghp_', 'xoxb', 'xoxp', 'AKIA', 'ghs_', 'github_pat_'];

// S層「0点」「０点」のみ: 直前文字が数字（「１０００点」等の逆センチメント誤検知）の場合はヒット扱いにしない。
// 他の S 層語には適用しない（マスター指示・語彙自体は無変更）。
const DIGIT_BOUNDARY_STRONG_PATTERNS = ['0点', '０点'];

// burst 判定専用（single event のスコアリングには使わない）: bash tool 出力・タスク通知・継続表示(⎿)・
// 擬似 invoke タグ等は isMasterUtterance を通過するが実質的に tool_result/メタ行であり、
// マスターの連続発話として burst 窓のカウント対象に含めない。
const BURST_ARTIFACT_MARKERS = [
  '<bash-input>',
  '<bash-stdout>',
  '<bash-stderr>',
  '<task-notification>',
  '⎿',
  '<invoke name=',
  '<parameter name=',
];

// -----------------------------------------------------------------------
// §6-1 transcript 走査
// -----------------------------------------------------------------------

/** PROJECT_DIR 直下（再帰しない）の *.jsonl 絶対パス一覧を返す */
function findTranscriptFiles() {
  if (!fs.existsSync(PROJECT_DIR)) return [];
  return fs
    .readdirSync(PROJECT_DIR, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.jsonl'))
    .map((e) => path.join(PROJECT_DIR, e.name));
}

/**
 * obj.message.content からマスター発話テキストを解決する（判定対象文字列の生成のみ・EXCLUDE_MARKERS 適用前）。
 * - string: そのまま返す（従来どおり）。
 * - array（画像+テキスト添付等）: `type === 'tool_result'` を1つでも含めば null（ツール結果メッセージ・除外）。
 *   `type === 'text'` の要素の `text` を `\n` 連結（複数可）。`type === 'image'` 等の非 text は無視。
 *   text 要素が無ければ null。
 * - それ以外（未知形状）: null。
 * @returns {string|null}
 */
function resolveMasterContentText(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    if (content.some((b) => b && b.type === 'tool_result')) return null;
    const texts = content
      .filter((b) => b && b.type === 'text' && typeof b.text === 'string')
      .map((b) => b.text);
    return texts.length > 0 ? texts.join('\n') : null;
  }
  return null;
}

/** マスター発話判定（§6-1 全条件 AND・array content 対応） */
function isMasterUtterance(obj) {
  if (!obj || obj.type !== 'user') return false;
  if (obj.isMeta) return false;
  const text = resolveMasterContentText(obj.message && obj.message.content);
  if (text === null) return false;
  for (const marker of EXCLUDE_MARKERS) {
    if (text.includes(marker)) return false;
  }
  return true;
}

/** dateJst: ts(UTC) + 9時間 の YYYY-MM-DD。不正 ts は null */
function toDateJst(tsIso) {
  const ms = Date.parse(tsIso);
  if (Number.isNaN(ms)) return null;
  const jst = new Date(ms + 9 * 60 * 60 * 1000);
  return jst.toISOString().slice(0, 10);
}

/** quote: 60字切詰め。シークレット様文字列を含む場合は '[REDACTED]' に置換 */
function makeQuote(text) {
  if (SECRET_PREFIXES.some((p) => text.includes(p))) return '[REDACTED]';
  return text.length > 60 ? text.slice(0, 60) : text;
}

// -----------------------------------------------------------------------
// §6-2 FB event 判定ロジック（固定）
// -----------------------------------------------------------------------

/** ch が半角(0-9)/全角(０-９)数字かどうか */
function isDigitChar(ch) {
  if (!ch) return false;
  return (ch >= '0' && ch <= '9') || (ch >= '０' && ch <= '９');
}

/**
 * STRONG_PATTERNS の1語 p が content に「ヒット」するか判定する。
 * '0点'/'０点' のみ、直前文字が数字（半角・全角）の場合はヒットとみなさない
 * （「１０００点」等の逆センチメント誤検知除去）。他の S 層語は通常の includes 判定。
 */
function matchesStrongPattern(content, p) {
  if (!DIGIT_BOUNDARY_STRONG_PATTERNS.includes(p)) return content.includes(p);
  let idx = content.indexOf(p);
  while (idx !== -1) {
    const prevChar = idx > 0 ? content[idx - 1] : '';
    if (!isDigitChar(prevChar)) return true;
    idx = content.indexOf(p, idx + 1);
  }
  return false;
}

/**
 * W層ヒット判定（1件のcontentに対し、条件を充足するWEAK_PATTERNSが1つでもあればtrue）。
 * 条件: ①content全長<=SHORT_MSG_CHARS ②パターンが先頭5字以内に出現 ③同一content内に他のS/Wパターンが共起。
 * LONG_MSG_CHARS超のcontentは常にfalse（W層無効）。
 */
function hasWeakHit(content) {
  if (content.length > THRESHOLDS.LONG_MSG_CHARS) return false;
  const shortMsg = content.length <= THRESHOLDS.SHORT_MSG_CHARS;
  for (const p of WEAK_PATTERNS) {
    const idx = content.indexOf(p);
    if (idx === -1) continue;
    const nearStart = idx < 5;
    const coOccurs =
      STRONG_PATTERNS.some((q) => q !== p && matchesStrongPattern(content, q)) ||
      WEAK_PATTERNS.some((q) => q !== p && content.includes(q));
    if (shortMsg || nearStart || coOccurs) return true;
  }
  return false;
}

/** 1件の user 発話を採点する。@returns {{score:number, matched:string[]}} */
function scoreContent(content) {
  const isLong = content.length > THRESHOLDS.LONG_MSG_CHARS;
  const matched = [];
  let score = 0;

  const strongHits = STRONG_PATTERNS.filter((p) => matchesStrongPattern(content, p));
  if (strongHits.length > 0) {
    score += 2;
    matched.push(...strongHits);
  }

  if (!isLong && hasWeakHit(content)) {
    score += 1;
    matched.push(...WEAK_PATTERNS.filter((p) => content.includes(p)));
  }

  return { score, matched };
}

/** content が bash tool 出力・タスク通知・継続表示・擬似 invoke タグ等の burst アーティファクトかどうか */
function isBurstArtifact(content) {
  return BURST_ARTIFACT_MARKERS.some((m) => content.includes(m));
}

/**
 * 同一 session 内の「isMasterUtterance を満たすマスター発話のうち burst アーティファクトを除いた」
 * 連続列を BURST_WINDOW 件窓でスキャンし、W ヒット数が BURST_MIN_HITS 以上の最初の窓を1件だけ
 * burst event として返す（警報疲れ防止・session内1件まで）。
 * @param {Array<{ts:string, content:string}>} masterMsgs isMasterUtterance を満たした発話（フィルタ前）
 * @returns {{ts:string, dateJst:string|null, score:number, kind:'burst', quote:string}|null}
 */
function detectBurst(masterMsgs) {
  const candidates = masterMsgs.filter((m) => !isBurstArtifact(m.content));
  const n = candidates.length;
  if (n === 0) return null;
  const windowSize = Math.min(THRESHOLDS.BURST_WINDOW, n);

  for (let start = 0; start + windowSize <= n; start++) {
    const window = candidates.slice(start, start + windowSize);
    const hits = window.filter((m) => hasWeakHit(m.content));
    if (hits.length >= THRESHOLDS.BURST_MIN_HITS) {
      const lastTs = window[window.length - 1].ts;
      const joined = hits.map((m) => m.content).join('/');
      return {
        ts: lastTs,
        dateJst: toDateJst(lastTs),
        score: hits.length,
        kind: 'burst',
        quote: makeQuote(joined),
      };
    }
  }
  return null;
}

/**
 * 1ファイル（1 session）を走査し、single/burst event 配列を返す。
 * @returns {{events: Array<object>, lines: number, parseErrors: number}}
 */
function scanTranscriptFile(filePath) {
  const sessionId = path.basename(filePath, '.jsonl');
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf-8');
  } catch {
    return { events: [], lines: 0, parseErrors: 0 };
  }

  const masterMsgs = [];
  let lines = 0;
  let parseErrors = 0;

  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    lines++;
    let obj;
    try {
      obj = JSON.parse(line);
    } catch {
      parseErrors++;
      continue;
    }
    if (!isMasterUtterance(obj)) continue;
    masterMsgs.push({ ts: obj.timestamp, content: resolveMasterContentText(obj.message.content) });
  }

  const events = [];

  for (const msg of masterMsgs) {
    const { score, matched } = scoreContent(msg.content);
    if (score >= THRESHOLDS.EVENT_SCORE) {
      events.push({
        ts: msg.ts,
        dateJst: toDateJst(msg.ts),
        sessionId,
        score,
        kind: 'single',
        quote: makeQuote(msg.content),
        matched,
      });
    }
  }

  const burst = detectBurst(masterMsgs);
  if (burst) {
    events.push({ ...burst, sessionId, matched: [] });
  }

  return { events, lines, parseErrors };
}

// -----------------------------------------------------------------------
// §6-7 --full --dry-run
// -----------------------------------------------------------------------

function runFullDryRun() {
  const files = findTranscriptFiles();
  let allEvents = [];
  let totalLines = 0;
  let totalParseErrors = 0;

  for (const filePath of files) {
    const { events, lines, parseErrors } = scanTranscriptFile(filePath);
    allEvents.push(...events);
    totalLines += lines;
    totalParseErrors += parseErrors;
  }

  allEvents.sort((a, b) => (a.ts || '').localeCompare(b.ts || ''));

  for (const ev of allEvents) {
    const shortSession = ev.sessionId.slice(0, 8);
    console.log(`FB-EVENT ${ev.dateJst} ${shortSession} score${ev.score} "${ev.quote}"`);
  }

  const singleCount = allEvents.filter((e) => e.kind === 'single').length;
  const burstCount = allEvents.filter((e) => e.kind === 'burst').length;
  const strongCount = allEvents.filter((e) => e.matched && e.matched.some((m) => STRONG_PATTERNS.includes(m))).length;
  const weakOnlyCount = allEvents.length - strongCount;

  console.log('');
  console.log(`[summary] 対象ファイル ${files.length} 件 / 解析行数 ${totalLines} / 破損行 ${totalParseErrors}`);
  console.log(
    `[summary] 総event数 ${allEvents.length}（single ${singleCount} / burst ${burstCount}）` +
      ` / S層含む ${strongCount} / S層なし(W層のみ・burst含む) ${weakOnlyCount}`
  );
}

// -----------------------------------------------------------------------
// §6-3 --checkout
// -----------------------------------------------------------------------

/**
 * 増分スキャン（前回 size より大きい/未知のファイルのみ再走査）→ fb-events.jsonl 追記 →
 * ledger 紐付け → 候補計算 → state/ledger 保存、まで一括で行い結果を返す（未 lock・呼出元で withLock 必須）。
 * --checkout（結果を全文表示）と --check の自己回復ステップ（missingCandidates 件数のみ利用）で共用する。
 */
function performCheckoutScan(runMode) {
  const state = loadScanState();
  const existingEvents = loadFbEvents();
  const existingKeys = new Set(existingEvents.map((e) => `${e.sessionId}|${e.ts}|${e.kind}`));

  const files = findTranscriptFiles();
  const newEvents = [];

  for (const filePath of files) {
    let size;
    try {
      size = fs.statSync(filePath).size;
    } catch {
      continue;
    }
    const prev = state.files[filePath];
    if (prev && prev.size === size) continue; // 増分判定: サイズ変化なしは skip

    const { events } = scanTranscriptFile(filePath);
    for (const ev of events) {
      const key = `${ev.sessionId}|${ev.ts}|${ev.kind}`;
      if (existingKeys.has(key)) continue;
      existingKeys.add(key);
      newEvents.push({ ...ev, status: 'pending' });
    }
    const lastEventTs = events.length > 0 ? events[events.length - 1].ts : prev ? prev.lastEventTs : null;
    state.files[filePath] = { size, lastEventTs };
  }

  appendFbEvents(newEvents);

  const allEvents = [...existingEvents, ...newEvents];
  const pendingEvents = allEvents.filter((e) => e.status === 'pending');
  const eventsByTs = new Map(allEvents.map((e) => [e.ts, e]));

  const failuresPath = path.join(REPO_ROOT, 'failures.md');
  let failuresEntries = [];
  if (fs.existsSync(failuresPath)) {
    failuresEntries = parseFailuresMd(fs.readFileSync(failuresPath, 'utf-8'));
  }

  const ledger = loadLedger();
  const tokenMap = buildLedgerFromFailuresMd(ledger, failuresEntries);
  linkEventsToLedger(ledger, tokenMap, allEvents);
  applyPart1bFiledMarks(ledger, path.join(REPO_ROOT, 'docs', 'ops', 'master-instruction-patterns.md'));

  const missingCandidates = computeMissingRecordCandidates(pendingEvents, failuresEntries);
  const promotionCandidates = computePromotionCandidates(ledger, failuresEntries, eventsByTs);

  state.lastRunAt = new Date().toISOString();
  state.lastRunMode = runMode;
  state.stats.totalEvents += newEvents.length;
  state.stats.candidatesShown += missingCandidates.length + promotionCandidates.length;

  const savedState = saveScanStateAtomic(state);
  saveLedgerAtomic(ledger);

  return {
    newEventsCount: newEvents.length,
    totalEvents: savedState.stats.totalEvents,
    missingCandidates,
    promotionCandidates,
    ledger,
    allEvents,
  };
}

function runCheckout() {
  withLock(() => {
    printCheckoutReport(performCheckoutScan('--checkout'));
  });
}

// -----------------------------------------------------------------------
// --mark-recorded / --mark-rejected
// -----------------------------------------------------------------------

/** fb-events.jsonl の該当 ts の status を書換え、ledger.dictFeedback（30日窓）を更新する */
function runMarkStatus(ts, status) {
  withLock(() => {
    const found = updateFbEventStatus(ts, status);
    if (!found) {
      console.log(`WARN: fb-events.jsonl に ts=${ts} の event が見つからない`);
      return;
    }

    const ledger = loadLedger();
    const windowMs = 30 * 24 * 60 * 60 * 1000; // dictFeedback 30日窓（THRESHOLDS.HOOK_WINDOW_DAYS と同じ日数）
    const now = Date.now();
    const windowStartMs = ledger.dictFeedback.windowStart ? Date.parse(ledger.dictFeedback.windowStart) : NaN;
    if (Number.isNaN(windowStartMs) || now - windowStartMs > windowMs) {
      ledger.dictFeedback.windowStart = new Date().toISOString();
      ledger.dictFeedback.accepted = 0;
      ledger.dictFeedback.rejected = 0;
    }
    if (status === 'recorded') ledger.dictFeedback.accepted++;
    else ledger.dictFeedback.rejected++;
    saveLedgerAtomic(ledger);

    const state = loadScanState();
    if (status === 'recorded') state.stats.candidatesAccepted++;
    else state.stats.candidatesRejected++;
    saveScanStateAtomic(state);

    console.log(`OK: ts=${ts} → status=${status}`);
  });
}

// -----------------------------------------------------------------------
// §6-4 --effect（check-in A-21+）
// -----------------------------------------------------------------------

function printEffectReport(warnings) {
  console.log('=== failure-loop --effect ===');
  const capped = capWarnLines(warnings, THRESHOLDS.WARN_LINES_MAX);
  if (capped.length === 0) {
    console.log('OK: [S✓]機構デッドリンクなし・昇格後再発なし');
  } else {
    for (const w of capped) console.log(`WARN ${w}`);
  }
  console.log(`集計: WARN ${warnings.length} 件`);
}

function runEffect() {
  withLock(() => {
    const failuresPath = path.join(REPO_ROOT, 'failures.md');
    const failuresText = fs.existsSync(failuresPath) ? fs.readFileSync(failuresPath, 'utf-8') : '';

    const { warnings: deadLinkWarnings } = checkPromotedDeadLinks(failuresText, REPO_ROOT);
    const ledger = loadLedger();
    const recurrenceWarnings = checkPromotedRecurrence(ledger);

    printEffectReport([...deadLinkWarnings, ...recurrenceWarnings]);
  });
}

// -----------------------------------------------------------------------
// §6-6 --check（check-in A-27）
// -----------------------------------------------------------------------

/** state（自己回復スキャン前）の lastRunAt から鮮度 WARN を判定する。問題なければ null */
function computeFreshnessWarning(state) {
  if (!state.lastRunAt) {
    return 'failure-loop 未実行: ループ形骸化。node scripts/failure-loop.mjs --checkout を手動実行';
  }
  const lastMs = Date.parse(state.lastRunAt);
  if (Number.isNaN(lastMs)) {
    return 'failure-loop lastRunAt 不正: ループ形骸化。node scripts/failure-loop.mjs --checkout を手動実行';
  }
  const days = Math.floor((Date.now() - lastMs) / (24 * 60 * 60 * 1000));
  if (days > THRESHOLDS.STALE_DAYS) {
    return `failure-loop 停止${days}日: ループ形骸化。node scripts/failure-loop.mjs --checkout を手動実行`;
  }
  return null;
}

function printCheckReport(warnings) {
  console.log('=== failure-loop --check ===');
  const capped = capWarnLines(warnings, THRESHOLDS.WARN_LINES_MAX);
  if (capped.length === 0) {
    console.log('OK: 鮮度OK・記録漏れなし・hook棚卸し正常');
  } else {
    for (const w of capped) console.log(`WARN ${w}`);
  }
  console.log(`集計: WARN ${warnings.length} 件`);
}

function runCheck() {
  withLock(() => {
    const priorState = loadScanState(); // 自己回復スキャンで lastRunAt が更新される前の鮮度を見る
    const freshnessWarning = computeFreshnessWarning(priorState);

    const scanResult = performCheckoutScan('--check'); // 自己回復スキャン（取りこぼし回収）

    const selfHealWarning =
      scanResult.missingCandidates.length > 0
        ? `checkout漏れの記録漏れ候補 ${scanResult.missingCandidates.length}件（次回 checkout で提示）`
        : null;

    const { stats: hookStats } = scanHookInventory();
    const hookCandidates = computeHookCandidates(hookStats, scanResult.ledger.dictFeedback);

    const allWarnings = [freshnessWarning, selfHealWarning, ...hookCandidates].filter(Boolean);
    printCheckReport(allWarnings);
  });
}

// -----------------------------------------------------------------------
// main
// -----------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  const full = args.includes('--full');
  const dryRun = args.includes('--dry-run');
  const checkout = args.includes('--checkout');
  const markRecordedIdx = args.indexOf('--mark-recorded');
  const markRejectedIdx = args.indexOf('--mark-rejected');
  const effect = args.includes('--effect');
  const check = args.includes('--check');

  if (full && dryRun) {
    runFullDryRun();
    process.exit(0);
    return;
  }

  if (checkout) {
    try {
      runCheckout();
    } catch (err) {
      console.log(`WARN: --checkout 実行中にエラー: ${err && err.message ? err.message : err}`);
    }
    process.exit(0); // --checkout は常に EXIT 0（checkout フローを止めない）
    return;
  }

  if (markRecordedIdx !== -1) {
    const ts = args[markRecordedIdx + 1];
    if (!ts) {
      console.log('ERROR: --mark-recorded には ts 引数が必要');
      process.exit(0);
      return;
    }
    runMarkStatus(ts, 'recorded');
    process.exit(0);
    return;
  }

  if (markRejectedIdx !== -1) {
    const ts = args[markRejectedIdx + 1];
    if (!ts) {
      console.log('ERROR: --mark-rejected には ts 引数が必要');
      process.exit(0);
      return;
    }
    runMarkStatus(ts, 'rejected');
    process.exit(0);
    return;
  }

  if (effect) {
    try {
      runEffect();
    } catch (err) {
      console.log(`WARN: --effect 実行中にエラー: ${err && err.message ? err.message : err}`);
    }
    process.exit(0); // --effect は常に EXIT 0
    return;
  }

  if (check) {
    try {
      runCheck();
    } catch (err) {
      console.log(`WARN: --check 実行中にエラー: ${err && err.message ? err.message : err}`);
    }
    process.exit(0); // --check は常に EXIT 0
    return;
  }

  console.log('未実装（不明な引数）');
  process.exit(0);
}

main();
