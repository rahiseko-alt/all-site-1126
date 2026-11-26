# product hook の cross-repo 修復（check-pc-version / check-rules-coverage）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans。Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 全 product の settings.json に配線された 2 hook（`check-pc-version.mjs` = PC 表バージョン照合 / `check-rules-coverage.sh` = ルールカバレッジ検証）が、段階 2 工程 2-2 の `scripts/` 移動後に `$CLAUDE_PROJECT_DIR/scripts/...` を指して ENOENT で機能停止している。これを `.claude/hooks/` 配下の薄いラッパー hook 経由で vibe-governance の正本スクリプトを cwd 非依存に invoke する形へ修正し、editor-time 検証 gate を復旧する。

**Architecture:** `vibe-base/.claude/hooks/` に 2 つのラッパー hook（`pc-version-gate.mjs` / `rules-coverage-gate.mjs`）を新設。各ラッパーは ①env `VIBE_GOVERNANCE_ROOT` ②自身の `import.meta.url` から上昇し兄弟 `vibe-governance` を探索 — の順で governance root を解決し、`<gov>/scripts/check-pc-version.mjs`（または `check-rules-coverage.sh`）を子プロセスで spawn。hook の stdin をそのまま子へ渡し、子の stdout/stderr/exit code を透過する。解決失敗時は stderr に警告して exit 0（PostToolUse は非ブロック・fail-safe）。vibe-base root `settings.json` の当該 2 hook command を `.claude/hooks/<wrapper>` 参照へ書換。`propagate-hooks.mjs`（**変更不要** — `.mjs` ファイル配布 + settings.json hooks 同期を既に実装済）が wrapper ファイルと settings.json hooks 設定を全 product へ配布する。

**Tech Stack:** Node.js ESM（`.mjs`）、`child_process.spawnSync`、既存 `propagate-hooks.mjs`（不変更）。

---

## 前提（auto mode のため 5 軸を明文化・brainstorming 質問はスキップ）

| 軸 | 内容 |
|---|---|
| **Purpose** | 工程 2-4 完了後の運用パリティ調査で判明した product hook 2 件の機能停止（`scripts/` 移動が原因）を修正し、editor-time 検証 gate を引っ越し前と同等に復旧する。 |
| **Constraints** | ①検証ロジック（check-pc-version.mjs / check-rules-coverage.sh）は vibe-governance に単一正本維持・重複禁止 ②cwd / 起動場所非依存 ③既存 propagate-hooks の配布モデルに乗せる（hook ファイルは `.claude/hooks/`・他 11 hook と同一）④hook 解決失敗は fail-safe（exit 0・非ブロック）⑤司令塔が cross-repo 編集（vibe-base/.claude/ 配下）を行う — マスター承認済（A→B→C 指示）。 |
| **Success criteria** | vibe-base root + 全 12 product の settings.json が wrapper 経由 hook を持ち、wrapper が cwd 非依存で正本スクリプトを invoke し exit code を透過する。スモークテストが全件 EXIT 0。`check-in-verify.sh` に cross-repo 由来の新規 NG が出ない。 |
| **Reference patterns** | 既存 11 hook の `.claude/hooks/` 配布モデル / `repo-paths.mjs` の「env override → 兄弟ディレクトリ探索」解決パターン / A 群スキルが path-resolver 経由で cross-repo 資産を参照する確立パターン。 |
| **Trade-offs** | wrapper 2 ファイルが増えるが、検証ロジック本体の重複は回避（正本は vibe-governance に 1 つ）。wrapper は propagate-hooks が配布するため他 11 hook と同じ 1-source→N-copy モデルで、重複債務にはならない。env `VIBE_GOVERNANCE_ROOT` override も提供し非標準配置に対応。 |

---

## File Structure

