# plan — 全製品横断調査の資産化（①定型化テンプレート・新規開発スキル）＋ ②健康診断レポート保存

> 起草: 2026-06-11 / 担当: vibe-base 司令塔 / 調査実走: ①横断調査 5 体 + ②健康診断 5 体（sonnet・read-only）完了済み

## ⚠ 危険項目

- 本 plan 自体の実装リスク: なし（新規ファイル作成のみ・製品フォルダ無書込）
- **残置される危険**: ②診断で検出した危険 5 件（review-analysis 本番キー平文 + CRON 認証バイパス / 顧客カルテ画像 git 追跡 / kobaraku APIキー localStorage / テスト不在群 / 巨大ファイル群）は本 plan では**未修正のまま残る**。修正は「報告→マスター承認→修正」順序に従い別 plan で対応。

## Context

なぜやるか:
- マスター指示「①20 プロジェクト横断調査→定型化（テンプレート + 共通 CLAUDE.md + 新規開発コマンド）/ ②各プロジェクト健康診断（報告のみ・修正禁止）」を vibe-base 実態に適合させて実行する。
- 事前評価で確定した適合方針:
  - ② の観点 6 項目は既存 review スキル群と重複するため**新スキルは作らない**（マスター選択「①横断調査のみ plan 化」）。②は今回の 5 体並列診断の**結果保存のみ**行う。
  - 共通 CLAUDE.md は既存（共通憲法 + 自治憲法）のため再作成しない。
  - コマンド保存先は `.claude/commands/` でなく `~/.claude/skills/`（§5.3 スキル配置規律）。
- 調査は完了済み（本セッション・19 製品・10 エージェント）。本 plan は**調査結果の資産化**（ファイル保存 + テンプレート + スキル）のみを実装範囲とする。

### 調査で確定した主要ファクト（実装の根拠）

**毎回共通している構成・技術・作業（定型化対象）:**
1. ガバナンスセットが全 19 製品共通: CLAUDE.md（@import 5 本 + agent-rules.md）/ memory.md P1-P4 / failures.md / hypotheses.md / runbook.md / cost-config.md / backup-config.md / risk-diagnosis.md / .claude/hooks（propagate 済）
2. `scripts/check-secret-patterns.mjs` が **10 箇所以上に同一コピー**（coach と code-review-skills は diff ゼロ確認済み）
3. `vercel.json` のセキュリティヘッダー 5 種ブロックが ai-concierge / aiueo / foodee / homepage で個別コピー
4. 技術プリセットが 5 型に収斂: (a) 単一 HTML 型（omotenashi / renai-game / coach / shift-ai）(b) React+Vite 型（ai-concierge / aiueo / kobaraku）(c) SvelteKit 型（kanji / kanji-foreign / new-trimmer）(d) CF Workers+KV 型（shiota-karte / trimmer-system / new-trimmer）(e) GAS 連携型（renai-game / google-system-dev / review-analysis 痕跡）
5. CF Workers+KV 型では `worker/src/index.js` / `site/` 4 ファイル構成 / manifest.json が製品間コピー

**毎回ゼロから試行錯誤している部分:**
- UI クローン反復（foodee: app-v0〜v9 の 9 回 / homepage: preview 3 バリアント / new-trimmer: mock 8 本）
- アーキ途中変更（foodee: localStorage→Supabase→Firebase / coach: ホスティング 3 回変更 / trimmer→new-trimmer 再構築）
- 運用形骸化: failures.md が 19 製品中ほぼ全て空・memory.md P1 空が多数（失敗が CLAUDE.md 運用メモに流れる構造ズレ）

**定型化できない部分（理由付き・レポートに収載）:**
- UI デザインの参照対象選定（製品ごとに競合が異なる。手順自体は web-design スキルで既にカバー）
- DB / Auth のアーキ選定（要件・コスト・規約依存。foodee の 2 回変更が示す通り事前確定不能）
- GAS / YMM4 GUI 等の特殊実行環境固有作業（環境が一点物）
- 顧客固有要件の解釈（当事者要望書 = ペイン一次資料の原則）

**②健康診断の最重要指摘（全グループ統合 TOP5・修正は本 plan 範囲外）:**
1. 【危険】review-analysis: `.env` に本番キー 6 種平文 + `CRON_SECRET` 未設定時に認証バイパスする実装（`api/cron/sync/route.ts:16`）
2. 【危険】shiota-karte / trimmer-system: 顧客実物カルテ画像（個人情報）が git 追跡 3 ファイル・gitignore 除外なし
3. 【危険】kobaraku: Claude API Key を localStorage 平文保存（`TenantMain.jsx:62`）
4. 【危険】テスト完全不在が多数（ai-concierge は販売中・本番稼働で 0 件 / foodee / kobaraku / learning-suite-kanji / new-trimmer / review-analysis / ymm-shorts）
5. 【危険】1500 行超の巨大単一ファイル群（ponchi-v2.html 2135 行 / aiueo desktop-layout.jsx 1744 行 / renai-game index.html 1713 行 / foodee index.html 1697 行）

## 上位 plan からの constraint 変更

