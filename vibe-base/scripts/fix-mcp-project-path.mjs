#!/usr/bin/env node
/**
 * fix-mcp-project-path.mjs — P2: ~/.claude.json の MCP project キー分裂を是正する
 *
 * 背景: vibe-base をフォルダ移設（Desktop/vibe-base → Desktop/ClaudeCode/vibe-base）
 *       した際、旧パスの project キー配下に登録された project-scope MCP サーバ
 *       （ga4 / chrome-devtools / playwright）が現 cwd で不発になる。
 * 対応: 旧キー配下の mcpServers を現キーへ統合（マージ）する。旧キーは温存（無害）。
 *
 * 実行: node scripts/fix-mcp-project-path.mjs
 * 実行後: Claude Code を再起動し /mcp で Connected を確認する。
 * 依存: Node.js 組み込みのみ（外部パッケージ不要）。
 */
import os from 'os';
import fs from 'fs';
import path from 'path';

const F = path.join(os.homedir(), '.claude.json');
const OLD = 'C:/Users/user/Desktop/vibe-base';
const NEW = 'C:/Users/user/Desktop/ClaudeCode/vibe-base';

if (!fs.existsSync(F)) {
  console.error('~/.claude.json が見つかりません:', F);
  process.exit(1);
}

const j = JSON.parse(fs.readFileSync(F, 'utf8'));
const projects = j.projects || {};
const oldP = projects[OLD];

if (!oldP || !oldP.mcpServers || Object.keys(oldP.mcpServers).length === 0) {
  console.log('旧キー配下に MCP サーバなし。統合不要（既に是正済みの可能性）。');
  process.exit(0);
}

// 破壊前バックアップ（重要ファイルのため必ず取る）
const bak = F + '.bak-mcpfix';
fs.writeFileSync(bak, fs.readFileSync(F));
console.log('バックアップ作成:', bak);

projects[NEW] = projects[NEW] || {};
// 既存の NEW 側設定を優先しつつ、旧キーのサーバを補完マージ
projects[NEW].mcpServers = Object.assign({}, oldP.mcpServers, projects[NEW].mcpServers || {});
j.projects = projects;

fs.writeFileSync(F, JSON.stringify(j, null, 2));
console.log('統合完了。現キーの mcpServers:', Object.keys(projects[NEW].mcpServers).join(', '));
console.log('※ Claude Code を再起動し /mcp で ga4 / chrome-devtools / playwright を確認してください。');
console.log('※ 問題があれば', bak, 'から復元できます。');
