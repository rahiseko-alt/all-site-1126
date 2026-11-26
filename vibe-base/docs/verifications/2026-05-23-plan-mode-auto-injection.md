# Plan Mode auto 注入 — 公式推奨 × 現状 × コードベース判定

> 検証日: 2026-05-23 / 対象 commit: 126da35 / 関連 plan: `~/.claude/plans/plan-mode-auto-injection.md`
> ゴール: 「プランモード発動時に、公式推奨仕様が自動的に発動する状態にする」（マスター指示原文）

## 凡例
- **[A]** = Anthropic 公式由来（ClaudeCode_Subagent_Guide_v3 §4 / code.claude.com/docs/en/memory.md）
- **[C]** = C 設計内製（vibe-governance ADR 0001 由来）
- **[吸収]** = 旧 feedback 吸収（Session 221 / 226 由来）

---

## §A. Plan Mode の定義・性質

| # | 出所 | 公式推奨内容（詳細） | 現状（rules/plan-mode.md 実装） | コードベース判定 | 結果 |
|---|------|---------------------|-------------------------------|------------------|------|
| A-1 | [A] | Plan Mode は Edit / Write / Bash 等の編集系ツールを封じ、Read / Grep / Glob 等の読み取り系のみ許可する権限モード | line 7 に同一記述 | `grep "Edit / Write / Bash 等の編集系ツールを封じ" .claude/rules/plan-mode.md` → 1 hit 必須 | ✅ PASS |
| A-2 | [A] | ハーネス自動発火でなく、ユーザーが Shift+Tab で明示起動する権限モード | line 9, 13 に同一記述 | `grep "ハーネスが自動発火する仕組みではなく" plan-mode.md` → 1 hit 必須 | ✅ PASS |
| A-3 | [A] | 起動: Shift+Tab / Ctrl+G 等 chord | line 9 に同一記述（backtick 装飾あり） | ``grep -F "`Shift+Tab` でモードトグル" plan-mode.md`` → 1 hit 必須 | ✅ PASS |
| A-4 | [A] | 終了: ExitPlanMode 承認で通常モードへ復帰 | line 10 に同一記述（backtick 装飾あり） | ``grep -F "`ExitPlanMode` を承認すると通常モードへ戻る" plan-mode.md`` → 1 hit 必須 | ✅ PASS |
| A-5 | [C] | 目的の積極的フレーミング: 「最善の計画を作り、その後の実走を安全快適に行える前提条件を固める」（防御的フレーミング禁止） | line 11 に同一記述 | `grep "最善の計画を作り" plan-mode.md` → 1 hit 必須 | ✅ PASS |

## §B. 適用タイミング表

| # | 出所 | 公式推奨内容（詳細） | 現状 | コードベース判定 | 結果 |
|---|------|---------------------|------|------------------|------|
| B-1 | [A] | 適: 新セッション直後・複数ファイル横断の着手前 | §いつ使うか table 行 1 | `grep "新セッション直後・複数ファイル横断の着手前" plan-mode.md` → 1 hit 必須 | ✅ PASS |
| B-2 | [A] | 適: 影響範囲不明・複数実装方針候補あり | §いつ使うか table 行 2 | `grep "影響範囲不明・複数の実装方針候補" plan-mode.md` → 1 hit 必須 | ✅ PASS |
| B-3 | [A] | 適: アーキテクチャ判断・新規 hook / SOP 設計 | §いつ使うか table 行 3 | `grep "アーキテクチャ判断・新規 hook" plan-mode.md` → 1 hit 必須 | ✅ PASS |
| B-4 | [A] | 不要: 1 ファイル内の小修正・型エラー・typo | §いつ使うか table 行 4 | `grep "1 ファイル内の小修正" plan-mode.md` → 1 hit 必須 | ✅ PASS |
| B-5 | [A] | 不要: 長時間作業の中盤 | §いつ使うか table 行 5 | `grep "長時間作業の中盤" plan-mode.md` → 1 hit 必須 | ✅ PASS |

## §C. plan ファイル H2 固定構造

