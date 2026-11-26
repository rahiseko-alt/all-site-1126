#!/usr/bin/env node
// scripts/git-scope-check.mjs
// path-scoped commit 巻き込み防止のための照合補助（並行セッション対策）
// 重要: 本スクリプトは「照合のみ」。unstage / reset / amend 等の自動修復は一切行わない。
//       並行セッションの staged を書き換えるのは越権であり、検出したら手動確認に委ねる。
// 用途:
//   node scripts/git-scope-check.mjs --intended "<path1> <path2> ..."
//     staged 全件が intended path のいずれかを prefix とするか照合。
//     範囲外 staged があれば一覧表示し exit 1。全件 intended 内なら exit 0。
//   node scripts/git-scope-check.mjs --post [--intended "<path1> <path2> ..."]
//     直前 commit のファイル一覧を表示し、intended との件数を照合して報告（不一致は WARN）。
//   node scripts/git-scope-check.mjs --selftest
//     os.tmpdir() 配下に一時 git repo を作り、intended 内/外のフィクスチャで判定ロジックを検証。
//     実 repo は一切触らない。終了時に一時 dir を掃除する。

import { execSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

function run(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf-8', ...opts });
}

function normalize(p) {
  return p.replace(/\\/g, '/').replace(/^\.\//, '');
}

export function getStagedFiles(cwd = process.cwd()) {
  const out = run('git diff --cached --name-only', { cwd });
  return out.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}

export function isWithinIntended(filePath, intendedPaths) {
  const f = normalize(filePath);
  return intendedPaths.some((ip) => {
    const norm = normalize(ip);
    if (norm === '') return false;
    return f === norm || f.startsWith(norm.endsWith('/') ? norm : `${norm}/`);
  });
}

export function checkScope(intendedPaths, cwd = process.cwd()) {
  const staged = getStagedFiles(cwd);
  const outOfScope = staged.filter((f) => !isWithinIntended(f, intendedPaths));
  return { staged, outOfScope };
}

function getLastCommitFiles(cwd = process.cwd()) {
  // --stat --name-only 併記時は後勝ちで --name-only の出力形式（コミットヘッダ + ファイル一覧）になる
  let out;
  try {
    out = run('git show HEAD --stat --name-only --format=medium', { cwd });
  } catch {
    console.error('[git-scope-check --post] HEAD が存在しません（commit 後に実行してください）');
    process.exit(1);
  }
  const lines = out.split(/\r?\n/);
  const files = [];
  let pastHeader = false;
  for (const line of lines) {
    if (/^commit\s/.test(line) || /^Author:/.test(line) || /^Date:/.test(line) || /^Merge:/.test(line)) {
      continue;
    }
    if (!pastHeader) {
      if (line.trim() === '') pastHeader = true;
      continue;
    }
    if (line.trim() === '') continue;
    if (/^ {4}/.test(line)) continue; // commit message 本文（4 スペースインデント）を除外
    files.push(line.trim());
  }
  return files;
}

function runIntendedMode(intendedStr) {
  const intendedPaths = intendedStr.split(/\s+/).map((s) => s.trim()).filter(Boolean);
  if (intendedPaths.length === 0) {
    console.error('[git-scope-check] --intended に有効なパスが指定されていません');
    process.exit(1);
  }
  const { staged, outOfScope } = checkScope(intendedPaths);
  if (staged.length === 0) {
    console.log('[git-scope-check] staged ファイルなし');
    process.exit(0);
  }
  if (outOfScope.length > 0) {
    console.error('[git-scope-check] 範囲外 staged ファイルを検出（並行セッションの巻き込み疑い）:');
    for (const f of outOfScope) console.error(`  - ${f}`);
    console.error('[git-scope-check] 本スクリプトは照合のみ。unstage/reset は行わない。手動確認せよ。');
    process.exit(1);
  }
  console.log(`[git-scope-check] OK: staged ${staged.length} 件すべて intended 範囲内`);
  process.exit(0);
}

function runPostMode(intendedStr) {
  const files = getLastCommitFiles();
  console.log('[git-scope-check] 直前 commit のファイル一覧:');
  for (const f of files) console.log(`  - ${f}`);
  console.log(`[git-scope-check] commit ファイル件数: ${files.length}`);
  if (intendedStr) {
    const intendedPaths = intendedStr.split(/\s+/).map((s) => s.trim()).filter(Boolean);
    console.log(`[git-scope-check] intended 件数: ${intendedPaths.length}`);
    if (intendedPaths.length !== files.length) {
      console.warn(
        `[git-scope-check] WARN: commit 件数(${files.length}) と intended 件数(${intendedPaths.length}) が不一致です。並行セッションの巻き込みを確認してください。`
      );
    } else {
      console.log('[git-scope-check] commit 件数と intended 件数は一致しています');
    }
  }
  process.exit(0);
}

function runSelftest() {
  const tmpBase = fs.mkdtempSync(path.join(os.tmpdir(), 'git-scope-check-'));
  let pass = true;
  try {
    run('git init -q', { cwd: tmpBase });
    run('git config user.email "selftest@example.com"', { cwd: tmpBase });
    run('git config user.name "selftest"', { cwd: tmpBase });

    // フィクスチャ1: intended 内 staged のみ → 範囲外なし（exit 0 相当）
    const dirA = path.join(tmpBase, 'a');
    fs.mkdirSync(dirA, { recursive: true });
    fs.writeFileSync(path.join(dirA, 'file1.txt'), 'dummy', 'utf-8');
    run('git add a/file1.txt', { cwd: tmpBase });
    let result = checkScope(['a'], tmpBase);
    if (result.outOfScope.length === 0) {
      console.log('[selftest] PASS: intended 内ケース（範囲外なし = exit 0 相当）');
    } else {
      console.error('[selftest] FAIL: intended 内ケースで誤って範囲外が検出された');
      pass = false;
    }

    // フィクスチャ2: intended 外 staged を追加 → 範囲外検出（exit 1 相当）
    const dirB = path.join(tmpBase, 'b');
    fs.mkdirSync(dirB, { recursive: true });
    fs.writeFileSync(path.join(dirB, 'file2.txt'), 'dummy', 'utf-8');
    run('git add b/file2.txt', { cwd: tmpBase });
    result = checkScope(['a'], tmpBase);
    if (result.outOfScope.length === 1 && normalize(result.outOfScope[0]) === 'b/file2.txt') {
      console.log('[selftest] PASS: intended 外ケース（範囲外検出 = exit 1 相当）');
    } else {
      console.error('[selftest] FAIL: intended 外ケースで範囲外検出に失敗');
      pass = false;
    }

    // フィクスチャ3: ファイル完全一致の intended（ディレクトリでなく単一ファイル指定）
    result = checkScope(['a/file1.txt', 'b/file2.txt'], tmpBase);
    if (result.outOfScope.length === 0) {
      console.log('[selftest] PASS: ファイル単位 intended ケース（範囲外なし）');
    } else {
      console.error('[selftest] FAIL: ファイル単位 intended ケースで誤検出');
      pass = false;
    }
  } catch (err) {
    console.error('[selftest] ERROR:', err.message);
    pass = false;
  } finally {
    try {
      fs.rmSync(tmpBase, { recursive: true, force: true });
    } catch {
      // 一時 dir 掃除の失敗は selftest 結果に影響させない（best-effort）
    }
  }
  return pass;
}

function parseArgs(argv) {
  const args = { intended: null, post: false, selftest: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--intended') {
      args.intended = argv[++i] || '';
    } else if (a.startsWith('--intended=')) {
      args.intended = a.slice('--intended='.length);
    } else if (a === '--post') {
      args.post = true;
    } else if (a === '--selftest') {
      args.selftest = true;
    }
  }
  return args;
}

// CLI 直接実行判定（ESM）— scripts/check-secret-patterns.mjs L47-56 のパターンを踏襲
const isMain = (() => {
  try {
    const argv1 = (process.argv[1] || '').replace(/\\/g, '/');
    const url = import.meta.url.replace(/^file:\/+/, '/').replace(/\\/g, '/');
    return argv1.endsWith('git-scope-check.mjs') && url.endsWith('git-scope-check.mjs');
  } catch {
    return false;
  }
})();

if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  if (args.selftest) {
    const ok = runSelftest();
    process.exit(ok ? 0 : 1);
  } else if (args.post) {
    runPostMode(args.intended);
  } else if (args.intended !== null) {
    runIntendedMode(args.intended);
  } else {
    console.error(
      'Usage: node scripts/git-scope-check.mjs --intended "<path1> <path2> ..." | --post [--intended "..."] | --selftest'
    );
    process.exit(1);
  }
}
