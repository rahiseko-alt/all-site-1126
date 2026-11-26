#!/usr/bin/env node
/**
 * inspect-mcp-servers.mjs — 現プロジェクトキー配下の MCP サーバ設定を安全に表示する
 *
 * 用途: MCP サーバが failed になる原因調査。command / args / cwd / env のキー名のみ表示し、
 *       env の値（トークン等の秘匿情報）は一切表示しない。
 * 実行: node scripts/inspect-mcp-servers.mjs
 */
import os from 'os';
import fs from 'fs';
import path from 'path';

const F = path.join(os.homedir(), '.claude.json');
const NEW = 'C:/Users/user/Desktop/ClaudeCode/vibe-base';

const j = JSON.parse(fs.readFileSync(F, 'utf8'));
const servers = (j.projects && j.projects[NEW] && j.projects[NEW].mcpServers) || {};

for (const [name, cfg] of Object.entries(servers)) {
  console.log('=== ' + name + ' ===');
  console.log('  type   :', cfg.type || '(未指定)');
  console.log('  command:', cfg.command || '(なし)');
  console.log('  args   :', JSON.stringify(cfg.args || []));
  console.log('  cwd    :', cfg.cwd || '(未指定)');
  if (cfg.url) console.log('  url    :', cfg.url);
  console.log('  env keys:', Object.keys(cfg.env || {}).join(', ') || '(なし)');
  // cwd が実在するか（旧パス残存の検知）
  if (cfg.cwd) {
    console.log('  cwd exists:', fs.existsSync(cfg.cwd));
  }
}
