#!/usr/bin/env node
/**
 * scripts/build-works-portfolio.mjs
 *
 * 営業資料「技術ポートフォリオ」の公開ビルド。
 *   正本: docs/deliverables/portfolio.html
 *   公開: deploy/works/index.html  →  https://works.kouheikosehira.com
 *
 * なぜこのスクリプトが要るか:
 *   docs/deliverables/ には経歴書・戦略資料・スクリーンショットが同居しており、
 *   そのままデプロイすると全部公開される。公開してよいのは portfolio.html のみ。
 *   そこで「公開専用ディレクトリに正本を1枚だけ写す」工程を機械化し、
 *   一時ディレクトリからの場当たりデプロイ（再現不能・誤公開リスク）を根絶する。
 *
 * 使い方:
 *   node scripts/build-works-portfolio.mjs        ビルド（正本 → deploy/works/index.html）
 *   node scripts/build-works-portfolio.mjs --check ビルドせず差分の有無だけ検査（EXIT 1 で要ビルド）
 *
 * デプロイ:
 *   node scripts/build-works-portfolio.mjs && vercel --prod --yes --cwd deploy/works
 *   手順の正本 → docs/ops/works-portfolio-deploy.md
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'docs', 'deliverables', 'portfolio.html');
const OUT_DIR = path.join(ROOT, 'deploy', 'works');
const OUT = path.join(OUT_DIR, 'index.html');

// 公開ディレクトリに存在してよいファイル。これ以外があれば誤公開の芽なので落とす。
//   .vercel / .gitignore は `vercel link` が生成する（.gitignore は .vercel を除外するためのもの）。
const ALLOWED = new Set(['index.html', 'vercel.json', '.vercel', '.gitignore']);

// 公開前に必ず弾くパターン（秘匿・内部情報）
// ハイフン/アンダースコアを含む新形式キー（sk-proj- / sk-ant- / sk_live_ 等）を取りこぼさないこと。
// 2026-07-09 security-reviewer 指摘: `sk-[A-Za-z0-9]{16,}` はハイフンで断裂し検出漏れする。
const FORBIDDEN = [
  { re: /sk[-_][A-Za-z0-9_-]{16,}/, name: 'OpenAI / Anthropic / Stripe 形式の API キー' },
  { re: /ghp_[A-Za-z0-9]{20,}/, name: 'GitHub トークン' },
  { re: /AKIA[0-9A-Z]{16}/, name: 'AWS アクセスキー' },
  { re: /xox[baprs]-[A-Za-z0-9-]{10,}/, name: 'Slack トークン' },
  { re: /AIza[0-9A-Za-z_-]{35}/, name: 'Google API キー' },
  { re: /vercel_blob_rw_[A-Za-z0-9_]{10,}/, name: 'Vercel Blob トークン' },
  { re: /\bAPI_KEY\s*[:=]/, name: 'API_KEY の代入' },
  { re: /Authorization:\s*Bearer\s+\S+/i, name: 'Bearer トークン' },
  { re: /localhost:\d+/, name: 'localhost の参照' },
  { re: /C:\\Users\\/, name: 'ローカル絶対パス' },
];

function die(msg) {
  process.stderr.write(`[build-works-portfolio] ERROR: ${msg}\n`);
  process.exit(1);
}

function sha(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

const checkOnly = process.argv.includes('--check');

if (!fs.existsSync(SRC)) die(`正本が見つかりません: ${path.relative(ROOT, SRC)}`);

const src = fs.readFileSync(SRC);
const text = src.toString('utf8');

// 秘匿スキャン（公開物なので fail-closed）
for (const { re, name } of FORBIDDEN) {
  if (re.test(text)) die(`公開禁止パターンを検出: ${name}。公開を中止しました。`);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

// 公開ディレクトリに想定外のファイルが混ざっていないか
for (const entry of fs.readdirSync(OUT_DIR)) {
  if (!ALLOWED.has(entry)) {
    die(`公開ディレクトリに想定外のファイルがあります: deploy/works/${entry}\n` +
        `        公開されるため、削除するか ALLOWED に追加してください。`);
  }
}

const srcHash = sha(src);
const outHash = fs.existsSync(OUT) ? sha(fs.readFileSync(OUT)) : null;

if (checkOnly) {
  if (srcHash === outHash) {
    process.stdout.write('[build-works-portfolio] 差分なし（deploy/works/index.html は最新）\n');
    process.exit(0);
  }
  process.stderr.write('[build-works-portfolio] 正本と公開物が乖離しています。ビルドしてください。\n');
  process.exit(1);
}

fs.writeFileSync(OUT, src);
const verify = sha(fs.readFileSync(OUT));
if (verify !== srcHash) die('書き込み後のハッシュが一致しません。');

process.stdout.write(
  `[build-works-portfolio] OK\n` +
  `  正本: docs/deliverables/portfolio.html\n` +
  `  公開: deploy/works/index.html\n` +
  `  sha256: ${srcHash.slice(0, 16)}\n` +
  `  bytes: ${src.length}\n` +
  `  次: vercel --prod --yes --cwd deploy/works\n`
);
