---
description: フォルダ構造変更・構造診断のルール（司令塔・全プロダクトエージェント共通）
paths:
  - "products/**"
  - "docs/ops/folder-lifecycle.md"
  - "docs/ops/structural-diagnosis.md"
  - "docs/ops/new-product-sop.md"
  - "docs/ops/dead-products-registry.md"
  - "docs/ops/trigger-map.md"
---

## フォルダ構造
- 1プロダクト = 1ディレクトリ。複数部門がある場合は products/{product}/{dept}/
- CLAUDE.md はプロダクトルートに1つだけ（部門ごとに作るな）
- 移動は git mv で履歴を保持。旧パスを grep で全ファイル検索し参照を更新せよ
- 凍結プロダクトは再起動時に再検証が必要
- **フォルダ構造変更時は必ず `docs/ops/folder-lifecycle.md` を読め**

## 構造診断（トリガー: マスター指示・新プロダクト・チーム変更・ルール違反発覚時）
- 診断順序は厳守: ①フォルダ構造 → ②ルール到達範囲 → ③重複整理
- サブディレクトリに独立した .git があるとルート CLAUDE.md が届かない
- **診断指示時は必ず `docs/ops/structural-diagnosis.md` の §診断方法手順に従え**

詳細: docs/ops/folder-lifecycle.md / docs/ops/new-product-sop.md / docs/ops/git-branching-guide.md / docs/ops/structural-diagnosis.md / docs/ops/structural-reform-2026-04-27.md / docs/ops/second-cycle-adjustments-2026-04-28.md / docs/ops/sop-index.md / docs/ops/p4-zero-procedure.md / docs/ops/dead-products-registry.md / docs/ops/trigger-map.md / docs/ops/cross-product-survey-2026-06-11.md / docs/ops/health-report-2026-06-11.md / docs/ops/serena-mcp-setup.md / docs/ops/serena-contribution-report.md / docs/standards/templates/runbook-template.md / docs/standards/templates/cost-config-template.md / docs/standards/templates/backup-config-template.md / docs/standards/templates/product-scaffold/
