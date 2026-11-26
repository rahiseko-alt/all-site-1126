#!/usr/bin/env node
// scripts/audit-local-allow-onetime.mjs
// A-21: root .claude/settings.local.json の allow 一回性候補を棚卸しし、
// Markdown 表を出力する（読み取り→出力のみ・削除は一切しない）。
// 出典: ~/.claude/plans/temporal-gliding-turing.md Step 6
//
// 分類:
//   E-1/E-2申し送り: rm -f / Remove-Item / Stop-Process / taskkill / python -c 等の
//                     危険系パターンに該当（削除候補には入れず別軸の棚卸しへ回す）
//   削除候補:        絶対パス・固有ファイル名を3語以上含みワイルドカード無し・
//                     pushd/popd/一時ディレクトリ参照のいずれかに該当
//   保持:             上記いずれにも該当しない

import fs from 'fs';
import path from 'path';
import { getProductsRepoRoot } from './repo-paths.mjs';

const ROOT = getProductsRepoRoot();
const settingsLocalPath = path.join(ROOT, '.claude', 'settings.local.json');
const outPath = path.join(ROOT, 'docs', 'audits', 'local-allow-onetime-triage-2026-07.md');

const settings = JSON.parse(fs.readFileSync(settingsLocalPath, { encoding: 'utf-8' }));
const allow = settings.permissions?.allow || [];

const DANGEROUS_RE = /\b(?:rm -f|rm -rf|Remove-Item|Stop-Process|taskkill|python3?\s+-c)\b/i;
const ABS_PATH_RE = /(?:[A-Za-z]:\\\\?|[A-Za-z]:\/|\/c\/|C--)/;
const PUSHD_RE = /\b(?:pushd|popd)\b|[Tt]emp[\\/]|scratchpad/;

function wordCount(rule) {
  // ルール本体（Bash(...) や WebFetch(...) の括弧内）を空白・区切り文字で分割
  const inner = rule.replace(/^[A-Za-z_]+\(/, '').replace(/\)$/, '');
  return inner.split(/[\s"']+/).filter(Boolean).length;
}

function hasWildcard(rule) {
  return rule.includes('*') || rule.includes(':*');
}

const rows = [];
for (const rule of allow) {
  if (DANGEROUS_RE.test(rule)) {
    rows.push({ rule, classification: 'E-1/E-2申し送り', reason: '危険系パターン該当（rm -f/Remove-Item/Stop-Process/taskkill/python -c 等）。削除候補に入れず別途棚卸し' });
    continue;
  }
  const isAbsPath = ABS_PATH_RE.test(rule);
  const isSpecific = wordCount(rule) >= 3 && !hasWildcard(rule);
  const isTemp = PUSHD_RE.test(rule);
  if (isAbsPath || isSpecific || isTemp) {
    const reasons = [];
    if (isAbsPath) reasons.push('絶対パス含む');
    if (isSpecific) reasons.push('固有引数3語以上・ワイルドカード無し');
    if (isTemp) reasons.push('pushd/popd/一時ディレクトリ参照');
    rows.push({ rule, classification: '削除候補', reason: reasons.join('・') });
  } else {
    rows.push({ rule, classification: '保持', reason: '汎用パターン・再利用可能性あり' });
  }
}

const counts = rows.reduce((acc, r) => {
  acc[r.classification] = (acc[r.classification] || 0) + 1;
  return acc;
}, {});

const lines = [];
lines.push('# local allow 一回性棚卸し（A-21）');
lines.push('');
lines.push(`> 生成: scripts/audit-local-allow-onetime.mjs（読み取り専用・削除は一切行わない）`);
lines.push(`> 対象: .claude/settings.local.json permissions.allow ${allow.length}件`);
lines.push(`> 分類件数: 削除候補=${counts['削除候補'] || 0} / 保持=${counts['保持'] || 0} / E-1/E-2申し送り=${counts['E-1/E-2申し送り'] || 0}`);
lines.push('');
lines.push('マスターが行単位で承認した行のみ削除する（段階展開: 最初の1件→JSON parse検証→残り継続）。');
lines.push('');
lines.push('| ルール文字列 | 分類 | 判定理由 |');
lines.push('|---|---|---|');
for (const r of rows) {
  const escaped = r.rule.replace(/\|/g, '\\|');
  lines.push(`| \`${escaped}\` | ${r.classification} | ${r.reason} |`);
}
lines.push('');

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, lines.join('\n') + '\n', { encoding: 'utf-8' });
console.log(`WROTE ${path.relative(ROOT, outPath).replace(/\\/g, '/')}`);
console.log(`削除候補=${counts['削除候補'] || 0} / 保持=${counts['保持'] || 0} / E-1/E-2申し送り=${counts['E-1/E-2申し送り'] || 0}`);
