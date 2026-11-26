#!/usr/bin/env node
// .claude/hooks/rules-coverage-gate.mjs
// PostToolUse(Write|Edit) hook ラッパー: vibe-governance の正本 check-rules-coverage.sh を
// cross-repo で invoke する。解決方式・fail-safe は pc-version-gate.mjs と同一。

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const TARGET_REL = 'scripts/check-rules-coverage.sh';

function resolveGovernanceRoot() {
  const env = process.env.VIBE_GOVERNANCE_ROOT;
  if (env && fs.existsSync(path.join(env, TARGET_REL))) return path.resolve(env);
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 12; i++) {
    const cand = path.join(dir, '..', 'vibe-governance');
    if (fs.existsSync(path.join(cand, TARGET_REL))) return path.resolve(cand);
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

const stdin = fs.readFileSync(0);
const govRoot = resolveGovernanceRoot();
if (!govRoot) {
  process.stderr.write('rules-coverage-gate: vibe-governance を解決できません（VIBE_GOVERNANCE_ROOT 未設定 + 兄弟探索失敗）。ルールカバレッジ検証をスキップします。\n');
  process.exit(0);
}

const r = spawnSync('bash', [path.join(govRoot, TARGET_REL)], {
  input: stdin,
  stdio: ['pipe', 'inherit', 'inherit'],
});
process.exit(r.status ?? 0);
