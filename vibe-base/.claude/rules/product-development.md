---
description: プロダクト開発時の進捗管理・ゲート・フェーズルール
paths:
  - "products/**"
---

## 思考原則+報告ラベル制度
- 思考原則5項+報告ラベル（【実行済み】【推測】【未実行】）→ `docs/ops/agent-rules.md` 冒頭を参照
- ラベルなしで「確認しました」「OKです」と書くな。迷ったら【推測】を付けろ

## 過失教訓の参照義務
- Check-in 時に `docs/ops/session-191-lessons.md`（司令塔6件過失カタログ）を読み、末尾の自己診断チェックリスト（6問 Yes/No）を実施せよ
- 1件でも Yes があれば方針を見直してからタスク着手

## 進捗管理（Plan Mode）
- 進捗の単一正本は Plan Mode の plan ファイル（`docs/ops/plans/` 配下・Git 管理）。照合なしに進捗を語るな
- **plan 作成時に memory.md P1 へ直近 plan path を記載する。チェックイン（`/pc-checkin` STEP3）はこの plan path を起点に照合する**（plan path 無し = plan 未作成として軽量 skip）
- 完了は第三者検証に耐えるもののみ。ファイル作っただけ・確認しただけは未完了
- 仮説テーブルは `products/{product}/hypotheses.md`（永続独立ファイル・単一正本）
- plan に無い作業を勝手に着手するな。受け入れ基準への追加提案→承認→着手

新規ドキュメント作成時は docs/standards/ の該当テンプレをコピーして使え

## rationale 記述と思考の視点（Session 294 マスター指示で確定）

- rationale（plan の判断根拠）は「採用結果 + 理由」を 1-2 行で書く（飛ばさない明確性のみ担保）
- 詳細比較は内部判断時のみ・plan 本文には書かない
- 選択肢 3 件以上を内部で比較する際の評価軸:
  1. 数値・期限
  2. 利用者ペイン解消度
  3. 法令適合性
  4. セキュリティリスク
  5. コスト・損益分岐
  6. 第三者依存・廃止リスク
- 22 項目 evidence 個別反映は廃案（Session 294 確定・Session 295 Phase 2 で関連 SOP/スクリプト撤去済）。思考の視点として上記 6 軸を使う

詳細: docs/ops/agent-rules.md / docs/ops/excel-product-sop.md / docs/ops/producttype-typology.md
