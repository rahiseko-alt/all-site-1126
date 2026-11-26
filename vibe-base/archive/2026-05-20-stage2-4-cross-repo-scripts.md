# 段階 2 工程 2-4: 検証 script の cross-repo 対応化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans。Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `vibe-governance/scripts/` 配下の検証 script を、products が兄弟 repo `vibe-base` に分離した後でも cwd 非依存で動作させ、`check-in-verify.sh` を vibe-governance / vibe-base いずれの cwd から実行しても cross-repo 由来の NG（A-4/A-5/A-6/A-7/A-12 + products ループ）がゼロになる状態にする。

**Architecture:** 新規 shared helper `scripts/repo-paths.mjs` が「governanceRoot（script 自身が属する repo）」と「productsRepoRoot（兄弟 vibe-base）」を解決する。governanceRoot は `import.meta.url` から導出（cwd 非依存）、productsRepoRoot は env `VIBE_PRODUCTS_ROOT` → 兄弟 `../vibe-base` の順で解決。各 script はハードコード相対パス（`products/`・`.claude/settings.json`）をこの 2 ルートからの絶対パスに置換する。`.sh` script は helper を CLI（`--governance-root` / `--products-root`）経由で呼ぶ。

**Tech Stack:** Node.js ESM（`.mjs`）、Bash、既存 `path-resolver.mjs`（CLI `resolve-paths.mjs` 経由・本工程では変更しない）。

---

## 前提（auto mode のため 5 軸を明文化・brainstorming 質問はスキップ）

| 軸 | 内容 |
|---|---|
| **Purpose** | 段階 2 repo 分割（governance / products / audits の 3 repo）後、検証 script 群が単独 repo 構造を前提に書かれており動作不能。これを解消し Check-in 機械検証を復旧する。 |
| **Constraints** | ①`path-resolver.mjs`（独立 repo `claude-skills-base`）は変更しない ②運用方針「cd で cwd 都度切替」（Session 302 マスター確定）と整合 = script は cwd 非依存にする ③productsRepoRoot は zero-config（兄弟ディレクトリ規約）を基本とし env override を許す ④hook ファイル本体（`.claude/hooks/*` の内部ロジック）は本工程スコープ外。 |
| **Success criteria** | `check-in-verify.sh` を vibe-governance cwd / vibe-base cwd の双方から実行し、cross-repo 由来 NG がゼロ（既存の A-10 plan 品質 NG 3 件は別タスク扱い・後述 Risk 参照）。 |
| **Reference patterns** | 既存 `propagate-hooks.mjs` の `findSettingsJsonFiles` 再帰探索パターン / `resolve-paths.mjs` の CLI ラッパーパターン / memory P4#9 の env-override パターン。 |
| **Trade-offs** | env-only にすると `~/.claude/settings.json` 編集が必須で新環境セットアップが増える。兄弟規約 first にすると 3 repo を `ClaudeCode/` 直下に並置する制約が固定化するが、memory P4#4「3 机構想」が既にこれを設計前提としているため採用。 |

---

## File Structure

| パス | 種別 | 責務 |
|---|---|---|
| `scripts/repo-paths.mjs` | 新規 | governanceRoot + productsRepoRoot 解決の shared helper（mjs import + CLI） |
| `scripts/propagate-hooks.mjs` | 修正 | `ROOT` を productsRepoRoot に置換 |
| `scripts/check-settings-spec.mjs` | 修正 | chdir 先を productsRepoRoot 化・productPaths 動的探索化・propagate-hooks 参照を governanceRoot 絶対パス化 |
| `scripts/check-skills-spec.mjs` | 修正 | `VIBE_SKILLS` を productsRepoRoot 化・A-6.6 scan を 2 root 分割 |
| `scripts/check-lesson-slides-canonical.mjs` | 修正 | `TARGET` を productsRepoRoot 化 |
| `scripts/check-pc-version.mjs` | 修正 | `TEMPLATE_PATH` を governanceRoot 絶対パス化 |
| `scripts/check-in-verify.sh` | 修正 | GOV/PRODUCTS 解決・全 `node scripts/*` と `products/*` と `git` を絶対パス/`-C` 化 |
| `scripts/verify-rules-coverage.sh` | 修正 | `BASE_DIR` ハードコードを GOV/PRODUCTS 分割に置換 |
| `scripts/check-rules-coverage.sh` | 修正 | `BASE_DIR` fallback と RELPATH 抽出を 2 repo 名対応化 |
| `.claude/rules/session-lifecycle.md` | 修正 | check-in-verify / propagate-hooks の実行手順記述を cross-repo 版に更新 |

---

## 役割分担表（必須・空欄禁止）

| エージェント | 担当タスク | 受領基準 | 報告先 |
|---|---|---|---|
| 司令塔 | Task 1〜10（全実装） | 各 Task の検証 cmd EXIT 0 | マスター |
| subagent (Explore) | Task 0 事前調査（実施済・本 plan に反映済） | 報告反映済 | 司令塔 |
| subagent (general-purpose) | 本 plan の plan-document-reviewer レビュー | 3 軸 PASS/FAIL 判定 | 司令塔 |
| プロダクト agent | 本工程では作業なし（vibe-base 側ファイルは司令塔が cross-repo で読むのみ・書込なし） | — | — |

