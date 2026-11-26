#!/usr/bin/env node
/**
 * set-token-env.mjs — P1(a): settings.json の平文トークンを OS ユーザー環境変数へ登録する
 *
 * 用途: ~/.claude/settings.json の env.TWITTER_BEARER_TOKEN を読み、Windows の
 *       ユーザー環境変数 TWITTER_BEARER_TOKEN に setx で登録する。値は一切表示しない。
 *       PowerShell への複数行貼り付けで壊れる問題を避けるため、node 1 本で完結させる。
 *
 * 実行: node scripts/set-token-env.mjs
 * 次手順: node scripts/remove-token-from-user-settings.mjs（設定ファイルから平文を削除）
 * 依存: Node.js 組み込みのみ。Windows 専用（setx 使用）。
 */
import os from 'os';
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const F = path.join(os.homedir(), '.claude', 'settings.json');
const KEY = 'TWITTER_BEARER_TOKEN';

const j = JSON.parse(fs.readFileSync(F, 'utf8'));
const t = j.env && j.env[KEY];

if (!t) {
  console.error(KEY, 'が settings.json の env に見つかりません（既に削除済みの可能性）。');
  process.exit(1);
}
if (typeof t !== 'string' || t.length === 0) {
  console.error('トークン値が不正です。');
  process.exit(1);
}
if (t.length > 1024) {
  console.error('値が 1024 文字を超えており setx では切り詰められます。別方式が必要です。');
  process.exit(1);
}

// setx.exe を明示パスで解決（Git Bash 環境で PATH に無い場合の保険）
const sysRoot = process.env.SystemRoot || process.env.windir || 'C:/Windows';
const setxPath = path.join(sysRoot, 'System32', 'setx.exe');
const setxCmd = fs.existsSync(setxPath) ? setxPath : 'setx';

const r = spawnSync(setxCmd, [KEY, t], { encoding: 'utf8', shell: false });

if (r.error) {
  console.error('setx の実行に失敗:', r.error.message);
  process.exit(1);
}
if (r.status === 0) {
  console.log('OS ユーザー環境変数に登録しました（値は非表示）。');
  console.log('次: node scripts/remove-token-from-user-settings.mjs で設定ファイルの平文を削除してください。');
} else {
  console.error('setx が非ゼロ終了 status=', r.status);
  console.error((r.stderr || r.stdout || '').slice(0, 300));
  process.exit(1);
}
