#!/usr/bin/env node
/**
 * scripts/daigi-smoke-test.mjs — 大義システムの「通電テスト」
 *
 * 各 product で **実際に `claude` を起動し**、SessionStart の大義 hook が発火した実行記録が
 * `~/.claude/logs/hook-errors.jsonl` に載ることを確認する。
 *
 * なぜ要るか（2026-07-17・この失敗の再発防止）:
 *   全 product へ hook を配布した後、`ls products/*<E2><80><8B>/.claude/hooks/plan-daigi-gate.mjs | wc -l` が
 *   29 なのを見て「配備完了」と判定した。**ファイルが在ることしか見ていない。**
 *   実際にはその頃、User スコープの root-guard が product セッションへ
 *   「hook が 1 本もロードされていません」という嘘を注入しており、それを読んだ AI が
 *   「機械が全部死んでいる」と誤報告していた。**存在検査は「書いてある」の確認であって
 *   「効いている」の確認ではない**（3 つの再発パターンの 2 番目）。
 *
 * 判定材料に「モデルの返答」を使わない理由:
 *   返答は言い換え・要約が混ざる。hook-runner が書く実行記録は機械が書いた事実で、
 *   cwd と hook 名と exit_code が入る。**発火したか否かはこれだけで決まる。**
 *
 * 使い方:
 *   node scripts/daigi-smoke-test.mjs                 # CLAUDE.md を持つ全 product
 *   node scripts/daigi-smoke-test.mjs web-platform    # 1 件だけ（コスト実測用）
 *
 * EXIT: 0 = 全 PASS / 1 = FAIL あり
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOG = path.join(os.homedir(), '.claude', 'logs', 'hook-errors.jsonl');
const HOOK = 'session-start-handover-inject';

/** 起動前後で増えた行だけを見る（過去の記録を成功と誤認しないため） */
function logSize() {
  try {
    return fs.statSync(LOG).size;
  } catch {
    return 0;
  }
}

function newEntriesSince(offset) {
  try {
    const fd = fs.openSync(LOG, 'r');
    const size = fs.statSync(LOG).size;
    if (size <= offset) {
      fs.closeSync(fd);
      return [];
    }
    const buf = Buffer.alloc(size - offset);
    fs.readSync(fd, buf, 0, buf.length, offset);
    fs.closeSync(fd);
    return buf
      .toString('utf8')
      .split('\n')
      .filter(Boolean)
      .map(l => {
        try {
          return JSON.parse(l);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function listProducts() {
  const dir = path.join(ROOT, 'products');
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => e.name)
    .filter(n => fs.existsSync(path.join(dir, n, 'CLAUDE.md')))
    .sort();
}

/** 1 product で claude を起動する（判定はしない。判定は全件終了後にログ 1 回読みで行う） */
function energize(product) {
  return new Promise(resolve => {
    const cwd = path.join(ROOT, 'products', product);
    const t0 = Date.now();
    const child = spawn('claude', ['-p', 'OK とだけ返せ。他は何もするな。'], {
      cwd,
      shell: true,
      stdio: 'ignore',
    });
    const timer = setTimeout(() => child.kill(), 180000);
    child.on('error', e => {
      clearTimeout(timer);
      resolve({ product, status: null, err: e.message, sec: (Date.now() - t0) / 1000 });
    });
    child.on('close', status => {
      clearTimeout(timer);
      resolve({ product, status, err: null, sec: (Date.now() - t0) / 1000 });
    });
  });
}

/** 同時起動数。直列だと 1 件 ~97s × 29 = 約 47 分かかるため。 */
const CONCURRENCY = 6;

async function runPool(items, fn, limit) {
  const out = [];
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return out;
}

const only = process.argv[2];
const targets = only ? [only] : listProducts();

if (!fs.existsSync(LOG)) {
  console.error(`⛔ hook 実行ログが無い: ${LOG}`);
  console.error('  hook-runner が動いていない＝判定材料が無い。先にそちらを直せ。');
  process.exit(1);
}

console.log(`=== 大義システム 通電テスト（${targets.length} product・実際に claude を起動する）===`);
console.log(`同時起動 ${Math.min(CONCURRENCY, targets.length)} 件。判定材料は hook 実行ログの実記録のみ。\n`);

// 起動前のログ位置を 1 回だけ取る。以降に増えた記録だけを証拠にする
// （過去の記録を拾って「発火した」と誤判定しないため）。
const before = logSize();
const t0 = Date.now();
const runs = await runPool(targets, energize, CONCURRENCY);

// 全件終了後にログを 1 回読む。並列で書かれても、cwd で product を識別できる。
const entries = newEntriesSince(before).filter(e => e.hook_name === HOOK && e.event === 'SessionStart');

let pass = 0;
const fails = [];
for (const r of runs) {
  const marker = `${path.sep}products${path.sep}${r.product}`.toLowerCase();
  const fired = entries.filter(e => {
    const c = String(e.cwd || '').toLowerCase();
    return c.endsWith(marker) || c.includes(marker + path.sep);
  });

  let ok = false;
  let reason;
  if (r.err) reason = `claude 起動失敗: ${r.err}`;
  else if (fired.length === 0) reason = `${HOOK} の実行記録なし（claude EXIT=${r.status}）＝機械が回っていない`;
  else if (fired.some(e => e.exit_code !== 0)) {
    const bad = fired.find(e => e.exit_code !== 0);
    reason = `発火したが exit_code=${bad.exit_code} / error=${bad.error}`;
  } else {
    ok = true;
    reason = `発火（exit 0）`;
  }

  console.log(`${ok ? 'PASS' : 'FAIL'} ${r.product.padEnd(30)} ${reason}（${r.sec.toFixed(1)}s）`);
  if (ok) pass++;
  else fails.push(r.product);
}

console.log(`\n集計: ${pass}/${targets.length} PASS（総所要 ${((Date.now() - t0) / 1000 / 60).toFixed(1)} 分）`);
if (fails.length) {
  console.log(`FAIL: ${fails.join(' / ')}`);
  console.log('対処: node scripts/propagate-hooks.mjs で配布し直し、再実行せよ。');
  process.exit(1);
}

// 全 product PASS の時だけ日付を残す。check-in A-29 がこの鮮度を見る
// （通電テストは重いので check-in では回さず、「最後に効いていると確かめた日」だけ見る）。
// 1 件だけの実行（引数あり）は全数の証明にならないので記録しない。
if (!only) {
  const stamp = path.join(ROOT, 'tmp', 'daigi-smoke-last-pass.txt');
  try {
    fs.mkdirSync(path.dirname(stamp), { recursive: true });
    fs.writeFileSync(stamp, new Date().toISOString().slice(0, 10) + '\n', 'utf8');
    console.log(`通電記録: ${path.relative(ROOT, stamp).replace(/\\/g, '/')}（check-in A-29 がこの鮮度を見る）`);
  } catch (e) {
    console.log(`⚠ 通電記録の書込に失敗: ${e.message}`);
  }
}
process.exit(0);
