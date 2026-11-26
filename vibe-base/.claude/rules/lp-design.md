---
description: LP固有の設計規律（必須入力・競合分析・LP固有差分）。フロー本体と骨格規律は docs/standards/web-design-flow.md / web-design.md
paths:
  - "products/*/lp/**"
---

> LP も WEB デザインフローに従う。手順正本＝`docs/standards/web-design-flow.md`、骨格パラダイム・素CSS禁止・保守天秤・judge は `web-design.md`（@import 共通）。本ファイルは **LP固有の差分のみ**。

## ⚠️ 骨格は再発明する（PASONA固定順序は撤去）
- 旧ルールの「PASONA 7セクションを縦に固定順で並べる」は **金太郎飴の骨格そのもの**につき撤去。
- **PASONA は"内容要素"のチェックであって、"配置順の固定"ではない**。問題/解決/証拠/オファー等の要素は満たしつつ、**骨格（スクロール・操作・次元）は骨格パラダイムに従って再発明**せよ。
- ヒーローが成否の80%を決める。見出しは3案作って比較。

## LP設計の必須入力（内容要素・7項目）
1. ターゲットの痛み 2. プロダクト 3. ベネフィット（数値付き） 4. 証拠 5. オファー・価格 6. 緊急性・希少性 7. CTA
- 証拠は具体的データのみ（「多くの」「高い」禁止。数値＋期間＋名前）。

## 競合LP分析（必須・フロー Step3 と連動）
- 3〜5つの実在LPを分析（コピー: トーン・証拠・CTA／デザイン: 骨格・色・タイポ・余白・操作・モバイル）。実在稼働中サイトのみ（記憶からの選定禁止）。
- コンポーネント単位のコピー禁止（全体の印象から分解）。抽出結果は Swipe File（`docs/swipe-file/`）に追記。
- 参考選定は感情定義が先（与えたい感情＋与えたくない感情）→ マスターGO必須。

LP雛形: docs/standards/boilerplate/ ／ WEBページ分類体系: docs/web-page-classification.html

詳細: docs/standards/web-design-flow.md / docs/ops/lp-design-sop.md / docs/ops/reference-site-selection-sop.md
コピー監査: docs/standards/checklists/lp-golden-rules-checklist.md（3ソース黄金律・39項目）／根拠 docs/standards/templates/lp-golden-rules-guide.md
