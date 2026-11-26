#!/usr/bin/env node
/**
 * scripts/init-product-roadmap.mjs
 *
 * product の現在地（roadmap-state.json）を roadmap.md から生成／同期する。
 * **司令塔（vibe-base root）から実行する唯一の経路。**
 *
 * なぜ司令塔からしか作れないか（2026-07-17 H2大義「大義システムを全 product へ配備」）:
 *   product 側の roadmap-state-write-gate は「不在ファイルへの Write」を deny する。
 *   つまり product セッションの AI は自分の器を作れない。これは穴ではなく**設計**で、
 *   「product が自分の器を無承認で確定できない」（マイルストーンと同格・CLAUDE.md §0）の機械強制そのもの。
 *   司令塔から書く時は $CLAUDE_PROJECT_DIR=root のため product 側 gate は発火しない。
 *
 * なぜ「空の器を作る」ではないか:
 *   roadmap.md **不在**＝「H2大義が未確定」を SessionStart hook が
 *   「⛔ H2大義が不在＝マスターに仰げ」として正しく表現する。空の器を置くとこの警告が止まり、
 *   代わりに空のプレースホルダが注入される＝判定機構の劣化。**不在が正しい初期状態。**
 *
 * 前提（この順序は不可逆）:
 *   1. H2大義とマイルストーンを確定する（**AI が起案してよい・マスター承認で確定する**）
 *   2. その判定を products/<product>/roadmap.md に書き起こす（書き起こし ≠ 立案）
 *   3. 本スクリプトで roadmap-state.json を生成する（id の正本は roadmap.md）
 *
 * 冪等: 既存 state の status は id 単位で引き継ぐ。roadmap.md から消えた id は落とし、
 *       増えた id は todo で入る。何度実行してもよい。
 *
 * 使い方: node scripts/init-product-roadmap.mjs <product>
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function die(msg, code = 1) {
  console.error(msg);
  process.exit(code);
}

const product = process.argv[2];
if (!product) {
  die(
    '使い方: node scripts/init-product-roadmap.mjs <product>\n' +
    '\n先に products/<product>/roadmap.md へマスターの大義判定を書き起こしてください。'
  );
}

// パス・トラバーサル防止（`../` で repo 外へ書かせない）
if (product.includes('/') || product.includes('\\') || product === '..' || product === '.') {
  die(`⛔ product 名が不正です: ${product}`);
}

const productDir = path.join(ROOT, 'products', product);
if (!fs.existsSync(path.join(productDir, 'CLAUDE.md'))) {
  die(
    `⛔ product として整備されていません: products/${product}\n` +
    `  （CLAUDE.md が不在。product 名の誤りか、未作成です）`
  );
}

const roadmapPath = path.join(productDir, 'roadmap.md');
if (!fs.existsSync(roadmapPath)) {
  die(
    `⛔ products/${product}/roadmap.md がありません。器はここからは作れません。\n` +
    `\n大義とマイルストーンは AI が起案してよい・マスター承認で確定する（CLAUDE.md §0）。\n` +
    `roadmap.md に大義とマイルストーンを書き（マスター承認後）再実行してください。\n` +
    `\n様式（vibe-base ルートの roadmap.md が見本）:\n` +
    `  ## H2大義   … 大義一文 ＋ 種別（継続 / 完了）＋ 完了条件\n` +
    `  ## マイルストーン（順序固定）  … | id | マイルストーン | 依存 | の表・5 個以下\n` +
    `\nなお roadmap.md が**不在のままでも機械は正しく働きます**（「H2大義が不在＝マスターに仰げ」と\n` +
    `毎セッション注入し、plan は deny される）。大義未確定の product が大半でよい（CLAUDE.md §0）。`
  );
}

// マイルストーン表から id を拾う。名前・順序・依存の正本は roadmap.md（state に持ち込まない）。
const md = fs.readFileSync(roadmapPath, 'utf8');
const ids = [];
for (const line of md.split(/\r?\n/)) {
  const m = line.match(/^\s*\|\s*(\d+)\s*\|/);
  if (m) {
    const id = Number(m[1]);
    if (!ids.includes(id)) ids.push(id);
  }
}

if (ids.length === 0) {
  die(
    `⛔ products/${product}/roadmap.md にマイルストーンの表が見つかりません。\n` +
    `\n大義（ゴール）だけでは足りません。**ロードマップ（そこへの道）が必ず要る**（CLAUDE.md §0）。\n` +
    `道が無いから開発が遅い。マスターにマイルストーンの判定を仰いでください。\n` +
    `\n様式: | id | マイルストーン | 依存 |  の表・**5 個以下**・順序（依存）を持つ`
  );
}
if (ids.length > 5) {
  die(`⛔ マイルストーンが ${ids.length} 個あります。**5 個以下**にしてください（CLAUDE.md §0）。`);
}

// 既存 status と daigi の引き継ぎ（現在地・大義を無言でリセットしない）
const statePath = path.join(productDir, 'roadmap-state.json');
const prev = new Map();
let prevDaigi = null;
if (fs.existsSync(statePath)) {
  try {
    const old = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    for (const m of old?.milestones ?? []) {
      if (Number.isInteger(m?.id) && typeof m?.status === 'string') prev.set(m.id, m.status);
    }
    // daigi は確定済みの大義（マスター承認済）。器の再生成で**絶対に消すな**。
    // これを消すと「一度確定した大義が黙って失われる」退行になる（2026-07-17 code-reviewer 実機再現）。
    if (old && typeof old.daigi === 'object' && old.daigi !== null) prevDaigi = old.daigi;
  } catch (e) {
    die(
      `⛔ 既存の roadmap-state.json が読めません: ${e.message}\n` +
      `\n現在地・大義を無言でリセットすると右往左往の原因になります。手で直すかマスターに諮ってください。`
    );
  }
}

const state = {
  _note: '現在地の単一正本。AI が編集してよいのは status フィールドのみ。daigi・マイルストーン名・順序・依存は roadmap.md で起案しマスター承認で確定する（マイルストーンと同格・CLAUDE.md §0/§1）。履歴は git log が持つ（ここに書くな）。',
  _status_values: ['todo', 'in_progress', 'done'],
  // 既存 daigi があれば保全する。無ければキー自体を出さない（＝未設定＝初期状態）。
  ...(prevDaigi ? { daigi: prevDaigi } : {}),
  updated_at: new Date().toISOString().slice(0, 10),
  milestones: ids.map(id => ({ id, status: prev.get(id) ?? 'todo' })),
};

fs.writeFileSync(statePath, JSON.stringify(state, null, 2) + '\n', 'utf8');

const carried = ids.filter(id => prev.has(id)).length;
console.log(`OK: products/${product}/roadmap-state.json を生成しました`);
console.log(`  マイルストーン: ${ids.join(' / ')}（${ids.length} 個・status 引継ぎ ${carried} 件）`);
console.log(`  daigi（大義）: ${prevDaigi ? '既存を保全' : '未設定（roadmap.md で起案しマスター承認で確定）'}`);
console.log(`  ${product} のセッションで SessionStart 注入と ExitPlanMode の大義照合が働きます。`);
