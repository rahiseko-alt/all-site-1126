// scripts/_lib/failure-loop-core.mjs
//
// failure-loop.mjs の Step 3 データ層・再発照合アルゴリズム分離モジュール
// （failure-loop.mjs が 500 行を超えるため plan Step 3 の分離許可枠で切り出し）。
//
// 責務:
//   - ~/.claude/logs/failure-loop/ 配下 3 データファイル（scan-state.json / fb-events.jsonl / ledger.json）
//     の読み書き（全て atomic: tmp 書込 → renameSync）
//   - 複数プロセス同時実行対策: fs.mkdirSync による排他ロック（withLock）
//   - §6-5 再発照合アルゴリズム（token 抽出 / Jaccard / distinctive token 判定）
//   - failures.md パース（`- ` 箇条書き / `| YYYY-MM-DD |` テーブル行の両形式）
//
// 全 fs read は encoding 'utf-8' 明示。書込先は必ず LOGS_DIR（os.homedir() 配下）のみ。

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { THRESHOLDS, STOP_TOKENS } from './negative-feedback-dict.mjs';

export const LOGS_DIR = path.join(os.homedir(), '.claude', 'logs', 'failure-loop');
export const SCAN_STATE_FILE = path.join(LOGS_DIR, 'scan-state.json');
export const FB_EVENTS_FILE = path.join(LOGS_DIR, 'fb-events.jsonl');
export const LEDGER_FILE = path.join(LOGS_DIR, 'ledger.json');
const LOCK_DIR = path.join(LOGS_DIR, '.checkout.lock');

// -----------------------------------------------------------------------
// 排他ロック（fs.mkdirSync は atomic・複数プロセス同時 --checkout / --mark-* の直列化用）
// -----------------------------------------------------------------------

// stale lock 判定閾値（10分）。プロセスが lock 保持中にクラッシュ（OOM/kill/リブート）すると
// LOCK_DIR が残置され、以後の全実行が spin→timeout で永久停止する事故を防ぐ。単発実行の想定所要
// （数秒）に十分な余裕を持たせた値。
const STALE_LOCK_MS = 600 * 1000;

/** LOCK_DIR の mkdir に成功するまでビジーウェイトで再試行する。timeoutMs 超過で throw */
function acquireLock(timeoutMs = 10000, retryMs = 20) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    try {
      fs.mkdirSync(LOCK_DIR);
      return;
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;

      // stale-lock 検知: mtime が STALE_LOCK_MS を超えて古い lock は死骸とみなし強制解放して
      // 即再試行する（正当な直列化中＝新しい mtime のロックは従来どおり待つ）。
      try {
        const st = fs.statSync(LOCK_DIR);
        const ageMs = Date.now() - st.mtimeMs;
        if (ageMs > STALE_LOCK_MS) {
          console.error(`WARN: stale lock (age ${Math.round(ageMs / 1000)}s) を解放`);
          fs.rmdirSync(LOCK_DIR);
          continue; // timeout 待ちを消費せず直ちに再試行
        }
      } catch {
        // statSync/rmdirSync 失敗（他プロセスが同時に解放済み等）は通常フローへフォールバック
      }

      if (Date.now() > deadline) {
        throw new Error(`failure-loop: ロック取得タイムアウト（${LOCK_DIR}）`);
      }
      const spinUntil = Date.now() + retryMs;
      while (Date.now() < spinUntil) {
        /* busy-wait: 低頻度運用スクリプトのため許容 */
      }
    }
  }
}

function releaseLock() {
  try {
    fs.rmdirSync(LOCK_DIR);
  } catch {
    // 既に無い等は無視（ベストエフォート解放）
  }
}

/** 排他区間で fn を実行する（同期関数専用） */
export function withLock(fn) {
  acquireLock();
  try {
    return fn();
  } finally {
    releaseLock();
  }
}

// -----------------------------------------------------------------------
// 4-1 scan-state.json
// -----------------------------------------------------------------------

function emptyScanState() {
  return {
    version: 1,
    lastRunAt: null,
    lastRunMode: null,
    files: {},
    stats: { totalEvents: 0, candidatesShown: 0, candidatesAccepted: 0, candidatesRejected: 0 },
  };
}

