#!/usr/bin/env node
// settings.local.json の棚卸しスクリプト
// 使い方: node scripts/cleanup-settings.mjs [--dry-run]

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const isDryRun = process.argv.includes('--dry-run');
const settingsPath = resolve('.claude/settings.local.json');

let raw;
try {
  raw = readFileSync(settingsPath, 'utf8');
} catch {
  console.log('settings.local.json が見つかりません。スキップします。');
  process.exit(0);
}

const settings = JSON.parse(raw);
const allow = settings?.permissions?.allow ?? [];

// 重複除去
const deduped = [...new Set(allow)];

// settings.json の allow を読み込んで、既にカバー済みのパターンを除去
let projectAllow = [];
try {
  const projectSettings = JSON.parse(readFileSync('.claude/settings.json', 'utf8'));
  projectAllow = projectSettings?.permissions?.allow ?? [];
} catch {
  // ignore
}

// exact match で重複するエントリを除去（project-level が既にカバー）
const cleaned = deduped.filter(entry => !projectAllow.includes(entry));

const before = allow.length;
const after = cleaned.length;
console.log(`before: ${before} エントリ → after: ${after} エントリ（削減: ${before - after}）`);

if (isDryRun) {
  console.log('[dry-run] ファイルは変更しません。');
  process.exit(0);
}

settings.permissions.allow = cleaned;
writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');
console.log('settings.local.json を更新しました。');
