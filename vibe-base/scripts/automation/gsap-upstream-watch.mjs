#!/usr/bin/env node
/**
 * scripts/automation/gsap-upstream-watch.mjs  （リスト③ C-4）
 *
 * gsap skill（~/.claude/skills/gsap/）の upstream 週次差分検知。schtasks 週次 月曜 08:20。
 * GitHub API（無認証・読取のみ）で監視対象リポの最新 commit SHA を取得し前回値と比較。差分ありのみ warn。
 * **自動追随・コード書換は一切しない**（検知・レポートのみ・適用は人間レビュー必須）。
 *
 * 監視対象の確定（plan C-4 の規則・2026-07-12 実査）: greensock/gsap-skills が実在（GitHub API 200）→ 主対象。
 *   不在時は greensock/GSAP 本体にフォールバック。
 *
 * 監視自体の故障対策: API 障害時は warn を出さず consecutive_failures を進め、last_run のみ更新。
 *   連続 FAIL_THRESHOLD 回で初めて「監視自体の故障」warn（静かに壊れるのを防ぐ）。
 */
import { recordRun, readState } from './_lib/state.mjs';

const JOB = 'gsap-watch';
const PRIMARY = 'greensock/gsap-skills';
const FALLBACK = 'greensock/GSAP';
const FETCH_TIMEOUT_MS = 15000;
const FAIL_THRESHOLD = 3;

async function ghJson(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { 'user-agent': 'gsap-upstream-watch/1.0', accept: 'application/vnd.github+json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/** 最新 commit SHA（default branch）。404/ネットワーク障害は throw。 */
async function latestSha(repo) {
  const arr = await ghJson(`https://api.github.com/repos/${repo}/commits?per_page=1`);
  if (!Array.isArray(arr) || !arr[0] || typeof arr[0].sha !== 'string') throw new Error('commit 応答が不正');
  return arr[0].sha;
}

async function main() {
  const prev = readState(JOB);
  const prevSha = typeof prev.metrics?.last_sha === 'string' ? prev.metrics.last_sha : null;
  const prevRepo = typeof prev.metrics?.repo === 'string' ? prev.metrics.repo : null;
  const prevFails = typeof prev.metrics?.consecutive_failures === 'number' ? prev.metrics.consecutive_failures : 0;

  // 監視先は PRIMARY を最優先し sha 取得を直接試みる（別の存在確認 API を挟まない＝瞬断で PRIMARY→FALLBACK
  // に誤切替し無関係な sha と比較する誤検知を避ける）。PRIMARY が取れなければ FALLBACK を試す。
  let repo = null;
  let sha = null;
  let lastErr = null;
  for (const candidate of [PRIMARY, FALLBACK]) {
    try {
      sha = await latestSha(candidate);
      repo = candidate;
      break;
    } catch (e) {
      lastErr = e;
    }
  }

  if (sha === null) {
    // 両方失敗 = 監視自体の故障。warn は閾値到達までは出さず故障カウントを進める。
    const fails = prevFails + 1;
    const warn = fails >= FAIL_THRESHOLD ? `gsap upstream 監視が連続 ${fails} 回失敗（GitHub API 到達不可）` : null;
    recordRun(JOB, {
      completed: false,
      warn,
      metrics: { repo: prevRepo || PRIMARY, last_sha: prevSha, consecutive_failures: fails },
    });
    process.stderr.write(`[gsap-watch] 取得失敗(${fails}/${FAIL_THRESHOLD}): ${lastErr ? lastErr.message : 'unknown'}\n`);
    process.stdout.write(`[gsap-watch] recorded (fail ${fails}/${FAIL_THRESHOLD}, warn=${warn ? 'yes' : 'no'}).\n`);
    // process.exit() は fetch(undici) のハンドルが残る中で Windows libuv assertion を起こす（実測 EXIT 127）。
    // exitCode を立てて return し、event loop の自然 drain で終了する。
    process.exitCode = fails >= FAIL_THRESHOLD ? 1 : 0;
    return;
  }

  // 差分は「前回と同一 repo」の時のみ判定（repo が切替わった直後の無関係な sha 比較で誤検知しない）。
  const changed = prevSha !== null && prevRepo === repo && prevSha !== sha;
  const warn = changed
    ? `gsap upstream (${repo}) に更新あり: ${prevSha.slice(0, 8)} → ${sha.slice(0, 8)}。適用は別工程・人間レビュー必須（自動追随はしない）`
    : null;

  recordRun(JOB, {
    completed: true,
    warn,
    metrics: { repo, last_sha: sha, consecutive_failures: 0 },
  });

  process.stdout.write(
    `[gsap-watch] ${repo} sha=${sha.slice(0, 8)} prev=${prevSha ? prevSha.slice(0, 8) : 'none'} changed=${changed}\n`
  );
  // process.exit() は使わない（fetch ハンドル残存中の Windows libuv assertion 回避）。exitCode は既定 0。
}

main().catch((e) => {
  recordRun(JOB, { completed: false, warn: `gsap-watch 異常終了: ${e.message}` });
  process.stderr.write(`[gsap-watch] FATAL: ${e.stack || e.message}\n`);
  process.exitCode = 1;
});