export function loadScanState() {
  if (!fs.existsSync(SCAN_STATE_FILE)) return emptyScanState();
  try {
    const parsed = JSON.parse(fs.readFileSync(SCAN_STATE_FILE, 'utf-8'));
    const base = emptyScanState();
    return {
      version: 1,
      lastRunAt: parsed.lastRunAt || null,
      lastRunMode: parsed.lastRunMode || null,
      files: parsed.files || {},
      stats: { ...base.stats, ...(parsed.stats || {}) },
    };
  } catch {
    return emptyScanState();
  }
}

/** files: bytesが大きい方を採用 / stats: 各カウンタは max（並行実行の lost-update 近似対策） */
function mergeScanStates(disk, mem) {
  const merged = emptyScanState();
  merged.lastRunAt = [disk.lastRunAt, mem.lastRunAt].filter(Boolean).sort().pop() || null;
  merged.lastRunMode = mem.lastRunMode || disk.lastRunMode || null;

  merged.files = { ...disk.files };
  for (const [p, e] of Object.entries(mem.files || {})) {
    const d = merged.files[p];
    if (!d || (e.size || 0) >= (d.size || 0)) merged.files[p] = e;
  }

  merged.stats = {
    totalEvents: Math.max(disk.stats.totalEvents || 0, mem.stats.totalEvents || 0),
    candidatesShown: Math.max(disk.stats.candidatesShown || 0, mem.stats.candidatesShown || 0),
    candidatesAccepted: Math.max(disk.stats.candidatesAccepted || 0, mem.stats.candidatesAccepted || 0),
    candidatesRejected: Math.max(disk.stats.candidatesRejected || 0, mem.stats.candidatesRejected || 0),
  };
  return merged;
}

/** tmp書込→renameSync（atomic）+ 書込直前に disk 現物を再読込して merge（agent-telemetry 同型） */
export function saveScanStateAtomic(state) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
  const merged = mergeScanStates(loadScanState(), state);
  const tmp = `${SCAN_STATE_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(merged, null, 2), 'utf-8');
  fs.renameSync(tmp, SCAN_STATE_FILE);
  return merged;
}

// -----------------------------------------------------------------------
// 4-2 fb-events.jsonl
// -----------------------------------------------------------------------

/** 全 event を配列で返す（破損行は skip）。不在時は [] */
export function loadFbEvents() {
  if (!fs.existsSync(FB_EVENTS_FILE)) return [];
  let raw;
  try {
    raw = fs.readFileSync(FB_EVENTS_FILE, 'utf-8');
  } catch {
    return [];
  }
  const out = [];
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      out.push(JSON.parse(line));
    } catch {
      // 破損行は skip
    }
  }
  return out;
}

/** events 全体を atomic に書き直す（tmp→rename） */
function writeFbEventsAtomic(events) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
  const tmp = `${FB_EVENTS_FILE}.${process.pid}.tmp`;
  const content = events.map((e) => JSON.stringify(e)).join('\n') + (events.length > 0 ? '\n' : '');
  fs.writeFileSync(tmp, content, 'utf-8');
  fs.renameSync(tmp, FB_EVENTS_FILE);
}

/** newEvents（status:'pending' 付与済み）を既存分に連結して atomic 書き直しで追記する */
export function appendFbEvents(newEvents) {
  if (newEvents.length === 0) return;
  const existing = loadFbEvents();
  writeFbEventsAtomic([...existing, ...newEvents]);
}

/** 該当 ts の event の status を書換える。見つかれば true */
export function updateFbEventStatus(ts, status) {
  const events = loadFbEvents();
  let found = false;
  const updated = events.map((e) => {
    if (e.ts === ts) {
      found = true;
      return { ...e, status };
    }
    return e;
  });
  if (!found) return false;
  writeFbEventsAtomic(updated);
  return true;
}

// -----------------------------------------------------------------------
// 4-3 ledger.json
// -----------------------------------------------------------------------

function emptyLedger() {
  return { version: 1, entries: {}, dictFeedback: { accepted: 0, rejected: 0, windowStart: null } };
}

export function loadLedger() {
  if (!fs.existsSync(LEDGER_FILE)) return emptyLedger();
  try {
    const parsed = JSON.parse(fs.readFileSync(LEDGER_FILE, 'utf-8'));
    const base = emptyLedger();
    return {
      version: 1,
      entries: parsed.entries || {},
      dictFeedback: { ...base.dictFeedback, ...(parsed.dictFeedback || {}) },
    };
  } catch {
    return emptyLedger();
  }
}

export function saveLedgerAtomic(ledger) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
  const tmp = `${LEDGER_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(ledger, null, 2), 'utf-8');
  fs.renameSync(tmp, LEDGER_FILE);
}