---

## Task 1: shared helper `scripts/repo-paths.mjs` 新規作成

**Files:**
- Create: `scripts/repo-paths.mjs`

- [ ] **Step 1: 受入条件確定**

1. `node scripts/repo-paths.mjs --governance-root` が vibe-governance 絶対パスを 1 行出力し EXIT 0
2. `node scripts/repo-paths.mjs --products-root` が vibe-base 絶対パスを 1 行出力し EXIT 0
3. cwd が vibe-base / 任意の product 配下でも上記 2 が同じ結果（governanceRoot は `import.meta.url` 由来で cwd 非依存）
4. mjs から `import { governanceRoot, getProductsRepoRoot }` で使用可能
5. vibe-base 不在環境では `--products-root` が stderr にメッセージを出し EXIT 1

- [ ] **Step 2: 実装**

```javascript
#!/usr/bin/env node
// scripts/repo-paths.mjs
// 段階 2 repo 分割後の workspace 構成を解決する shared helper。
// - governanceRoot   : 本 scripts/ を含む repo（vibe-governance）。import.meta.url 由来で cwd 非依存。
// - productsRepoRoot : products/ + .claude/settings.json を持つ兄弟 repo（vibe-base）。
//                      解決順: env VIBE_PRODUCTS_ROOT → 兄弟 ../vibe-base → 失敗時 throw。
//
// CLI:
//   node scripts/repo-paths.mjs --governance-root
//   node scripts/repo-paths.mjs --products-root
// mjs:
//   import { governanceRoot, getProductsRepoRoot } from './repo-paths.mjs';

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const governanceRoot = path.resolve(__dirname, '..');

function hasDir(d, name) {
  try { return fs.statSync(path.join(d, name)).isDirectory(); } catch { return false; }
}
function hasFile(d, rel) {
  try { return fs.statSync(path.join(d, rel)).isFile(); } catch { return false; }
}
function isProductsRepo(d) {
  return !!d && hasDir(d, 'products') && hasFile(d, path.join('.claude', 'settings.json'));
}

function resolveProductsRepoRoot() {
  const env = process.env.VIBE_PRODUCTS_ROOT;
  if (env && isProductsRepo(env)) return path.resolve(env);
  const sibling = path.join(path.dirname(governanceRoot), 'vibe-base');
  if (isProductsRepo(sibling)) return sibling;
  throw new Error(
    'productsRepoRoot 解決失敗: products/ + .claude/settings.json を持つ vibe-base が見つかりません。\n' +
    `  env VIBE_PRODUCTS_ROOT = ${env || '(未設定)'}\n` +
    `  兄弟探索パス           = ${sibling}`
  );
}

let _cached;
export function getProductsRepoRoot() {
  if (_cached === undefined) _cached = resolveProductsRepoRoot();
  return _cached;
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] || '').href;
if (isMain) {
  const flag = process.argv[2];
  try {
    if (flag === '--governance-root') {
      process.stdout.write(governanceRoot + '\n');
    } else if (flag === '--products-root') {
      process.stdout.write(getProductsRepoRoot() + '\n');
    } else {
      process.stderr.write('Usage: node scripts/repo-paths.mjs [--governance-root|--products-root]\n');
      process.exit(1);
    }
  } catch (e) {
    process.stderr.write(String(e.message || e) + '\n');
    process.exit(1);
  }
}
```

- [ ] **Step 3: 検証コマンド実行**

```bash
cd /c/Users/user/Desktop/ClaudeCode/vibe-governance && node scripts/repo-paths.mjs --governance-root && node scripts/repo-paths.mjs --products-root && (cd /c/Users/user/Desktop/ClaudeCode/vibe-base && node /c/Users/user/Desktop/ClaudeCode/vibe-governance/scripts/repo-paths.mjs --products-root)
```

期待: 3 行出力（governance パス / vibe-base パス / vibe-base パス）・全 EXIT 0。3 行目（cwd=vibe-base でも同結果）で cwd 非依存を確認。

- [ ] **Step 4: コミット**

```bash
git add scripts/repo-paths.mjs
git commit -m "feat(scripts): add repo-paths.mjs — cross-repo root resolver (stage 2-4)"
```

---

## Task 2: `propagate-hooks.mjs` を productsRepoRoot 化

**Files:**
- Modify: `scripts/propagate-hooks.mjs:8-13`

- [ ] **Step 1: 受入条件確定**

1. `ROOT` が vibe-base を指す（settings.json / products/ / .claude/hooks/ すべて vibe-base 配下）
2. cwd 非依存で実行成功（ENOENT が出ない）

- [ ] **Step 2: 実装**

`scripts/propagate-hooks.mjs` の import 部と ROOT 定義（現 8-13 行）を以下に置換:

旧:
```javascript
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
```
新:
```javascript
import fs from 'fs';
import path from 'path';
import { getProductsRepoRoot } from './repo-paths.mjs';

// 段階 2 分割後: hooks/settings/products は兄弟 repo vibe-base に存在する
const ROOT = getProductsRepoRoot();
```

