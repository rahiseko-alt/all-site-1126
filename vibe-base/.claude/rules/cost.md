---
description: コスト・予算管理（cost-config編集時）
paths:
  - "products/*/cost-config.md"
---

## 着手前見積もり（必須）
- 課金単位を確定（リクエスト数 / トークン数 / 帯域 / ストレージ等）
- 想定ユーザー数 × 想定アクション数 × 単価 = 月額試算
- 試算なしでの API契約・サービス起動は禁止

## ハードリミット必須設定
- GCP: Budget Alert + 自動 API無効化（pubsub経由）
- Vercel: Spend Management + Pro plan は使用上限設定
- OpenAI / Anthropic: usage limit を月額上限で設定
- Stripe: monthly volume cap 設定（不正利用防止）
- 設定なしでの本番リリース禁止

## リリース後の監視
- 日次トレンド: 前日比+50%超で警告
- 週次トレンド: 想定値の2倍超で停止判断
- ダッシュボード必須（GCP Billing / Vercel Usage / 各サービスの管理画面）

## 緊急停止プロトコル
- 予算超過検知 → 即座にAPI無効化 or maintenance mode
- ユーザー告知は incident-response-sop.md §3 に従う
- 復旧前に原因究明（攻撃 / バグ / 想定超過のいずれか）

詳細: docs/ops/cost-budget-sop.md
