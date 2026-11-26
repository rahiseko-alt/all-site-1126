# product-scaffold — 新規プロダクト雛形一式

> 出典: 2026-06-11 全製品横断調査（`docs/ops/cross-product-survey-2026-06-11.md`）で確定した全 19 製品共通構成の正本化。
> 発火経路: `~/.claude/skills/new-product/`（new-product スキル）から参照される。手動利用も可。

## 使い方

1. `products/{name}/` を作成し、本フォルダの `*.template` をコピーして拡張子 `.template` を外す
2. `{{PRODUCT_NAME}}` 等のプレースホルダを置換する
3. 技術構成は `tech-presets.md` の 5 型から選ぶ
4. hooks / settings.json / manifest 同期は **`docs/ops/new-product-sop.md` Step 3〜5 に従う**（本 scaffold では重複定義しない）

## 同梱ファイル

| ファイル | コピー先 | 備考 |
|---|---|---|
| `CLAUDE.md.template` | `products/{name}/CLAUDE.md` | 自治憲法雛形（標準 @import 5 件込み） |
| `memory.md.template` | `products/{name}/memory.md` | P1-P4 構造 |
| `failures.md.template` | `products/{name}/failures.md` | 1 失敗 = 1 行形式 |
| `hypotheses.md.template` | `products/{name}/hypotheses.md` | 即死/重要/補助の仮説テーブル |
| `risk-diagnosis.md.template` | `products/{name}/risk-diagnosis.md` | リスク予備フィルタ |
| `vercel-security-headers.json` | `products/{name}/vercel.json` へ統合 | セキュリティヘッダー 5 種の正本（コピー改変でなくここを正とする） |
| `tech-presets.md` | コピー不要（参照のみ） | 技術構成 5 型の選定ガイド |

## 既存テンプレートへの参照（Refactor-on-Write・本 scaffold では再定義しない）

| ファイル | 正本 |
|---|---|
| runbook.md | `docs/standards/templates/runbook-template.md` |
| cost-config.md | `docs/standards/templates/cost-config-template.md` |
| backup-config.md | `docs/standards/templates/backup-config-template.md` |
| hooks / settings.json / manifest 手順 | `docs/ops/new-product-sop.md` |
| シークレット検査スクリプト | 各製品 `scripts/check-secret-patterns.mjs`（現状はコピー配布。単一正本化は backlog — survey レポート §6 参照） |
