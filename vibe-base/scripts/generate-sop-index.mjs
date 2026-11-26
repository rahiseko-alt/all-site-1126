#!/usr/bin/env node
// docs/ops/*.md 直下の実体から SOP 索引を自動生成する。
// 走査は直下のみ（plans/ snapshots/ は対象外）。sop-index.md 自身は除外。
// モード: 引数なし=書込み / --check=不一致なら EXIT 1

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OPS_DIR = path.join(ROOT, 'docs', 'ops');
const INDEX_FILE = path.join(OPS_DIR, 'sop-index.md');
const BEGIN_MARKER = '<!-- AUTO-GENERATED:BEGIN -->';
const END_MARKER = '<!-- AUTO-GENERATED:END -->';

const CHECK = process.argv.includes('--check');

function listOpsMdFilesDirectOnly() {
  return fs.readdirSync(OPS_DIR, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith('.md') && d.name !== 'sop-index.md')
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b));
}

function extractTitle(fileName) {
  // マルチバイト文字（UTF-8）がバッファ境界で分断されないよう、
  // 1バイトずつでなくまとまったバイト列を一括で utf-8 デコードしてから行分割する。
  const filePath = path.join(OPS_DIR, fileName);
  const fd = fs.openSync(filePath, 'r');
  const CHUNK_BYTES = 4096;
  const buf = Buffer.alloc(CHUNK_BYTES);
  let text;
  try {
    const n = fs.readSync(fd, buf, 0, CHUNK_BYTES, 0);
    text = buf.toString('utf-8', 0, n);
  } finally {
    fs.closeSync(fd);
  }
  const lines = text.split(/\r\n|\r|\n/).slice(0, 20);
  const h1 = lines.find((l) => l.startsWith('# '));
  if (h1) return h1.slice(2).trim();
  return fileName;
}

function buildTableBody() {
  const files = listOpsMdFilesDirectOnly();
  const rows = files.map((f) => `| \`docs/ops/${f}\` | ${extractTitle(f)} |`);
  return ['| ファイル | タイトル |', '|---------|---------|', ...rows].join('\n');
}

// CRLF/LF混在対策: replaceMarkerSection() が新規挿入部を '\n' 固定で生成するため、
// 既存部が CRLF（git core.autocrlf=true 環境でのチェックアウト由来）だと
// 内容が実質同一でも生文字列比較(===)が不一致になる。読込直後に LF へ正規化
// することで、比較と書込みの両方で改行混在を解消する。
function normalizeNewlines(s) {
  return s.replace(/\r\n/g, '\n');
}

function readIndex() {
  return normalizeNewlines(fs.readFileSync(INDEX_FILE, { encoding: 'utf-8' }));
}

function replaceMarkerSection(content, body) {
  const beginIdx = content.indexOf(BEGIN_MARKER);
  const endIdx = content.indexOf(END_MARKER);
  if (beginIdx === -1 || endIdx === -1 || endIdx < beginIdx) {
    throw new Error(`[FATAL] マーカー区間 (${BEGIN_MARKER} / ${END_MARKER}) が見つかりません。`);
  }
  const before = content.slice(0, beginIdx + BEGIN_MARKER.length);
  const after = content.slice(endIdx);
  return `${before}\n${body}\n${after}`;
}

function main() {
  const current = readIndex();
  const body = buildTableBody();
  const next = replaceMarkerSection(current, body);

  if (CHECK) {
    if (current === next) {
      console.log('[OK] sop-index.md はdocs/ops実体と一致しています。');
      process.exit(0);
    } else {
      const currentLines = current.split('\n').length;
      const nextLines = next.split('\n').length;
      console.error(`[NG] sop-index.md が実体と乖離しています（差分行数概算: ${Math.abs(nextLines - currentLines)}）。`);
      console.error('  node scripts/generate-sop-index.mjs で再生成してください。');
      process.exit(1);
    }
  }

  fs.writeFileSync(INDEX_FILE, next, { encoding: 'utf-8' });
  console.log(`[OK] sop-index.md を再生成しました（対象 ${listOpsMdFilesDirectOnly().length} 件）。`);
  process.exit(0);
}

main();
