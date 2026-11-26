---
description: 実装中〜デプロイ前に使う品質テンプレート（障害シナリオ・外部サービス確認・テスト計画・比較表・設計ドキュメント等）
paths:
  - "products/*/docs/cl3-*"
  - "products/*/docs/test-plan*"
  - "products/*/docs/external-service*"
  - "products/*/docs/*-comparison*"
  - "products/*/docs/*-feature-comparison*"
  - "products/*/tmp/feature-list*"
---

## 障害シナリオ
- 7カテゴリ必須: 認証 / DB / 外部API / AI・LLM / ホスティング / ネットワーク / データ整合性
- 各項目: シナリオ・発生条件・ユーザー影響・現在の対応・必要な修正
- 重大度: HIGH（クラッシュ・データ損失・セキュリティ）は実装前に必須対応、MEDIUM/LOWは改善課題として記録し後日対応

## 外部サービス確認
- 全外部サービスについて: SDK/ライブラリ・エンドポイント・認証方式・無料枠・既知リスク・修正状況・確認日
- 全数値にタイムスタンプとソースを付けよ

## テスト計画
- TC-1〜TC-7グループ: 認証 / ユーザー管理 / コアフロー / データ操作 / 外部連携 / エラー / レスポンシブ
- レスポンシブ: 375px（モバイル）/ 768px（タブレット）/ 1280px（デスクトップ）

## 比較表
- 単一HTML形式。3〜5社の競合。全機能+価格+コスト試算
- 推測禁止。不明は「non-public」と書け

## 機能棚卸し表
- 1機能=1行。8列: #・名前・説明（専門用語禁止）・実装済み・実行可能・API種別・コスト・発火タイミング

テンプレートのvest1: docs/standards/templates/ を参照

詳細: docs/ops/failure-scenario-template.md / docs/ops/external-service-check-template.md / docs/ops/test-template-guide.md / docs/ops/comparison-sop.md / docs/ops/feature-inventory-sop.md