- なし（独立 plan）。§5.3 スキル配置規律（正本 `~/.claude/skills/`・独立 repo 別管理）・§1 Refactor-on-Write（②新スキル純増回避）を遵守。
- 製品フォルダ内への書込は行わない（§0 越権防止）。check-secret-patterns.mjs の既存コピー削除・健康診断指摘の修正は**本 plan 範囲外**（各製品セッション扱い）。

## 影響範囲

| 種別 | パス | 変更 |
|---|---|---|
| 新規 | `docs/ops/cross-product-survey-2026-06-11.md` | ①横断調査統合レポート（共通点 / 試行錯誤 / 定型化可否一覧・非エンジニア向け日本語） |
| 新規 | `docs/ops/health-report-2026-06-11.md` | ②健康診断統合レポート（19 製品 × 6 観点・危険/注意/良好・修正提案のみ） |
| 新規 | `docs/standards/templates/product-scaffold/` | 新規プロダクト雛形一式（CLAUDE.md 雛形 / memory.md / failures.md / runbook.md / cost-config.md / risk-diagnosis.md / vercel-security-headers.json） |
| 新規 | `~/.claude/skills/new-product/SKILL.md` | /new-app 相当スキル: scaffold コピー + 技術 5 型プリセット選択 + propagate-hooks 実行 + check-secret-patterns 正本参照 |
| 編集 | `memory.md`（vibe-base 司令塔） | P1 に成果物 path 記録 |

## 実装ステップ

| # | 内容 | 受入#紐付け | 検証 |
|---|---|---|---|
| 1 | ①統合レポートを `docs/ops/cross-product-survey-2026-06-11.md` に Write（5 グループ調査結果統合・定型化可否一覧含む） | 1 | `test -f` + grep "定型化できない" |
| 2 | ②統合レポートを `docs/ops/health-report-2026-06-11.md` に Write（19 製品 × 6 観点表 + TOP5・修正なし宣言明記） | 2 | `test -f` + grep -c "危険" |
| 3 | `docs/standards/templates/product-scaffold/` に雛形一式を Write（既存テンプレ `docs/standards/templates/` 配下と重複しないか先に Glob 照合 = Refactor-on-Write） | 3 | `ls` 7 ファイル以上 |
| 4 | `~/.claude/skills/new-product/SKILL.md` を作成（scaffold 参照・5 型プリセット・path-resolver 経由） | 4 | `test -f` + grep "product-scaffold" |
| 5 | 司令塔 memory.md P1 更新 + verify-agent で受け入れ基準を機械検証 | 5 | verify-agent PASS 表 |

## リスク

- テンプレート純増リスク: Step 3 で既存 `docs/standards/templates/` を Glob 照合し、既存雛形（cost-config-template.md 等）は**参照に置換**して二重定義しない。
- スキル正本の repo 分離: `~/.claude/skills/new-product/` は vibe-base コミット対象外（独立 repo 管理）。
- 健康診断の指摘は未修正のまま残る（報告→マスター承認→修正の順序厳守。修正着手は別 plan）。

## テスト方針

- 各 Write 後に `test -f` / `ls` / `grep` で実体確認（自己生成ファイル再読はしない）。
- 完遂宣言前に verify-agent で受け入れ基準を機械検証（orchestration-discipline 規律 3）。

## 受け入れ基準

> G-PN ゲート照合: 本 plan は対象プロダクトを持たない司令塔横断 plan のためプロダクトサイクル G-PN（P0/P1/P2/P4）は対象外（pc-checklist.md v1.0 参照済み）。

1. ①横断調査統合レポートの実体存在 — Run: `test -f docs/ops/cross-product-survey-2026-06-11.md && grep -c "定型化" docs/ops/cross-product-survey-2026-06-11.md` / Expected: EXIT 0 かつ grep 件数 1 以上
2. ②健康診断統合レポートの実体存在と全製品網羅 — Run: `grep -o -E "ai-concierge|aiueo|coach|code-review-skills|foodee|google-system-dev|homepage|kobaraku|learning-suite-kanji-foreign|learning-suite-kanji|n8n|new-trimmer-system|omotenashi-trainer|renai-game|review-analysis|shift-ai|shiota-karte|trimmer-system|ymm-shorts" docs/ops/health-report-2026-06-11.md | sort -u | wc -l` / Expected: 19（全製品名ヒット）
3. product-scaffold 雛形一式の実体存在 — Run: `ls docs/standards/templates/product-scaffold/ | wc -l` / Expected: 7 以上
4. new-product スキルの実体存在 — Run: `test -f ~/.claude/skills/new-product/SKILL.md && grep -c "product-scaffold" ~/.claude/skills/new-product/SKILL.md` / Expected: EXIT 0 かつ grep 件数 1 以上
5. 製品フォルダ越権書込ゼロ — Run: `git status --porcelain products/` / Expected: 本 plan 起因の新規差分 0 件（チェックイン時点の既存差分 28 件は対象外）

## 承認後モード

default（理由: 判定軸 1 — 影響範囲に protected path `~/.claude/skills/new-product/` を含む。判定軸 4 — 新規ファイル 4 件以上にも該当）

- 実装体制: 規模小（新規ファイル作成のみ・既存編集は司令塔 memory.md 1 件）のため司令塔直接実装。Step 5 のみ verify-agent 呼出。