以降の `ROOT` 参照（rootSettingsJsonPath / productsDir / rootHooksDir 等）は無変更。

- [ ] **Step 3: 検証コマンド実行**

```bash
cd /c/Users/user/Desktop/ClaudeCode/vibe-governance && node scripts/propagate-hooks.mjs
```

期待: `N/M hooks updated` 等 5 行のサマリ出力・EXIT 0・ENOENT なし。

- [ ] **Step 4: コミット**

```bash
git add scripts/propagate-hooks.mjs
git commit -m "fix(scripts): propagate-hooks — resolve ROOT to vibe-base via repo-paths (stage 2-4)"
```

---

## Task 3: `check-settings-spec.mjs` の cross-repo 化

**Files:**
- Modify: `scripts/check-settings-spec.mjs:13-31`（ROOT/chdir/productPaths）
- Modify: `scripts/check-settings-spec.mjs:149`（propagate-hooks 参照）

- [ ] **Step 1: 受入条件確定**

1. chdir 先が productsRepoRoot（git check-ignore / ls-files / products settings 読込が vibe-base 基準で成立）
2. productPaths が `products/` 配下の `.claude/settings.json` を再帰探索で動的取得（13 ハードコード廃止）
3. E-1/E-3 の `scripts/propagate-hooks.mjs` 読込が governanceRoot 絶対パスで成立
4. EXIT 0（全 PASS or WARN のみ）

- [ ] **Step 2: 実装**

(2-a) 現 13-31 行を以下に置換:

旧:
```javascript
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
process.chdir(ROOT);

const SECRET_PATTERN = /npg_|sb_secret_|GOCSPX-|AIzaSy|sk_test_|sk_live_|BEGIN.*PRIVATE KEY|r8_aW/;

const productPaths = [
  'ai-concierge', 'ai-concierge/app', 'aiueo', 'aiueo/app/frontend', 'aiueo/lp',
  'coach', 'foodee', 'homepage', 'kobaraku', 'learning-suite-kanji',
  'omotenashi-trainer', 'review-analysis', 'ymm-shorts',
];
const settingsJsonFiles = [
  '.claude/settings.json',
  ...productPaths.map(p => `products/${p}/.claude/settings.json`),
];
const settingsLocalFiles = settingsJsonFiles.map(f => f.replace('settings.json', 'settings.local.json'));
```
新:
```javascript
import { governanceRoot, getProductsRepoRoot } from './repo-paths.mjs';

const productsRepoRoot = getProductsRepoRoot();
process.chdir(productsRepoRoot);

const SECRET_PATTERN = /npg_|sb_secret_|GOCSPX-|AIzaSy|sk_test_|sk_live_|BEGIN.*PRIVATE KEY|r8_aW/;

// products/ 配下の .claude/settings.json を再帰探索（node_modules / .git 除外）
function findProductSettings(dir, results = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) findProductSettings(full, results);
    else if (e.name === 'settings.json' && path.basename(dir) === '.claude') {
      results.push(path.relative(productsRepoRoot, full).replace(/\\/g, '/'));
    }
  }
  return results;
}
const settingsJsonFiles = [
  '.claude/settings.json',
  ...findProductSettings(path.join(productsRepoRoot, 'products')).sort(),
];
const settingsLocalFiles = settingsJsonFiles.map(f => f.replace('settings.json', 'settings.local.json'));
```

注: `import { fileURLToPath } from 'url';`（現 11 行）は他に用途がなくなるため削除する。`path` / `fs` / `execSync` の import は残す。

(2-b) 現 149 行の propagate-hooks 読込を置換:

旧:
```javascript
const propagateScript = fs.readFileSync('scripts/propagate-hooks.mjs', 'utf8');
```
新:
```javascript
const propagateScript = fs.readFileSync(path.join(governanceRoot, 'scripts/propagate-hooks.mjs'), 'utf8');
```

- [ ] **Step 3: 検証コマンド実行**

```bash
cd /c/Users/user/Desktop/ClaudeCode/vibe-governance && node scripts/check-settings-spec.mjs; echo "EXIT=$?"
```

期待: `集計: ✅ N PASS ...` 出力・`EXIT=0`。

- [ ] **Step 4: コミット**

```bash
git add scripts/check-settings-spec.mjs
git commit -m "fix(scripts): check-settings-spec — cross-repo paths + dynamic product discovery (stage 2-4)"
```

---

## Task 4: `check-skills-spec.mjs` の cross-repo 化

**Files:**
- Modify: `scripts/check-skills-spec.mjs:6-12`（VIBE_BASE/VIBE_SKILLS）
- Modify: `scripts/check-skills-spec.mjs:134-159`（A-6.6 SCAN_PATHS）

- [ ] **Step 1: 受入条件確定**

1. `VIBE_SKILLS` が productsRepoRoot/.claude/skills を指す
2. A-6.6 が governance 側パス（docs/ops・.claude/rules・scripts・memory・memory.md・CLAUDE.md）を governanceRoot から、products 側パス（.claude/hooks・.claude/settings.json）を productsRepoRoot からスキャン
3. EXIT 0

- [ ] **Step 2: 実装**

(4-a) 現 6-12 行を置換:

