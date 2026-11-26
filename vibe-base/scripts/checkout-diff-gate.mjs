#!/usr/bin/env node
// scripts/checkout-diff-gate.mjs
// S-5: checkout skill A-1（変更差分の最終確認）の機械化ゲート。
// git status/diff の既知リスクパターン（xlsx / settings.local.json / .env* /
// 1MB 超の新規バイナリ / Office 一時ファイル ~$）を機械検知する。
//   - ヒットあり: 一覧を表示し exit 1（＝「目視必須に格上げ」のゲート。commit 禁止ではない）
//   - クリーン:   exit 0
// exit 1 は checkout を詰まらせるためではなく、A-1 の目視3観点を確実に発火させる合図。
// 用途:
//   node scripts/checkout-diff-gate.mjs            # 現 repo を判定
//   node scripts/checkout-diff-gate.mjs --selftest # 内蔵フィクスチャで自己検証
//
// Windows cp932 対策: ファイル読込は utf-8 明示（既知ローカル罠）。

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

// 除外: 安全な .env 系サンプル（実シークレットを含まない慣習ファイル）
const ENV_SAFE = /\.env\.(example|sample|template)$/i;
// テキスト拡張子（新規でも「巨大バイナリ」判定から除外）
const TEXT_EXT = /\.(md|txt|json|jsonl|mjs|js|cjs|ts|tsx|jsx|css|scss|html|htm|svg|yml|yaml|xml|csv|tsv|sh|ps1|py|toml|ini|env|gitignore|lock)$/i;
const BIG_BYTES = 1024 * 1024; // 1MB

// リスク分類ルール（パス基準）
const PATH_RULES = [
  { name: 'Excel ブック混入 (.xlsx/.xls)', test: (p) => /\.xlsx?$/i.test(p) },
  { name: 'ローカル settings 混入 (settings.local.json)', test: (p) => /(^|\/)settings\.local\.json$/i.test(p) },
  {
    name: '.env 実ファイル混入',
    test: (p) => {
      const base = p.split('/').pop() || p;
      return /(^|\/)\.env(\.|$)/i.test('/' + base) && !ENV_SAFE.test(base);
    },
  },
  { name: 'Office 一時ファイル (~$)', test: (p) => /(^|\/)~\$/.test(p) },
];

// git status --short --untracked-files=all をパースして {status, filePath, isNew} の配列を返す
// （-uall: 新規未追跡ディレクトリを1行に折り畳まず中身を個別ファイルとして列挙。
//   折り畳まれると新規ディレクトリ内の xlsx/.env 等が検知漏れするため必須）
function parseStatus(cwd) {
  let raw = '';
  try {
    raw = execSync('git status --short --untracked-files=all', { cwd, encoding: 'utf-8' });
  } catch {
    return [];
  }
  const out = [];
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    // 形式: XY <path>  （リネームは "R  old -> new"）
    const xy = line.slice(0, 2);
    let p = line.slice(3).trim();
    if (p.includes(' -> ')) p = p.split(' -> ').pop().trim();
    // クォート除去（日本語等でクォートされる場合）
    if (p.startsWith('"') && p.endsWith('"')) p = p.slice(1, -1);
    const isNew = xy.includes('?') || xy.includes('A');
    out.push({ status: xy, filePath: p.replace(/\\/g, '/'), isNew });
  }
  return out;
}

// git diff --stat HEAD をパースして {status, filePath, isNew} の配列を返す
// （status --short と併用: HEAD 比較の変更ファイル名を補完的に捕捉する）
function parseDiffStat(cwd) {
  let raw = '';
  try {
    raw = execSync('git diff --stat HEAD', { cwd, encoding: 'utf-8' });
  } catch {
    return [];
  }
  const out = [];
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*(.+?)\s+\|\s+\d+/);
    if (!m) continue;
    const p = m[1].trim();
    out.push({ status: 'M', filePath: p.replace(/\\/g, '/'), isNew: false });
  }
  return out;
}

// parseStatus + parseDiffStat を filePath でマージ（重複排除・isNew は OR）
function collectEntries(cwd) {
  const map = new Map();
  for (const e of [...parseStatus(cwd), ...parseDiffStat(cwd)]) {
    const prev = map.get(e.filePath);
    if (prev) {
      prev.isNew = prev.isNew || e.isNew;
    } else {
      map.set(e.filePath, { ...e });
    }
  }
  return [...map.values()];
}

