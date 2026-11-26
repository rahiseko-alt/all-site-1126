#!/usr/bin/env node
// verify-report-numbers.mjs
// Usage: node verify-report-numbers.mjs <report.md path> <agg dir path>
// All stderr output is ASCII-safe (non-ascii chars escaped as \uXXXX equivalents).
// Exit 0 = all checks PASS, exit 1 = any check FAIL.

import fs from 'fs';
import path from 'path';
import os from 'os';

const VIBE_BASE_ROOT = 'C:/Users/user/Desktop/ClaudeCode/vibe-base/';

function asciiSafe(str) {
  const s = String(str);
  const bs = String.fromCharCode(92);
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code > 127) {
      out += bs + 'u' + code.toString(16).padStart(4, '0');
    } else {
      out += s.charAt(i);
    }
  }
  return out;
}

function warn(msg) {
  process.stderr.write(asciiSafe(msg) + String.fromCharCode(10));
}

function splitLines(content) {
  const rawLines = content.split(String.fromCharCode(10));
  return rawLines.map((l) => {
    if (l.length > 0 && l.charCodeAt(l.length - 1) === 13) return l.slice(0, -1);
    return l;
  });
}

// ---------------------------------------------------------------------------
// [実測: key] tag extraction (no regex; manual scan)
// ---------------------------------------------------------------------------

function extractMeasureTags(content) {
  const tags = [];
  const marker = '[実測:';
  let searchFrom = 0;
  while (true) {
    const start = content.indexOf(marker, searchFrom);
    if (start === -1) break;
    const contentStart = start + marker.length;
    const end = content.indexOf(']', contentStart);
    if (end === -1) {
      searchFrom = start + marker.length;
      continue;
    }
    const key = content.slice(contentStart, end).trim();
    tags.push(key);
    searchFrom = end + 1;
  }
  return tags;
}

// ---------------------------------------------------------------------------
// Key-path resolution against agg/*.json
// ---------------------------------------------------------------------------

