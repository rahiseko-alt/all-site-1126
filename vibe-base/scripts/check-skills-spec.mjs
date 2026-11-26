#!/usr/bin/env node
// scripts/check-skills-spec.mjs
// スキル配置規律（CLAUDE.md §4.3 / .claude/rules/skill-deployment.md）の機械検証
// 用途: check-in-verify.sh A-6 として組込・毎セッション Check-in で実行

import fs from 'fs';
import path from 'path';
import os from 'os';
import { governanceRoot, getProductsRepoRoot } from './repo-paths.mjs';

const USER_SKILLS = path.join(os.homedir(), '.claude', 'skills');
const productsRepoRoot = getProductsRepoRoot();
const VIBE_SKILLS = path.join(productsRepoRoot, '.claude', 'skills');

const A_GROUP = ['pc-checkin', 'deep-research', 'feed-check', 'learning-suite-add-kanji', 'fix-loop', 'create-image', 'masking-grep', 'formation', 'verification-panel-call', 'decommission-plan'];
const ABSOLUTE_PATH_REGEXES = [
  /C:\\\\Users\\\\user\\\\Desktop\\\\事業戦略/,
  /C:\/Users\/user\/Desktop\/事業戦略/,
  /\/c\/Users\/user\/Desktop\/事業戦略/,
];

let ok = 0;
let warn = 0;
let ng = 0;

function pass(label) { console.log(`  OK: ${label}`); ok++; }
function warning(label) { console.log(`  WARN: ${label}`); warn++; }
function fail(label) { console.log(`  NG: ${label}`); ng++; }

console.log('=== スキル配置規律検証（CLAUDE.md §4.3）===\n');

// 1. vibe-base/.claude/skills/ に機能スキル不在（SKILL.md 含む dir のみ NG 対象、空残骸は WARN）
console.log('--- A-6.1: vibe-base 側に機能スキル不在確認 ---');
if (!fs.existsSync(VIBE_SKILLS)) {
  pass('vibe-base/.claude/skills/ 不在（user-level 単一正本）');
} else {
  const subdirs = fs.readdirSync(VIBE_SKILLS, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
  const functional = subdirs.filter((d) =>
    ['SKILL.md', 'skill.md'].some((f) => fs.existsSync(path.join(VIBE_SKILLS, d, f)))
  );
  const empty = subdirs.filter((d) => !functional.includes(d));
  if (functional.length === 0) {
    pass(`vibe-base/.claude/skills/ に機能スキル不在（空残骸 ${empty.length} 件は許容）`);
  } else {
    fail(`vibe-base/.claude/skills/ に機能スキルが残存: ${functional.join(', ')}`);
  }
  if (empty.length > 0) {
    warning(`空残骸ディレクトリ ${empty.join(', ')} あり（手動削除推奨）`);
  }
}

// 2. user-level skills が物理存在すること
console.log('\n--- A-6.2: user-level スキルの物理存在 ---');
if (!fs.existsSync(USER_SKILLS)) {
  fail(`${USER_SKILLS} が存在しない。復元: cd ~/.claude && git clone <repo> skills`);
} else {
  const dirs = fs.readdirSync(USER_SKILLS, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.') && !e.name.startsWith('_'))
    .map((e) => e.name);
  if (dirs.length >= 30) {
    pass(`user-level skills ${dirs.length} 件存在`);
  } else {
    warning(`user-level skills ${dirs.length} 件のみ（30 件以上想定）`);
  }
}

// 3. _shared/path-resolver.mjs の存在
console.log('\n--- A-6.3: _shared/path-resolver.mjs 存在確認 ---');
const resolverPath = path.join(USER_SKILLS, '_shared', 'path-resolver.mjs');
if (fs.existsSync(resolverPath)) {
  pass('_shared/path-resolver.mjs 存在');
} else {
  fail(`${resolverPath} 不在。A 群スキルが動作不能`);
}

// 4. A 群スキルに Path Resolution セクションがあること（or feed-check は $MASTER_VAULT_ROOT を含むこと）
console.log('\n--- A-6.4: A 群スキルの path-resolver 経由化 ---');
for (const name of A_GROUP) {
  const skillDir = path.join(USER_SKILLS, name);
  const candidates = ['SKILL.md', 'skill.md'];
  let body = null;
  for (const c of candidates) {
    const p = path.join(skillDir, c);
    if (fs.existsSync(p)) {
      body = fs.readFileSync(p, 'utf-8');
      break;
    }
  }
  if (!body) {
    fail(`${name}/SKILL.md 不在`);
    continue;
  }
  const hasPathResolution = /Path Resolution/.test(body) || /path-resolver\.mjs/.test(body);
  const hasVaultEnv = /\$MASTER_VAULT_ROOT/.test(body);
  if (name === 'feed-check') {
    if (hasVaultEnv) pass(`${name}: $MASTER_VAULT_ROOT 経由 OK`);
    else fail(`${name}: $MASTER_VAULT_ROOT 参照なし`);
  } else {
    if (hasPathResolution) pass(`${name}: Path Resolution セクション OK`);
    else fail(`${name}: Path Resolution セクション欠落`);
  }
}

// 5. ハードコード絶対パス禁止
console.log('\n--- A-6.5: ハードコード絶対パス禁止（事業戦略 literal）---');
function scanDir(dir, results = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) scanDir(full, results);
    else if (/\.(md|mjs|js|cjs|yml|yaml|json)$/i.test(e.name)) results.push(full);
  }
  return results;
}
const allFiles = fs.existsSync(USER_SKILLS) ? scanDir(USER_SKILLS) : [];
let hardcoded = [];
for (const f of allFiles) {
  if (f.includes('README.md')) continue;
  const content = fs.readFileSync(f, 'utf-8');
  if (ABSOLUTE_PATH_REGEXES.some((r) => r.test(content))) {
    hardcoded.push(path.relative(USER_SKILLS, f));
  }
}
if (hardcoded.length === 0) {
  pass('user-level skills 配下に 事業戦略 literal なし');
} else {
  fail(`事業戦略 literal を検出: ${hardcoded.join(', ')}`);
}

