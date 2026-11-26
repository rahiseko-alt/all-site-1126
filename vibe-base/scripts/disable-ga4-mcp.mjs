#!/usr/bin/env node
/**
 * disable-ga4-mcp.mjs — ga4 MCP サーバを無効化する（現プロジェクトの mcpServers から除去）
 *
 * 背景: ga4（stape.ai 経由 GA）は外部連携未設定のため failed 継続。設定ファイルの修正では
 *       繋がらないため、赤表示を消して /mcp を整える。設定は後日復元できるよう保存する。
 * 実行: node scripts/disable-ga4-mcp.mjs → Claude Code 再起動 → /mcp から ga4 が消える
 * 復元: 保存された docs/ops/ga4-mcp-config-disabled.json の config を
 *       ~/.claude.json の projects[<現プロジェクト>].mcpServers.ga4 に戻す。
 * 依存: Node.js 組み込みのみ。
 */
import os from 'os';
import fs from 'fs';
import path from 'path';

const F = path.join(os.homedir(), '.claude.json');
const NEW = 'C:/Users/user/Desktop/ClaudeCode/vibe-base';

const j = JSON.parse(fs.readFileSync(F, 'utf8'));
const servers = j.projects && j.projects[NEW] && j.projects[NEW].mcpServers;

if (!servers || !servers.ga4) {
  console.log('ga4 は既に存在しません。処理不要。');
  process.exit(0);
}

const bak = F + '.bak-ga4disable';
fs.writeFileSync(bak, fs.readFileSync(F));

// 後日復元用に ga4 設定を vibe-base 内へ保存
const savePath = path.resolve('docs/ops/ga4-mcp-config-disabled.json');
fs.writeFileSync(
  savePath,
  JSON.stringify(
    {
      note:
        'ga4 MCP を 2026-07-02 に無効化（外部連携未設定のため failed）。再有効化はこの config を ~/.claude.json の projects["' +
        NEW +
        '"].mcpServers.ga4 に戻す。',
      config: servers.ga4,
    },
    null,
    2
  )
);

delete servers.ga4;
fs.writeFileSync(F, JSON.stringify(j, null, 2));

console.log('ga4 を無効化しました（現プロジェクトの mcpServers から除去）。');
console.log('復元用設定を保存:', savePath);
console.log('バックアップ:', bak);
console.log('※ Claude Code を再起動すると /mcp から ga4 が消えます。');
