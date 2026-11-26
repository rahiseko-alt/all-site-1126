#!/usr/bin/env node
// failures-coverage.mjs — failures.md の昇格 mark を集計する。
// mark 凡例（failures.md ヘッダと一致）:
//   [S✓] = 機械検証へ昇格済 / [S] = script化対象（未昇格バックログ）/ 無印 = メモで十分（[M] 扱い）
// 用途: check-in 時に「未昇格 [S] バックログ件数」を可視化し、failures→機械検証の昇格を促す。
// 終了コード: 常に 0（報告専用・ゲートではない）。--list で [S] バックログ本文を列挙。

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FAILURES_PATH = resolve(__dirname, '..', 'failures.md');

function main() {
  const wantList = process.argv.includes('--list');
  let text;
  try {
    text = readFileSync(FAILURES_PATH, 'utf8');
  } catch (e) {
    console.error(`failures.md を読めません: ${FAILURES_PATH}\n${e.message}`);
    process.exit(0); // 報告専用・存在しなくても check-in を止めない
  }

  // 失敗エントリは "- " 始まり（"> " 凡例行は除外）
  const entries = text.split(/\r?\n/).filter((l) => /^- /.test(l));
  const done = entries.filter((l) => /^- \[S✓\]/.test(l));
  const backlog = entries.filter((l) => /^- \[S\]/.test(l));
  const memo = entries.length - done.length - backlog.length;

  const total = entries.length;
  const pct = (n) => (total ? ((n / total) * 100).toFixed(0) : '0');

  console.log('failures.md 昇格カバレッジ');
  console.log(`  総エントリ      : ${total}`);
  console.log(`  [S✓] 昇格済     : ${done.length} (${pct(done.length)}%)`);
  console.log(`  [S]  未昇格BL   : ${backlog.length} (${pct(backlog.length)}%)`);
  console.log(`  [M]  メモで十分 : ${memo} (${pct(memo)}%)`);

  if (backlog.length) {
    console.log(`\n⚠ 未昇格 [S] バックログ ${backlog.length} 件（機械検証へ昇格候補）`);
    if (wantList) {
      for (const l of backlog) console.log(`   ${l.replace(/^- \[S\]\s*/, '')}`);
    } else {
      console.log('   本文は `node scripts/failures-coverage.mjs --list` で確認');
    }
  }
  process.exit(0);
}

main();
