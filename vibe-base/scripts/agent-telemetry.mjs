#!/usr/bin/env node
// scripts/agent-telemetry.mjs
// サブエージェント発火テレメトリ収集スクリプト
// 用途: ~/.claude/projects/**/*.jsonl から Agent tool_use を抽出し、エージェント別発火統計を集計する
// 検証対象データ: assistant 行の message.content[] 内 { type:"tool_use", name:"Agent"|"Task", input:{subagent_type} }
//   （旧ログはツール名 Task、新ログは Agent。両対応必須）
//
// 設計方針:
//   - stream 処理（readline + createReadStream）。readFileSync 全読み禁止（723MB/1,889ファイル・ヒープ保護）
//   - 増分処理: per-file の { bytesProcessed, mtimeMs } を state に持ち、mtime 変化なしファイルは skip
//   - 追記分のみ { start: bytesProcessed, end: size-1 } で読む。resume 起点が行途中の場合は最初の改行まで破棄
//   - state 保存は tmp ファイル→ fs.renameSync でアトミック（並行セッション対策）
//   - dead-agent 判定: ~/.claude/agents/*.md の mtime から30日を猶予期間とし、猶予経過済 かつ
//     lastSeen 30日以上前（または発火記録なし）を dead 候補とする
//
// CLI:
//   node scripts/agent-telemetry.mjs            増分スキャン + state 更新 + サマリ出力
//   node scripts/agent-telemetry.mjs --report    スキャンせず state から報告のみ
//   node scripts/agent-telemetry.mjs --full      state を無視して全ファイル再スキャン
//   node scripts/agent-telemetry.mjs --check     check-in A-24 用: 軽量増分スキャンで鮮度自己回復 +
//                                                 telemetry鮮度/dead-agent/runs.jsonlクロスチェック/多様性指標を判定
//                                                 （WARN 基調・常に EXIT 0・NG にしない）

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline';

const PROJECTS_DIR = path.join(os.homedir(), '.claude', 'projects');
const LOGS_DIR = path.join(os.homedir(), '.claude', 'logs');
const STATE_FILE = path.join(LOGS_DIR, 'agent-telemetry-state.json');
const AGENTS_DIR = path.join(os.homedir(), '.claude', 'agents');
const RUNS_LOG_FILE = path.join(LOGS_DIR, 'verification-panel-runs.jsonl'); // docs/standards/verification-panel.md 実行ログ

const DEAD_GRACE_MS = 30 * 24 * 60 * 60 * 1000; // dead-agent 猶予: 定義ファイル mtime から30日
const DEAD_LASTSEEN_MS = 30 * 24 * 60 * 60 * 1000; // dead-agent 判定: lastSeen 30日以上前

// A-24（check-in A-24: agent effectiveness）用の閾値
const PANEL_AGENTS = ['verify-agent', 'code-reviewer', 'security-reviewer', 'spec-audit-agent', 'ux-quality-reviewer'];
const TELEMETRY_FRESHNESS_MS = 7 * 24 * 60 * 60 * 1000; // telemetry 鮮度: 7日超過で WARN（vault A-23 と同思想）
const RUNS_CROSSCHECK_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // runs.jsonl クロスチェック窓: 直近7日
const DIVERSITY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000; // 多様性指標算出窓: 直近30日
const DIVERSITY_MIN_RECORDS = 5; // これ未満はサンプル不足として算出skip
const DUP_RATE_WARN_THRESHOLD = 0.3; // 指摘重複率 > 30% で WARN
const ADOPTED_RATE_WARN_THRESHOLD = 0.2; // 採用率 < 20% で WARN

// -----------------------------------------------------------------------
// state 入出力
// -----------------------------------------------------------------------

/** @returns {{lastRunAt: string|null, filesScanned: number, linesParsed: number, parseErrors: number, files: Record<string,{bytesProcessed:number, mtimeMs:number}>, agents: Record<string,{count:number, firstSeen:string|null, lastSeen:string|null}>}} */
function emptyState() {
  return { lastRunAt: null, filesScanned: 0, linesParsed: 0, parseErrors: 0, files: {}, agents: {} };
}