// 6. vibe-base 内に 事業戦略 literal が混入していないこと（git 追跡対象のドキュメント / 設定 / スクリプト全般）
// 注: 機密度評価は控えめ（事業戦略 = 構想段階フォルダ名であり真の機密ではない）。
// それでも 4 層防御の第 1 防衛線として「vibe-base 内には書かない」原則を維持するための検知。
console.log('\n--- A-6.6: 両 repo 配下に 事業戦略 literal 混入なし（agent 配布物 + 設定 + メモリ + スクリプト）---');
// 段階 2 分割後: governance 側と products 側で配布物が 2 repo に分散する
const SCAN_TARGETS = [
  { root: governanceRoot,   paths: ['.claude/rules', 'CLAUDE.md', 'docs/ops', 'memory', 'memory.md', 'scripts', '.gitignore'] },
  { root: productsRepoRoot, paths: ['.claude/hooks', '.claude/settings.json', '.gitignore'] },
];
let vibeViolations = [];
for (const { root, paths } of SCAN_TARGETS) {
  for (const sp of paths) {
    const abs = path.join(root, sp);
    if (!fs.existsSync(abs)) continue;
    const stat = fs.statSync(abs);
    const files = stat.isFile() ? [abs] : scanDir(abs);
    for (const f of files) {
      if (f.includes(`${path.sep}archive${path.sep}`) || f.includes('node_modules')) continue;
      const content = fs.readFileSync(f, 'utf-8');
      if (ABSOLUTE_PATH_REGEXES.some((r) => r.test(content))) {
        vibeViolations.push(path.relative(root, f));
      }
    }
  }
}
if (vibeViolations.length === 0) {
  pass('両 repo 配下に 事業戦略 literal 混入なし');
} else {
  fail(`literal 混入: ${vibeViolations.join(', ')}`);
}

// Summary
console.log(`\n=== 集計 ===`);
console.log(`  OK:   ${ok}`);
console.log(`  WARN: ${warn}`);
console.log(`  NG:   ${ng}`);

if (ng > 0) {
  console.log('\n❌ NG 検知。CLAUDE.md §4.3 / .claude/rules/skill-deployment.md 参照の上、修正してください。');
  process.exit(1);
} else if (warn > 0) {
  console.log('\n⚠️ WARN あり（進行可）');
} else {
  console.log('\n✅ 全項目 OK');
}