/** sha1Hex: 正規化行の ledger key 生成用 */
export function sha1Hex(str) {
  return crypto.createHash('sha1').update(str, 'utf-8').digest('hex');
}

// -----------------------------------------------------------------------
// failures.md パース + 行正規化（4-3 定義）
// -----------------------------------------------------------------------

/** 行頭 `- ` と `[S✓]|[S]|[M]` mark と日付を除去し空白単一化した残り全文 */
export function normalizeFailureLine(raw) {
  let s = raw.replace(/^-\s*/, '');
  s = s.replace(/\[S✓\]/g, '');
  s = s.replace(/\[S\]/g, '');
  s = s.replace(/\[M\]/g, '');
  s = s.replace(/\d{4}-\d{2}-\d{2}/g, '');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

/** 1行を解析し {raw, date, marks, hasKijunTag, normalized, sha1} を返す。非エントリ行は null */
export function parseFailuresMdLine(raw) {
  const isBullet = /^-\s+\S/.test(raw);
  const isTableRow = /^\|\s*\d{4}-\d{2}-\d{2}\s*\|/.test(raw);
  if (!isBullet && !isTableRow) return null;
  const dateMatch = raw.match(/\d{4}-\d{2}-\d{2}/);
  const date = dateMatch ? dateMatch[0] : null;
  const marks = raw.match(/\[S✓\]|\[S\]|\[基準[^\]]*\]/g) || [];
  const normalized = normalizeFailureLine(raw);
  if (!normalized) return null;
  return {
    raw,
    date,
    marks,
    hasKijunTag: marks.some((m) => m.startsWith('[基準')),
    normalized,
    sha1: sha1Hex(normalized),
  };
}

/** failures.md 全文を解析し、entry 配列を返す */
export function parseFailuresMd(text) {
  const entries = [];
  for (const line of text.split(/\r?\n/)) {
    const entry = parseFailuresMdLine(line);
    if (entry) entries.push(entry);
  }
  return entries;
}

// -----------------------------------------------------------------------
// §6-5 再発照合アルゴリズム（固定）
// -----------------------------------------------------------------------

