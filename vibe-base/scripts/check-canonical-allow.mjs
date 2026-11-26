#!/usr/bin/env node
// scripts/check-canonical-allow.mjs
// root + 全 product settings.json が CANONICAL_ALLOW を包含しているか機械検証
// EXIT: 0 = 全 PASS / 1 = 1 件以上 FAIL（JSON parse error 含む）
// 出典: ~/.claude/plans/temporal-gliding-turing.md 受け入れ基準1

import fs from 'fs';
import path from 'path';
import { getProductsRepoRoot } from './repo-paths.mjs';
import { CANONICAL_ALLOW } from './_lib/canonical-allow.mjs';

const ROOT = getProductsRepoRoot();

function findProductSettings(dir, results = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) findProductSettings(full, results);
    else if (e.name === 'settings.json' && path.basename(dir) === '.claude') {
      results.push(full);
    }
  }
  return results;
}

const targets = [
  path.join(ROOT, '.claude', 'settings.json'),
  ...findProductSettings(path.join(ROOT, 'products')).sort(),
];

let fail = 0;
for (const settingsPath of targets) {
  const rel = path.relative(ROOT, settingsPath).replace(/\\/g, '/');
  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
  } catch (err) {
    console.log(`❌ ${rel}: JSON parse error (${err.message})`);
    fail++;
    continue;
  }
  const allow = new Set(settings.permissions?.allow || []);
  const missing = CANONICAL_ALLOW.filter((rule) => !allow.has(rule));
  if (missing.length) {
    console.log(`❌ ${rel}: missing ${missing.length} rule(s): ${missing.join(', ')}`);
    fail++;
  } else {
    console.log(`✅ ${rel}`);
  }
}

console.log('');
console.log(`${targets.length - fail}/${targets.length} settings.json contain full CANONICAL_ALLOW`);
process.exit(fail > 0 ? 1 : 0);
