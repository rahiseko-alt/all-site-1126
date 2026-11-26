#!/usr/bin/env node
/**
 * remove-token-from-user-settings.mjs — P1: user settings.json から平文トークンを除去する
 *
 * 背景: ~/.claude/settings.json の env に TWITTER_BEARER_TOKEN が平文で埋め込まれている
 *       （gitignore 外・secret-write-gate の網外）。OS 環境変数へ移設した後、設定ファイル
 *       側の平文を削除する。値は一切表示しない（無表示削除）。
 *
 * 前提: 先に別端末で `setx TWITTER_BEARER_TOKEN "＜値＞"` を実行済みであること。
 * 実行: node scripts/remove-token-from-user-settings.mjs
 * 実行後: Claude Code を再起動し、OS 環境変数から読めることを確認する。
 * 依存: Node.js 組み込みのみ。
 */
import os from 'os';
import fs from 'fs';
import path from 'path';

const F = path.join(os.homedir(), '.claude', 'settings.json');
const KEY = 'TWITTER_BEARER_TOKEN';

if (!fs.existsSync(F)) {
  console.error('~/.claude/settings.json が見つかりません:', F);
  process.exit(1);
}

const j = JSON.parse(fs.readFileSync(F, 'utf8'));

if (!j.env || !(KEY in j.env)) {
  console.log(KEY, 'は既に env にありません。削除不要。');
  console.log('現在の env keys:', Object.keys(j.env || {}).join(', ') || '(なし)');
  process.exit(0);
}

// 破壊前バックアップ
const bak = F + '.bak-tokenfix';
fs.writeFileSync(bak, fs.readFileSync(F));
console.log('バックアップ作成:', bak);

delete j.env[KEY];
fs.writeFileSync(F, JSON.stringify(j, null, 2) + '\n');
console.log('削除完了。現在の env keys:', Object.keys(j.env || {}).join(', ') || '(なし)');
console.log('※ 一覧に', KEY, 'が無ければ成功です（値は表示していません）。');
console.log('※ 先に setx で OS 環境変数へ登録済みか確認し、Claude Code を再起動してください。');