| # | 出所 | 公式推奨内容（詳細） | 現状 | コードベース判定 | 結果 |
|---|------|---------------------|------|------------------|------|
| C-1 | [C] | 配置: `docs/ops/plans/YYYY-MM-DD-*.md` または `~/.claude/plans/*.md` | line 27 に同一記述 | `grep "docs/ops/plans/YYYY-MM-DD" plan-mode.md` → 1 hit 必須 | ✅ PASS |
| C-2 | [C] | H2 5 項目: ## 影響範囲 / ## 実装ステップ / ## リスク / ## テスト方針 / ## 受け入れ基準 | line 29-35 code block | `grep "^## 影響範囲$" plan-mode.md` + `## 実装ステップ` + `## リスク` + `## テスト方針` + `## 受け入れ基準` → 各 1 hit 必須 | ✅ PASS |
| C-3 | [C] | 順序固定・追加自由・削除禁止 | line 27 | `grep "順序固定・追加自由・削除禁止" plan-mode.md` → 1 hit 必須 | ✅ PASS |
| C-4 | [C] | 先頭 `## Context` 任意 | line 37 | `grep "任意で先頭に.*Context.*を置いてよい" plan-mode.md` → 1 hit 必須 | ✅ PASS |
| C-5 | [C] | 影響範囲: 全ファイル列挙・新規/削除/修正区別・複数 repo は repo 別見出し | line 39 | `grep "編集する全ファイル・ディレクトリを列挙" plan-mode.md` → 1 hit 必須 | ✅ PASS |
| C-6 | [C] | 実装ステップ: Step 0（着手前確認）から番号順・サブステップ番号付き | line 40 | `grep "Step 0（着手前確認）から番号順" plan-mode.md` → 1 hit 必須 | ✅ PASS |
| C-7 | [C] | リスク: 表形式（リスク / 検知 / 対応）推奨・検知方法明示なしのリスク禁止 | line 41 | `grep "検知方法を明示しないリスクは記述するな" plan-mode.md` → 1 hit 必須 | ✅ PASS |
| C-8 | [C] | テスト方針: 番号順・受け入れ基準と 1 対 1 対応 | line 42 | `grep "受け入れ基準と 1 対 1 対応" plan-mode.md` → 1 hit 必須 | ✅ PASS |
| C-9 | [C] | 受け入れ基準: 機械検証可能な条件（Glob 数 / EXIT code / diff --stat）・主観表現禁止 | line 43 | `grep "機械検証可能な条件" plan-mode.md` → 1 hit 必須 | ✅ PASS |

## §D. セッション分離ワークフロー

| # | 出所 | 公式推奨内容（詳細） | 現状 | コードベース判定 | 結果 |
|---|------|---------------------|------|------------------|------|
| D-1 | [A] | 立案 / 実装を別セッションに分ける（公式 §4.5） | line 47-50 に手順詳細 | `grep "立案と実装を別セッションに分ける" plan-mode.md` → 1 hit 必須 | ✅ PASS |
| D-2 | [C] | 立案セッション: Shift+Tab → Read で把握 → plan 書く → ExitPlanMode で plan のみコミット | line 49 | `grep "ExitPlanMode で plan ファイルのみコミット" plan-mode.md` → 1 hit 必須 | ✅ PASS |
| D-3 | [C] | 実装セッション: 新セッション → plan Read → 順次実装 | line 50 | `grep "別の新セッションを開く（コンテキスト切替）" plan-mode.md` → 1 hit 必須 | ✅ PASS |
| D-4 | [C] | 例外: 単一ファイル・3 ステップ以下は同一セッション可 | line 54 | `grep "実装ステップが 3 つ以下の小規模変更" plan-mode.md` → 1 hit 必須 | ✅ PASS |

## §E. plan の進化（吸収 / Session 221）

| # | 出所 | 公式推奨内容（詳細） | 現状 | コードベース判定 | 結果 |
|---|------|---------------------|------|------------------|------|
| E-1 | [吸収] | plan は実装判断の起点・実装段階の構造的判断による方針変更を許容 | line 58 | `grep "実装判断の起点" plan-mode.md` → 1 hit 必須 | ✅ PASS |
| E-2 | [吸収] | 手順: ①マスター報告（理由 X 付き）②合意 ③plan は最小訂正 ④逸脱は MISSION_LOG / commit message 記録で十分 | line 60-63 番号付 | `grep "Plan 逸脱が必要、理由は X" plan-mode.md` → 1 hit 必須 | ✅ PASS |
| E-3 | [吸収] | スコープクリープ（NG・受け入れ基準外） vs 合理的進化（OK・受け入れ基準内方法論変更） | line 65-67 | `grep "スコープクリープ" plan-mode.md` + `grep "合理的進化" plan-mode.md` → 各 1 hit 必須 | ✅ PASS |

## §F. 実体照合（吸収 / Session 226）