function loadState() {
  if (!fs.existsSync(STATE_FILE)) return emptyState();
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      lastRunAt: parsed.lastRunAt || null,
      filesScanned: parsed.filesScanned || 0,
      linesParsed: parsed.linesParsed || 0,
      parseErrors: parsed.parseErrors || 0,
      files: parsed.files || {},
      agents: parsed.agents || {},
    };
  } catch {
    // state 破損（並行書込・ディスク異常等）→ 増分再構築のため初期状態から
    console.log(`  WARN: ${STATE_FILE} の読込に失敗。初期状態から再構築する`);
    return emptyState();
  }
}

/**
 * disk の最新 state と in-memory state をマージする（並行実行の lost-update 近似対策）。
 * files: bytesProcessed が大きい方（同値なら mtimeMs が新しい方）/ agents: count=max・firstSeen=min・lastSeen=max /
 * グローバル集計: max。厳密ロックではないため「別々の新規ファイルを同時スキャンした差分」は max で近似される。
 */
function mergeStates(disk, mem) {
  const merged = emptyState();
  merged.lastRunAt = [disk.lastRunAt, mem.lastRunAt].filter(Boolean).sort().pop() || null;
  merged.filesScanned = Math.max(disk.filesScanned || 0, mem.filesScanned || 0);
  merged.linesParsed = Math.max(disk.linesParsed || 0, mem.linesParsed || 0);
  merged.parseErrors = Math.max(disk.parseErrors || 0, mem.parseErrors || 0);

  merged.files = { ...disk.files };
  for (const [p, e] of Object.entries(mem.files || {})) {
    const d = merged.files[p];
    if (!d || e.bytesProcessed > d.bytesProcessed ||
        (e.bytesProcessed === d.bytesProcessed && e.mtimeMs >= d.mtimeMs)) {
      merged.files[p] = e;
    }
  }

  merged.agents = { ...disk.agents };
  for (const [name, e] of Object.entries(mem.agents || {})) {
    const d = merged.agents[name];
    if (!d) {
      merged.agents[name] = e;
      continue;
    }
    merged.agents[name] = {
      count: Math.max(d.count || 0, e.count || 0),
      firstSeen: [d.firstSeen, e.firstSeen].filter(Boolean).sort()[0] || null,
      lastSeen: [d.lastSeen, e.lastSeen].filter(Boolean).sort().pop() || null,
    };
  }
  return merged;
}

/**
 * state 保存。tmp 書込→ renameSync（torn-write 対策）+ save 直前に disk state を再 load してマージ
 * （lost-update 近似対策・厳密ロックなし）。
 */