旧:
```javascript
import fs from 'fs';
import path from 'path';
import os from 'os';

const USER_SKILLS = path.join(os.homedir(), '.claude', 'skills');
const VIBE_BASE = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const VIBE_SKILLS = path.join(VIBE_BASE, '.claude', 'skills');
```
新:
```javascript
import fs from 'fs';
import path from 'path';
import os from 'os';
import { governanceRoot, getProductsRepoRoot } from './repo-paths.mjs';

const USER_SKILLS = path.join(os.homedir(), '.claude', 'skills');
const productsRepoRoot = getProductsRepoRoot();
const VIBE_SKILLS = path.join(productsRepoRoot, '.claude', 'skills');
```

(4-b) 現 134-159 行（A-6.6 ブロック）を置換:

旧:
```javascript
console.log('\n--- A-6.6: vibe-base 配下に 事業戦略 literal 混入なし（agent 配布物 + 設定 + メモリ + スクリプト）---');
const SCAN_PATHS = [
  '.claude/rules', '.claude/hooks', '.claude/settings.json',
  'CLAUDE.md', 'docs/ops', 'memory', 'MEMORY.md', 'memory.md',
  'scripts', '.gitignore',
];
let vibeViolations = [];
for (const sp of SCAN_PATHS) {
  const abs = path.join(VIBE_BASE, sp);
  if (!fs.existsSync(abs)) continue;
  const stat = fs.statSync(abs);
  const files = stat.isFile() ? [abs] : scanDir(abs);
  for (const f of files) {
    // archive/ + node_modules は除外
    if (f.includes(`${path.sep}archive${path.sep}`) || f.includes('node_modules')) continue;
    const content = fs.readFileSync(f, 'utf-8');
    if (ABSOLUTE_PATH_REGEXES.some((r) => r.test(content))) {
      vibeViolations.push(path.relative(VIBE_BASE, f));
    }
  }
}
if (vibeViolations.length === 0) {
  pass('vibe-base 配下に 事業戦略 literal 混入なし');
} else {
  fail(`vibe-base に literal 混入: ${vibeViolations.join(', ')}`);
}
```
新:
```javascript
console.log('\n--- A-6.6: 両 repo 配下に 事業戦略 literal 混入なし（agent 配布物 + 設定 + メモリ + スクリプト）---');
// 段階 2 分割後: governance 側と products 側で配布物が 2 repo に分散する
const SCAN_TARGETS = [
  { root: governanceRoot,   paths: ['.claude/rules', 'CLAUDE.md', 'docs/ops', 'memory', 'memory.md', 'scripts', '.gitignore'] },
  { root: productsRepoRoot, paths: ['.claude/hooks', '.claude/settings.json', '.gitignore'] },
];
let vibeViolations = [];
for (const { root, paths } of SCAN_TARGETS) {
  for (const sp of paths) {
    const abs = path.join(root, sp);
    if (!fs.existsSync(abs)) continue;
    const stat = fs.statSync(abs);
    const files = stat.isFile() ? [abs] : scanDir(abs);
    for (const f of files) {
      if (f.includes(`${path.sep}archive${path.sep}`) || f.includes('node_modules')) continue;
      const content = fs.readFileSync(f, 'utf-8');
      if (ABSOLUTE_PATH_REGEXES.some((r) => r.test(content))) {
        vibeViolations.push(path.relative(root, f));
      }
    }
  }
}
if (vibeViolations.length === 0) {
  pass('両 repo 配下に 事業戦略 literal 混入なし');
} else {
  fail(`literal 混入: ${vibeViolations.join(', ')}`);
}
```

- [ ] **Step 3: 検証コマンド実行**

```bash
cd /c/Users/user/Desktop/ClaudeCode/vibe-governance && node scripts/check-skills-spec.mjs; echo "EXIT=$?"
```

期待: `集計` 出力・`EXIT=0`（WARN は許容）。

- [ ] **Step 4: コミット**

```bash
git add scripts/check-skills-spec.mjs
git commit -m "fix(scripts): check-skills-spec — split scan across governance/products repos (stage 2-4)"
```

---

## Task 5: `check-lesson-slides-canonical.mjs` の cross-repo 化

**Files:**
- Modify: `scripts/check-lesson-slides-canonical.mjs:35-41`

- [ ] **Step 1: 受入条件確定**

1. `TARGET` が productsRepoRoot/products/coach/lesson-slides.html を指す
2. coach 不在環境では `SKIP` 出力・EXIT 0（既存挙動維持）

- [ ] **Step 2: 実装**

現 35-41 行を置換:

旧:
```javascript
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// vibe-base ルート = このスクリプトの親（scripts/）の親
const VIBE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const TARGET = resolve(VIBE_ROOT, "products/coach/lesson-slides.html");
```
新:
```javascript
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { getProductsRepoRoot } from "./repo-paths.mjs";

// 段階 2 分割後: coach は兄弟 repo vibe-base に存在する
const TARGET = resolve(getProductsRepoRoot(), "products/coach/lesson-slides.html");
```

- [ ] **Step 3: 検証コマンド実行**

