# 新 product 追加 SOP

新規 product を vibe-base に追加する際の標準手順。`.claude/` 配下の hook / settings.json / manifest 同期 / integrity check の全工程を網羅する。

本 SOP は memory.md P3 #2 「wrap-product-hooks.mjs JSON escape バグで 90 entries 一斉破壊」事案の再発防止策の一環として、**一括書換時は必ず `scripts/_lib/json-canary.mjs` を経由する** 規律を含む。

---

## 全体フロー (手順表)

| Step | 内容 | 検証 |
|------|------|------|
| Step 1 | `products/{name}/` ディレクトリ作成 + 基本構成配置 | `test -d products/{name}` |
| Step 2 | `CLAUDE.md` 配置 | `test -f products/{name}/CLAUDE.md` |
| Step 3 | `node scripts/propagate-hooks.mjs` を実行（hook 実体 + settings.json + 大義システムが自動配備される。手で書くな） | `ls products/{name}/.claude/hooks/plan-daigi-gate.mjs` |
| Step 4 | product 固有 hook が要る時だけ追加（root 由来の hook は触るな） | JSON.parse 妥当性 + integrity check |
| Step 5 | `scripts/generate-hook-manifest.mjs --write` で manifest 再生成 → `scripts/check-hook-integrity.mjs` で検証 | manifest 件数 + integrity exit 0 |
| Step 6 | `node scripts/init-product-repo.mjs --product={name}` で独立ローカル git リポ初期化（local-only・GitHub は必要時オンデマンド） | `test -d products/{name}/.git` かつ `git ls-files products/{name}` = 0 |

---

## Step 1: products/{name}/ ディレクトリ作成

```bash
mkdir -p products/{name}
cd products/{name}
```

product 名は kebab-case 推奨。例: `learning-suite-kanji`, `ai-concierge`。

depth 3 product (例: `products/{name}/{sub}/`) の場合は中間ディレクトリも作成。

---

## Step 2: CLAUDE.md 配置

`products/aiueo/CLAUDE.md` を雛形参考に、§0 (プロダクト定義表) / §1 (最重要ルール) / §2 (技術ルール) / §3 (デザイン仕様) を product 固有内容で記述。

最低限の項目:
- 名称・コンセプト・技術スタック・デプロイ先・フェーズ
- 最重要ルール (「勝手に変えるな」系の禁止事項)
- 技術ルール (使用フレームワーク・API)
- 禁止事項 (シークレット貼付禁止等は共通憲法から継承)

`@../../../vibe-governance/docs/ops/agent-rules.md` を import で継承する。

### 標準 @import 5 件 (基幹・新規 product CLAUDE.md 冒頭に必ず配置)

```
@../../.claude/rules/permission-defense.md
@../../.claude/rules/session-lifecycle.md
@../../.claude/rules/plan-mode.md
@../../.claude/rules/self-verification.md
@../../.claude/rules/orchestration-discipline.md
```

上記 5 件のみが「常時 @import」する**基幹ルール**（権限防御・セッション規律・plan 規律・自己検証・マルチエージェント統制）。**全タスク種別で毎セッション必要**なものに限定する (2026-06-06 運用近代化 Phase 1・公式 200 行 target 整合)。`orchestration-discipline.md` は複数 agent 並列展開規律 + plan 実走中問題発見 4 原則を内包し全 product 共通 (Session 2026-05-27 確立)。

> 進捗管理は Plan Mode（plan ファイル）で行う。pc-progress.html は配置しない。

#### path-scoped 化された作業限定ルール (常時 @import しない・該当ファイル編集時に自動ロード)

以下は `paths:` frontmatter による path-scoped 化済みのため、**新規 product CLAUDE.md に @import 行を書く必要はない**。該当作業のファイルを編集すると自動でロードされる。

- `skill-deployment.md` (`.claude/skills/**` 編集時) / `subagent-ops.md` (`.claude/agents/*.md` 編集時) / `structural-ops.md` (`products/**`・構造変更時) / `web-design.md` (html/css/app/lp 編集時) ほか作業限定 rule 全般。
- `notebooklm.md` はリサーチ作業時のもの (パス非依存)。`globs` で当該 SOP ファイル編集時のみ発火し、リサーチ作業自体はパス非依存のため `agent-rules.md` 安全弁でカバーする。常時 @import 不要。

---

## Step 3: hooks / settings.json 配備（手で書くな・1 コマンド）

```bash
node scripts/propagate-hooks.mjs
```

これだけでよい。root の共有 hook が **実体コピー**で `products/{name}/.claude/hooks/` に配られ、`settings.json`（`.claude/` ごと無い product も含む）が生成される。`ROOT_ONLY_HOOK_NAMES`（`scripts/_lib/root-only-hooks.mjs`）の root 専用 hook だけが除かれる。

**大義システム**（`session-start-handover-inject` / `plan-daigi-gate` / `roadmap-state-write-gate`）もこの経路で既定配備される。新 product は作った時点で「H2大義が不在＝マスターに仰げ」を毎セッション注入し、大義未確定のまま出された plan を deny する。**人手ゼロ**（2026-07-17 H2大義「大義システムを全 product へ配備し、新規 product にも既定で配備されること」）。

- **器（`roadmap.md` / `roadmap-state.json`）は作らない。不在が正しい初期状態**（大義未確定の product が大半でよい・CLAUDE.md §0）。マスターが大義を判定したら、その判定を `products/{name}/roadmap.md` に書き起こし、司令塔で `node scripts/init-product-roadmap.mjs {name}` を実行して器を作る。
- `.gitignore` whitelist の整合性に注意（新規サブディレクトリ追加時は `.claude/` whitelist に列を追加）。