function saveStateAtomic(state) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
  const merged = mergeStates(loadState(), state);
  const tmpFile = `${STATE_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmpFile, JSON.stringify(merged, null, 2), 'utf-8');
  fs.renameSync(tmpFile, STATE_FILE);
  return merged;
}

// -----------------------------------------------------------------------
// jsonl ファイル探索
// -----------------------------------------------------------------------

/** PROJECTS_DIR 配下を再帰走査し *.jsonl の絶対パス一覧を返す（全プロジェクト dir 走査） */
function findJsonlFiles(rootDir) {
  const results = [];
  const stack = [rootDir];
  while (stack.length > 0) {
    const current = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue; // アクセス不可ディレクトリは skip
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile() && entry.name.endsWith('.jsonl')) {
        results.push(full);
      }
    }
  }
  return results;
}

// -----------------------------------------------------------------------
// 行単位パース・Agent 発火抽出
// -----------------------------------------------------------------------

/**
 * assistant 行の message.content[] から Agent/Task tool_use を抽出し agentsAcc に累積する。
 * @param {any} rec JSON.parse 済みの1行分レコード
 * @param {Record<string,{count:number, firstSeen:string|null, lastSeen:string|null}>} agentsAcc
 */
function extractAgentInvocations(rec, agentsAcc) {
  if (!rec || rec.type !== 'assistant') return;
  const content = rec.message && rec.message.content;
  if (!Array.isArray(content)) return;
  const ts = rec.timestamp || null;

  for (const block of content) {
    if (!block || block.type !== 'tool_use') continue;
    if (block.name !== 'Agent' && block.name !== 'Task') continue; // 旧ログ Task / 新ログ Agent 両対応
    const subagentType = block.input && block.input.subagent_type;
    if (!subagentType) continue;

    let entry = agentsAcc[subagentType];
    if (!entry) {
      entry = { count: 0, firstSeen: null, lastSeen: null };
      agentsAcc[subagentType] = entry;
    }
    entry.count++;
    if (ts) {
      if (!entry.firstSeen || ts < entry.firstSeen) entry.firstSeen = ts;
      if (!entry.lastSeen || ts > entry.lastSeen) entry.lastSeen = ts;
    }
  }
}

/** offset の直前バイトが改行(\n)かどうかを判定する。offset<=0 は常に境界とみなす */
function isAtLineBoundary(filePath, offset) {
  if (offset <= 0) return true;
  let fd;
  try {
    fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(1);
    const bytesRead = fs.readSync(fd, buf, 0, 1, offset - 1);
    if (bytesRead === 0) return true; // ファイル末尾以降。判定不要
    return buf[0] === 0x0a; // '\n'
  } catch {
    return true; // 判定不能時は境界とみなす（ベストエフォート）
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

/** ファイル末尾から遡り、最後の改行(\n)の直後 offset を返す。改行が1つも無ければ 0。判定不能時は size（従来挙動） */
function findLastNewlineEnd(filePath, size) {
  if (size <= 0) return 0;
  const CHUNK = 65536;
  let fd;
  try {
    fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(CHUNK);
    let pos = size;
    while (pos > 0) {
      const readLen = Math.min(CHUNK, pos);
      const readStart = pos - readLen;
      const bytesRead = fs.readSync(fd, buf, 0, readLen, readStart);
      for (let i = bytesRead - 1; i >= 0; i--) {
        if (buf[i] === 0x0a) return readStart + i + 1;
      }
      pos = readStart;
    }
    return 0;
  } catch {
    return size; // 判定不能時はベストエフォートで末尾まで処理
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

/**
 * 1ファイルを増分（または全件）処理し、agentsAcc / counters を更新する。
 * 戻り値の bytesProcessed / mtimeMs を state.files[filePath] に保存すること。
 * bytesProcessed は常に「最後に確認できた改行の直後 offset」= 行境界。末尾の書込途中行（改行なし）は
 * 消費せず次回スキャンに持ち越す（完成後に完全な行として parse される。永久消失防止）。
 * @returns {Promise<{skipped: boolean, bytesProcessed: number, mtimeMs: number} | null>} ファイル消失時は null
 */
async function processFile(filePath, prevEntry, fullRescan, agentsAcc, counters) {
  let st;
  try {
    st = fs.statSync(filePath);
  } catch {
    return null; // 走査中にファイルが消失
  }
  const mtimeMs = st.mtimeMs;
  const size = st.size;

  let start = 0;
  if (!fullRescan && prevEntry) {
    if (prevEntry.mtimeMs === mtimeMs) {
      // 前回から mtime 変化なし → skip
      return { skipped: true, bytesProcessed: prevEntry.bytesProcessed, mtimeMs };
    }
    if (size < prevEntry.bytesProcessed) {
      start = 0; // rotate/truncate 検知 → 先頭から再読
    } else {
      start = prevEntry.bytesProcessed; // 追記分のみ読む
    }
  }

  // 消費上限 = 最後の改行の直後（未完了の末尾行は次回へ持ち越し）
  const effectiveEnd = findLastNewlineEnd(filePath, size);

  if (start >= effectiveEnd) {
    // 追記なし / 完成行の増分なし（書込途中の末尾行のみ等）→ offset は進めない
    return { skipped: true, bytesProcessed: start, mtimeMs };
  }

  // resume 起点が行の途中になる場合は、最初の改行までを破棄し次の行から parse する（保険・通常は行境界）
  const discardFirstLine = start > 0 && !isAtLineBoundary(filePath, start);

  try {
    const stream = fs.createReadStream(filePath, { start, end: effectiveEnd - 1, encoding: 'utf8' });
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    let firstLine = true;
    for await (const line of rl) {
      if (firstLine) {
        firstLine = false;
        if (discardFirstLine) continue;
      }
      if (line === '') continue;
      counters.linesParsed++;
      let rec;
      try {
        rec = JSON.parse(line);
      } catch {
        counters.parseErrors++; // 破損行は skip（実在する前提）
        continue;
      }
      extractAgentInvocations(rec, agentsAcc);
    }
  } catch (err) {
    // 個別ファイルの read エラー（権限等）で全体を落とさない
    console.log(`  WARN: ${filePath} の読込中にエラー: ${err && err.message ? err.message : err}`);
    return { skipped: true, bytesProcessed: prevEntry ? prevEntry.bytesProcessed : 0, mtimeMs };
  }

  return { skipped: false, bytesProcessed: effectiveEnd, mtimeMs };
}

// -----------------------------------------------------------------------
// dead-agent 判定・report 出力
// -----------------------------------------------------------------------

/** ~/.claude/agents/*.md 一覧（name / 定義ファイル mtime）を返す */
function loadAgentDefinitions() {
  if (!fs.existsSync(AGENTS_DIR)) return [];
  return fs.readdirSync(AGENTS_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const full = path.join(AGENTS_DIR, f);
      const st = fs.statSync(full);
      return { name: f.replace(/\.md$/, ''), definedAt: st.mtimeMs };
    });
}

/**
 * 猶予中 / active / dead候補 を判定する。
 * lastSeen が30日以内なら定義ファイル mtime（猶予）に関係なく active。
 * 猶予は「発火記録がない/30日以上前」の場合の dead 誤判定回避にのみ使う。
 */
function classifyStatus(defEntry, agentsStats, now) {
  const stat = agentsStats[defEntry.name];
  if (stat && stat.lastSeen) {
    const lastSeenMs = Date.parse(stat.lastSeen);
    if (!Number.isNaN(lastSeenMs) && now - lastSeenMs < DEAD_LASTSEEN_MS) {
      return 'active';
    }
  }

  // ここに到達するのは「発火記録なし」または「lastSeen が30日以上前」の場合のみ
  const graceElapsed = now - defEntry.definedAt >= DEAD_GRACE_MS;
  return graceElapsed ? 'dead候補' : '猶予中';
}

/** state.agents（発火実績）と ~/.claude/agents/*.md（定義）を突合し report 行を組み立てる */
function buildReportRows(state) {
  const defs = loadAgentDefinitions();
  const defMap = new Map(defs.map((d) => [d.name, d]));
  const now = Date.now();
  const names = new Set([...Object.keys(state.agents), ...defMap.keys()]);

  const rows = [];
  for (const name of names) {
    const stat = state.agents[name];
    const def = defMap.get(name);
    const status = def ? classifyStatus(def, state.agents, now) : '定義なし';
    rows.push({
      name,
      count: stat ? stat.count : 0,
      lastSeen: stat && stat.lastSeen ? stat.lastSeen : '(発火記録なし)',
      status,
    });
  }
  rows.sort((a, b) => b.count - a.count);
  return rows;
}

function printReport(state) {
  const rows = buildReportRows(state);

  console.log('=== エージェント別発火統計 ===\n');
  if (rows.length === 0) {
    console.log('  (発火記録・定義ファイルともになし)');
  } else {
    console.log(
      '  ' + 'subagent_type'.padEnd(32) + 'count'.padEnd(8) + 'lastSeen'.padEnd(28) + '状態'
    );
    for (const r of rows) {
      console.log(
        '  ' + r.name.padEnd(32) + String(r.count).padEnd(8) + String(r.lastSeen).padEnd(28) + r.status
      );
    }
  }

  console.log('');
  console.log(`最終実行: ${state.lastRunAt || '(未実行)'}`);
  console.log(`累積ファイル走査数: ${state.filesScanned}  累積行解析数: ${state.linesParsed}  累積破損行: ${state.parseErrors}`);

  const deadCandidates = rows.filter((r) => r.status === 'dead候補');
  if (deadCandidates.length > 0) {
    console.log(`\nWARN: dead-agent 候補 ${deadCandidates.length} 件: ${deadCandidates.map((r) => r.name).join(', ')}`);
  }
}

/**
 * PROJECTS_DIR を増分（または --full 指定時は全件）スキャンし state（files/agents）を更新する。
 * state.lastRunAt / filesScanned / linesParsed / parseErrors も本関数内で更新する（呼出後は saveStateAtomic 要）。
 * PROJECTS_DIR 不在時は state を変更せず { scanned: false } を返す（--check からの防御的呼出用）。
 */
async function runIncrementalScan(state, full) {
  if (!fs.existsSync(PROJECTS_DIR)) {
    return { scanned: false, fileCount: 0, scannedCount: 0, skippedCount: 0, linesParsed: 0, parseErrors: 0 };
  }

  const files = findJsonlFiles(PROJECTS_DIR);
  const counters = { linesParsed: 0, parseErrors: 0 };
  let scannedCount = 0;
  let skippedCount = 0;

  for (const filePath of files) {
    const prevEntry = full ? null : state.files[filePath];
    const result = await processFile(filePath, prevEntry, full, state.agents, counters);
    if (!result) continue; // ファイル消失
    if (result.skipped) {
      skippedCount++;
    } else {
      scannedCount++;
    }
    state.files[filePath] = { bytesProcessed: result.bytesProcessed, mtimeMs: result.mtimeMs };
  }

  state.lastRunAt = new Date().toISOString();
  state.filesScanned += scannedCount;
  state.linesParsed += counters.linesParsed;
  state.parseErrors += counters.parseErrors;

  return { scanned: true, fileCount: files.length, scannedCount, skippedCount, linesParsed: counters.linesParsed, parseErrors: counters.parseErrors };
}

// -----------------------------------------------------------------------
// A-24: agent effectiveness（telemetry 鮮度 + dead agent + runs.jsonl クロスチェック + 多様性指標）
// -----------------------------------------------------------------------

/** verification-panel-runs.jsonl を読み込みレコード配列を返す。不在時は null、破損行は行単位 skip */
function loadRunsJsonl() {
  if (!fs.existsSync(RUNS_LOG_FILE)) return null;
  let content;
  try {
    content = fs.readFileSync(RUNS_LOG_FILE, 'utf-8');
  } catch {
    return [];
  }
  const records = [];
  for (const line of content.split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      records.push(JSON.parse(line));
    } catch {
      // 破損行は skip
    }
  }
  return records;
}

/**
 * A-24 の4項目（鮮度/dead-agent/runs.jsonlクロスチェック/多様性）を判定する。
 * @returns {{ warnings: string[], infos: string[] }}
 */
function checkA24(state, scanResult) {
  const warnings = [];
  const infos = [];
  const now = Date.now();

  if (!scanResult.scanned) {
    infos.push(`${PROJECTS_DIR} 不在のため増分スキャン未実施（既存 state のみで判定）`);
  }

  // 1. telemetry 鮮度（vault A-23 と同じ思想: 7日超過で WARN）
  if (!state.lastRunAt) {
    warnings.push('telemetry 未実行（lastRunAt なし）');
  } else {
    const lastRunMs = Date.parse(state.lastRunAt);
    if (Number.isNaN(lastRunMs) || now - lastRunMs > TELEMETRY_FRESHNESS_MS) {
      warnings.push(`telemetry 鮮度: 最終実行 ${state.lastRunAt} から7日超過`);
    }
  }

  // 2. dead agent（1体以上で WARN・列挙）
  const rows = buildReportRows(state);
  const deadRows = rows.filter((r) => r.status === 'dead候補');
  if (deadRows.length > 0) {
    warnings.push(`dead-agent 候補 ${deadRows.length} 件: ${deadRows.map((r) => r.name).join(', ')}`);
  }

  // 3-4. runs.jsonl クロスチェック + 多様性指標
  const runs = loadRunsJsonl();
  if (runs === null) {
    infos.push('verification-panel-runs.jsonl 不在（導入直後）');
  } else {
    // 3. 直近7日でパネル系 agent の発火を telemetry が検知しているのに runs.jsonl に直近7日の記録が0件 → WARN
    const last7d = runs.filter((r) => r && r.ts && now - Date.parse(r.ts) <= RUNS_CROSSCHECK_WINDOW_MS);
    const panelFiredRecently = PANEL_AGENTS.some((name) => {
      const stat = state.agents[name];
      return stat && stat.lastSeen && now - Date.parse(stat.lastSeen) <= RUNS_CROSSCHECK_WINDOW_MS;
    });
    if (panelFiredRecently && last7d.length === 0) {
      warnings.push('パネル実行ログ記録漏れ疑い（telemetry は直近7日のパネル系 agent 発火を検知したが runs.jsonl に直近7日の run 記録が0件）');
    }

    // 4. 多様性指標（直近30日・レコード5件未満はサンプル不足として算出skip）
    const last30d = runs.filter((r) => r && r.ts && now - Date.parse(r.ts) <= DIVERSITY_WINDOW_MS);
    if (last30d.length < DIVERSITY_MIN_RECORDS) {
      infos.push(`多様性指標: runs.jsonl 直近30日レコード ${last30d.length} 件（${DIVERSITY_MIN_RECORDS}件未満のためサンプル不足・算出skip）`);
    } else {
      let totalFindings = 0;
      let totalDup = 0;
      let totalAdopted = 0;
      for (const r of last30d) {
        const findingsObj = r.findings || {};
        totalFindings += Object.values(findingsObj).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
        totalDup += typeof r.dup_pairs === 'number' ? r.dup_pairs : 0;
        totalAdopted += typeof r.adopted === 'number' ? r.adopted : 0;
      }
      if (totalFindings === 0) {
        infos.push('多様性指標: 直近30日の総指摘数が0のため算出skip');
      } else {
        const dupRate = totalDup / totalFindings;
        const adoptedRate = totalAdopted / totalFindings;
        if (dupRate > DUP_RATE_WARN_THRESHOLD) {
          warnings.push(`指摘重複率 ${(dupRate * 100).toFixed(1)}%（>30%・レンズ癖の収束疑い）`);
        }
        if (adoptedRate < ADOPTED_RATE_WARN_THRESHOLD) {
          warnings.push(`採用率 ${(adoptedRate * 100).toFixed(1)}%（<20%・過剰検出の疑い）`);
        }
      }
    }
  }

  return { warnings, infos };
}

function printCheckReport(state, scanResult) {
  console.log('=== A-24: agent effectiveness（telemetry 鮮度 + dead agent + パネルログ整合 + 多様性）===\n');
  if (scanResult.scanned) {
    console.log(`  自己回復スキャン: 処理 ${scanResult.scannedCount} 件 / 変化なし skip ${scanResult.skippedCount} 件`);
  }

  const { warnings, infos } = checkA24(state, scanResult);
  for (const w of warnings) console.log(`  WARN: ${w}`);
  for (const i of infos) console.log(`  INFO: ${i}`);
  if (warnings.length === 0) console.log('  OK: WARN 0件');

  console.log(`\n集計: WARN ${warnings.length} 件 / INFO ${infos.length} 件`);
}

// -----------------------------------------------------------------------
// main
// -----------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const reportOnly = args.includes('--report');
  const checkOnly = args.includes('--check');
  const full = args.includes('--full');

  const state = loadState();

  if (reportOnly) {
    console.log('=== agent-telemetry（--report: state からの報告のみ・スキャンなし）===\n');
    printReport(state);
    process.exit(0);
    return;
  }

  if (checkOnly) {
    // 増分スキャンで鮮度を自己回復（軽量。--full とは併用しない）してから A-24 判定
    const scanResult = await runIncrementalScan(state, false);
    saveStateAtomic(state);
    printCheckReport(state, scanResult);
    process.exit(0); // A-24 は WARN 基調・常に EXIT 0（NG にしない・plan 指示）
    return;
  }

  if (!fs.existsSync(PROJECTS_DIR)) {
    console.error(`FATAL: ${PROJECTS_DIR} が存在しない`);
    process.exit(1);
    return;
  }

  console.log('=== agent-telemetry スキャン開始 ===');
  console.log(`対象: ${PROJECTS_DIR}${full ? '（--full: 全ファイル再スキャン）' : '（増分スキャン）'}\n`);

  const scanResult = await runIncrementalScan(state, full);
  console.log(`対象ファイル: ${scanResult.fileCount} 件\n`);

  saveStateAtomic(state);

  console.log(`スキャン完了: 処理 ${scanResult.scannedCount} 件 / 変化なし skip ${scanResult.skippedCount} 件`);
  console.log(`今回解析行数: ${scanResult.linesParsed}  今回破損行: ${scanResult.parseErrors}\n`);

  printReport(state);

  process.exit(0);
}

main().catch((err) => {
  console.error(`FATAL: ${err && err.stack ? err.stack : err}`);
  process.exit(1);
});