```bash
cd /c/Users/user/Desktop/ClaudeCode/vibe-governance && node scripts/check-lesson-slides-canonical.mjs; echo "EXIT=$?"
```

期待: `SKIP: products/coach/lesson-slides.html 不在`（coach に lesson-slides.html がなければ）または `OK`・`EXIT=0`。

- [ ] **Step 4: コミット**

```bash
git add scripts/check-lesson-slides-canonical.mjs
git commit -m "fix(scripts): check-lesson-slides — resolve coach target via repo-paths (stage 2-4)"
```

---

## Task 6: `check-pc-version.mjs` の TEMPLATE_PATH 絶対パス化

**Files:**
- Modify: `scripts/check-pc-version.mjs:12-15`

- [ ] **Step 1: 受入条件確定**

1. `TEMPLATE_PATH` が governanceRoot/docs/standards/templates/pc-template.html を指す（cwd 非依存）
2. 引数なし呼び出しでは従来どおり no-op EXIT 0

- [ ] **Step 2: 実装**

現 12-15 行を置換:

旧:
```javascript
import { readFileSync } from "fs";
import { resolve, basename, dirname } from "path";

const TEMPLATE_PATH = resolve("docs/standards/templates/pc-template.html");
```
新:
```javascript
import { readFileSync } from "fs";
import { resolve, basename, dirname } from "path";
import { governanceRoot } from "./repo-paths.mjs";

const TEMPLATE_PATH = resolve(governanceRoot, "docs/standards/templates/pc-template.html");
```

- [ ] **Step 3: 検証コマンド実行**

```bash
cd /c/Users/user/Desktop/ClaudeCode/vibe-governance && node scripts/check-pc-version.mjs; echo "EXIT=$?"
```

期待: 無出力・`EXIT=0`（引数なし no-op）。

- [ ] **Step 4: コミット**

```bash
git add scripts/check-pc-version.mjs
git commit -m "fix(scripts): check-pc-version — absolute TEMPLATE_PATH via governanceRoot (stage 2-4)"
```

---

## Task 7: `check-in-verify.sh` を cwd 非依存・cross-repo 化

**Files:**
- Modify: `scripts/check-in-verify.sh`（下記 13 箇所）

依存: Task 1〜6 完了後に着手（呼び出すサブスクリプトが先に cross-repo 化されている必要がある）。

- [ ] **Step 1: 受入条件確定**

1. 冒頭で `GOV`（自 repo ルート・`$0` 由来）と `PRODUCTS`（repo-paths.mjs `--products-root`）を解決
2. 全 `node scripts/X.mjs` を `node "$GOV/scripts/X.mjs"` に置換
3. 全 `products/*/` ループを `"$PRODUCTS"/products/*/` に置換
4. `docs/ops/plans/` を `"$GOV/docs/ops/plans/"` に置換
5. git 操作を対象 repo に `-C` 付与（B-4=GOV / E-2=PRODUCTS / A-12 residual=GOV）
6. A-12 の resolve-paths 呼び出しは cwd を `$PRODUCTS` にして実行
7. vibe-governance cwd / vibe-base cwd の双方から実行して cross-repo 由来 NG ゼロ

- [ ] **Step 2: 実装（13 箇所の編集）**

**編集 1** — `set +e`（8 行）直後に GOV/PRODUCTS 解決を挿入:
```bash
set +e

# 段階 2 分割後: GOV=本 script の repo / PRODUCTS=兄弟 vibe-base
GOV="$(cd "$(dirname "$0")/.." && pwd)"
PRODUCTS="$(node "$GOV/scripts/repo-paths.mjs" --products-root)"
if [ -z "$PRODUCTS" ]; then
  echo "FATAL: productsRepoRoot 解決失敗（vibe-base 不在 or repo-paths.mjs 異常）"
  exit 1
fi
```

**編集 2** — A-1（19 行）: `node scripts/check-pc-version.mjs` → `node "$GOV/scripts/check-pc-version.mjs"`

**編集 3** — B-4（36-39 行）: `git ls-files` → `git -C "$GOV" ls-files`（scripts/設定は governance 側）。該当ブロック:
```bash
OLD_PATH_FILES=$(git -C "$GOV" ls-files '*.mjs' '*.sh' '*.json' '*.gs' 2>/dev/null \
  | grep -v '^archive/' \
  | grep -v '^scripts/check-in-verify\.sh$' \
  | (cd "$GOV" && xargs grep -ln "$OLD_PATH_PATTERN" 2>/dev/null))
```

**編集 4** — D-3（55 行）: `for d in products/*/` → `for d in "$PRODUCTS"/products/*/`（`p=$(basename "$d")`・`$d/CLAUDE.md`・`$d/runbook.md` は絶対パス化された `$d` でそのまま成立）

**編集 5** — E-2（82-83 行）: `git status` → `git -C "$PRODUCTS" status`（xlsx / settings.local は vibe-base 側）:
```bash
XLSX_DIRTY=$(git -C "$PRODUCTS" status --short 2>/dev/null | grep -cE '\.xlsx$|\.xlsm$' || echo 0)
SETTINGS_DIRTY=$(git -C "$PRODUCTS" status --short 2>/dev/null | grep -c 'settings.local.json' || echo 0)
```

