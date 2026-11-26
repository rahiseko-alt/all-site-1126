#!/usr/bin/env node
/**
 * fix-mcp-servers.mjs — chrome-devtools / ga4 の MCP 起動設定を堅牢化する（P2 続き）
 *
 * 背景: フォルダ移設後、パス統合（fix-mcp-project-path.mjs）で3サーバは現プロジェクトに
 *       登録されたが、chrome-devtools と ga4 が起動失敗する。原因は各サーバ固有:
 *   - chrome-devtools: `bash scripts/launch-chrome-devtools.sh`（相対パス＋Chrome事前起動）
 *       依存で、MCP 起動時 cwd や Chrome 起動タイミングに脆い（playwright は npx 直起動で成功）。
 *   - ga4: mcp-remote@0.1.38 ピン留めが失敗。latest へ更新して接続・認証を改善。
 * 対応:
 *   - chrome-devtools → `npx -y chrome-devtools-mcp@latest`（自己管理 Chrome・cwd/bash 非依存）。
 *   - ga4 → mcp-remote@latest。
 *
 * 実行: node scripts/fix-mcp-servers.mjs
 * 実行後: Claude Code 再起動 → /mcp 確認。ga4 が「needs authentication」ならブラウザでログイン。
 * 依存: Node.js 組み込みのみ。
 */
import os from 'os';
import fs from 'fs';
import path from 'path';

const F = path.join(os.homedir(), '.claude.json');
const NEW = 'C:/Users/user/Desktop/ClaudeCode/vibe-base';

const j = JSON.parse(fs.readFileSync(F, 'utf8'));
const servers = j.projects && j.projects[NEW] && j.projects[NEW].mcpServers;
if (!servers) {
  console.error('現プロジェクトキーの mcpServers が見つかりません:', NEW);
  process.exit(1);
}

const bak = F + '.bak-serverfix';
fs.writeFileSync(bak, fs.readFileSync(F));
console.log('バックアップ作成:', bak);

const changed = [];

if (servers['chrome-devtools']) {
  servers['chrome-devtools'] = {
    type: 'stdio',
    command: 'npx',
    args: ['-y', 'chrome-devtools-mcp@latest'],
  };
  changed.push('chrome-devtools → npx 直起動（cwd/bash 非依存・自己管理 Chrome）');
}

if (servers['ga4'] && Array.isArray(servers['ga4'].args)) {
  servers['ga4'].args = servers['ga4'].args.map((a) =>
    /^mcp-remote@/.test(a) ? 'mcp-remote@latest' : a
  );
  changed.push('ga4 → mcp-remote@latest');
}

if (changed.length === 0) {
  console.log('対象サーバなし。変更不要。');
  process.exit(0);
}

fs.writeFileSync(F, JSON.stringify(j, null, 2));
console.log('更新完了:');
changed.forEach((c) => console.log('  -', c));
console.log('※ Claude Code を再起動し /mcp を確認してください。');
console.log('※ ga4 が「needs authentication」になったら、開いたブラウザでログインしてください。');
console.log('※ 問題があれば', bak, 'から復元できます。');
