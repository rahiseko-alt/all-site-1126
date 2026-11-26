# {プロダクト名} バックアップ設定

> プロダクトでコピーして埋める雛形。`docs/ops/backup-strategy-sop.md` §6 に対応。
> **このファイルが存在することが「運用準備チェック」の必須条件**（DB/データ永続化があるプロダクト）。

## §1. バックアップ対象

| 対象 | 種別 | 重要度 | RTO / RPO |
|------|------|-------|-----------|
| [DB（Supabase / Firestore / Neon 等）] | データベース | 致命 | RTO 1h / RPO 24h |
| [オブジェクトストレージ（S3 / R2 / Storage）] | ファイル | 重要 | RTO 4h / RPO 24h |
| [環境変数] | 設定 | 重要 | RTO 1h / RPO 0 |
| [シークレット] | 認証情報 | 致命 | RTO 1h / RPO 0 |

## §2. バックアップ先

[記入: rclone / pg_dump / Cloud Scheduler 等。**別クラウド推奨**]

## §3. 頻度と世代管理

- 日次: [スケジュール、保持期間]
- 週次: [スケジュール、保持期間]
- 月次: [スケジュール、保持期間]

## §4. リストア検証（最低四半期に 1 回）

- 直近検証日: [記入]
- 検証手順書: [記入]
- 結果: [記入]

## §5. 暗号化

[記入: at-rest / in-transit の暗号化手段]

## §6. サービス別の代替バックアップ手段

共有リスク台帳 #9「マネージド DB の自動バックアップは限定的」対応:

- **Supabase Free**: 7 日 PITR 非提供 → 手動 `pg_dump` cron で別クラウドへ退避、または Pro 移行
- **Firestore Spark**: 自動バックアップ非対応 → `gcloud firestore export` を Cloud Scheduler で日次実行
- **Neon Postgres**: PITR 要明示設定 → Branch + PITR 設定

詳細SOP: `docs/ops/backup-strategy-sop.md`