| パス | 種別 | 責務 |
|---|---|---|
| `vibe-base/.claude/hooks/pc-version-gate.mjs` | 新規 | `check-pc-version.mjs` のラッパー（governance 解決 + spawn + 透過） |
| `vibe-base/.claude/hooks/rules-coverage-gate.mjs` | 新規 | `check-rules-coverage.sh` のラッパー（同上） |
| `vibe-base/.claude/settings.json` | 修正 | PostToolUse の 2 hook command を wrapper 参照へ書換 |
| `vibe-base/products/*/.claude/hooks/{pc-version-gate,rules-coverage-gate}.mjs` | 自動配布 | propagate-hooks が 12 product へ複製 |
| `vibe-base/products/*/.claude/settings.json` | 自動配布 | propagate-hooks が hooks 設定を同期 |
| `scripts/propagate-hooks.mjs` | 不変更 | `.mjs` 配布 + settings.json hooks 同期を既に実装済（確認のみ） |

---

## 役割分担表（必須・空欄禁止）

| エージェント | 担当タスク | 受領基準 | 報告先 |
|---|---|---|---|
| 司令塔 | Task 1〜5（全実装・cross-repo 編集はマスター承認済） | 各 Task の検証 cmd EXIT 0 | マスター |
| subagent (general-purpose) | 本 plan の plan-document-reviewer レビュー | 3 軸 PASS/FAIL 判定 | 司令塔 |
| プロダクト agent | 作業なし（settings.json / hooks は propagate-hooks が自動配布・手動編集不要） | — | — |

---

## Task 1: `pc-version-gate.mjs` ラッパー作成

**Files:**
- Create: `vibe-base/.claude/hooks/pc-version-gate.mjs`

- [ ] **Step 1: 受入条件確定**

1. `echo '{}' | node vibe-base/.claude/hooks/pc-version-gate.mjs` が EXIT 0（PC パス無し → check-pc-version が no-op）
2. cwd 非依存（vibe-governance / vibe-base どこから実行しても governance root を解決）
3. governance 解決失敗時は stderr 警告 + EXIT 0（非ブロック）
4. 子プロセス（check-pc-version.mjs）の stdout / exit code を透過

- [ ] **Step 2: 実装**

`vibe-base/.claude/hooks/pc-version-gate.mjs` を新規作成:

```javascript
#!/usr/bin/env node
// .claude/hooks/pc-version-gate.mjs
// PostToolUse(Write|Edit) hook ラッパー: vibe-governance の正本 check-pc-version.mjs を
// cross-repo で invoke する。段階 2 repo 分割で scripts/ が vibe-governance に移動したため、
// product 側 hook は兄弟 repo を解決して正本スクリプトを呼ぶ（正本は vibe-governance に 1 つ）。
//
// governance 解決順: env VIBE_GOVERNANCE_ROOT → 自身の位置から上昇し兄弟 vibe-governance を探索。
// 解決失敗時: stderr 警告 + exit 0（PostToolUse は非ブロック・fail-safe）。

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const TARGET_REL = 'scripts/check-pc-version.mjs';

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
  process.stderr.write('pc-version-gate: vibe-governance を解決できません（VIBE_GOVERNANCE_ROOT 未設定 + 兄弟探索失敗）。PC 表照合をスキップします。\n');
  process.exit(0);
}

const r = spawnSync('node', [path.join(govRoot, TARGET_REL)], {
  input: stdin,
  stdio: ['pipe', 'inherit', 'inherit'],
});
process.exit(r.status ?? 0);
```

- [ ] **Step 3: 検証コマンド実行**

```bash
cd /c/Users/user/Desktop/ClaudeCode && echo '{}' | node vibe-base/.claude/hooks/pc-version-gate.mjs; echo "EXIT=$?"
```

期待: 無出力（resolution 成功 → check-pc-version no-op）・`EXIT=0`。stderr に「解決できません」が出ないこと。

- [ ] **Step 4: コミット** — Task 3 でまとめてコミット（source 変更 3 件を 1 commit）。

---

## Task 2: `rules-coverage-gate.mjs` ラッパー作成

**Files:**
- Create: `vibe-base/.claude/hooks/rules-coverage-gate.mjs`

- [ ] **Step 1: 受入条件確定**