// 巨大新規バイナリ判定
function isBigNewBinary(cwd, entry) {
  if (!entry.isNew) return false;
  if (TEXT_EXT.test(entry.filePath)) return false;
  try {
    const st = fs.statSync(path.join(cwd, entry.filePath));
    return st.isFile() && st.size > BIG_BYTES;
  } catch {
    return false;
  }
}

// 判定本体: ヒット配列 [{filePath, reason}] を返す
export function scanRepo(cwd) {
  const entries = collectEntries(cwd);
  const hits = [];
  for (const e of entries) {
    for (const rule of PATH_RULES) {
      if (rule.test(e.filePath)) hits.push({ filePath: e.filePath, reason: rule.name });
    }
    if (isBigNewBinary(cwd, e)) {
      hits.push({ filePath: e.filePath, reason: '1MB 超の新規バイナリ' });
    }
  }
  return hits;
}

// ---- selftest ----
function selftest() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ckgate-'));
  let ok = true;
  try {
    execSync('git init -q', { cwd: tmp });
    execSync('git config user.email t@t.t', { cwd: tmp });
    execSync('git config user.name t', { cwd: tmp });

    // (1) クリーン: 安全ファイルのみ → hits 0
    fs.writeFileSync(path.join(tmp, 'a.md'), '# hello\n', 'utf-8');
    fs.writeFileSync(path.join(tmp, '.env.example'), 'KEY=\n', 'utf-8');
    let hits = scanRepo(tmp);
    if (hits.length !== 0) { console.error('FAIL clean:', hits); ok = false; }

    // (2) 危険ファイル群 → 各ルールが検知
    fs.writeFileSync(path.join(tmp, 'book.xlsx'), 'x', 'utf-8');
    fs.writeFileSync(path.join(tmp, 'settings.local.json'), '{}', 'utf-8');
    fs.writeFileSync(path.join(tmp, '.env'), 'SECRET=1', 'utf-8');
    fs.writeFileSync(path.join(tmp, '~$temp.docx'), 'x', 'utf-8');
    fs.writeFileSync(path.join(tmp, 'big.bin'), Buffer.alloc(BIG_BYTES + 10));
    hits = scanRepo(tmp);
    const reasons = new Set(hits.map((h) => h.reason));
    for (const need of ['Excel ブック混入 (.xlsx/.xls)', 'ローカル settings 混入 (settings.local.json)', '.env 実ファイル混入', 'Office 一時ファイル (~$)', '1MB 超の新規バイナリ']) {
      if (!reasons.has(need)) { console.error('FAIL missing rule:', need); ok = false; }
    }
    // .env.example は誤検知しない
    if (hits.some((h) => h.filePath.endsWith('.env.example'))) { console.error('FAIL: .env.example を誤検知'); ok = false; }

    // (3) 新規未追跡ディレクトリの中身 → git add せず放置しても検知（-uall 折り畳み穴の回帰防止）
    fs.mkdirSync(path.join(tmp, 'newdir'));
    fs.writeFileSync(path.join(tmp, 'newdir', 'book.xlsx'), 'x', 'utf-8');
    hits = scanRepo(tmp);
    if (!hits.some((h) => h.filePath === 'newdir/book.xlsx' && h.reason === 'Excel ブック混入 (.xlsx/.xls)')) {
      console.error('FAIL: 新規未追跡ディレクトリ内の xlsx を検知できず（-uall 折り畳み穴）:', hits);
      ok = false;
    }
  } finally {
    try { fs.rmSync(tmp, { recursive: true, force: true }); } catch {}
  }
  if (ok) { console.log('checkout-diff-gate selftest: PASS'); process.exit(0); }
  else { console.error('checkout-diff-gate selftest: FAIL'); process.exit(1); }
}

// ---- CLI ----
const isMain = (() => {
  try {
    const argv1 = (process.argv[1] || '').replace(/\\/g, '/');
    return argv1.endsWith('checkout-diff-gate.mjs');
  } catch {
    return false;
  }
})();

if (isMain) {
  if (process.argv.includes('--selftest')) {
    selftest();
  } else {
    const hits = scanRepo(process.cwd());
    if (hits.length) {
      console.error('⚠️ checkout-diff-gate: 目視必須に格上げ（下記は既知リスクパターン。混入の意図を確認せよ）:');
      for (const h of hits) console.error(`  - [${h.reason}] ${h.filePath}`);
      process.exit(1);
    }
    console.log('checkout-diff-gate: クリーン（既知リスクパターンなし）');
    process.exit(0);
  }
}