const KATAKANA_RE = /[゠-ヿ]{3,}/g;
const KANJI_RUN_RE = /[一-鿿]{2,}/g;
const ASCII_WORD_RE = /[A-Za-z0-9_.-]{3,}/g;
const BACKTICK_RE = /`([^`]+)`/g;

/** token 抽出: ①backtick内語 ②ASCII word(3+) ③カタカナ連続3+ ④漢字2-gram */
export function extractTokens(text) {
  const tokens = new Set();

  for (const m of text.matchAll(BACKTICK_RE)) {
    const inner = m[1].trim();
    if (inner) tokens.add(inner);
  }
  for (const m of text.matchAll(ASCII_WORD_RE)) {
    tokens.add(m[0]);
  }
  for (const m of text.matchAll(KATAKANA_RE)) {
    tokens.add(m[0]);
  }
  for (const m of text.matchAll(KANJI_RUN_RE)) {
    const run = m[0];
    for (let i = 0; i + 2 <= run.length; i++) {
      tokens.add(run.slice(i, i + 2));
    }
  }
  return tokens;
}

/** 頻出 stop-token を除いた distinctive token 集合を返す */
export function distinctiveTokens(tokenSet) {
  return new Set([...tokenSet].filter((t) => !STOP_TOKENS.includes(t)));
}

export function jaccard(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 0;
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/** 2行が同族か: Jaccard(token集合) >= RECUR_JACCARD かつ distinctive共通token数 >= RECUR_MIN_TOKENS */
export function isRecurrent(tokensA, tokensB) {
  const j = jaccard(tokensA, tokensB);
  if (j < THRESHOLDS.RECUR_JACCARD) return false;
  const distinctA = distinctiveTokens(tokensA);
  let common = 0;
  for (const t of distinctA) {
    if (tokensB.has(t)) common++;
  }
  return common >= THRESHOLDS.RECUR_MIN_TOKENS;
}

function pushUniqueDate(arr, date) {
  if (date && !arr.includes(date)) arr.push(date);
}

/**
 * failures.md entries から ledger.entries を構築・更新する（既存 ledger は破壊せず in-place 更新）。
 * ①各 entry を sha1(normalized) key で登録/更新 ②全 entry 総当りで isRecurrent 判定し、
 * 同族ならお互いの日付を recurDates に push（正規化テキストが異なる同族ライン向け）。
 * @returns {Map<string, {tokens: Set<string>}>} key -> entry の token 集合（呼出側の event 照合用）
 */
export function buildLedgerFromFailuresMd(ledger, entries) {
  const tokenMap = new Map();

  for (const e of entries) {
    const key = e.sha1;
    tokenMap.set(key, extractTokens(e.normalized));
    if (!ledger.entries[key]) {
      ledger.entries[key] = {
        excerpt: e.normalized.slice(0, 60),
        firstSeen: e.date,
        recurDates: e.date ? [e.date] : [],
        filed: false,
        filedDate: null,
        promotedDate: null,
        fbEventRefs: [],
      };
    } else {
      const entry = ledger.entries[key];
      if (e.date && (!entry.firstSeen || e.date < entry.firstSeen)) entry.firstSeen = e.date;
      pushUniqueDate(entry.recurDates, e.date);
    }
  }

  const keys = [...tokenMap.keys()];
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const keyA = keys[i];
      const keyB = keys[j];
      if (keyA === keyB) continue;
      if (isRecurrent(tokenMap.get(keyA), tokenMap.get(keyB))) {
        const dateA = ledger.entries[keyA].firstSeen;
        const dateB = ledger.entries[keyB].firstSeen;
        pushUniqueDate(ledger.entries[keyA].recurDates, dateB);
        pushUniqueDate(ledger.entries[keyB].recurDates, dateA);
      }
    }
  }

  return tokenMap;
}

/**
 * fb event を ledger entries（tokenMap）と照合し、同族なら event.dateJst を recurDates に、
 * event.ts を fbEventRefs に push する。
 * @returns {Map<string, string[]>} entryKey -> 紐付いた event の ts 配列（今回の照合分のみ）
 */
export function linkEventsToLedger(ledger, tokenMap, events) {
  const linkedRefs = new Map();
  for (const ev of events) {
    if (!ev.quote) continue;
    const evTokens = extractTokens(ev.quote);
    for (const [key, entryTokens] of tokenMap.entries()) {
      if (!isRecurrent(evTokens, entryTokens)) continue;
      const entry = ledger.entries[key];
      pushUniqueDate(entry.recurDates, ev.dateJst);
      if (!entry.fbEventRefs.includes(ev.ts)) entry.fbEventRefs.push(ev.ts);
      if (!linkedRefs.has(key)) linkedRefs.set(key, []);
      linkedRefs.get(key).push(ev.ts);
    }
  }
  return linkedRefs;
}

// -----------------------------------------------------------------------
// §6-3 --checkout 候補計算（記録漏れ候補・昇格候補・却下率）
// -----------------------------------------------------------------------

/**
 * 記録漏れ候補: status:'pending' の event のうち
 *   強候補: 同じ dateJst の failures.md エントリが1件もない
 *   弱候補: 同日ありでも quote と全エントリの token overlap が 0
 * score降順・burst優先でソートした配列を返す（全件。表示は呼出側で TOP_N 切り）。
 */
export function computeMissingRecordCandidates(pendingEvents, failuresEntries) {
  const byDate = new Map();
  for (const e of failuresEntries) {
    if (!e.date) continue;
    if (!byDate.has(e.date)) byDate.set(e.date, []);
    byDate.get(e.date).push(e);
  }

  const candidates = [];
  for (const ev of pendingEvents) {
    const dateEntries = ev.dateJst ? byDate.get(ev.dateJst) : undefined;
    if (!dateEntries || dateEntries.length === 0) {
      candidates.push({ ev, reason: 'failures.md 同日エントリなし' });
      continue;
    }
    const evTokens = extractTokens(ev.quote || '');
    const hasOverlap = dateEntries.some((e) => {
      const entryTokens = extractTokens(e.normalized);
      for (const t of evTokens) {
        if (entryTokens.has(t)) return true;
      }
      return false;
    });
    if (!hasOverlap) {
      candidates.push({ ev, reason: 'failures.md 同日エントリと内容重複なし（弱候補）' });
    }
  }

  candidates.sort((a, b) => {
    if (b.ev.score !== a.ev.score) return b.ev.score - a.ev.score;
    if (a.ev.kind !== b.ev.kind) return a.ev.kind === 'burst' ? -1 : 1;
    return (a.ev.ts || '').localeCompare(b.ev.ts || '');
  });
  return candidates;
}

/**
 * 昇格候補: failures.md の [S]/無印 行（[S✓] は除外）× 再発照合。基準（いずれか）:
 *   ①ledger の recurDates 数>=2 ②行内に `[基準` タグ ③紐付いた event の matched に
 *   何回目|前も言った|また同じ を含む。filed:true は除外。recurDates数降順でソートした配列を返す。
 */
export function computePromotionCandidates(ledger, failuresEntries, eventsByTs) {
  const candidates = [];
  const seenKeys = new Set();
  const RECUR_TAG_RE = /何回目|前も言った|また同じ/;

  for (const e of failuresEntries) {
    const key = e.sha1;
    if (seenKeys.has(key)) continue; // 同一正規化文（重複行）は1件のみ評価
    seenKeys.add(key);
    if (e.marks.includes('[S✓]')) continue;
    const entry = ledger.entries[key];
    if (!entry || entry.filed) continue;

    const c1 = entry.recurDates.length >= 2;
    const c2 = e.hasKijunTag;
    const c3 = entry.fbEventRefs.some((ts) => {
      const ev = eventsByTs.get(ts);
      return ev && Array.isArray(ev.matched) && ev.matched.some((m) => RECUR_TAG_RE.test(m));
    });
    if (!c1 && !c2 && !c3) continue;

    candidates.push({ entry, key });
  }

  candidates.sort((a, b) => b.entry.recurDates.length - a.entry.recurDates.length);
  return candidates;
}

/** 候補却下率(30日窓): ledger.dictFeedback.accepted/rejected から算出。データなしは '0.0%' */
export function computeRejectRate(dictFeedback) {
  const accepted = dictFeedback.accepted || 0;
  const rejected = dictFeedback.rejected || 0;
  const total = accepted + rejected;
  if (total === 0) return '0.0%';
  return `${((rejected / total) * 100).toFixed(1)}%`;
}

/** --checkout の stdout レポートを固定フォーマットで出力する */
export function printCheckoutReport({ newEventsCount, totalEvents, missingCandidates, promotionCandidates, ledger, allEvents }) {
  console.log('== failure-loop --checkout ==');

  console.log(`[記録漏れ候補] ${missingCandidates.length}件（提示上位3）`);
  missingCandidates.slice(0, THRESHOLDS.TOP_N).forEach((c, i) => {
    const ev = c.ev;
    const shortSession = (ev.sessionId || '').slice(0, 8);
    console.log(`  ${i + 1}. ${ev.dateJst} score${ev.score} "${ev.quote}" (session ${shortSession}) → ${c.reason}`);
  });

  console.log(`[昇格候補] ${promotionCandidates.length}件（提示上位3）`);
  promotionCandidates.slice(0, THRESHOLDS.TOP_N).forEach((c, i) => {
    const entry = c.entry;
    const dates = [...entry.recurDates].sort();
    let line = `  ${i + 1}. "${entry.excerpt}" 再発: ${dates.join(', ')} (${dates.length}回)`;
    if (entry.fbEventRefs.length > 0) {
      const firstEv = allEvents.find((e) => e.ts === entry.fbEventRefs[0]);
      if (firstEv) line += ` 証拠: FB "${firstEv.quote}"`;
    }
    console.log(line);
  });

  console.log(
    `[stats] events今回+${newEventsCount} / 累計 ${totalEvents} / 候補却下率(30日) ${computeRejectRate(ledger.dictFeedback)}`
  );
}

/**
 * docs/ops/master-instruction-patterns.md の「Part 1b」既起票表を読み、抜粋一致する ledger entry を
 * filed:true にマークする。見出しが無ければ何もしない（skip）。read-only（repo 読取のみ）。
 */
export function applyPart1bFiledMarks(ledger, patternsFilePath) {
  if (!fs.existsSync(patternsFilePath)) return 0;
  let text;
  try {
    text = fs.readFileSync(patternsFilePath, 'utf-8');
  } catch {
    return 0;
  }
  const headingIdx = text.indexOf('Part 1b');
  if (headingIdx === -1) return 0;

  const section = text.slice(headingIdx);
  let marked = 0;
  const today = new Date().toISOString().slice(0, 10);
  for (const entry of Object.values(ledger.entries)) {
    if (entry.filed) continue;
    const excerpt = entry.excerpt.trim();
    if (excerpt.length >= 8 && section.includes(excerpt)) {
      entry.filed = true;
      entry.filedDate = today;
      marked++;
    }
  }
  return marked;
}

// -----------------------------------------------------------------------
// §6-4 --effect: [S✓] 機構デッドリンク検知・昇格後再発検知
// -----------------------------------------------------------------------

const MECHANISM_TOKEN_RE = /(A-\d+|\S*\.mjs|\S*\.sh)/;

/** token（A-NN / *.mjs / *.sh）の実在確認。scripts/・.claude/hooks/ のファイル存在 OR check-in-verify.sh 内の A-NN 文字列存在 */
function mechanismExists(token, repoRoot) {
  if (/^A-\d+$/.test(token)) {
    const civPath = path.join(repoRoot, 'scripts', 'check-in-verify.sh');
    if (!fs.existsSync(civPath)) return false;
    try {
      return fs.readFileSync(civPath, 'utf-8').includes(token);
    } catch {
      return false;
    }
  }
  if (token.endsWith('.mjs') || token.endsWith('.sh')) {
    const candidates = [
      path.join(repoRoot, token),
      path.join(repoRoot, '.claude', 'hooks', path.basename(token)),
      path.join(repoRoot, 'scripts', path.basename(token)),
    ];
    return candidates.some((p) => fs.existsSync(p));
  }
  return true; // 想定外 token は false-positive 回避のため既定 OK 扱い
}

/**
 * failures.md の各 `[S✓]` 行から `機構: ` 以降の最初の `.mjs`/`.sh`/`A-\d+` token を抽出し実在確認する。
 * @returns {{ warnings: string[], checked: number }}
 */
export function checkPromotedDeadLinks(failuresText, repoRoot) {
  const warnings = [];
  let checked = 0;
  for (const line of failuresText.split(/\r?\n/)) {
    if (!line.includes('[S✓]')) continue;
    const idx = line.indexOf('機構: ');
    if (idx === -1) continue;
    checked++;
    const after = line.slice(idx + '機構: '.length);
    const m = after.match(MECHANISM_TOKEN_RE);
    if (!m) continue;
    const token = m[0].replace(/[)）。、,]+$/, '');
    if (!mechanismExists(token, repoRoot)) {
      warnings.push(`[S✓]機構デッドリンク: ${line.trim().slice(0, 60)}`);
    }
  }
  return { warnings, checked };
}

/** ledger の promotedDate 非 null エントリに promotedDate より後の recurDates があれば再発 WARN を返す */
export function checkPromotedRecurrence(ledger) {
  const warnings = [];
  for (const entry of Object.values(ledger.entries)) {
    if (!entry.promotedDate) continue;
    const laterDates = entry.recurDates.filter((d) => d && d > entry.promotedDate);
    if (laterDates.length > 0) {
      warnings.push(`昇格済み対策が再発: ${entry.excerpt} → /fix-loop Aルート対象`);
    }
  }
  return warnings;
}

/** WARN 行配列を max 件に切り詰め、超過分は末尾1行「…他N件」に集約する */
export function capWarnLines(lines, max) {
  if (lines.length <= max) return lines;
  const shown = lines.slice(0, max - 1);
  const overflow = lines.length - shown.length;
  shown.push(`…他${overflow}件`);
  return shown;
}

// -----------------------------------------------------------------------
// §6-6 --check: hook 棚卸し（hook-errors.jsonl + ローテ hook-errors*.jsonl）
// -----------------------------------------------------------------------

export const HOOK_ERRORS_DIR = path.join(os.homedir(), '.claude', 'logs');
const HOOK_ROTATED_RE = /^hook-errors-\d{8}-\d{6}\.jsonl$/;

/** hook-errors.jsonl（当代）+ ローテファイル一覧の絶対パスを返す */
export function listHookErrorLogFiles() {
  if (!fs.existsSync(HOOK_ERRORS_DIR)) return [];
  return fs
    .readdirSync(HOOK_ERRORS_DIR)
    .filter((f) => f === 'hook-errors.jsonl' || HOOK_ROTATED_RE.test(f))
    .map((f) => path.join(HOOK_ERRORS_DIR, f));
}

/**
 * hook-errors*.jsonl を走査し hook_name 別に HOOK_WINDOW_DAYS(30日) と HOOK_DEAD_DAYS(90日) の
 * 2窓で {runs, blocks(exit_code=2), errors(exit_code=1)} を集計する。
 * @returns {{ stats: Map<string, object>, filesScanned: number }}
 */
export function scanHookInventory(nowMs = Date.now()) {
  const cutoff30 = nowMs - THRESHOLDS.HOOK_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const cutoff90 = nowMs - THRESHOLDS.HOOK_DEAD_DAYS * 24 * 60 * 60 * 1000;
  const stats = new Map();
  let filesScanned = 0;

  for (const filePath of listHookErrorLogFiles()) {
    let text;
    try {
      text = fs.readFileSync(filePath, 'utf-8');
    } catch {
      continue;
    }
    filesScanned++;
    for (const line of text.split(/\r?\n/)) {
      if (!line.trim()) continue;
      let rec;
      try {
        rec = JSON.parse(line);
      } catch {
        continue;
      }
      const ms = rec.ts ? Date.parse(rec.ts) : NaN;
      if (Number.isNaN(ms) || ms < cutoff90) continue;
      const name = rec.hook_name || '(unknown)';
      if (!stats.has(name)) {
        stats.set(name, { runs30: 0, blocks30: 0, errors30: 0, runs90: 0, blocks90: 0, errors90: 0 });
      }
      const s = stats.get(name);
      s.runs90++;
      if (rec.exit_code === 2) s.blocks90++;
      if (rec.exit_code === 1) s.errors90++;
      if (ms >= cutoff30) {
        s.runs30++;
        if (rec.exit_code === 2) s.blocks30++;
        if (rec.exit_code === 1) s.errors30++;
      }
    }
  }
  return { stats, filesScanned };
}

/**
 * 降格候補（gate|guard を含み runs30>0 かつ HOOK_DEAD_DAYS block ゼロ）/ 過剰検知候補
 * （blocks30/runs30 > HOOK_OVERBLOCK_RATE かつ blocks30 >= HOOK_OVERBLOCK_MIN）/
 * 辞書調整候補（30日窓却下率 > DICT_REJECT_RATE）を合算し、優先度順で TOP_N 件のテキスト配列を返す。
 */
export function computeHookCandidates(hookStats, dictFeedback) {
  const candidates = [];

  for (const [name, s] of hookStats.entries()) {
    if (s.runs30 === 0) continue;
    const rate = s.blocks30 / s.runs30;
    if (rate > THRESHOLDS.HOOK_OVERBLOCK_RATE && s.blocks30 >= THRESHOLDS.HOOK_OVERBLOCK_MIN) {
      candidates.push({
        priority: 1,
        sortKey: s.blocks30,
        text: `過剰検知候補: ${name}（block ${s.blocks30}/${s.runs30}件 = ${(rate * 100).toFixed(1)}%）`,
      });
    }
  }

  for (const [name, s] of hookStats.entries()) {
    if (!/gate|guard/i.test(name)) continue;
    if (s.runs30 === 0) continue;
    if (s.blocks90 > 0) continue;
    candidates.push({
      priority: 2,
      sortKey: s.runs30,
      text: `降格候補: ${name}（run ${s.runs30}件・${THRESHOLDS.HOOK_DEAD_DAYS}日block0・抑止として機能中の可能性あり・候補提示のみ自動降格禁止）`,
    });
  }

  const accepted = dictFeedback.accepted || 0;
  const rejected = dictFeedback.rejected || 0;
  const total = accepted + rejected;
  if (total > 0) {
    const rejectRate = rejected / total;
    if (rejectRate > THRESHOLDS.DICT_REJECT_RATE) {
      candidates.push({
        priority: 3,
        sortKey: rejectRate,
        text: `辞書調整候補: negative-feedback-dict.mjs 30日却下率 ${(rejectRate * 100).toFixed(1)}%（>${(
          THRESHOLDS.DICT_REJECT_RATE * 100
        ).toFixed(0)}%・閾値見直しはマスターゲート）`,
      });
    }
  }

  candidates.sort((a, b) => a.priority - b.priority || b.sortKey - a.sortKey);
  return candidates.slice(0, THRESHOLDS.TOP_N).map((c) => c.text);
}