1. `echo '{}' | node vibe-base/.claude/hooks/rules-coverage-gate.mjs` が EXIT 0（FILE 空 → check-rules-coverage が no-op）
2. cwd 非依存
3. governance 解決失敗時は stderr 警告 + EXIT 0
4. 子プロセス（`bash check-rules-coverage.sh`）の stdout / exit code を透過

- [ ] **Step 2: 実装**

`vibe-base/.claude/hooks/rules-coverage-gate.mjs` を新規作成（Task 1 と同型・spawn 対象が `bash` + `.sh`）:

```javascript
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
```

- [ ] **Step 3: 検証コマンド実行**

```bash
cd /c/Users/user/Desktop/ClaudeCode && echo '{}' | node vibe-base/.claude/hooks/rules-coverage-gate.mjs; echo "EXIT=$?"
```

期待: 無出力・`EXIT=0`。stderr に「解決できません」が出ないこと。

- [ ] **Step 4: コミット** — Task 3 でまとめてコミット。

---

## Task 3: vibe-base root `settings.json` の 2 hook command 書換

**Files:**
- Modify: `vibe-base/.claude/settings.json`（PostToolUse の 2 ブロック）

- [ ] **Step 1: 受入条件確定**

1. `check-pc-version` の hook command が `node "$CLAUDE_PROJECT_DIR"/.claude/hooks/pc-version-gate.mjs`
2. `check-rules-coverage` の hook command が `node "$CLAUDE_PROJECT_DIR"/.claude/hooks/rules-coverage-gate.mjs`
3. JSON が valid（`node -e` 不使用 — `python -c json.load` か `node --check` 相当で確認）

- [ ] **Step 2: 実装**

`vibe-base/.claude/settings.json` の PostToolUse 内、以下 2 箇所を置換:

旧（その1）:
```json
            "command": "node \"$CLAUDE_PROJECT_DIR\"/scripts/check-pc-version.mjs",
```
新（その1）:
```json
            "command": "node \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/pc-version-gate.mjs",
```

旧（その2）:
```json
            "command": "bash \"$CLAUDE_PROJECT_DIR\"/scripts/check-rules-coverage.sh",
```
新（その2）:
```json
            "command": "node \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/rules-coverage-gate.mjs",
```

`statusMessage` 行は無変更。

- [ ] **Step 3: 検証コマンド実行**

```bash
cd /c/Users/user/Desktop/ClaudeCode && python -c "import json; json.load(open('vibe-base/.claude/settings.json')); print('JSON valid')" && grep -c 'gate.mjs' vibe-base/.claude/settings.json
```

期待: `JSON valid` 出力・`gate.mjs` 出現 2 件・`scripts/check-pc-version` と `scripts/check-rules-coverage` が settings.json から消えていること。

- [ ] **Step 4: コミット（vibe-base — source 変更）**

```bash
cd /c/Users/user/Desktop/ClaudeCode/vibe-base && git add .claude/hooks/pc-version-gate.mjs .claude/hooks/rules-coverage-gate.mjs .claude/settings.json && git commit -m "fix(hooks): cross-repo wrapper で check-pc-version/check-rules-coverage を復旧"
```

---

## Task 4: `propagate-hooks.mjs` 実行 → 全 product 配布 + 検証

**Files:**
- 自動更新: `vibe-base/products/*/.claude/hooks/` + `vibe-base/products/*/.claude/settings.json`

依存: Task 1〜3 完了後（配布元 = vibe-base root の hooks ファイル + settings.json が確定している必要がある）。

- [ ] **Step 1: 受入条件確定**

1. propagate-hooks 実行後、全 12 product の `.claude/hooks/` に `pc-version-gate.mjs` + `rules-coverage-gate.mjs` が存在（各 product 13 hook ファイル）
2. 全 12 product の `settings.json` hook command が wrapper 参照に同期
3. propagate-hooks が EXIT 0

- [ ] **Step 2: 実行**

