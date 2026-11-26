#!/usr/bin/env node
/**
 * .claude/hooks/session-start-toranomaki.mjs
 *
 * SessionStart 薄ラッパ — HTML虎の巻 outbox 取込の半自動トリガー。
 *
 * 設計（git 混線・auto-commit 事故の防止が最優先）:
 *   - **read-only**: 本 hook 自身は docs/ ・ registry.json ・ agent-ag を一切書込まない。
 *   - 司令塔セッション（CLAUDE_PROJECT_DIR 配下に docs/html-toranomaki/registry.json が在る）:
 *       pending 提出物が在る時のみ `toranomaki-intake.mjs --dry-run`（read-only 走査）を起動し、
 *       その結果を additionalContext として注入する。実取込（書込）は orchestrator が
 *       明示的に `node scripts/toranomaki-intake.mjs` を実行（unstaged・コミットはマスター承認）。
 *   - product セッション（registry 不在）: 自身の .toranomaki-outbox に投函があれば通知のみ。
 *       engine 起動なし・無書込。
 *
 * 入出力: stdin に SessionStart の JSON（hook_event_name 等）。stdout に
 *   { hookSpecificOutput: { hookEventName, additionalContext } } を出力（無通知時は無出力）。
 * EXIT: 常に 0（SessionStart を絶対にブロックしない）。
 */

import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

function emit(context) {
  if (!context) return;
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: context,
      },
    })
  );
}

// outbox 提出物を数える（read-only）
function countOutbox(productsDir) {
  let count = 0;
  const items = [];
  if (!fs.existsSync(productsDir)) return { count, items };
  for (const product of fs.readdirSync(productsDir, { withFileTypes: true })) {
    if (!product.isDirectory()) continue;
    const outboxDir = path.join(productsDir, product.name, '.toranomaki-outbox');
    if (!fs.existsSync(outboxDir)) continue;
    for (const slugEnt of fs.readdirSync(outboxDir, { withFileTypes: true })) {
      if (!slugEnt.isDirectory()) continue;
      if (fs.existsSync(path.join(outboxDir, slugEnt.name, 'meta.json'))) {
        count++;
        items.push(`${product.name}/${slugEnt.name}`);
      }
    }
  }
  return { count, items };
}

function localOutbox(projectDir) {
  let count = 0;
  const items = [];
  const outboxDir = path.join(projectDir, '.toranomaki-outbox');
  if (!fs.existsSync(outboxDir)) return { count, items };
  for (const slugEnt of fs.readdirSync(outboxDir, { withFileTypes: true })) {
    if (!slugEnt.isDirectory()) continue;
    if (fs.existsSync(path.join(outboxDir, slugEnt.name, 'meta.json'))) {
      count++;
      items.push(slugEnt.name);
    }
  }
  return { count, items };
}

function main() {
  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const registryPath = path.join(projectDir, 'docs', 'html-toranomaki', 'registry.json');
  const isOrchestrator = fs.existsSync(registryPath);

  if (isOrchestrator) {
    const productsDir = path.join(projectDir, 'products');
    const prod = countOutbox(productsDir);
    // agent-ag/.toranomaki-outbox/ も intake ソース（R&D 実験場の提出口）
    const ag = localOutbox(path.join(projectDir, 'agent-ag'));
    const count = prod.count + ag.count;
    const items = [...prod.items, ...ag.items.map((s) => `agent-ag/${s}`)];
    if (count === 0) {
      process.exit(0); // 無通知
    }
    // read-only dry-run でpending を可視化
    const intakeScript = path.join(projectDir, 'scripts', 'toranomaki-intake.mjs');
    let dryOut = '';
    if (fs.existsSync(intakeScript)) {
      const r = spawnSync(process.execPath, [intakeScript, '--dry-run'], {
        encoding: 'utf-8',
        cwd: projectDir,
        timeout: 20000,
      });
      dryOut = (r.stdout || '') + (r.stderr || '');
    }
    emit(
      [
        `📥 HTML虎の巻 outbox に取込待ち ${count} 件: ${items.join(', ')}`,
        '',
        '--- intake --dry-run（read-only・本番未変更）---',
        dryOut.trim(),
        '---',
        '実取込: `node scripts/toranomaki-intake.mjs` を実行（配置→blindtest→registry→build / unstaged のまま終了）。',
        'コミットは司令塔＋マスター承認のみ（auto-commit 禁止）。',
      ].join('\n')
    );
    process.exit(0);
  }

  // product セッション: 通知のみ・無書込・engine 起動なし
  const { count, items } = localOutbox(projectDir);
  if (count > 0) {
    emit(
      `📤 このプロダクトの .toranomaki-outbox に ${count} 件投函済み（${items.join(', ')}）。` +
      `司令塔（vibe-base）セッションで取込されます。本セッションでは中央 docs/ への書込は行いません。`
    );
  }
  process.exit(0);
}

// stdin を読み切ってから処理（SessionStart JSON を drain。内容は判定に使わないが hang 回避）
let data = '';
let settled = false;
function run() {
  if (settled) return;
  settled = true;
  try {
    main();
  } catch (e) {
    process.stderr.write('[session-start-toranomaki] error: ' + (e?.message || String(e)) + '\n');
    process.exit(0); // SessionStart は絶対にブロックしない
  }
}
process.stdin.on('data', (c) => (data += c));
process.stdin.on('end', run);
// stdin が無い（TTY 直起動等）場合のフォールバック
setTimeout(run, 500);
