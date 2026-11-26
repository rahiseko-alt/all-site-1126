---
description: WEB/LPデザインの設計規律（金太郎飴脱却・骨格パラダイム・保守天秤）。デザイン着手時に必ず適用。手順正本は docs/standards/web-design-flow.md
paths:
  - "products/*/app/**"
  - "products/*/lp/**"
  - "products/*/src/**"
  - "products/*/**/*.html"
---

## デザイン着手時の必須参照（順序固定）

1. **手順正本**：`docs/standards/web-design-flow.md`（10ステップ＋設定 Tech Radar/judge/Swipe File）を読んでから着手
2. skill `/web-design` が発火経路（skill-menu からの能動推薦含む）

## 設計規律（全product共通・@import 配布）

### 判定軸＝骨格パラダイム
- **金太郎飴**＝全幅ブロックを定型順で縦に通過するだけ。**脱・金太郎飴**＝スクロール・操作・次元のいずれかを再発明。
- **技術・アニメ機構の有無では判定しない**（機構たっぷりでも骨格が定型なら金太郎飴）。
- ものさし実例＝`docs/standards/design-yardstick/`（ダメ＝index/pro-2/pro-3・良＝pro-1）。

### 素CSS禁止＝最新技術最低1つ
- Technology Radar（web-design-flow.md 設定1）から最低1つ採用。素CSSのみ（最新技術ゼロ）は Hold＝新規着手禁止。

### 保守天秤（事業判断として必須）
- 採用デザイン/技術の保守工数（壊れやすさ×対応コスト・外部条件変更で将来動かなくなるリスク）を着手前に把握 →「品質 vs 保守コスト」を天秤にかけ採否を記録。大前提＝とにかく良いものを。

### 検証＝judge＋マスター目（機械ゲートは廃止）
- 提出前にダメデザインチェックリスト（web-design-flow.md）で自己採点 → taste-judge サブで rubric 照合 → 最終判定はマスター。
- カードベース独立設計（Component Encapsulation）は `docs/ops/agent-rules.md`「UI設計基礎哲学」を遵守。

## ページ種別判断
- WEBページ分類体系：`docs/web-page-classification.html`（種別/ファネル/レイアウト判断時に参照）。
- モバイル対応は全種別で必須。

詳細: `docs/standards/web-design-flow.md` / `docs/ops/ui-clone-sop.md`（UIパターン分析フレームワーク・付録）
