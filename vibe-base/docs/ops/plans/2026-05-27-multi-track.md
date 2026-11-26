# Multi-Track 同時進行計画 (2026-05-27 司令塔セッション)

## Context

前セッション (2026-05-26) で Vibe-Governance を vibe-base にモノレポ統合 (`c0a456f`) し、Plan Mode 再設計を formally close した。残作業 23 件 + memory.md P1 引継ぎ 2 件を抱えた状態。マスター指示「全てのミッションを同時進行・サブエージェント / バックエージェントを複数展開」。本計画は track 分割 + agent 割当 + 並列度設計を提示し、マスター承認後に Wave 単位で起動する。

正本: `docs/ops/plans/2026-05-27-multi-track.md` (実装着手後にコピー保存・area-gate plans エリア対応)。本ファイル (`~/.claude/plans/pure-meandering-dove.md`) は Plan Mode harness が指定した一時 path。

## Wave 1 完了状況 (2026-05-27 Plan Mode 再入時点)

| Track | 状態 | 主要結果 |
|-------|-----|---------|
| A | ✅ 完了 | 46 dead-link → 0 / rules 4 ファイル更新 / CLAUDE.md L62 訂正 (未 commit) |
| B-W1 | ✅ 完了 | 18 ソース (H:9 / M:9) / 既存 7 軸重複 0 件 / 4 兄弟統合案 4 件提示 |
| D-W1 | ✅ 完了 | 11/11 全 product P4#0 status `×` / 既存 runbook.md 全件存在 (完全準拠 3 / 部分 2 / 標準 6) |
| G | ✅ 完了 | 既修復済 (`4d1adc4`)・現状 17/17 OK / 修正案 = stderr 1 行追加 |
| K | ✅ 完了 | **memory P4 訂正**: HARD BLOCK = DENY ではなく PROMPT (承認 1 回で通過) / 8 ソース / Track F/G/I 全て代替経路あり |

### Wave 1 由来の計画修正 (Plan Mode 再入で反映)

#### 修正 1: Track D-W2 改訂
- 「新規生成」→「**追記モード + テンプレ整合補正**」
- 品質 3 区分対応 (完全準拠 3 / 部分 2 / 標準 6)

#### 修正 2: Track M 新設 (CLAUDE.md スリム化)
- Track A 副次発見 (65 行 > 60 行上限)
- Wave 2 末配置 (Wave 3 統合後)

#### 修正 3: Track G 縮退
- area-gate.mjs 本体は既に `4d1adc4` で修復済
- catch 内 stderr 追加 1 行のみ master 手動 → **Edit + 承認 1 回** に変更 (Track K 結果反映)

#### 修正 4: Wave 3 を Wave 2 に統合 (Track K 重大発見の反映)
- Track F/G は `.claude/hooks/*.mjs` が pre-edit.sh 正規表現対象外 → Edit ツール + CC Protected Path 承認 1 回で通過可
- Track I は `claude --add-dir ~/.claude/skills` で新セッション起動 + Write で配備可能
- 結果: **Wave 3 廃止**・F/G/I は Wave 2 に統合
- 残 Wave 3 候補: Track C (nlm login 待ち) と Track H (logger bug) のみ → **Wave 2 末 + master 手動完了報告後** に再編

#### 修正 5: Track L-4 経路確定
- `.claude/agents/verify-agent.md` 編集は Edit + 承認 1 回経路 (Layer A) で通過可
- 別経路設計不要

#### 修正 6: memory.md P4 訂正項目 (Check-out 時必須)
- 旧記述: 「`.claude/hooks/*.mjs` 編集は Self-Modification HARD BLOCK で user authorization でも解除不可」
- 新記述: 「`.claude/hooks/*.mjs` 編集は CC Protected Path で **PROMPT** (承認 1 回で通過)・pre-edit.sh HARD BLOCK は `.claude/agents|skills|commands/` のみ対象」
- 影響: メモ帳ナビ 三種の神器 (P4 [2026-05-26]) は手動編集の最終手段として残置・通常運用は Edit 経路

## 上位 plan からの constraint 変更

- なし (drifting plan チェーンは前セッションで formally close)。本計画は独立した運用 track 集合

## 影響範囲

| 領域 | 影響内容 |
|------|---------|
| 13 product CLAUDE.md | `@../../../vibe-governance/...` → `@../../...` 一括置換 (60 件) |
| `.claude/rules/` 2 ファイル | subagent-ops.md / session-lifecycle.md の旧 path 記述更新 |
| `vibe-base/CLAUDE.md` | L62 `.sh` → `.mjs` 訂正 |
| `products/code-review-skills/` | 4 兄弟 spec.md + SKILL.md 配置 |
| `products/google-system-dev/CLAUDE.md` | §1-§5 確定 (NotebookLM 認証後) |
| 11 product PC 表 | P4#0 Runbook 通過処理 |
| 4 product memory.md | failures.md 移管残 |
| `.claude/hooks/secret-write-gate.mjs` | fail-closed 化 (マスター手動・HARD BLOCK) |
| `.claude/hooks/area-gate.mjs` | exit≠0 原因調査 |

