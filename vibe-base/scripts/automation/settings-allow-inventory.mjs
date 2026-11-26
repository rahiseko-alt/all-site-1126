#!/usr/bin/env node
/**
 * scripts/automation/settings-allow-inventory.mjs  （リスト③ C-3）
 *
 * settings.local.json の allow 規則を月次で棚卸し（分類スナップショット + 前月比増加 WARN）。schtasks 月次 1日 08:25。
 *
 * 重要（read-only 保証）: 本 job は settings.local.json を **一切書き換えない**（削除・整理はしない）。
 *   レポート・提案のみ。削除候補は既存 `node scripts/cleanup-settings.mjs --dry-run` の案内を出力に含める。
 *   write 経路を実装しないことで read-only を機械的に保証する（自動削除への誘惑を構造的に断つ）。
 *
 * 設計: allow を kind 別分類（webfetch / bash-generic(:*) / bash-oneoff / mcp / tool / other）し、
 *   outputs/settings-inventory/YYYY-MM.json にスナップショット保存 → 直近の過去スナップショットと総数比較 →
 *   前月比 INCREASE_THRESHOLD 超の増加で warn（肥大の無監視を防ぐ）。
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { recordRun } from './_lib/state.mjs';

const JOB = 'settings-inventory';
const INCREASE_THRESHOLD = 50; // 前回スナップショット比 +50 件超の増加で warn（詳細節の閾値案）。
const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '..', '..');
const settingsPath = path.join(repoRoot, '.claude', 'settings.local.json');
const inventoryDir = path.join(repoRoot, 'outputs', 'settings-inventory');

/** allow 規則を kind 別に分類する。 */
function classifyRule(r) {
  if (typeof r !== 'string') return 'other';
  if (r.startsWith('WebFetch')) return 'webfetch';
  if (r.startsWith('Bash(')) return r.endsWith(':*)') ? 'bash-generic' : 'bash-oneoff';
  if (r.startsWith('mcp__')) return 'mcp';
  if (/^(Read|Edit|Write|Glob|Grep|WebSearch|Task|NotebookEdit|TodoWrite)/.test(r)) return 'tool';
  return 'other';
}

function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** inventoryDir 内で currentMonth より前の最新スナップショット（比較基線）を返す。無ければ null。 */
function findBaseline(currentMonth) {
  let files;
  try {
    files = readdirSync(inventoryDir).filter((f) => /^\d{4}-\d{2}\.json$/.test(f) && f < `${currentMonth}.json`);
  } catch {
    return null;
  }
  if (files.length === 0) return null;
  files.sort();
  const latest = files[files.length - 1];
  try {
    return { name: latest, ...JSON.parse(readFileSync(path.join(inventoryDir, latest), 'utf-8')) };
  } catch {
    return null;
  }
}

function main() {
  let raw;
  try {
    raw = readFileSync(settingsPath, 'utf-8');
  } catch (e) {
    recordRun(JOB, { completed: false, warn: `settings.local.json 読取失敗: ${e.message}` });
    process.stderr.write(`[settings-inventory] read failed: ${e.message}\n`);
    process.exit(1);
  }

  const sha = createHash('sha256').update(raw).digest('hex');
  let allow = [];
  try {
    const parsed = JSON.parse(raw);
    allow = (parsed.permissions && Array.isArray(parsed.permissions.allow)) ? parsed.permissions.allow : [];
  } catch (e) {
    recordRun(JOB, { completed: false, warn: `settings.local.json parse 失敗: ${e.message}` });
    process.stderr.write(`[settings-inventory] parse failed: ${e.message}\n`);
    process.exit(1);
  }

  const byKind = {};
  for (const r of allow) {
    const k = classifyRule(r);
    byKind[k] = (byKind[k] || 0) + 1;
  }

  const cur = monthKey();
  const snapshot = {
    month: cur,
    generated_at: new Date().toISOString(),
    source: '.claude/settings.local.json',
    source_sha256: sha,
    total: allow.length,
    by_kind: byKind,
  };

  const baseline = findBaseline(cur);
  let warn = null;
  if (baseline && typeof baseline.total === 'number') {
    const delta = snapshot.total - baseline.total;
    if (delta > INCREASE_THRESHOLD) {
      warn = `allow が前回スナップショット(${baseline.name} total=${baseline.total})比 +${delta} 件増（現 ${snapshot.total}）＝肥大の兆候。削除候補は node scripts/cleanup-settings.mjs --dry-run で確認`;
    }
  }

  try {
    mkdirSync(inventoryDir, { recursive: true });
    writeFileSync(path.join(inventoryDir, `${cur}.json`), JSON.stringify(snapshot, null, 2) + '\n', 'utf-8');
  } catch (e) {
    recordRun(JOB, { completed: false, warn: `スナップショット書込失敗: ${e.message}` });
    process.stderr.write(`[settings-inventory] snapshot write failed: ${e.message}\n`);
    process.exit(1);
  }

  recordRun(JOB, {
    completed: true,
    warn,
    metrics: { total: snapshot.total, by_kind: byKind, baseline: baseline ? baseline.name : null },
  });

  process.stdout.write(
    `[settings-inventory] ${cur}: total=${snapshot.total} ` +
      `(${Object.entries(byKind).map(([k, v]) => `${k}:${v}`).join(' ')}) ` +
      `baseline=${baseline ? baseline.name : 'none'} warn=${warn ? 'yes' : 'no'}\n`
  );
  if (warn) process.stdout.write(`  WARN: ${warn}\n`);
  process.stdout.write('  （本 job は settings を書き換えません。削除は node scripts/cleanup-settings.mjs --dry-run で確認）\n');
  process.exit(0);
}

main();
