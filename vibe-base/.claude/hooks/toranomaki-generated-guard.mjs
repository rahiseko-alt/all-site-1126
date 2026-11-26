#!/usr/bin/env node
// PreToolUse:Write|Edit — 虎の巻 canonical（docs/html-toranomaki/<slug>/）への直書きブロックゲート
//
// 虎の巻 3段ゲート（Add→Commit→Push）の Commit 境界を機械強制する。
// canonical（docs/html-toranomaki/{slug}/ 配下のテーマ内容）への Claude の Write/Edit を Deny し、
// 「canonical に入れるのは intake を通った judged-PASS だけ」を保証する。
// intake（toranomaki-intake.mjs）は node の fs API で書くため PreToolUse をすり抜け、唯一の正規入口になる。
//
// 許可（通過）:
//   - docs/html-toranomaki/ 外
//   - 直下ファイル registry.json / RULES.md（メタ・ルール本体）
//   - `.` 始まりの作業域（.add/ .staging/ .reject/ 等＝verify も dot 除外）
//   - バイパス: $CLAUDE_PROJECT_DIR/.allow-prod-edit（10分 TTL・portfolio-generated-guard と共用）
//
// Deny: docs/html-toranomaki/{非dot slug}/... へのテーマ内容直書き
//   → 正しくは Add 領域（*/.toranomaki-outbox/ or ルート .toranomaki-outbox/）で作り、
//     node scripts/toranomaki-intake.mjs で commit する。

import fs from 'fs';
import path from 'path';

const MARKER_TTL_SEC = 600;
const PROJECT_DIR = (process.env.CLAUDE_PROJECT_DIR || process.cwd()).replace(/\\/g, '/');
const MARKER_PATH = path.join(PROJECT_DIR, '.allow-prod-edit');

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

    const canonicalDir = `${PROJECT_DIR}/docs/html-toranomaki/`;
    if (!fp.startsWith(canonicalDir)) process.exit(0); // 虎の巻 canonical 外は対象外

    const rel = fp.slice(canonicalDir.length); // docs/html-toranomaki/ 以下の相対

    // 直下ファイル（registry.json / RULES.md 等）= テーマ内容ではないので通過
    if (!rel.includes('/')) process.exit(0);

    // `.` 始まりの作業域（.add / .staging / .reject …）は通過（verify も dot 除外）
    const firstSeg = rel.split('/')[0];
    if (firstSeg.startsWith('.')) process.exit(0);

    // バイパスマーカー（10分 TTL・portfolio-generated-guard と共用）
    if (fs.existsSync(MARKER_PATH)) {
      const ageSec = (Date.now() - fs.statSync(MARKER_PATH).mtimeMs) / 1000;
      if (ageSec < MARKER_TTL_SEC) process.exit(0);
    }

    // テーマ内容（docs/html-toranomaki/{slug}/...）への直書き = Add を飛ばした canonical 侵入。Deny。
    console.log(JSON.stringify({
      decision: 'block',
      reason: [
        '⛔ [toranomaki-generated-guard] 虎の巻 canonical への直書きを検知（Commit 境界の封鎖）',
        `対象: docs/html-toranomaki/${rel}`,
        'canonical（docs/html-toranomaki/{slug}/）に入れるのは intake を通った judged-PASS だけです。',
        '直書きは Add（合否判断）を飛ばすため Deny します。正しい手順:',
        `  1. Add: 下書きを Add 領域へ置く（司令塔= ルート .toranomaki-outbox/${firstSeg}/ ／product/agent-ag= 各 .toranomaki-outbox/）`,
        '     構成: meta.json + concept.md + research-log.md + impl-{lib}-{ver}/',
        '  2. Commit: node scripts/toranomaki-intake.mjs（blindtest 判定→PASS のみ canonical＋registry へ）',
        '  3. Push: node scripts/build-portfolio.mjs → toranomaki-verify → cd portfolio && vercel --prod',
        '根拠: RULES.md §8.3/§8.7（3段ゲート Add→Commit→Push）',
        'TPO バイパス（意図的直編集・10分有効）: touch "' + MARKER_PATH + '"',
      ].join('\n'),
    }));
    process.exit(0);
  } catch (e) {
    process.stderr.write('[toranomaki-generated-guard] error: ' + (e && e.message ? e.message : String(e)) + '\n');
    process.exit(0);
  }
});