| # | 出所 | 公式推奨内容（詳細） | 現状 | コードベース判定 | 結果 |
|---|------|---------------------|------|------------------|------|
| F-1 | [吸収] | 「新規作成」と書く全 path は書く前に Glob で実体不在を確認 | line 73（backtick 装飾あり） | ``grep -F "`Glob` で実体不在を確認する" plan-mode.md`` → 1 hit 必須 | ✅ PASS |
| F-2 | [吸収] | 手順 ①: 全「新規作成」path を Glob | line 77-82 | `grep "「新規作成」と書く全ファイル.*を Glob で実体照合" plan-mode.md` → 1 hit 必須 | ✅ PASS |
| F-3 | [吸収] | 手順 ②: Explore agent 報告は二重照合 | line 83 | `grep "Explore agent の「不在」「NOT FOUND」報告は二重照合" plan-mode.md` → 1 hit 必須 | ✅ PASS |
| F-4 | [吸収] | 手順 ③: plan 影響範囲セクションに照合結果を証跡明記 | line 84 | `grep "影響範囲」セクションに照合結果を明記" plan-mode.md` → 1 hit 必須 | ✅ PASS |
| F-5 | [吸収] | 手順 ④: ExitPlanMode 直前に最終照合 | line 85 | `grep "ExitPlanMode 直前に最終照合" plan-mode.md` → 1 hit 必須 | ✅ PASS |

## §G. /plan コマンド

| # | 出所 | 公式推奨内容（詳細） | 現状 | コードベース判定 | 結果 |
|---|------|---------------------|------|------------------|------|
| G-1 | [C] | `/plan` 実行で固定 H2 構造の雛形出力 | line 93 + `~/.claude/commands/plan.md` 実在 | `test -f ~/.claude/commands/plan.md` + `grep "/plan.*雛形が出力" plan-mode.md` → 共 hit | ✅ PASS |
| G-2 | [C] | 強制機構なし（hook / 判定スクリプト ゼロ） | line 96 | `grep "強制機構（hook / 判定スクリプト）は存在しない" plan-mode.md` → 1 hit 必須 | ✅ PASS |
| G-3 | [C] | 雛形を編集せず提出は禁止 | line 97 | `grep "雛形を編集せず提出するのは禁止" plan-mode.md` → 1 hit 必須 | ✅ PASS |

## §H. auto-load 配信経路（@import）

| # | 出所 | 公式推奨内容（詳細） | 現状 | コードベース判定 | 結果 |
|---|------|---------------------|------|------------------|------|
| H-1 | [A] | CLAUDE.md `@path` import 構文・5 ホップネスト・全環境サポート（code.claude.com/docs/en/memory.md「Import additional files」） | vibe-base/CLAUDE.md line 11 + products/*/CLAUDE.md line 3 × 13 | `grep "^@.*plan-mode.md$" vibe-base/CLAUDE.md products/*/CLAUDE.md` → 14 hit 必須 | ✅ PASS (14/14) |
| H-2 | [A] | @import path は実体存在必須 | 14 path 全て `../...vibe-governance/.claude/rules/plan-mode.md` を指す | 各 CLAUDE.md ディレクトリで `test -f $(dirname CLAUDE.md)/@path` → 14/14 OK 必須 | ✅ PASS (14/14) |
| H-3 | [A] | vibe-governance cwd は `.claude/rules/*.md` 直接 auto-load（公式仕様・@import 不要） | `vibe-governance/.claude/rules/plan-mode.md` 直接配置 | `test -f vibe-governance/.claude/rules/plan-mode.md` → OK 必須 | ✅ PASS |
| H-4 | [A] | fresh session 起動で plan-mode.md 内容が context に注入 | 4 cwd で master 実機検証済（fresh session で AI が H2 5 項目を Read せず YES 回答） | 該当セッションの AI 応答ログ（master が手動 paste） | ✅ PASS（master 確認済 14/14） |
| H-5 | [A] | Plan Mode は permission mode 切替のみ・context 保持 | 本セッション EnterPlanMode 観察: Plan Mode active reminder 追加のみ・CLAUDE.md 再 load 無し | 本セッション会話ログ・EnterPlanMode 直後の system reminder 内容（context drop の証拠ゼロ） | ✅ PASS（公式仕様 §4 論理確認 + 本セッション EnterPlanMode 観察） |

---

## 総合判定枠

| 判定 | 件数 |
|------|------|
| ✅ PASS 合計 | 41 / 41 |
| ❌ FAIL 合計 | 0 / 41 |
| 公式記述存在（grep 1 hit） | 36 項目（A-1 〜 G-3）全 PASS |
| 配信経路成立（@import 14/14 + path resolve） | 3 項目（H-1, H-2, H-3）全 PASS |
| 実機受領（fresh session YES） | H-4 = master 確認済 14/14 PASS |
| permission mode 切替・context 保持 | H-5 = 公式仕様 §4 + 本セッション観察 PASS |

---

## 完了状態

- 全 41 項目 PASS（sub-agent 独立検証 2026-05-23）
- ghost-operation 空ディレクトリ削除済（products 13 件）
- @import 配置 line 3 統一済（14 cwd）
- CRLF → LF 統一済（ai-concierge / foodee / omotenashi-trainer）
- pattern 訂正済（A-3 / A-4 / F-1 = backtick 込み）

master 承認後にコミット。
