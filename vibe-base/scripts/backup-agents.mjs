#!/usr/bin/env node
// scripts/backup-agents.mjs
// ~/.claude/agents/ (正本) を vibe-base/.claude/agents/ (バックアップ) に同期する。
// ~/.claude/ は git 管理外のため、vibe-base repo がバックアップを担う。
// 用途: Check-in 時に propagate-hooks.mjs と並んで実行。冪等（差分なしなら何もしない）。

import fs from 'fs';
import path from 'path';
import os from 'os';
import { governanceRoot } from './repo-paths.mjs';

const SRC = path.join(os.homedir(), '.claude', 'agents');
const DST = path.join(governanceRoot, '.claude', 'agents');

if (!fs.existsSync(SRC)) {
  console.error(`ERROR: 正本ディレクトリが存在しません: ${SRC}`);
  process.exit(1);
}

const srcFiles = fs.readdirSync(SRC).filter((f) => f.endsWith('.md'));

// 安全ガード: 正本が空ならバックアップ全削除を防ぐため中断
if (srcFiles.length === 0) {
  console.error('WARN: 正本に .md がありません。バックアップ誤削除を防ぐため中断します。');
  process.exit(1);
}

// --check: 何も書かず、正本とバックアップの乖離だけを検査する（Check-in A-19c 用）。
// ~/.claude/ は git 管理外のため、ミラー漏れは「PC 初期化でサブエージェントだけ消える」事故になる。
// 特に job-application-write-gate のような「サブ経由でしか書けない」hook を repo に持つ場合、
// サブが消えると親も deny されデッドロックする。ゆえに乖離は NG 扱いにする。
if (process.argv.includes('--check')) {
  const missing = [];
  const drifted = [];
  for (const file of srcFiles) {
    const dst = path.join(DST, file);
    if (!fs.existsSync(dst)) { missing.push(file); continue; }
    if (!fs.readFileSync(path.join(SRC, file)).equals(fs.readFileSync(dst))) drifted.push(file);
  }
  const orphaned = fs.existsSync(DST)
    ? fs.readdirSync(DST).filter((f) => f.endsWith('.md') && !srcFiles.includes(f))
    : [];

  if (missing.length === 0 && drifted.length === 0 && orphaned.length === 0) {
    console.log(`OK: 正本 ${srcFiles.length} 件がバックアップと一致`);
    process.exit(0);
  }
  for (const f of missing) console.error(`MISSING: ${f}（バックアップ未生成＝PC初期化で消滅する）`);
  for (const f of drifted) console.error(`DRIFT: ${f}（正本とバックアップの内容が不一致）`);
  for (const f of orphaned) console.error(`EXTRA: ${f}（正本に無い。削除済み agent の残骸）`);
  console.error(`NG: node scripts/backup-agents.mjs を実行して同期してください`);
  process.exit(1);
}

fs.mkdirSync(DST, { recursive: true });
let copied = 0;
let deleted = 0;

// 正本 → バックアップ（追加・更新）
for (const file of srcFiles) {
  const srcContent = fs.readFileSync(path.join(SRC, file));
  const dst = path.join(DST, file);
  const needsCopy = !fs.existsSync(dst) || !srcContent.equals(fs.readFileSync(dst));
  if (needsCopy) {
    fs.writeFileSync(dst, srcContent);
    console.log(`SYNC ${file}`);
    copied++;
  }
}

// バックアップ側の orphan 処理（正本にないファイル）
// 改修 (Session 2026-05-27): 即削除ではなく archive/ に move して復元可能化
// 理由: backup-agents.mjs 一方向 mirror による誤削除リスク P4 教訓 (cf08321 で 4 件削除事案)
const orphans = fs.readdirSync(DST).filter((f) => f.endsWith('.md') && !srcFiles.includes(f));

if (orphans.length > 0) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19); // YYYY-MM-DDTHH-MM-SS
  const archiveDir = path.join(governanceRoot, 'archive', 'agents-orphans', ts);
  fs.mkdirSync(archiveDir, { recursive: true });

  // 削除しきい値: orphan 件数 > 残存件数の 50% で警告 (誤削除の可能性大)
  const ratio = orphans.length / Math.max(srcFiles.length, 1);
  if (ratio > 0.5 && !process.argv.includes('--force')) {
    console.error(`⚠️  WARN: orphan 件数 ${orphans.length} 件 / 正本 ${srcFiles.length} 件 (比率 ${(ratio * 100).toFixed(0)}%)`);
    console.error(`大量削除の可能性。意図的なら --force flag 付きで再実行してください。`);
    console.error(`archive/ への退避は行いませんでした。`);
    process.exit(1);
  }

  for (const file of orphans) {
    const srcPath = path.join(DST, file);
    const archivePath = path.join(archiveDir, file);
    fs.renameSync(srcPath, archivePath);
    console.log(`ARCHIVE ${file} → ${path.relative(governanceRoot, archivePath)}`);
    deleted++;
  }

  console.log(`\n復元方法: cp ${path.relative(governanceRoot, archiveDir)}/<file> .claude/agents/<file>`);
}

console.log(`\n${copied} synced / ${deleted} archived / ${srcFiles.length} total`);