```bash
cd /c/Users/user/Desktop/ClaudeCode/vibe-governance && node scripts/propagate-hooks.mjs
```

- [ ] **Step 3: 検証コマンド実行**

```bash
cd /c/Users/user/Desktop/ClaudeCode && echo "=== 各 product の wrapper 配布 + settings.json 参照 ===" && for p in vibe-base/products/*/; do n=$(basename "$p"); g=$(ls "$p.claude/hooks/" 2>/dev/null | grep -c 'gate.mjs'); s=$(grep -c 'gate.mjs' "$p.claude/settings.json" 2>/dev/null); echo "$n: hooks/gate.mjs=$g settings.json:gate.mjs=$s"; done
```

期待: 全 product で `hooks/gate.mjs` が 13 件中該当 2 を含む（pc-version-gate / rules-coverage-gate）かつ `settings.json:gate.mjs=2`。旧 `scripts/check-pc-version` 参照ゼロ。

- [ ] **Step 4: コミット（vibe-base — 配布結果）**

```bash
cd /c/Users/user/Desktop/ClaudeCode/vibe-base && git add products/ && git commit -m "chore(hooks): propagate-hooks で wrapper hook を全 product へ配布"
```

---

## Task 5: hook 発火スモークテスト + check-in-verify 回帰確認 + Check-out

**Files:**
- Test: なし（既存スクリプト実行のみ）
- Modify: `memory.md`（P1#4 更新）、`docs/ops/plans/2026-05-21-product-hook-cross-repo-fix.md`（本 plan・reviewer マーカー）

- [ ] **Step 1: 受入条件確定**

1. product 配布版 wrapper（例 coach）が cwd 非依存で resolution 成功・EXIT 0
2. PC 表パスを与えた実発火テストで check-pc-version が実走（mismatch 検知 or no-op）
3. `check-in-verify.sh` 両 cwd 実行で cross-repo 由来の新規 NG ゼロ（A-10 既存 NG = `scripts-residual-sorting` のみ）

- [ ] **Step 2: スモークテスト + 統合検証**

```bash
cd /c/Users/user/Desktop/ClaudeCode && echo "=== product 配布版 wrapper スモーク（coach）===" && echo '{}' | node vibe-base/products/coach/.claude/hooks/pc-version-gate.mjs; echo "pc EXIT=$?" && echo '{}' | node vibe-base/products/coach/.claude/hooks/rules-coverage-gate.mjs; echo "rules EXIT=$?" && echo "=== 実発火テスト（pc-progress.html パス付与）===" && echo '{"tool_input":{"file_path":"products/coach/pc-progress.html"}}' | node vibe-base/products/coach/.claude/hooks/pc-version-gate.mjs; echo "発火 EXIT=$?" && echo "=== check-in-verify 回帰確認 ===" && bash vibe-governance/scripts/check-in-verify.sh > /tmp/civ-c.log 2>&1; echo "EXIT=$?"; grep -E '^  (OK|NG|WARN):|^=== 集計' /tmp/civ-c.log
```

期待: スモーク 2 件 EXIT 0・実発火 EXIT 0（mismatch なければ）・check-in-verify は A-10 既存 NG 1 件のみ（cross-repo 新規 NG ゼロ）。

- [ ] **Step 3: memory.md 更新 + plan reviewer マーカー追記**

`memory.md` P1#4（旧 verify-rules-coverage MISS）を更新 or 完了消去し、本タスク完了を反映。本 plan ファイルに reviewer 完了マーカーを手動追記（vibe-governance cwd では SubagentStop hook 不発火のため）。完了した本 plan は `archive/` へ移動。

- [ ] **Step 4: コミット（vibe-governance）**

```bash
cd /c/Users/user/Desktop/ClaudeCode/vibe-governance && git add memory.md archive/2026-05-21-product-hook-cross-repo-fix.md && git commit -m "chore(checkout): product hook cross-repo 修復完了 + memory 更新"
```

---

## Risk & Rollback