## Track 分割と agent 割当

### Track A — Governance 参照修正 [H優先・他作業の前提条件]
- **担当:** `general-purpose` foreground
- **作業:**
  1. 13 product CLAUDE.md の `@../../../vibe-governance/` → `@../../` 60 件一括置換 (canary lib 経由を検討・対象が JSON でなく markdown なので直接 sed 系で可)
  2. `.claude/rules/subagent-ops.md` の「バックアップは vibe-governance/.claude/agents/」記述を vibe-base 配下に更新
  3. `.claude/rules/session-lifecycle.md` の memory.md パステーブルから「vibe-governance/memory.md」記述削除 / 「vibe-base モノレポ司令塔」へ書換え
  4. `vibe-base/CLAUDE.md` L62 `pre-write-glob-check.sh` → `.mjs`
- **検証:** `grep -r "vibe-governance" --include="CLAUDE.md" --include="*.md" -l | wc -l` で 0 件確認 (ただし `archive/` / git 履歴言及は除外)
- **実行モード:** foreground (Edit/Write 必要)

### Track B — code-review-skills プロジェクト推進 [P1#1]
- **担当 (Wave 1):** `research-analyst` background — 軸 8 シミュレーション手法リサーチ (リサーチ v2 は完了済なので軸 8 だけ補完)
- **担当 (Wave 2):** `general-purpose` foreground — 4 兄弟 (only-now / 3m / 6m / 1year) spec.md → SKILL.md 配置
- **マスター承認段階で停止:** SKILL.md 配置後にマスター確認待ち
- **参照:** `products/code-review-skills/docs/research-bank/code-review-philosophy-2026.html` (7 軸 101 ソース)
- **実行モード:** Wave 1 = background (read-only) / Wave 2 = foreground (Write 必要)

### Track C — google-system-dev 初期設計 [P1#2]
- **担当:** マスター手動 (`nlm login` 再認証) → 完了後に司令塔 foreground で CLAUDE.md §1-§5 書込
- **本セッションでの司令塔作業:** 認証待ちの間は他 track 進行・認証完了報告受領後に着手
- **停止点:** nlm login = master 専用・本計画では待機 track として扱う
- **実行モード:** master 手動 + foreground

### Track D — PC 表 P4#0 Runbook ガバナンス [H優先]
- **担当 (Wave 1):** `explore-agent` background — 11 product の P4#0 Runbook 未通過状態を確認 + 既存 Runbook テンプレ (`docs/standards/templates/runbook-template.md`) 確認 ✅ 完了
- **Wave 1 判明事項 (2026-05-27 更新):** 既存 runbook.md は **11/11 全 product に存在** (品質: 完全準拠 3 / 部分実装 2 / 標準 6)。P4#0 status は全 product `×` (未通過)。「新規生成」ではなく **「追記モード + テンプレ整合補正」** が正しいアプローチ
- **担当 (Wave 2 改訂):** `general-purpose` foreground — 既存 runbook.md を Read → テンプレ (`docs/standards/templates/runbook-template.md` §1-§6) との差分検出 → 不足セクション追記 + TBD 項目埋込 + テンプレ不準拠箇所の正規化 (上書き禁止・追記 / 整合補正のみ)
- **Wave 2 作業詳細:**
  1. **完全準拠 3 件 (aiueo / ai-concierge / foodee):** 内容検証のみ・必要なら微調整・PC 表 P4#0 status `×` → `○`
  2. **部分実装 2 件 (coach / homepage):** §1-§3 既存 + §5 (プロダクト固有情報) 6 項目を追記 + §4/§6 不足分補完
  3. **標準実装 6 件 (kobaraku / learning-suite-kanji / learning-suite-kanji-foreign / omotenashi-trainer / review-analysis / ymm-shorts):** PC 表 P4#0 rationale から外部依存・デプロイ先を抽出 → §5 反映 + 全 6 セクション整合確認
- **検証 (改訂):** 各 product runbook.md に §1〜§6 全セクション存在確認 (`grep -c "^##" products/{X}/runbook.md >= 6`) + PC 表 P4#0 status `○` + `tmp/pc-progress-audit.html` 再走で H 件数 11→0
- **実行モード:** Wave 1 = background ✅ / Wave 2 = foreground

### Track E — failures.md 移管残 [M優先]
- **担当:** `general-purpose` foreground (sequential 推奨・並列 Write 禁止 memory 教訓に従う)
- **対象 4 product:**
  1. `learning-suite-kanji-foreign/memory.md` P3 5 件 (長文経緯混入)
  2. `ymm-shorts/memory.md` P3 1 件 (禁止語混入)
  3. `learning-suite-kanji/memory.md` P3 1 件
  4. `google-system-dev/memory.md` P3 1 件
