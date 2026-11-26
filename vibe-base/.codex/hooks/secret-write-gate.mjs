#!/usr/bin/env node
// PreToolUse:Write|Edit|MultiEdit — settings.local.json 書込時のシークレット検知ブロック
// Q-C 案 2（Session 250 Plan Mode 確定）: settings.local.json に
// sk-/AIza/GOCSPX-/npg_ 等のシークレットが混入した状態で Write/Edit/MultiEdit を実行したら即ブロック
// 既存 hook（area-gate.mjs）と同じパターン: stdin JSON → 判定 → block or pass

import path from 'path';
import { fileURLToPath } from 'url';
// 検知ロジックは 2026-07-17 に scripts/ → .claude/hooks/ へ移動した
// （Claude Code 側 secret-write-gate の product 配布時クラッシュを断つため）。
// .codex は root 固定なので新パスを直接参照する。
import { scanString } from '../../.claude/hooks/check-secret-patterns.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let data = '';
process.stdin.on('data', chunk => (data += chunk));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const toolInput = input.tool_input || {};
    const filePath = (toolInput.file_path || '').replace(/\\/g, '/');

    // 対象: settings.local.json / .env / .env.* / .git/credentials
    const basename = path.basename(filePath);
    const isSettingsLocal = basename === 'settings.local.json';
    const isEnvFile = basename === '.env' || /^\.env\./.test(basename);
    const isGitCredentials = /\.git\/credentials$/.test(filePath);
    if (!isSettingsLocal && !isEnvFile && !isGitCredentials) {
      process.exit(0);
    }

    // 書込テキスト抽出（Write: content / Edit: new_string / MultiEdit: edits[].new_string）
    const texts = [];
    if (typeof toolInput.content === 'string') texts.push(toolInput.content);
    if (typeof toolInput.new_string === 'string') texts.push(toolInput.new_string);
    if (Array.isArray(toolInput.edits)) {
      for (const e of toolInput.edits) {
        if (typeof e.new_string === 'string') texts.push(e.new_string);
      }
    }

    const hits = [];
    for (const t of texts) hits.push(...scanString(t));

    if (hits.length > 0) {
      const unique = [...new Set(hits)];
      console.log(JSON.stringify({
        decision: 'block',
        reason: `⛔ [secret-write-gate] settings.local.json への書込にシークレットパターンを検出: ${unique.join(', ')}\n\n対処:\n  1. 書込内容からシークレット原文を削除する\n  2. 環境変数参照（\${VAR_NAME}）に置き換える\n  3. どうしても直接書く必要がある場合は Bash 経由（printf / node ワンライナー）で書き、Edit/Write を経由しない\n\n根拠: feedback_self-violation-of-secret-pasting.md（Session 250 自爆漏洩 2 件の再発防止）`,
      }));
    }
    process.exit(0);
  } catch (e) {
    // JSON 解析失敗 → 安全側に倒して通過（既存 hook と同じ方針）
    process.exit(0);
  }
});
