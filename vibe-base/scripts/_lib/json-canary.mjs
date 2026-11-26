#!/usr/bin/env node
/**
 * scripts/_lib/json-canary.mjs
 *
 * 本番一括 JSON 改変 script の事故防止 lib (memory P3 #2 [2026-05-25] 90 entries 破壊事故の根本対策)。
 *
 * API:
 *   canaryTransform({
 *     fixture: string,           // 検証用 fixture (JSON file path)
 *     transformFn: (content, targetPath?) => string,
 *     targets?: string[],        // 展開先 (省略時は canary のみ)
 *     expectedDiffLines?: number,// fixture 上の transform で期待する diff 行数
 *     dryRun?: boolean,
 *   }): Promise<{success, targetCount, transformHash}>
 *
 *   挙動:
 *     1. fixture を読込 → transformFn 適用 → JSON.parse 試行 (FAIL なら throw)
 *     2. expectedDiffLines 指定時は実 diff 行数と一致確認 (不一致なら throw)
 *     3. canary PASS なら全 targets に同 transformFn 適用 (dryRun 時はスキップ)
 *     4. 毎回 tmp/json-canary-trace.jsonl に schema {ts, fixture, transformHash, targets, targetCount, success} を追記
 *
 *   FAIL 時の保証:
 *     - fixture / targets の実ファイルは未変更 (canary FAIL なら target に触らない)
 *
 * CLI:
 *   --self-test       内蔵 fixture に no-op append transform で PASS シナリオ確認
 *   --self-test-fail  内蔵 fixture に破壊 transformFn `(c) => c.replace('"command":', '"BROKEN":')` を渡し FAIL シナリオ確認
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VIBE_BASE_ROOT = path.resolve(__dirname, '..', '..');
const TRACE_PATH = path.join(VIBE_BASE_ROOT, 'tmp', 'json-canary-trace.jsonl');

function ensureDir(p) {
  const dir = path.dirname(p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function appendTrace(entry) {
  ensureDir(TRACE_PATH);
  fs.appendFileSync(TRACE_PATH, JSON.stringify(entry) + '\n', 'utf-8');
}

function hashTransformFn(fn) {
  return crypto.createHash('sha256').update(fn.toString()).digest('hex').slice(0, 16);
}

function diffLineCount(a, b) {
  const al = a.split('\n');
  const bl = b.split('\n');
  let diff = 0;
  const max = Math.max(al.length, bl.length);
  for (let i = 0; i < max; i++) {
    if (al[i] !== bl[i]) diff++;
  }
  return diff;
}

export async function canaryTransform({
  fixture,
  transformFn,
  targets = [],
  expectedDiffLines,
  dryRun = false,
}) {
  const transformHash = hashTransformFn(transformFn);
  const ts = new Date().toISOString();
  const fixtureAbs = path.isAbsolute(fixture) ? fixture : path.join(VIBE_BASE_ROOT, fixture);

  // Canary stage: fixture 上で transform → JSON.parse / diff 行数検証
  if (!fs.existsSync(fixtureAbs)) {
    const reason = `fixture not found: ${fixture}`;
    appendTrace({ ts, fixture, transformHash, targets, targetCount: targets.length, success: false, reason });
    throw new Error(reason);
  }

  // fixture 候補は単一 JSON file か directory（中の.claude/settings.json を使う）
  let fixtureFile;
  if (fs.statSync(fixtureAbs).isDirectory()) {
    fixtureFile = path.join(fixtureAbs, '.claude', 'settings.json');
  } else {
    fixtureFile = fixtureAbs;
  }
  if (!fs.existsSync(fixtureFile)) {
    const reason = `fixture file not found: ${fixtureFile}`;
    appendTrace({ ts, fixture, transformHash, targets, targetCount: targets.length, success: false, reason });
    throw new Error(reason);
  }

  const original = fs.readFileSync(fixtureFile, 'utf-8');
  let transformed;
  try {
    transformed = transformFn(original, fixtureFile);
  } catch (e) {
    appendTrace({ ts, fixture, transformHash, targets, targetCount: targets.length, success: false, reason: `transformFn threw: ${e.message}` });
    throw e;
  }

  // JSON.parse 検証
  try {
    JSON.parse(transformed);
  } catch (e) {
    appendTrace({ ts, fixture, transformHash, targets, targetCount: targets.length, success: false, reason: `JSON.parse FAIL: ${e.message}` });
    throw new Error(`canary JSON.parse failed: ${e.message}`);
  }

  // diff 行数検証
  if (typeof expectedDiffLines === 'number') {
    const actualDiff = diffLineCount(original, transformed);
    if (actualDiff !== expectedDiffLines) {
      appendTrace({ ts, fixture, transformHash, targets, targetCount: targets.length, success: false, reason: `diff lines: expected=${expectedDiffLines} actual=${actualDiff}` });
      throw new Error(`canary diff lines mismatch: expected=${expectedDiffLines} actual=${actualDiff}`);
    }
  }

  // Canary PASS - target 展開
  if (!dryRun) {
    for (const target of targets) {
      const targetAbs = path.isAbsolute(target) ? target : path.join(VIBE_BASE_ROOT, target);
      if (!fs.existsSync(targetAbs)) {
        appendTrace({ ts, fixture, transformHash, targets, targetCount: targets.length, success: false, reason: `target not found: ${target}` });
        throw new Error(`target not found: ${target}`);
      }
      const targetContent = fs.readFileSync(targetAbs, 'utf-8');
      const newContent = transformFn(targetContent, targetAbs);
      // 念のため targets 側でも JSON.parse 検証
      try {
        JSON.parse(newContent);
      } catch (e) {
        appendTrace({ ts, fixture, transformHash, targets, targetCount: targets.length, success: false, reason: `target JSON.parse FAIL: ${target} ${e.message}` });
        throw new Error(`target JSON.parse failed for ${target}: ${e.message}`);
      }
      fs.writeFileSync(targetAbs, newContent, 'utf-8');
    }
  }

  appendTrace({ ts, fixture, transformHash, targets, targetCount: targets.length, success: true });
  return { success: true, targetCount: targets.length, transformHash };
}

// ─────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────
const args = process.argv.slice(2);

async function selfTest({ shouldFail }) {
  // 内蔵 fixture (一時 dir に有効な JSON を配置)
  const tmpFixture = path.join(VIBE_BASE_ROOT, 'tmp', 'json-canary-self-fixture.json');
  ensureDir(tmpFixture);
  const sample = '{"command":"echo OK","note":"sample"}\n';
  fs.writeFileSync(tmpFixture, sample, 'utf-8');

  const beforeHash = crypto.createHash('sha256').update(fs.readFileSync(tmpFixture)).digest('hex');

  try {
    if (shouldFail) {
      // 破壊 transformFn: JSON parse を壊す
      const transformFn = (c) => c.replace('"command":', '"BROKEN":');
      // diff 行数 mismatch も併発するが、JSON parse FAIL が先に throw する
      await canaryTransform({
        fixture: tmpFixture,
        transformFn: (c) => c.replace('"command":', '"BROKEN"'),  // 構文壊し: ":" を抜く
        targets: [],
        expectedDiffLines: 1,
      });
      // ここに到達したら FAIL シナリオ失敗
      process.stderr.write('SELF-TEST FAIL: expected throw but succeeded\n');
      process.exit(2);
    } else {
      // 正常 transformFn: no-op append (1 行追加)
      const transformFn = (c) => c.replace('}\n', ',"appended":true}\n');
      const result = await canaryTransform({
        fixture: tmpFixture,
        transformFn,
        targets: [],
        expectedDiffLines: 1,
      });
      process.stdout.write(`CANARY PASS targetCount=${result.targetCount} transformHash=${result.transformHash}\n`);
      process.exit(0);
    }
  } catch (e) {
    // fixture が変更されていないことを確認
    const afterHash = crypto.createHash('sha256').update(fs.readFileSync(tmpFixture)).digest('hex');
    if (beforeHash !== afterHash) {
      process.stderr.write(`FIXTURE TAMPERED: before=${beforeHash} after=${afterHash}\n`);
      process.exit(3);
    }
    if (shouldFail) {
      process.stdout.write(`CANARY FAIL (expected): ${e.message}\n`);
      process.exit(1);
    } else {
      process.stderr.write(`CANARY UNEXPECTED FAIL: ${e.message}\n`);
      process.exit(2);
    }
  }
}

if (args.includes('--self-test')) {
  selfTest({ shouldFail: false });
} else if (args.includes('--self-test-fail')) {
  selfTest({ shouldFail: true });
}