- **作業:** P3 を 1 失敗 1 行に短縮 → 該当 product `failures.md` に移管 → memory.md P3 を pointer 化
- **実行モード:** foreground (Edit/Write 必要・1 message 1 Write 原則)

### Track F — secret-write-gate fail-closed 化 [M優先・Track K 訂正後 → 司令塔直経路]
- **担当:** orchestrator 直 Edit (Track K で経路訂正・元: マスター手動メモ帳ナビ)
- **作業:** `.claude/hooks/secret-write-gate.mjs` の `catch (e) { process.exit(0); }` → `process.exit(2)` を Edit
- **経路:** Edit ツール → CC Protected Path PROMPT → マスター承認クリック 1 回 → 完了
- **検証 (Edit 後):** `echo '{"tool_name":"Write","tool_input":{"file_path":"test.txt","content":"abc"}}' | node .claude/hooks/secret-write-gate.mjs` で EXIT 0 (シークレットなし通過)
- **propagate:** `node scripts/propagate-hooks.mjs` で全 16 product 配布
- **実行モード:** orchestrator foreground (Edit ツール)

### Track G — area-gate.mjs catch stderr 追加 [M優先・Wave 1 で原因確定済]
- **Wave 1 結果:** 直近 25 回 exit≠0 は `commit 241547c` の literal newline 混入 SyntaxError が原因・`commit 4d1adc4` で 17/17 location 修復済・**現状本体修正不要**
- **残作業 (縮退):** catch ブロックに `process.stderr.write('[area-gate] error: ' + e.message + '\n')` 1 行追加 (将来の異常を hook-errors.jsonl に残すため)
- **担当:** orchestrator 直 Edit (Track K で経路訂正・元: マスター手動)
- **経路:** Edit ツール → CC Protected Path PROMPT → マスター承認クリック 1 回
- **propagate:** Edit 後 propagate-hooks.mjs で 17 location 配布
- **検証:** fixture (`tests/fixtures/area-gate-repro/` 既配置) で挙動確認 → EXIT 0
- **実行モード:** orchestrator foreground

### Track H — area-gate.mjs 修正提案受領後の hook-errors.jsonl logger bug 修正 [L優先]
- **担当:** `debugger` foreground
- **作業:** malformed record 34 件の原因調査 + logger 修正
- **実行モード:** foreground

### Track I — checkout 仕組み完遂 [M優先・前セッション #6 残・Track K 訂正後]
- **Track K 結果反映:** `~/.claude/skills/checkout/SKILL.md` は新規ファイル + project dir 外 → **`claude --add-dir ~/.claude/skills` 新セッション起動 + Write** で配備可能。元案 (Self-Modification HARD BLOCK 回避経路なし) は誤認
- **担当:** master + orchestrator (新セッション + 直 Write)
- **作業 (2 ステップ):**
  1. **Step 1 (本セッション):** `~/.claude/skills/checkout/SKILL.md` 本体内容を本セッション中に確定 + `tmp/checkout-skill-md.md` に下書き出力 (project dir 内なので Write 可)
  2. **Step 2 (master 手動):** 新セッション `claude --add-dir ~/.claude/skills` で起動 → orchestrator 直 Write で `~/.claude/skills/checkout/SKILL.md` 配置
  3. **Step 3 (本セッション 残):** `/checkout` slash command を 17 location (vibe-base + 15 product) 配備 — `.claude/commands/checkout.md` は project 内なので通常経路で Write 可
- **検証:** `ls ~/.claude/skills/checkout/SKILL.md` + 17 location の `.claude/commands/checkout.md` 存在 (`ls .claude/commands/checkout.md products/*/.claude/commands/checkout.md | wc -l == 17`)
- **実行モード:** master + orchestrator foreground

