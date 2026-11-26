---
description: APIレートリミット必須化（API実装編集時）
paths:
  - "**/api/**"
  - "**/middleware.ts"
  - "**/middleware.js"
---

## 認証不要エンドポイントは必須
- `/api/contact`, `/api/auth/login`, `/api/signup`, `/api/search`等の公開APIには必ずレートリミット
- 認証あっても外部入力を受けるエンドポイントは原則レートリミット

## 制限軸（最低3軸）
- IP別: 短時間の連続攻撃検知
- ユーザー別: ログイン後の濫用検知
- API別: 重い処理（AI呼出・DB全件検索等）は個別に厳しめ

## 実装パターン
- Next.js Vercel: Upstash Ratelimit + Vercel Edge Middleware
- Express: `express-rate-limit` + Redis store
- Cloud Run: Cloud Armor or アプリ層で同様の実装

## 超過時のレスポンス
- HTTP 429 Too Many Requests
- `Retry-After` ヘッダー必須（秒数 or 日付）
- レスポンスボディに「再試行可能時刻」を明記

## 監視
- 429発生数 / 上位IPランキング を週次でレビュー
- 攻撃検知時は incident-response-sop.md §1のP1扱い

詳細: docs/ops/rate-limit-sop.md