**編集 6** — A-4（90 行）: `node scripts/propagate-hooks.mjs` → `node "$GOV/scripts/propagate-hooks.mjs"`

**編集 7** — A-5（115 行）: `node scripts/check-settings-spec.mjs` → `node "$GOV/scripts/check-settings-spec.mjs"`

**編集 8** — A-6（130 行）: `node scripts/check-skills-spec.mjs` → `node "$GOV/scripts/check-skills-spec.mjs"`

**編集 9** — A-7（145 行）: `node scripts/check-lesson-slides-canonical.mjs` → `node "$GOV/scripts/check-lesson-slides-canonical.mjs"`

**編集 10** — A-9（159-164 行）: MEMORY_PATHS を 2 root 化。
```bash
MEMORY_PATHS="$GOV/memory.md"
for d in "$PRODUCTS"/products/*/; do
  if [ -f "$d/CLAUDE.md" ]; then
    MEMORY_PATHS="$MEMORY_PATHS ${d}memory.md"
  fi
done
```
注: vibe-base ルートの「薄宣言 memory.md」は agent 作業 memory.md ではない repo 宣言ファイルのため A-9 対象外（P1-P4 構造を持たない）。

**編集 11** — A-10（217・221 行）: `if [ -d "docs/ops/plans" ]` → `if [ -d "$GOV/docs/ops/plans" ]`、`for f in docs/ops/plans/*.md` → `for f in "$GOV"/docs/ops/plans/*.md`、`node scripts/check-plan-quality.mjs` → `node "$GOV/scripts/check-plan-quality.mjs"`

**編集 12** — A-12（273 行）: resolve-paths を cwd=PRODUCTS で実行。
```bash
(cd "$PRODUCTS" && node ~/.claude/skills/_shared/resolve-paths.mjs --vibe-root) > /tmp/resolver-vibe.log 2>&1
```
同 A-12（281-282 行）: `if [ -d "products/coach" ]` → `if [ -d "$PRODUCTS/products/coach" ]`、`cd products/coach` → `cd "$PRODUCTS/products/coach"`

**編集 13** — A-12（292 行）: live residual の `git ls-files` → `git -C "$GOV" ls-files`（docs/scripts は governance 側）

- [ ] **Step 3: 検証コマンド実行**

```bash
cd /c/Users/user/Desktop/ClaudeCode/vibe-governance && bash scripts/check-in-verify.sh > /tmp/civ-gov.log 2>&1; echo "GOV-EXIT=$?"; cd /c/Users/user/Desktop/ClaudeCode/vibe-base && bash /c/Users/user/Desktop/ClaudeCode/vibe-governance/scripts/check-in-verify.sh > /tmp/civ-vb.log 2>&1; echo "VB-EXIT=$?"; grep -E '^  (OK|WARN|NG):|NG \(|NG:' /tmp/civ-gov.log /tmp/civ-vb.log
```

期待: 両 cwd で集計が一致（cwd 非依存）。NG は A-10 既存 plan 品質 3 件のみ（cross-repo 由来 A-4/A-5/A-6/A-7/A-12 NG ゼロ）。

- [ ] **Step 4: コミット**

```bash
git add scripts/check-in-verify.sh
git commit -m "fix(scripts): check-in-verify — cwd-independent cross-repo orchestration (stage 2-4)"
```

---

## Task 8: `verify-rules-coverage.sh` + `check-rules-coverage.sh` の cross-repo 化

**Files:**
- Modify: `scripts/verify-rules-coverage.sh:5-7`、`:59`、`:87`
- Modify: `scripts/check-rules-coverage.sh:12-13`

- [ ] **Step 1: 受入条件確定**

1. `verify-rules-coverage.sh` が rules/docs/ops/CLAUDE.md を governanceRoot、products を productsRepoRoot から参照
2. `check-rules-coverage.sh` の BASE_DIR fallback と RELPATH 抽出が vibe-base / vibe-governance 双方の path を処理
3. `verify-rules-coverage.sh` 単独実行が EXIT 0 または既知の MISS のみ

- [ ] **Step 2: 実装**

(8-a) `verify-rules-coverage.sh` 現 5-7 行を置換:

旧:
```bash
BASE_DIR="/c/Users/user/Desktop/vibe-base"
RULES_DIR="$BASE_DIR/.claude/rules"
OPS_DIR="$BASE_DIR/docs/ops"
```
新:
```bash
GOV="$(cd "$(dirname "$0")/.." && pwd)"
PRODUCTS="$(node "$GOV/scripts/repo-paths.mjs" --products-root)"
RULES_DIR="$GOV/.claude/rules"
OPS_DIR="$GOV/docs/ops"
```

(8-b) `verify-rules-coverage.sh` 現 59 行を置換:

旧:
```bash
for PCLAUD in "$BASE_DIR"/products/*/CLAUDE.md; do
```
新:
```bash
for PCLAUD in "$PRODUCTS"/products/*/CLAUDE.md; do
```

(8-c) `verify-rules-coverage.sh` 現 87 行を置換:

旧:
```bash
LINES=$(wc -l < "$BASE_DIR/CLAUDE.md")
```
新:
```bash
LINES=$(wc -l < "$GOV/CLAUDE.md")
```

