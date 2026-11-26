---
description: Plan Mode 規律の pointer。canonical = vibe-base/docs/standards/plan-mode.md
---

# Plan Mode 規律 (pointer)

詳細仕様は **`vibe-base/docs/standards/plan-mode.md`** (canonical・345 行) を参照する。canonical は以下を含む:

- 設計思想 5 項目
- Plan Mode とは / いつ使うか
- plan の固定見出し構造 (上位 plan からの constraint 変更 / 影響範囲 / 実装ステップ / リスク / テスト方針 / 受け入れ基準 / 承認後モード)
- セッション分離ワークフロー
- agent 定義 (`.claude/agents/` 配下 explore / implement / verify)
- 実装ステップの表形式記法 (思想 5)
- 承認後モード判定 (思想 5)
- plan の進化・実体照合
- `/plan` コマンド (雛形補助・強制なし)

本ファイルは vibe-base 配下から `@import` 経由で plan-mode 規律を参照する経路 (product CLAUDE.md 等) を維持するための pointer。仕様変更時は canonical のみを編集する。

## 関連 ADR

- `docs/adr/0001-plan-mode-c-design.md` — A・B 抹消と C 採用の決定経緯 (canonical 5450 B 詳細版)

## 履歴

- 2026-05-26: 旧 101 行版を canonical (vibe-base standards) に集約し本 pointer に置換 (drifting plan 完遂後の hotfix)。旧版は git log で参照可能。