function splitKeyPath(k) {
  const seps = ['.', '/', ':', '>'];
  const parts = [];
  let current = '';
  for (let i = 0; i < k.length; i++) {
    const ch = k.charAt(i);
    if (seps.indexOf(ch) !== -1) {
      if (current) parts.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current) parts.push(current);
  return parts.map((s) => s.trim()).filter(Boolean);
}

function resolveInObj(obj, segments) {
  let cur = obj;
  for (const seg of segments) {
    if (cur && typeof cur === 'object' && Object.prototype.hasOwnProperty.call(cur, seg)) {
      cur = cur[seg];
    } else {
      return false;
    }
  }
  return true;
}

function collectAllKeyNames(obj, set, depth) {
  if (depth > 15) return;
  if (obj && typeof obj === 'object') {
    if (Array.isArray(obj)) {
      for (const item of obj) collectAllKeyNames(item, set, depth + 1);
    } else {
      for (const k of Object.keys(obj)) {
        set.add(k);
        collectAllKeyNames(obj[k], set, depth + 1);
      }
    }
  }
}

function keyExistsInAgg(rawKey, files, allKeyNames) {
  const segments = splitKeyPath(rawKey);
  if (segments.length === 0) return false;
  const first = segments[0];
  for (const fn of Object.keys(files)) {
    const fnNoExt = fn.endsWith('.json') ? fn.slice(0, -5) : fn;
    if (fn === first || fnNoExt === first) {
      const rest = segments.slice(1);
      if (rest.length === 0) return true;
      if (resolveInObj(files[fn], rest)) return true;
    }
  }
  for (const fn of Object.keys(files)) {
    if (resolveInObj(files[fn], segments)) return true;
  }
  const lastSeg = segments[segments.length - 1];
  if (allKeyNames.has(lastSeg)) return true;
  if (allKeyNames.has(rawKey.trim())) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Path-candidate extraction from a line containing existing-ticket references
// ---------------------------------------------------------------------------

function isBreakChar(ch) {
  const simple = [' ', String.fromCharCode(9), '(', ')', '"', "'", ',', ';', '`'];
  if (simple.indexOf(ch) !== -1) return true;
  const code = ch.charCodeAt(0);
  if (code === 0x3001) return true; // 、
  if (code === 0x3002) return true; // 。
  if (code === 0x300c) return true; // 「
  if (code === 0x300d) return true; // 」
  if (code === 0xff08) return true; // （
  if (code === 0xff09) return true; // ）
  return false;
}

function tokenizeLine(line) {
  const tokens = [];
  let current = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line.charAt(i);
    if (isBreakChar(ch)) {
      if (current) tokens.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current) tokens.push(current);
  return tokens;
}

function isAlphaChar(ch) {
  return (ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z');
}

function trimTrailingPunct(tok) {
  let t = tok;
  const punct = ['.', ',', ':', ';'];
  while (t.length > 0 && punct.indexOf(t.charAt(t.length - 1)) !== -1) {
    t = t.slice(0, -1);
  }
  return t;
}

function extractPathCandidates(line) {
  const bs = String.fromCharCode(92);
  const results = [];
  const tokens = tokenizeLine(line);
  for (let tok of tokens) {
    tok = trimTrailingPunct(tok);
    if (!tok) continue;
    const c0 = tok.charAt(0);
    const looksWinAbs =
      isAlphaChar(c0) && tok.charAt(1) === ':' && (tok.charAt(2) === bs || tok.charAt(2) === '/');
    const looksHome = c0 === '~';
    const looksRel = tok.indexOf('/') !== -1 || tok.indexOf(bs) !== -1;
    if (looksWinAbs || looksHome || looksRel) {
      results.push(tok);
    }
  }
  return results;
}

function resolveExistCheckPath(raw) {
  const homeDir = os.homedir().split(String.fromCharCode(92)).join('/');
  let p = raw;
  if (p.charAt(0) === '~') {
    p = homeDir + p.slice(1);
  } else {
    const c0 = p.charAt(0);
    const isAbs = isAlphaChar(c0) && p.charAt(1) === ':';
    if (!isAbs) {
      p = VIBE_BASE_ROOT + p;
    }
  }
  return p;
}

// ---------------------------------------------------------------------------
// Required H2 headings (front-match)
// ---------------------------------------------------------------------------

const REQUIRED_HEADINGS = [
  '## 調査諸元',
  '## リスト①',
  '## リスト②',
  '## リスト③',
  '## リスト④',
  '## リスト⑤',
  '## 除外理由',
  '## 要マスター判定',
  '## 機械検証フッター',
];

// ---------------------------------------------------------------------------
// Agg file loading
// ---------------------------------------------------------------------------

function loadAggFiles(aggDir) {
  const files = {};
  const allKeyNames = new Set();
  let entries = [];
  try {
    entries = fs.readdirSync(aggDir).filter((f) => f.endsWith('.json'));
  } catch (e) {
    warn('FATAL: cannot read agg dir: ' + e.message);
    process.exit(1);
  }
  for (const f of entries) {
    try {
      const obj = JSON.parse(fs.readFileSync(path.join(aggDir, f), 'utf8'));
      files[f] = obj;
      collectAllKeyNames(obj, allKeyNames, 0);
    } catch (e) {
      warn('WARN: cannot parse agg file ' + f + ': ' + e.message);
    }
  }
  return { files, allKeyNames };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const reportPath = process.argv[2];
  const aggDir = process.argv[3];
  if (!reportPath || !aggDir) {
    warn('USAGE: node verify-report-numbers.mjs <report.md> <agg-dir>');
    process.exit(1);
    return;
  }

  let content;
  try {
    content = fs.readFileSync(reportPath, 'utf8');
  } catch (e) {
    warn('FATAL: cannot read report file: ' + e.message);
    process.exit(1);
    return;
  }

  const { files, allKeyNames } = loadAggFiles(aggDir);
  const lines = splitLines(content);
  const failures = [];

  // Check 1: [実測: key] tags
  const measureKeys = extractMeasureTags(content);
  const missingKeys = [];
  for (const key of measureKeys) {
    if (!keyExistsInAgg(key, files, allKeyNames)) missingKeys.push(key);
  }
  if (missingKeys.length) {
    failures.push('CHECK1_MISSING_KEYS: ' + missingKeys.map((k) => asciiSafe(k)).join(' | '));
  }

  // Check 2: lines with 平均 must also contain 中央値 and 最頻値
  const badMeanLines = [];
  lines.forEach((line, idx) => {
    if (line.indexOf('平均') !== -1) {
      if (line.indexOf('中央値') === -1 || line.indexOf('最頻値') === -1) {
        badMeanLines.push(idx + 1);
      }
    }
  });
  if (badMeanLines.length) {
    failures.push('CHECK2_MEAN_WITHOUT_MEDIAN_MODE_LINES: ' + badMeanLines.join(','));
  }

  // Check 3: 既起票 lines must reference existing paths
  const missingPaths = [];
  lines.forEach((line, idx) => {
    if (line.indexOf('既起票') === -1) return;
    const candidates = extractPathCandidates(line);
    for (const raw of candidates) {
      const resolved = resolveExistCheckPath(raw);
      if (!fs.existsSync(resolved)) {
        missingPaths.push('line' + (idx + 1) + ':' + asciiSafe(raw));
      }
    }
  });
  if (missingPaths.length) {
    failures.push('CHECK3_MISSING_PATHS: ' + missingPaths.join(' | '));
  }

  // Check 4: required H2 headings
  const missingHeadings = REQUIRED_HEADINGS.filter(
    (h) => !lines.some((l) => l.trim().indexOf(h) === 0)
  );
  if (missingHeadings.length) {
    failures.push('CHECK4_MISSING_HEADINGS: ' + missingHeadings.map((h) => asciiSafe(h)).join(' | '));
  }

  if (failures.length) {
    warn('RESULT: FAIL');
    for (const f of failures) warn(f);
    process.exit(1);
  } else {
    warn('RESULT: PASS');
    process.exit(0);
  }
}

main();