### Track K — Self-Modification HARD BLOCK 正当性検証 + 回避経路調査 [H優先・Wave 3 前提]
- **担当:** `research-analyst` background
- **背景:** マスター指摘「HARD BLOCK = 負の遺産と感じる素人考え。なぜ存在するか・削除リスク・回避方法を調査せよ」
- **調査項目:**
  1. **なぜ存在するか:** Claude Code 公式 docs (https://docs.claude.com/en/docs/claude-code/) + Anthropic security model から HARD BLOCK の設計意図を文書化 (denial intent / AI 自己改変防止 / RCE 攻撃面遮断 等)
  2. **削除/緩和時のリスク:** AI が自身の hook / settings.json / agents を自律的に書換える経路が開放された場合の脅威モデル列挙 (prompt injection 経由の権限昇格 / hook 無効化による全防御層 bypass 等)
  3. **既知の回避モード調査:** `--dangerously-skip-permissions` / `bypassPermissions` mode / `.allow-skill-edit` / `.allow-destructive` 等の正規バイパス機構の存在・適用条件・制約を公式 docs から抽出
  4. **回避経路の安全性評価:** 各回避モードが本セッション Track F/G/I に適用可能か・適用時の追加リスク・マスター承認規律
  5. **代替経路設計:** HARD BLOCK 維持下での Track F/G/I 完遂経路 (現行: マスター手動編集 / 候補: bypass mode 一時起動 / orchestrator 直 Write の境界条件再確認)
- **受け入れ条件:** 上記 5 項目を `tmp/hard-block-investigation.html` に集約 + 公式 docs 引用 URL 併記 + Wave 3 着手可否 (Track F/G/I 各々) を判定表で提示
- **テスト方法:** 提示された回避経路 (もしあれば) を fixture で実機検証 → 実際に Track F/G/I のいずれか 1 件で適用可能か demo (本番非破壊)
- **実行モード:** background (read-only 調査 + WebFetch / WebSearch 使用可)
- **完遂期限:** Wave 2 完了時点

### Track J — aiueo テスト残 [M優先・前セッション #17 残]
- **担当:** `general-purpose` foreground or `backend-engineer-agent` foreground
- **作業:**
  1. 既配置 `tax-utils.test.js` を commit (PASS 済・未 commit 状態)
  2. 残 4 utils (csv-export / menu-translations / receipt-printer / role-auth) のテスト追加
- **理由:** 前セッション #17 で tax-utils のみ配置 + 全 PASS だが未 commit + 他 utils 未着手
- **検証:** `cd products/aiueo/app/frontend && npm run test:*` 全 PASS + git status clean
- **実行モード:** foreground

### Track M — CLAUDE.md スリム化 [L優先・別ミッション化・Track A 副次発見]
- **担当:** `general-purpose` foreground
- **背景:** Track A 完了時に `rules-coverage-gate` hook が「CLAUDE.md が 65 行・上限 60 行超」warning を発出。Track A の Edit は delta = 0 (1 行置換) なので **Track A 起因ではない既存問題**。マスター指示で別ミッション化
- **作業:**
  1. `CLAUDE.md` (65 行) を Read → 削減候補抽出
  2. §5.2 / §5.3 / §5.4 の重複説明を `.claude/rules/` への pointer 1 行に圧縮
  3. §7 の plan-mode 詳細記述を `docs/standards/plan-mode.md` への pointer に圧縮
  4. 改訂履歴行 (v5.9 + pointer) は 1 行維持
  5. 目標: 60 行以下に削減 + `rules-coverage-gate` warning 解消
- **制約:**
  - §1-§6 の主要規律は削除禁止 (rules への参照置換のみ可)
  - 削除する記述は事前にマスター承認必要 (default モード)
  - 削減前後で `rules-coverage-gate` hook 単体起動 PASS 確認
- **受け入れ条件:**
  - `wc -l CLAUDE.md` 結果 ≤ 60
  - `rules-coverage-gate` hook 単体起動 EXIT 0 + warning 無し
  - `grep -c "^## " CLAUDE.md` で §0-§7 + 改訂履歴の H2 全件存在 (8 件)
  - vibe-base/CLAUDE.md 起動時の自動注入確認 (test Read で内容到達)
- **配置時期:** Wave 3 末 or 次セッション (本セッション完遂は条件付き)
- **実行モード:** foreground

### Track L — 受け入れ基準精度担保 4 段深層防御アーキテクチャ [H優先・本セッション以降の全 plan に適用]

- **背景:** マスター指示「Goal の受け入れ条件は必ず検証可能な項目にする仕組み構築・1-4 全て対象・無秩序な全部盛り禁止・俯瞰して最適構成・実装難易度高でも可・精度担保最優先」
- **採用方針:** 案 1-4 を異なるゲートポイントに配置する深層防御。同種チェックの重複を避け、各 stage 単機能化で false positive を分散
- **全体検証:** 本計画書自体に 4 段すべての hook を適用し self-verify で通過確認 (dogfooding)

#### サブ Track L-1: Stage 1 — plan Write **直前** schema 検証 (PreToolUse hook)
- **担当:** `general-purpose` foreground
- **配置:** `.claude/hooks/plan-schema-gate.mjs` 新規作成
- **検証対象:** plan ファイル content の構造 schema
  - H2「## 受け入れ基準」セクション存在
  - H2「## 機械検証可能条件」セクション存在 (plan-mode.md canonical 準拠)
  - プレースホルダ `[コマンド]` `TBD` `TODO` `後で記入` 残存 0 件
  - 各受入条件項目が「番号 + 名詞 + 検証手段」のテンプレ準拠
- **EARS 仕様:** `WHEN path に "plans/" を含むファイルへの Write/Edit が実行される THE SYSTEM SHALL plan schema 全 4 条件を検証する`
- **settings.json:** PreToolUse matcher `Write|Edit` 追加
- **受け入れ条件:**
  - fixture 配置: `tests/fixtures/plan-schema/{ok, missing-h2, placeholder-残, template-violation}/` の 4 ケース配置
  - 各 fixture × hook 単体起動で OK ケース exit 0 / 3 NG ケース block decision JSON
  - 自己適用: 本計画書 (`pure-meandering-dove.md`) hook 通過 (self-verify)

#### サブ Track L-2: Stage 2 — plan Write **直後** keyword gate (PostToolUse hook)
- **担当:** `general-purpose` foreground
- **配置:** `.claude/hooks/ac-keyword-gate.mjs` 新規作成
- **検証対象:** plan ファイル受け入れ基準内の機械検証 keyword 存在
  - 検査 keyword: `EXIT 0` / `Glob:` / `git diff` / `npm run` / `test -f` / `sha256` / `wc -l` / `grep -c` のいずれか
  - 「## 受け入れ基準」H2 内に keyword 1 件以上存在 → exit 0
  - 欠落時 → block decision JSON
- **EARS 仕様:** `WHEN path に "plans/" を含むファイルへの Write/Edit が完了する THE SYSTEM SHALL 受け入れ基準 H2 内に機械検証 keyword が存在することを確認する`
- **settings.json:** PostToolUse matcher `Write|Edit` 追加
- **Stage 1 との責務分離:** Stage 1 = 構造 / Stage 2 = 内容 (keyword) — keyword 検査を Stage 1 で重複させない
- **受け入れ条件:** Stage 1 と同形式の fixture 4 ケース + 単体 hook 起動 + 自己適用 self-verify

#### サブ Track L-3: Stage 3 — `/plan-finalize` 完全性確認拡張
- **担当:** `general-purpose` foreground (slash command 拡張)
- **配置:** `.claude/commands/plan-finalize.md` 既存ファイル拡張
- **検証対象 (ExitPlanMode 直前ゲート):**
  - 全受け入れ基準項目に「実コマンド + 期待 EXIT/出力」入力済 (writing-plans skill の `Run:/Expected:` 形式準拠)
  - 各検証コマンドが verify-agent dry-run で構文エラー 0 (Bash parse OK)
  - 検証コマンドが「## 機械検証可能条件」セクションと相互整合 (Glob 結果数・EXIT code・diff --stat 等)
- **動作シナリオ:**
  1. `/plan-finalize <plan-path>` 実行
  2. plan を Read → 受け入れ基準セクション全項目を抽出
  3. 各項目の `Run:` 行を verify-agent (Haiku) に dry-run 委譲 (syntax check のみ・実行はしない)
  4. dry-run 全 PASS → 既存の承認後モード判定へ進む
  5. dry-run NG or 未入力検出 → マスター報告 + 入力促進
- **Stage 2 との責務分離:** Stage 2 = keyword 1 件以上存在 / Stage 3 = 全項目の実コマンド入力済 + 構文 OK
- **受け入れ条件:**
  - test plan (受入条件 5 項目すべて記入済・1 項目だけプレースホルダ) で `/plan-finalize` 実行 → 該当 1 項目報告
  - 全項目記入済 plan → 承認後モード判定セクションに到達

#### サブ Track L-4: Stage 4 — 実装完遂判定 (`/goal` + verify-agent 統合)
- **担当:** `general-purpose` foreground + `research-analyst` background (Track K と並行・`/goal` 公式仕様調査)
- **配置:**
  - `.claude/agents/verify-agent.md` description 拡張: 「受入基準内の検証 keyword を全実行して PASS/FAIL 表を返す + transcript ベース意味判定 (Worker/Evaluator 分離)」
  - `docs/standards/plan-mode.md` canonical に Stage 4 統合仕様追記
  - 新規: `.claude/skills/goal-verify/SKILL.md` (option) — `/goal` completion condition に「verify-agent 全 PASS」を設定するヘルパー
- **動作シナリオ (Worker/Evaluator 分離・公式 best-practices 準拠):**
  1. ExitPlanMode 承認後、implement-agent が実装を実行 (Worker = Opus/Sonnet)
  2. 実装完了時、orchestrator が verify-agent (Evaluator = Haiku) を起動
  3. verify-agent が plan の受け入れ基準 1 項目ずつコマンド実行 + 結果を表形式返却
  4. 全 PASS → 完遂確定・commit へ進む
  5. 部分 PASS or 全 FAIL → orchestrator に再実装指示 (loop)
- **Stage 3 との責務分離:** Stage 3 = 構文 dry-run (実行しない) / Stage 4 = 実行 + transcript 評価
- **受け入れ条件:**
  - verify-agent 単体起動: 本計画書を入力 → 受け入れ基準 12 項目の合否表返却
  - dummy plan (1 項目 PASS / 1 項目 FAIL を仕込み) → verify-agent が正しく分離判定
  - Worker/Evaluator 分離検証: verify-agent description で「実装は行わない」「実行と判定のみ」を明示

#### Track L 全体 受け入れ条件 (4 stage 統合 self-verify)
- L-1〜L-4 各 stage の個別受け入れ条件すべて PASS
- 本計画書 `pure-meandering-dove.md` を全 4 stage に通して **全 stage PASS** (dogfooding)
- propagate-hooks.mjs で全 16 product 配布完了 + dry-run EXIT 0
- `docs/standards/plan-mode.md` canonical に「4 段深層防御」セクション追記 + 公式 4 思想 (証拠ベース / 評価者分離 / EARS / hooks 決定論) 統合記述
- 既存 plan `~/.claude/plans/` 配下の 4 plan を新 hook に通し、現行品質と比較レポート出力 (`tmp/plan-quality-comparison.html`)

#### Track L 実装難易度評価
- L-1: 中 (PreToolUse hook + 構造 grep + プレースホルダ正規表現)
- L-2: 低 (PostToolUse hook + keyword grep)
- L-3: 中 (slash command 拡張 + verify-agent dry-run 連携)
- L-4: 高 (`/goal` 仕様調査 + Worker/Evaluator 分離設計 + verify-agent description 拡張 + loop 制御)

#### Track L 実行モード / 完遂期限
- 実行モード: foreground (hook + slash command + agent 編集を含む)
- 完遂期限: Wave 2 末 (Track K の HARD BLOCK 結果を Stage 4 設計に反映してから実装着手)
- HARD BLOCK 依存: Stage 4 で `.claude/agents/verify-agent.md` 編集が必要 → Track K 結果次第で master 手動経路 or orchestrator 直経路を選択

## Model 切替フェーズ (司令塔モデル指定・Wave 3 統合後の再編)

| Phase | 範囲 | 推奨 model | 切替契機 |
|-------|------|----------|---------|
| Phase 1 | Wave 1 起動 + 5 agent 進捗監視 | **Opus** 🔴 ✅ 完了 | — |
| Phase 2 | Wave 1 結果統合 + Plan Mode 再入 + 計画修正 | **Opus** 🔴 ✅ 完了 | — |
| Phase 3 | Wave 2 起動 (機械的 Track B-W2/D-W2/E/J/L-1/L-2/L-3 + F/G/I) | **Sonnet** 🟢 | Plan Mode 出口で「Sonnet 切替可」と声掛け |
| Phase 4 | Track L-4 (Worker/Evaluator) 実装 + Track M レビュー | **Opus** 🔴 | Track L-4 着手時に「Opus フェーズ」と声掛け |
| Phase 5 | 残 Track C / H / I-Step2 (master 手動 step 経由) | **Sonnet** 🟢 | master 手動完了報告時に「Sonnet 切替可」と声掛け |
| Phase 6 | Check-out レポート + memory.md 更新 (P4 訂正必須) + commit 前最終照合 | **Opus** 🔴 | Check-out 着手時に「Opus フェーズ」と声掛け |

**司令塔運用ルール:** 各 Phase 切替点で orchestrator が「現在 Opus フェーズ / Sonnet 切替可」を明示的に発話する。マスターが切替判断 → 実行は master 手動 (model 切替コマンド)。

**Check-out 時の memory.md P4 訂正項目 (必須):**
- 旧: 「`.claude/hooks/*.mjs` 編集は Self-Modification HARD BLOCK で user authorization でも解除不可」(memory P4 [2026-05-26])
- 新: 「`.claude/hooks/*.mjs` 編集は CC Protected Path で PROMPT (承認 1 回で通過)・pre-edit.sh HARD BLOCK は `.claude/agents|skills|commands/` のみ対象」
- 引用元: `tmp/hard-block-investigation.html` (Track K 出力)

## Wave 構成 (並列起動順序)

```
Wave 1 (即時並列起動・5 agent 同時) [Opus フェーズ]:
  ├─ Track A foreground   [general-purpose]  Governance 参照修正
  ├─ Track B Wave1 bg     [research-analyst] code-review-skills 軸 8 リサーチ
  ├─ Track D Wave1 bg     [explore-agent]    PC 表 P4#0 11 product 調査
  ├─ Track G foreground   [debugger]         area-gate.mjs 原因調査
  └─ Track K bg           [research-analyst] HARD BLOCK 正当性 + 回避経路調査

Wave 2 (Wave 1 完了後・並列) [Track K で Wave 3 を統合済・基本 Sonnet・L-4 のみ Opus]:
  ├─ Track B Wave2 fg     [general-purpose]   spec.md + SKILL.md 配置                       🟢 Sonnet
  ├─ Track D Wave2 fg     [general-purpose]   11 product runbook 追記モード整合補正         🟢 Sonnet
  ├─ Track E sequential   [general-purpose]   failures.md 移管 4 product                    🟢 Sonnet
  ├─ Track J foreground   [general-purpose]   aiueo tax-utils.test commit + 残 4 utils      🟢 Sonnet
  ├─ Track L-1/2/3 fg     [general-purpose]   Stage 1-3 hook + slash command 拡張           🟢 Sonnet
  ├─ Track L-4 fg         [general-purpose]   Stage 4 /goal + verify-agent 統合             🔴 Opus
  ├─ Track F fg           [orchestrator]      secret-write-gate Edit + 承認 1 回             🟢 Sonnet
  ├─ Track G fg           [orchestrator]      area-gate.mjs catch stderr 追加 + 承認 1 回    🟢 Sonnet
  ├─ Track I (Step 1/3)   [orchestrator]      tmp/checkout-skill-md.md 下書き + commands 配備 🟢 Sonnet
  └─ Track M fg           [general-purpose]   CLAUDE.md スリム化 65→≤60 行                   🟢 Sonnet

Wave 3 → 廃止 (Track K 反映で Wave 2 に統合済):
  - 残: Track C (nlm login 後・master 手動 step 待ち)
       Track H (logger bug・低優先)
       Track I Step 2 (新セッション --add-dir 起動・master 手動 step 待ち)
```

## 実装ステップ

| step | 担当 | 内容 | 完了判定 |
|------|------|------|---------|
| 1 | orchestrator | 本計画マスター承認 → ExitPlanMode | acceptEdits or default モード遷移 |
| 2 | orchestrator | Wave 1 を 1 message で 4 agent 並列起動 | 4 Agent tool call 同時送信 |
| 3 | 4 agents | Wave 1 各 track 実行 | 各 agent 完了報告受領 |
| 4 | orchestrator | Wave 1 結果統合 → マスター中間報告 | 中間 commit 1 件 (Track A 完遂分) |
| 5 | orchestrator | Wave 2 起動 (Track E は sequential・他は並列) | 各 track 完了 |
| 6 | orchestrator | Wave 2 完了 → 中間 commit + マスター報告 | 進捗 HTML 更新 |
| 7 | master | nlm login + メモ帳手動編集 (Track C/F) | 完了報告受領 |
| 8 | orchestrator | Wave 3 起動 | 各 track 完了 |
| 9 | orchestrator | 最終 commit + Check-out レポート生成 | `docs/session-reports/2026-05-27-checkout.html` |

## リスク

| リスク | 対策 |
|--------|------|
| 並列 Write 衝突 (Track A / B / D / E が同領域編集) | 編集対象 path を track 間で重複させない設計 (Track A=CLAUDE.md + rules / Track B=code-review-skills 配下 / Track D=各 product runbook.md / Track E=memory.md + failures.md) |
| Background agent が Write 必要箇所で auto-deny | Wave 1 background は read-only リサーチ専用に限定 (Track B Wave1 / Track D Wave1) |
| 60 件一括置換ミス (Track A) | sed/Edit 単位で diff 確認 → 1 product ずつ verify → 残継続 (memory P4 教訓「一括破壊系は段階展開」) |
| canary lib 適用範囲 | markdown 一括置換は対象 (memory P4 2026-05-25 教訓)・ただし JSON 書換ではないので canary lib 強制対象外 (lib は `_lib/json-canary.mjs`)・段階展開原則のみ適用 |
| マスター手動経路 (Track C/F) が長時間ブロック | Wave 1-2 で master 手動を待たない track 群を完遂 → Wave 3 で着手 |
| Self-Modification HARD BLOCK (Track F/G) | hook 編集はマスター手動・司令塔はコード提示 + syntax 検証のみ |
| 並列起動による context 圧迫 | background agent は短報告 (200 words 以内) を指示・foreground agent は完了時 summary 返却 |
| 同型過失 (Session 270 「持ち越しタグ ≠ 中身決着事項」) | 本計画は前セッション checkout report の D 章 + memory P1 を中身まで読了済 |

## テスト方針

- **Track A 検証:** `grep -rn "vibe-governance" products/*/CLAUDE.md` で 0 件確認・`grep -n "pre-write-glob-check.sh" CLAUDE.md` で 0 件確認
- **Track B 検証:** SKILL.md frontmatter 検証 (`scripts/check-skills-spec.mjs`) PASS
- **Track D 検証:** `tmp/pc-progress-audit.html` 再走で P4#0 H 件数 11→0
- **Track E 検証:** 4 product memory.md に「P3 → failures.md 参照」pointer 化確認 + failures.md 行数 ≤ 200
- **Track G 検証:** area-gate.mjs 修正後 fixture 経由で exit 0 確認 (`tests/fixtures/area-gate-fix/` 配置・本番 hook 破壊禁止)
- **Track 全体:** Check-out 時に `bash scripts/check-in-verify.sh` EXIT 0 確認

## 受け入れ基準

1. **Track A:** `grep -rn "vibe-governance" products/*/CLAUDE.md .claude/rules/ CLAUDE.md` 結果 0 件 (archive/ + git 履歴除外)
2. **Track B Wave 2:** 4 SKILL.md 配置 (only-now / 3m / 6m / 1year) + `node scripts/check-skills-spec.mjs` EXIT 0 + frontmatter 4 必須 key (name / description / short_label / usage_examples) 全 PASS + 配置完了後マスター確認待ち
3. **Track C:** master `nlm login` 完了報告受領 → CLAUDE.md §1 (技術スタック) §2 (フェーズ定義) §3 (制約) §4 (デザイン仕様) §5 (禁止事項) 各章に最低 3 項目以上記入 + `agent-brief.md` の全要求項目との 1 対 1 照合表添付
4. **Track D:** 11 product `runbook.md` 配置 + 内容 sha256 で `docs/standards/templates/runbook-template.md` ベース確認 + PC 表 P4#0 status `○` 更新 + `tmp/pc-progress-audit.html` 再走で H 件数 11→0
5. **Track E:** 4 product memory.md P3 セクションが `→ failures.md 参照` pointer のみに短縮 + 各 product failures.md 行数 ≤ 200 + 経緯文 (「Session N で〜」「マスター指示で〜」等) 含まず 1 失敗 1 行
6. **Track F:** secret-write-gate.mjs L (該当行) `catch (e) exit(0)` → `exit(2)` (master 貼付後コード受領 + syntax check EXIT 0)
7. **Track G:** ①stderr capture log を `tmp/area-gate-stderr-capture.log` に取得 ②exit≠0 再現 fixture を `tests/fixtures/area-gate-repro/` に配置 ③修正 patch diff を tmp/area-gate-fix.diff に提示・の 3 成果物
8. **Track H:** hook-errors.jsonl logger malformed record `jq -e` で 34→0 + master 手動編集後 logger 単体起動で 1 record 整合性 PASS
9. **Track I:** `~/.claude/skills/checkout/SKILL.md` 実体存在 + sha256 確認 + 17 location (`ls vibe-base/.claude/commands/checkout.md products/*/.claude/commands/checkout.md | wc -l == 17`) + 各 file frontmatter PASS
10. **Track J:** aiueo `git status` で tax-utils.test.js 含む test ファイル全 staged + commit + 残 4 utils (csv-export / menu-translations / receipt-printer / role-auth) 各テストファイル新規配置 + `npm run test:*` 全 PASS + git status clean
11. **Track K:** `tmp/hard-block-investigation.html` 出力 + 公式 docs 引用 URL 5 件以上 + Track F/G/I 各々の Wave 3 着手判定 (現行マスター手動 / bypass mode 適用可 / 代替経路 の 3 択提示) + 回避経路がある場合は fixture demo 1 件以上完遂
12. **Track M (CLAUDE.md スリム化):**
    - `wc -l CLAUDE.md` 結果 ≤ 60
    - `rules-coverage-gate` hook 単体起動 EXIT 0 + warning 無し (`echo '{"tool_name":"Write","tool_input":{"file_path":"CLAUDE.md"}}' | node .claude/hooks/rules-coverage-gate.mjs` で EXIT 0)
    - `grep -c "^## " CLAUDE.md` で H2 8 件存在
    - §1-§6 主要規律の意味的保全 (削除候補は事前 master 承認・rules pointer 化のみ)
13. **Track L (4 段深層防御 統合):**
    - **L-1 (Stage 1 PreToolUse schema):** `ls .claude/hooks/plan-schema-gate.mjs` 存在 + `tests/fixtures/plan-schema/` 4 ケース × 単体起動で OK/NG 期待通り
    - **L-2 (Stage 2 PostToolUse keyword):** `ls .claude/hooks/ac-keyword-gate.mjs` 存在 + 同形 fixture 4 ケース PASS
    - **L-3 (Stage 3 /plan-finalize):** test plan 2 種 (全項目記入 / 1 項目未記入) で `/plan-finalize` 動作確認
    - **L-4 (Stage 4 /goal + verify-agent):** verify-agent 単体起動で本計画書受け入れ基準 12 項目の合否表返却 + dummy plan (PASS/FAIL 混在) で正しく分離判定
    - **全体 dogfooding:** 本計画書 `pure-meandering-dove.md` を L-1〜L-4 全 stage に通して全 PASS
    - **配布:** `propagate-hooks.mjs` dry-run EXIT 0 + 全 16 product 配布完了 + `ls products/*/.claude/hooks/plan-schema-gate.mjs products/*/.claude/hooks/ac-keyword-gate.mjs | wc -l == 32`
    - **canonical 統合:** `docs/standards/plan-mode.md` に「4 段深層防御」セクション追記 + 公式 4 思想 (証拠ベース / 評価者分離 / EARS / hooks 決定論) 統合 + `grep -c "Stage 1" docs/standards/plan-mode.md >= 1`
    - **比較レポート:** `tmp/plan-quality-comparison.html` 出力 (既存 `~/.claude/plans/` 4 plan × 新 hook 適用結果)

## 承認後モード

**`default` モード**

判定軸:
- ✅ 編集対象が複数 product CLAUDE.md / hooks / settings.json を跨ぐ (高影響)
- ✅ background + foreground agent 並列展開 → 各 agent 編集承認が必要
- ✅ canary lib 経由を含む一括置換あり (Track A)
- ✅ 60 件 dead-link 一括置換は段階展開推奨 (memory P4 教訓)
- ✅ Self-Modification HARD BLOCK 対象 (Track F/G) はマスター手動経路
- ❌ acceptEdits 採用には影響範囲が広すぎる

→ 各 Edit/Write 毎にマスター承認 (default モード) で進行。Wave 単位で中間 commit + 報告。