> 旧手順（root 共有 hook を `$CLAUDE_PROJECT_DIR/../../.claude/hooks/...` の depth 2/3 参照で settings.json へ手書きする）は**実装と食い違っていた**ため 2026-07-17 に撤去。実装は昔から実体コピー方式（`propagate-hooks.mjs`）で、`$CLAUDE_PROJECT_DIR` は product ルートを指す。

---

## Step 4: product 固有 hook（要る時だけ）

product 固有の hook がある場合のみ `products/{name}/.claude/hooks/` に置き、settings.json へ登録する。**root 由来の hook 登録は触るな**（`propagate-hooks.mjs` が完全置換で上書きする。product 固有 hook のみで構成された entry は保持される）。

登録は hook-runner ラップ形式:

```json
{
  "type": "command",
  "command": "node \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/hook-runner.mjs --hook=<name> -- node \"$CLAUDE_PROJECT_DIR\"/.claude/hooks/<name>.mjs"
}
```

配置後 JSON 構文確認:

```bash
node -e "JSON.parse(require('fs').readFileSync('products/{name}/.claude/settings.json','utf-8'))"
```

---

## Step 5: manifest 同期 + integrity check

新 product 追加で hook 構成が変わるため、`scripts/hook-integrity-manifest.json` を再生成:

```bash
node scripts/generate-hook-manifest.mjs --write
```

その後 integrity check で全 product 整合性を確認:

```bash
node scripts/check-hook-integrity.mjs                          # root
node scripts/check-hook-integrity.mjs --target-dir products/{name}/  # 新 product
node scripts/check-hook-integrity.mjs --fixture-suite tests/fixtures/hook-integrity  # fixture 5/5
```

---

## Step 6: 独立ローカル git リポ初期化

全構成（CLAUDE.md / hooks / settings / manifest）配置後、新規 product を独立したローカル git リポとして初期化する。**新規 product はローカル git 独立スタート**（vibe-base モノレポに tracked させない・git status のディレクトリ横断汚染を根治）。

```bash
node scripts/init-product-repo.mjs --product={name}
```

このスクリプトは以下を自動実行する（`scripts/migrate-products-to-repos.mjs` の製品側処理を新規向けに抽出したもの）:

- `git init -b main`
- 標準 `.gitignore`（`scripts/_lib/standard-gitignore.txt`）配置
- 初回 commit（local-only・remote 無し）
- vibe-base root `.gitignore` に `products/{name}/` を追記（root が今後拾わない）

ガード:

- 既に `.git` を持つ製品は SKIP（冪等）
- root に tracked 済みの製品は ERROR で停止し `migrate-products-to-repos.mjs` へ誘導（新規専用のため）

検証:

```bash
test -d products/{name}/.git && echo "独立 .git あり"
git ls-files products/{name} | wc -l   # = 0（root 非追跡）
```

**GitHub 連携は必要時オンデマンド**（公開/共有が要る時に `gh repo create rahiseko-alt/{name} --private` → `git -C products/{name} remote add origin <url>` → `git -C products/{name} push -u origin main`）。ブランチ運用・公開手順の詳細は `docs/ops/git-branching-guide.md` を参照。

---

## 既存 product への一括変更時の規律 (重要)

複数 product の `.claude/settings.json` を一括書換する場合は **必ず `scripts/_lib/json-canary.mjs` を経由する**。

理由: memory.md P3 #2 [2026-05-25] にて wrap-product-hooks.mjs 初版で JSON escape バグにより 90 entries 一斉破壊事案発生。canary 経路で fixture 上の JSON.parse + diff 行数検証を強制することで再発防止。

経由方法:

```javascript
import { canaryTransform } from './scripts/_lib/json-canary.mjs';

await canaryTransform({
  fixture: 'tests/fixtures/json-canary/foodee-snapshot',
  transformFn: (content, targetPath) => /* transform */,
  targets: [/* 全 product settings.json path */],
  expectedDiffLines: 1,
});
```

canary FAIL 時は throw され target は変更されない (sha256 保証)。

---

## 関連参照

- `scripts/_lib/json-canary.mjs` — 一括変換 canary lib (本番改変 script の事故防止)
- `scripts/generate-hook-manifest.mjs` — manifest 自動生成 (untracked / 独立 git 含む和集合)
- `scripts/check-hook-integrity.mjs` — 4 軸整合性検査 + product style 自動判定
- `.claude/hooks/hook-runner.mjs` — 全 .mjs hook の structured log wrapper + kill-switch (env / flag file)
- `memory.md` P3 #2 — wrap-product-hooks.mjs 破壊事案根拠
- `memory.md` P4 — settings.json subagent HARD BLOCK / fixture 方式

---

## 完了チェック (新 product 追加後)

- [ ] `products/{name}/` ディレクトリ作成済
- [ ] CLAUDE.md / 基本構成配置済
- [ ] `.claude/settings.json` JSON.parse 成功
- [ ] `node scripts/check-hook-integrity.mjs --target-dir products/{name}/` exit 0
- [ ] `node scripts/generate-hook-manifest.mjs --write` 実行・manifest backup あり
- [ ] `node scripts/check-hook-integrity.mjs --fixture-suite tests/fixtures/hook-integrity` 5/5 PASS
- [ ] `node scripts/init-product-repo.mjs --product={name}` 実行済 — `test -d products/{name}/.git` かつ `git ls-files products/{name}` = 0（独立ローカルリポ化）