(8-d) `check-rules-coverage.sh` 現 12-13 行を置換（BASE_DIR fallback と RELPATH 抽出を 2 repo 対応化）:

旧:
```bash
BASE_DIR="${CLAUDE_PROJECT_DIR:-/c/Users/user/Desktop/vibe-base}"
RELPATH=$(echo "$FILE" | sed 's|.*/vibe-base/||')
```
新:
```bash
BASE_DIR="${CLAUDE_PROJECT_DIR:-/c/Users/user/Desktop/ClaudeCode/vibe-governance}"
RELPATH=$(echo "$FILE" | sed 's|.*/vibe-governance/||;s|.*/vibe-base/||')
```

注: `check-rules-coverage.sh` は現在どの `.claude/hooks/` にも配線されていない orphan（vibe-base/.claude/hooks/ に不在）。本工程ではハードコード除去のみ行い、hook 再配線の要否は別途マスター判断とする。

- [ ] **Step 3: 検証コマンド実行**

```bash
cd /c/Users/user/Desktop/ClaudeCode/vibe-governance && bash scripts/verify-rules-coverage.sh > /tmp/vrc.log 2>&1; echo "EXIT=$?"; tail -8 /tmp/vrc.log
```

期待: `=== サマリ ===` 出力・SOP 総数 > 0・@import 検査が products を走査（`[OK]`/`[MISS]` が出力される）。`vibe-base` 不在で products ループが空回りしないこと。

- [ ] **Step 4: コミット**

```bash
git add scripts/verify-rules-coverage.sh scripts/check-rules-coverage.sh
git commit -m "fix(scripts): rules-coverage scripts — drop hardcoded vibe-base path (stage 2-4)"
```

---

## Task 9: `session-lifecycle.md` の実行手順記述を更新

**Files:**
- Modify: `.claude/rules/session-lifecycle.md`（hook伝播 / 機械検証スクリプト実行の 2 段落）

- [ ] **Step 1: 受入条件確定**

1. `propagate-hooks` / `check-in-verify` の実行手順が「vibe-base ルートで」ではなく cross-repo 版に更新
2. cwd 非依存で動作する旨を明記（vibe-governance / vibe-base どちらからでも可）

- [ ] **Step 2: 実装**

`session-lifecycle.md` の Check-in 節「hook伝播」「機械検証スクリプト実行」の記述を、現状の「vibe-baseルートで実行」前提から以下趣旨に修正する:

旧趣旨: 「vibe-base ルートで `node scripts/propagate-hooks.mjs` を実行」「vibe-base ルートで `bash scripts/check-in-verify.sh`」

新趣旨:
```
- **hook伝播 / 機械検証:** scripts は vibe-governance/scripts/ に集約され cwd 非依存（段階 2 工程 2-4 で cross-repo 対応化）。
  vibe-governance ルートで `node scripts/propagate-hooks.mjs` と `bash scripts/check-in-verify.sh` を実行せよ。
  vibe-base cwd からは `node ../vibe-governance/scripts/propagate-hooks.mjs` 等フルパスで呼べる。
  productsRepoRoot は兄弟 vibe-base を自動解決（env VIBE_PRODUCTS_ROOT で override 可）。
```

実際の編集は該当 2 段落の現行文言を Read で確認した上で、上記趣旨に沿った最小差分で行う（段落構造は維持）。

- [ ] **Step 3: 検証コマンド実行**

```bash
cd /c/Users/user/Desktop/ClaudeCode/vibe-governance && grep -n 'propagate-hooks\|check-in-verify' .claude/rules/session-lifecycle.md
```

期待: 更新後の記述に「vibe-base ルートで」前提の旧文言が残っていない。

- [ ] **Step 4: コミット**

```bash
git add .claude/rules/session-lifecycle.md
git commit -m "docs(rules): session-lifecycle — update script invocation for cross-repo layout (stage 2-4)"
```

---

## Task 10: 統合検証 + Check-out

**Files:**
- Test: なし（既存 script の実行のみ）
- Modify: `memory.md`（P1#1 完了消去）、`docs/ops/plans/2026-05-20-stage2-4-cross-repo-scripts.md`（本 plan・reviewer マーカー）

- [ ] **Step 1: 受入条件確定**

1. `check-in-verify.sh` を vibe-governance cwd / vibe-base cwd の双方から実行 → 集計が一致
2. cross-repo 由来 NG（A-4/A-5/A-6/A-7/A-12）がゼロ
3. 残存 NG は A-10 既存 plan 品質 3 件のみ（本工程スコープ外・Risk 参照）
4. memory.md P1#1 を完了消去し次タスクへ更新

- [ ] **Step 2: 統合検証実行**

```bash
cd /c/Users/user/Desktop/ClaudeCode/vibe-governance && bash scripts/check-in-verify.sh > /tmp/civ-final-gov.log 2>&1; echo "GOV=$?"; cd /c/Users/user/Desktop/ClaudeCode/vibe-base && bash /c/Users/user/Desktop/ClaudeCode/vibe-governance/scripts/check-in-verify.sh > /tmp/civ-final-vb.log 2>&1; echo "VB=$?"; diff <(grep -E '^--- A-|^  (OK|NG|WARN):' /tmp/civ-final-gov.log) <(grep -E '^--- A-|^  (OK|NG|WARN):' /tmp/civ-final-vb.log) && echo "両 cwd 一致"
```

