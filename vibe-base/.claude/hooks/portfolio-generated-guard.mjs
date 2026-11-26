#!/usr/bin/env node
// PreToolUse:Write|Edit — portfolio/ 生成物の直接編集ブロックゲート（leak 封鎖）
//
// portfolio/ は build-portfolio.mjs の純生成物（原本 = docs/html-toranomaki/ + portfolio/_portal-shell.html）。
// 生成物（creative-portfolio-portal.html / 各 {slug}/ 配下）への直接 Write/Edit を Deny する。
// add-to-cart で実証された「portfolio/ 直編集 leak」を機械的に封鎖する。
//
// 許可（原本ソース）: _portal-shell.html / server.mjs / vercel.json
// バイパス: $CLAUDE_PROJECT_DIR/.allow-prod-edit（10分 TTL・既存 pre-edit.sh と同形）

import fs from 'fs';
import path from 'path';

const MARKER_TTL_SEC = 600;
const PROJECT_DIR = (process.env.CLAUDE_PROJECT_DIR || process.cwd()).replace(/\\/g, '/');
const MARKER_PATH = path.join(PROJECT_DIR, '.allow-prod-edit');

// portfolio/ 直下で編集を許可する原本ソース
const ALLOWED_TOP = new Set(['_portal-shell.html', 'server.mjs', 'vercel.json']);

function norm(p) {
  return (p || '').replace(/\\/g, '/');
}

let data = '';
process.stdin.on('data', (c) => (data += c));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const fp = norm((input.tool_input || {}).file_path || '');
    if (!fp) process.exit(0);

    const portfolioDir = `${PROJECT_DIR}/portfolio/`;
    if (!fp.startsWith(portfolioDir)) process.exit(0); // portfolio 外は対象外

    const rel = fp.slice(portfolioDir.length); // portfolio/ 以下の相対

    // 原本ソース（直下の許可ファイル）は通過
    if (ALLOWED_TOP.has(rel)) process.exit(0);

    // バイパスマーカー（10分 TTL）
    if (fs.existsSync(MARKER_PATH)) {
      const ageSec = (Date.now() - fs.statSync(MARKER_PATH).mtimeMs) / 1000;
      if (ageSec < MARKER_TTL_SEC) process.exit(0);
    }

    // 生成物（portal 本体 or {slug}/ 配下）への編集 = leak。Deny。
    const isPortal = rel === 'creative-portfolio-portal.html';
    const isThemeOutput = rel.includes('/');
    if (isPortal || isThemeOutput) {
      const target = isPortal ? 'creative-portfolio-portal.html（生成 portal）' : `portfolio/${rel}（生成テーマ出力）`;
      console.log(JSON.stringify({
        decision: 'block',
        reason: [
          '⛔ [portfolio-generated-guard] portfolio/ 生成物への直接編集を検知（leak 封鎖）',
          `対象: ${target}`,
          'portfolio/ は build-portfolio.mjs の純生成物です。直接編集しても次の build で上書き消滅します。',
          '正しい修正先:',
          `  - テーマ実装 → docs/html-toranomaki/${isThemeOutput ? rel.split('/')[0] : '{slug}'}/{impl}/ を編集 → node scripts/build-portfolio.mjs`,
          '  - ポータルの枠（ヘッダ/フッタ/CSS）→ portfolio/_portal-shell.html を編集 → build',
          '  - カードの内容 → docs/html-toranomaki/registry.json を編集 → build',
          '根拠: RULES.md §8.5「AUTO 区画は手動編集禁止」/ 本計画 leak 封鎖',
          'TPO バイパス（意図的編集時・10分有効）: touch "' + MARKER_PATH + '"',
        ].join('\n'),
      }));
      process.exit(0);
    }

    process.exit(0);
  } catch (e) {
    process.stderr.write('[portfolio-generated-guard] error: ' + (e && e.message ? e.message : String(e)) + '\n');
    process.exit(0);
  }
});
