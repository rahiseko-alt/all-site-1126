#!/usr/bin/env node
// scripts/check-masking-patterns.mjs
// 外部公開物マスキング対象語検知（#7 ①skill化 plan Wave1/S-1）
// 用途:
//   - CLI: node scripts/check-masking-patterns.mjs --file <path> [--product <name>]
//   - CLI: node scripts/check-masking-patterns.mjs --selftest
// 辞書: docs/standards/masking-dictionary.json（global.categories + products[name]）
// マスター本人名は辞書に書かず、実行時に ~/.claude/skills/_shared/resolve-paths.mjs
// --master-name-file 経由で env からマージする（env 未設定なら skip・crash しない）。
// 検出時 exit 1, 検出なし exit 0。
// 🔴 検出語そのもの（特に本人名）は stdout/stderr に出さず、カテゴリ名のみ表示する。

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DICTIONARY_PATH = path.join(__dirname, '..', 'docs', 'standards', 'masking-dictionary.json');

export function loadDictionary(dictPath = DICTIONARY_PATH) {
  const raw = fs.readFileSync(dictPath, 'utf-8');
  return JSON.parse(raw);
}

// masterName: マージ済みの本人名文字列（呼び出し側が env 経由で解決したもの）。省略可。
export function buildPatterns(dictionary, product, masterName) {
  const patterns = [];
  const categories = (dictionary && dictionary.global && dictionary.global.categories) || {};
  for (const [category, words] of Object.entries(categories)) {
    for (const word of words) {
      if (word) patterns.push({ category, word });
    }
  }
  if (product && dictionary.products && dictionary.products[product]) {
    const productCategories = dictionary.products[product];
    for (const [category, words] of Object.entries(productCategories)) {
      for (const word of words) {
        if (word) patterns.push({ category, word });
      }
    }
  }
  if (masterName) {
    patterns.push({ category: '本人情報', word: masterName });
  }
  return patterns;
}

// text 内に patterns の word が含まれるかを走査し、ヒットした「カテゴリ名」の一覧（重複排除）を返す。
// ヒット語そのもの（word）は返り値に含めない（本人名等の漏洩防止）。
export function scanString(text, patterns) {
  if (typeof text !== 'string' || text.length === 0) return [];
  if (!Array.isArray(patterns) || patterns.length === 0) return [];
  const hitCategories = new Set();
  for (const pat of patterns) {
    if (!pat || !pat.word) continue;
    if (text.includes(pat.word)) {
      hitCategories.add(pat.category);
    }
  }
  return [...hitCategories];
}

export function scanFile(filePath, patterns) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  return scanString(content, patterns);
}

// マスター本人名を env 経由で解決する。取得できない場合は null（呼び出し側で skip する）。
// 得た名前は絶対にログ出力しない。
export function resolveMasterName() {
  try {
    const home = os.homedir();
    const resolverPath = path.join(home, '.claude', 'skills', '_shared', 'resolve-paths.mjs');
    if (!fs.existsSync(resolverPath)) return null;
    const out = execFileSync('node', [resolverPath, '--master-name-file'], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const namePath = out.trim();
    if (!namePath || !fs.existsSync(namePath)) return null;
    const name = fs.readFileSync(namePath, 'utf-8').trim();
    return name || null;
  } catch {
    return null;
  }
}

function runSelftest() {
  const dictionary = loadDictionary();
  const patterns = buildPatterns(dictionary, null, null);
  const dirtyFixture = 'これは日本一のサービスです。';
  const cleanFixture = 'これは高品質なサービスです。';
  const dirtyHits = scanString(dirtyFixture, patterns);
  const cleanHits = scanString(cleanFixture, patterns);
  if (dirtyHits.length > 0 && cleanHits.length === 0) {
    console.log('selftest OK: dirty fixture detected, clean fixture passed');
    process.exit(0);
  }
  console.error(
    `selftest FAILED: dirtyHits=${dirtyHits.length}, cleanHits=${cleanHits.length}`
  );
  process.exit(1);
}

// CLI 直接実行判定（ESM）
const isMain = (() => {
  try {
    const argv1 = (process.argv[1] || '').replace(/\\/g, '/');
    const url = import.meta.url.replace(/^file:\/+/, '/').replace(/\\/g, '/');
    return argv1.endsWith('check-masking-patterns.mjs') && url.endsWith('check-masking-patterns.mjs');
  } catch {
    return false;
  }
})();

if (isMain) {
  const args = process.argv.slice(2);

  if (args.includes('--selftest')) {
    runSelftest();
  }

  let filePath = null;
  let product = null;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--file') { filePath = args[++i] || null; }
    else if (a.startsWith('--file=')) { filePath = a.slice(7); }
    else if (a === '--product') { product = args[++i] || null; }
    else if (a.startsWith('--product=')) { product = a.slice(10); }
  }

  if (!filePath) {
    console.error('Usage: node scripts/check-masking-patterns.mjs --file <path> [--product <name>] | --selftest');
    process.exit(1);
  }

  const dictionary = loadDictionary();
  const masterName = resolveMasterName();
  const patterns = buildPatterns(dictionary, product, masterName);
  const hits = scanFile(filePath, patterns);

  if (hits.length > 0) {
    console.error(`MASKING TARGET DETECTED in ${filePath}: [${hits.join(', ')}]`);
    process.exit(1);
  }
  process.exit(0);
}