期待: `両 cwd 一致` 出力。両ログで A-4/A-5/A-6/A-7/A-12 が `OK`。

- [ ] **Step 3: memory.md 更新 + plan reviewer マーカー追記**

P1#1 を完了消去（工程 2-4 完了）、段階 2 を「全工程完了」に更新。P3 は客観 7 基準非該当なら登録不要。本 plan ファイルに reviewer 完了マーカーを手動追記（vibe-governance cwd では SubagentStop hook 不発火のため）。

- [ ] **Step 4: コミット**

```bash
git add memory.md docs/ops/plans/2026-05-20-stage2-4-cross-repo-scripts.md
git commit -m "chore(checkout): stage 2-4 完遂 — cross-repo scripts + memory 更新"
```

---

## Risk & Rollback

| リスク | 検知方法 | ロールバック手順 |
|---|---|---|
| `repo-paths.mjs` が vibe-base を誤検出（worktree `vibe-base-plan-mode` を拾う） | `node scripts/repo-paths.mjs --products-root` 出力目視 | sibling 探索は名称 `vibe-base` 完全一致のため誤検出しない。万一は env `VIBE_PRODUCTS_ROOT` で明示 override |
| check-in-verify A-10 が既存 plan 品質 NG 3 件で EXIT 1 のまま | `/tmp/civ-final-*.log` の A-10 セクション | **本工程スコープ外**。`2026-05-19-prep-task-x.md`（完了済）/`stage2-2`（完了済）はアーカイブ、`scripts-residual-sorting.md` は P1#3 で対応。工程 2-4 の受入は「cross-repo 由来 NG ゼロ」で判定し A-10 plan 品質 NG は別管理 |
| A-9 で vibe-base 薄宣言 memory.md が P1-P4 欠落 NG | `/tmp/civ-final-*.log` A-9 | 編集 10 で MEMORY_PATHS から vibe-base ルート memory.md を除外済（governance + product のみ対象） |
| サブスクリプト個別修正で他 check が回帰 | 各 Task Step 3 の EXIT 0 確認 | 該当 Task の単一 commit を `git revert` |
| `check-rules-coverage.sh` が orphan のまま（hook 未配線） | `ls vibe-base/.claude/hooks/` に不在 | 本工程はハードコード除去のみ。hook 再配線要否はマスター判断（plan 注記済） |

---

## Self-Review Checklist

- [ ] **Spec coverage:** memory P1#1 の達成条件「check-in-verify cross-repo EXIT 0」を Task 7+10 でカバー。3 named scripts（propagate-hooks/rules-coverage/check-in-verify）= Task 2/8/7。サブスクリプト = Task 3/4/5/6
- [ ] **No Placeholders:** 全コードブロックが実コード（旧→新の完全な置換文字列）。抽象語なし
- [ ] **Type consistency:** `governanceRoot`（const export）/ `getProductsRepoRoot()`（関数 export）/ `productsRepoRoot`（各 script ローカル const）で章間一貫
- [ ] **Glob 実体照合:** `scripts/repo-paths.mjs` のみ新規（現存しないこと確認済）。他 9 ファイルは現存（Read 済）
- [ ] **役割分担表:** 空欄なし・subagent 委任型（Explore / general-purpose reviewer）を含む
- [ ] **Verification Commands:** 全 Task に exact command + 期待 EXIT 0 を明記

---

## 必須 10 要素チェック

1. ✅ Goal: cross-repo で check-in-verify EXIT 0（cross-repo 由来 NG ゼロ）
2. ✅ Architecture: repo-paths.mjs が 2 root 解決・各 script が絶対パス化
3. ✅ Tech Stack: Node.js ESM / Bash / 既存 path-resolver（不変更）
4. ✅ File Structure: 新規 1 + 修正 9 の表
5. ✅ Task Decomposition: Task 1-10・各独立検証可能
6. ✅ Bite-Sized Steps: 各 Task 4 Step・1 Step 数分
7. ✅ Complete Code Blocks: 旧→新の完全置換文字列
8. ✅ Verification Commands: 各 Task Step 3 + Task 10 統合検証
9. ✅ No Placeholders: 抽象表現なし
10. ✅ Self-Review Checklist: 上記の通り

---

## Dependency Map

- Task 1（helper）→ Task 2,3,4,5,6 が依存
- Task 2,3,4,5,6 → Task 7（check-in-verify はサブスクリプト先行修正が前提）が依存
- Task 8,9 は Task 1 のみ依存（Task 7 と並行可）
- Task 10 は Task 1-9 全完了が前提

<!-- reviewer-stopped-at: 2026-05-20T00:00:00.000Z / verdict: PASS / agent_id: adc53c3a620d5e293 -->
<!-- 3 軸（Completeness / Spec Coverage / Buildability）全 PASS。SubagentStop hook は vibe-governance cwd で不発火のため手動追記。 -->

