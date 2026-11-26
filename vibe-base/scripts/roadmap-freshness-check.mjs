#!/usr/bin/env node
/**
 * roadmap-freshness-check.mjs — 現在地（roadmap-state.json）の鮮度を機械検証する
 *
 * roadmap M5。Check-out で実行する。
 *
 * なぜ要るか:
 *   「右往左往の真因は軌跡の欠如ではなく順序＋現在地の欠如」という判断で、軌跡を記録しない
 *   設計を採った（2026-07-17 マスター裁定）。その代償として **現在地が腐ると復帰不能**になる。
 *   だから現在地の鮮度だけは機械が見る。roadmap.md も「現在地の鮮度は Check-out で機械検証する」
 *   と定める。
 *
 * 判定（機械に判れる範囲だけを見る。マイルストーンが本当に done かは機械には判らない）:
 *   - updated_at より後の commit が在る       → WARN（現在地を触らずに作業が進んだ疑い）
 *   - in_progress のまま 14 日以上動いていない → WARN（放置の疑い）
 *   - status が _status_values の外           → WARN
 *   - 全 done                                  → INFO（H2大義の完走判定へ進めの合図）
 *
 * **WARN 止まりで EXIT 0 を返す。** 新規検知は advisory/WARN 固定で導入する規律
 * （docs/standards/verification-panel.md）。blocking 化は観測窓（14日 or 10 check-in）の
 * 候補却下率 < 30% を実測してからマスターに起票する。
 *
 * EXIT: 常に 0（--strict 指定時のみ WARN で 1）。
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const STATE = path.join(ROOT, 'roadmap-state.json');
const STRICT = process.argv.includes('--strict');
const STALE_DAYS = 14;

const warns = [];
const infos = [];

function daysBetween(a, b) {
  return Math.floor((b - a) / 86400000);
}

function lastCommitISO() {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cI'], { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function main() {
  if (!fs.existsSync(STATE)) {
    console.log('— roadmap-freshness: roadmap-state.json 不在（product は現在地 JSON を持たなくてよい）→ skip');
    return 0;
  }

  let state;
  try {
    state = JSON.parse(fs.readFileSync(STATE, 'utf8'));
  } catch (e) {
    console.log(`⚠️  roadmap-freshness: roadmap-state.json が valid JSON でない: ${e.message}`);
    console.log('   → 現在地の正本が壊れています。git checkout -- roadmap-state.json で復元してください。');
    return STRICT ? 1 : 0;
  }

  const updatedAt = state.updated_at;
  const milestones = Array.isArray(state.milestones) ? state.milestones : [];

  if (!updatedAt || !/^\d{4}-\d{2}-\d{2}/.test(String(updatedAt))) {
    warns.push('updated_at が YYYY-MM-DD 形式でない（鮮度を判定できない）');
  } else {
    const u = new Date(`${String(updatedAt).slice(0, 10)}T23:59:59`);
    const commitISO = lastCommitISO();
    if (commitISO) {
      const c = new Date(commitISO);
      if (c > u) {
        const d = daysBetween(u, c);
        warns.push(
          `updated_at (${String(updatedAt).slice(0, 10)}) より後の commit が在る（最新 commit: ${commitISO.slice(0, 10)}・${d}日ぶん）\n` +
          '   → 現在地を更新せずに作業が進んだ疑い。roadmap-state.json の status を実態に合わせてください（編集してよいのは status のみ）。'
        );
      }
    }
    const age = daysBetween(u, new Date());
    const inProgress = milestones.filter(m => m?.status === 'in_progress');
    if (inProgress.length > 0 && age >= STALE_DAYS) {
      warns.push(`id ${inProgress.map(m => m.id).join(',')} が in_progress のまま ${age} 日動いていない（放置の疑い）`);
    }
  }

  const allowed = Array.isArray(state._status_values) ? state._status_values : ['todo', 'in_progress', 'done'];
  const bad = milestones.filter(m => !allowed.includes(m?.status));
  if (bad.length > 0) {
    warns.push(`status が許可値外: ${JSON.stringify(bad.map(m => ({ id: m?.id, status: m?.status })))}（許可値: ${allowed.join(' / ')}）`);
  }

  const done = milestones.filter(m => m?.status === 'done').length;
  if (milestones.length > 0 && done === milestones.length) {
    infos.push('全マイルストーンが done。**roadmap.md の完走判定**（backlog.json を読んで各 open が現 H2大義をブロックするか再判定）へ進み、H2大義の完了をマスターに諮ってください。');
  }

  console.log(`roadmap-freshness: updated_at=${updatedAt ?? '(なし)'} / 進捗 ${done}/${milestones.length} done`);
  const remaining = milestones.filter(m => m?.status !== 'done').map(m => m.id);
  if (remaining.length > 0) console.log(`   残り: id ${remaining.join(', ')}`);
  for (const i of infos) console.log(`ℹ️  ${i}`);
  for (const w of warns) console.log(`⚠️  ${w}`);
  if (warns.length === 0) console.log('✅ 現在地は鮮度 OK');

  return warns.length > 0 && STRICT ? 1 : 0;
}

try {
  process.exit(main());
} catch (e) {
  console.log(`— roadmap-freshness: 実行不能（${e.message}）→ skip（checkout は続行）`);
  process.exit(0);
}