| リスク | 検知方法 | ロールバック手順 |
|---|---|---|
| wrapper が governance 解決に失敗（兄弟配置でない環境） | Step 3 検証で stderr 警告出現 | env `VIBE_GOVERNANCE_ROOT` を `~/.claude/settings.json` に明示。fail-safe で exit 0 のため作業はブロックされない |
| `$CLAUDE_PROJECT_DIR` が想定外に解決され `.claude/hooks/` 不在 | スモークテスト ENOENT | wrapper は他 11 hook と同じ `$CLAUDE_PROJECT_DIR/.claude/hooks/` 形式。11 hook が動いている以上この形式は実績あり |
| propagate-hooks が settings.json hooks を完全置換し product 固有 hook を消す | Step 3 で hook 数確認 | propagate-hooks は元来 hooks 完全置換仕様（canonical = root settings.json）。product 固有 hook は元々存在しない設計 |
| check-in-verify A-10 が本 plan を NG 化 | Step 2 の check-in-verify ログ | 本 plan は Step 3 で `archive/` へ移動し A-10 scan 対象外にする（stage2-4 plan と同じ完了 plan 運用） |
| spawnSync の stdin 透過不全（hook が JSON を受け取れない） | 実発火テスト（pc-progress.html パス付与）で挙動異常 | wrapper の `input: stdin` + `stdio[0]='pipe'` で子へ確実に渡る。異常時は Task 1/2 の wrapper を修正 |

---

## Self-Review Checklist

- [ ] **Spec coverage:** 運用パリティ調査で判明した「product hook 2 件機能停止」を Task 1-4 で完全修復。Success criteria「wrapper 経由・cwd 非依存・回帰なし」を Task 5 で検証
- [ ] **No Placeholders:** 全コードブロックが実コード（wrapper 全文 + settings.json の旧→新完全置換文字列）
- [ ] **Type consistency:** `resolveGovernanceRoot()`（関数）/ `TARGET_REL`（const）/ `govRoot`（const）で 2 wrapper 間一貫
- [ ] **Glob 実体照合:** `pc-version-gate.mjs` / `rules-coverage-gate.mjs` のみ新規（vibe-base/.claude/hooks/ に現存しないこと確認済 — 既存 11 hook に該当名なし）。`settings.json` / `propagate-hooks.mjs` は現存
- [ ] **役割分担表:** 空欄なし・subagent reviewer 委任を含む
- [ ] **Verification Commands:** 全 Task に exact command + 期待 EXIT 0 を明記

---

## 必須 10 要素チェック

1. ✅ Goal: product hook 2 件を cross-repo wrapper で復旧
2. ✅ Architecture: `.claude/hooks/` ラッパー + governance 動的解決 + propagate-hooks 配布
3. ✅ Tech Stack: Node.js ESM / spawnSync / 既存 propagate-hooks（不変更）
4. ✅ File Structure: 新規 2 + 修正 1 + 自動配布の表
5. ✅ Task Decomposition: Task 1-5・各独立検証可能
6. ✅ Bite-Sized Steps: 各 Task 4 Step
7. ✅ Complete Code Blocks: wrapper 全文 + settings.json 完全置換文字列
8. ✅ Verification Commands: 各 Task Step 3 + Task 5 統合検証
9. ✅ No Placeholders: 抽象表現なし
10. ✅ Self-Review Checklist: 上記の通り

---

## Dependency Map

- Task 1, 2（wrapper 作成）→ 独立・並行可
- Task 3（settings.json 書換）→ Task 1,2 完了後（wrapper 名が確定している必要）
- Task 4（propagate-hooks 配布）→ Task 1,2,3 完了が前提（配布元確定）
- Task 5（検証 + Check-out）→ Task 1-4 全完了が前提

<!-- reviewer-stopped-at: 2026-05-21T00:00:00.000Z / verdict: PASS / agent_id: a77fd548deb0d169e -->
<!-- 3 軸（Completeness / Spec Coverage / Buildability）全 PASS。SubagentStop hook は vibe-governance cwd で不発火のため手動追記。 -->
