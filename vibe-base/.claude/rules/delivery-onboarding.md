---
description: 納品・オンボーディング・メール設計のテンプレート
paths:
  - "products/*/docs/delivery*"
  - "products/*/docs/provisioning*"
  - "products/*/docs/operation-manual*"
---

## プロビジョニング
- 登録方式（自動/セルフ/手動）・初期設定（必須/任意/デフォルト）・マスター手動作業の内容と所要時間を明記
- 環境変数チェックリスト必須

## 運用マニュアル
- 開発用語禁止。画面ごとに手順を書け
- 役割別に分離（管理者/ユーザー/ゲスト）
- トラブルシューティング: 症状（ユーザーの言葉）→ 原因 → 対処法（3列表）

## メール設計
- 4種類: ウェルカム（自動）/ フォローアップ（条件トリガー）/ 管理者通知（自動）/ 自動返信（フォーム送信後）
- APIキーは環境変数に。クライアントコードに書くな
- エラー時: 1回リトライ + 管理者通知。ユーザーの操作をブロックするな

納品テンプレートのvest1: docs/standards/templates/ を参照

詳細: docs/ops/onboarding-ops-templates.md / docs/ops/email-template-guide.md / docs/ops/design-doc-templates.md
