---
description: バックアップ戦略（backup-config編集時）
paths:
  - "products/*/backup-config.md"
---

## バックアップ対象（必須カテゴリ）
- DB（Postgres / MySQL / SQLite等のダンプ）
- オブジェクトストレージ（S3 / Cloud Storage / R2のユーザーアップロード）
- 環境変数（.env / Vercel env / Cloud Run env）
- シークレット（API キー / OAuth secret は別途暗号化バックアップ）

## バックアップ先
- **別クラウド推奨**（同一クラウドのリージョン障害で全滅を避ける）
- 例: 本番 GCP → バックアップ Cloudflare R2 / Backblaze B2
- rclone でクラウド間転送を自動化

## 頻度と世代管理（3段階）
- 日次: 直近30日分保持
- 週次: 直近12週分保持
- 月次: 直近12ヶ月分保持
- 古い世代は自動削除（lifecycle policy）

## リストア検証
- **最低四半期に1回**、実際にリストアしてデータ整合性を確認
- 検証なしのバックアップは「存在しないも同然」
- 検証手順は backup-config.md に記載

## 暗号化（必須）
- バックアップファイルは保存時に暗号化（AES-256推奨）
- 鍵管理は本番環境とは別の KMS で実施
- 鍵紛失時の復旧不能リスクを backup-config.md に明記

詳細: docs/ops/backup-strategy-sop.md
