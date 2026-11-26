#!/usr/bin/env node
// PreToolUse:Bash — portfolio デプロイ前 build + verify 強制ゲート
//
// `cd portfolio && vercel --prod` 系のデプロイ直前に build-portfolio.mjs（テンプレ＋registry→完全生成）と
// toranomaki-verify.mjs（三者一致）を強制実行する。verify FAIL なら deploy を Deny する。
// 「古い手編集 portal をそのまま本番公開する」leak を機械的に封鎖する。
//
// 発火条件: command が vercel デプロイ かつ portfolio を対象とする場合のみ。
//   （他プロダクトの vercel --prod には反応しない＝過剰反応防止）

import { execSync } from 'child_process';
import path from 'path';

const PROJECT_DIR = (process.env.CLAUDE_PROJECT_DIR || process.cwd()).replace(/\\/g, '/');

let data = '';
process.stdin.on('data', (c) => (data += c));
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(data);
    const command = ((input.tool_input || {}).command || '').trim();
    if (!command) process.exit(0);

    // vercel デプロイ かつ portfolio 対象 のみ発火
    const isVercel = /\bvercel\b/.test(command);
    const isProd = /--prod\b/.test(command) || /\bdeploy\b/.test(command);
    const isPortfolio = /\bportfolio\b/.test(command);
    if (!(isVercel && isProd && isPortfolio)) process.exit(0);

    // build → verify を強制実行
    let buildOut = '';
    let verifyOut = '';
    try {
      buildOut = execSync(`node "${PROJECT_DIR}/scripts/build-portfolio.mjs"`, { encoding: 'utf-8', stdio: 'pipe' });
    } catch (e) {
      block('build-portfolio.mjs 失敗', (e.stdout || '') + (e.stderr || ''));
      return;
    }
    try {
      verifyOut = execSync(`node "${PROJECT_DIR}/scripts/toranomaki-verify.mjs"`, { encoding: 'utf-8', stdio: 'pipe' });
    } catch (e) {
      block('toranomaki-verify.mjs FAIL（三者不整合）', (e.stdout || '') + (e.stderr || ''));
      return;
    }

    // 両方 PASS → deploy 許可。再生成済み portal が本番に乗る。
    process.exit(0);

    function block(title, detail) {
      console.log(JSON.stringify({
        decision: 'block',
        reason: [
          `⛔ [portfolio-deploy-build-gate] デプロイ前検証で停止: ${title}`,
          '本番公開前に build-portfolio + toranomaki-verify を強制実行しましたが不合格でした。',
          '--- 詳細 ---',
          (detail || '').trim().split('\n').slice(-20).join('\n'),
          '------------',
          '修正してから再デプロイしてください（正本 = docs/html-toranomaki/ + registry.json + _portal-shell.html）。',
        ].join('\n'),
      }));
      process.exit(0);
    }
  } catch (e) {
    process.stderr.write('[portfolio-deploy-build-gate] error: ' + (e && e.message ? e.message : String(e)) + '\n');
    process.exit(0);
  }
});
