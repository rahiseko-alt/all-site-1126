---
description: 実装ファイル編集時にセキュリティ観点を自動注入（API・middleware・認証経路）
paths:
  - "**/api/**"
  - "**/*.route.*"
  - "**/middleware.*"
  - "**/auth/**"
---

## IDOR対策（権限差し替え攻撃面）
- データ取得・更新・削除のリクエストで、リソース所有者IDをURLパラメータ/ボディから受け取らない
- ログイン中ユーザーIDはサーバー側セッション/JWTから取得し、対象レコードの所有者と一致するか必ず検証
- 例: `GET /api/users/{id}/profile` で `{id}` を信用するな。`session.userId === record.userId` をサーバー側で検証

## プロンプト・LLM入出力の機密漏洩
- APIキー・トークン・個人情報・社内情報をプロンプトに**貼るな**
- LLMからのエラーログ・トレースをそのまま返却するな（プロンプト内容が露出するリスク）
- ユーザー入力をプロンプトに連結する前にサニタイズ（プロンプトインジェクション対策）

## 入力バリデーション
- 全入力（body / query / params / header）をサーバー側で再検証
- クライアント側バリデーションはUX補助。信頼してはならない
- スキーマ検証ライブラリ（zod / joi / pydantic等）を使い、型・範囲・形式を厳格化

## エラー隠蔽（本番環境）
- 本番では抽象メッセージのみ返す（「Internal Server Error」「Bad Request」等）
- スタックトレース・SQLクエリ・内部パス・ライブラリバージョンを返却するな
- 詳細はサーバー側ログに集約。クライアントには `errorId` のみ返してログ照合可能に

## レートリミット
- 認証不要エンドポイント（`/api/contact`, `/api/signup`, `/api/search`等）には必須
- 制限超過時は HTTP 429 + `Retry-After` ヘッダー
- 詳細: docs/ops/rate-limit-sop.md

---

詳細SOP:
- docs/ops/rate-limit-sop.md（レートリミット実装）
- docs/ops/incident-response-sop.md（漏洩・侵害発生時の対応プロトコル）
- docs/ops/api-provider-compliance.md（外部 API 提供元の商用利用条件・データ保持・地域制限の横断台帳）
- docs/ops/sentry-introduction-sop.md（Sentry エラー追跡導入手順、E-3 ログ追跡解消策）
