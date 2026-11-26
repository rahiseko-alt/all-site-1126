> ⚠️ 要点は `.claude/rules/backup.md` で自動注入される。ここは詳細版。

# バックアップ戦略SOP

> **対象:** データ永続化を伴う全プロダクト（「運用Runbook整備」時に参照必須）
> **起源:** catnose#3「ストレージ自動バックアップ」を実装ガイド化
> **関連SOP:** `incident-response-sop.md`（障害時のリストア手順）

---

## §1. バックアップ対象

### 必須カテゴリ
| カテゴリ | 例 | 復旧優先度 |
|---------|-----|----------|
| **DB** | Postgres / MySQL / SQLite / Firestore | 最高（ユーザーデータ） |
| **オブジェクトストレージ** | S3 / GCS / Cloudflare R2（ユーザーアップロード画像・動画） | 高 |
| **環境変数** | .env / Vercel env / Cloud Run env | 中（再設定可だが時間ロス） |
| **シークレット** | API キー / OAuth secret / DB password | 最高（漏洩リスク高、別途暗号化必須） |
| **コード** | git remote（GitHub等） | 低（既に分散済み） |

### 対象外（バックアップ不要）
- ビルド成果物（再生成可能）
- ログ（保管要件があれば別途長期保管設計）
- キャッシュ（Redis等の揮発前提データ）

### 実施タイミング
- インフラ決定時にバックアップ対象を確定
- 「運用Runbook整備」完了条件として `backup-config.md` に対象一覧を記載

---

## §2. バックアップ先

### 別クラウド推奨ルール
**本番と同一クラウドへのバックアップは禁止。** リージョン障害・アカウントBANで全滅する。

| 本番 | 推奨バックアップ先 |
|------|------------------|
| GCP | Cloudflare R2 / Backblaze B2 / AWS S3 |
| Vercel + Supabase | Cloudflare R2（Supabaseは内蔵バックアップ + 外部追加） |
| AWS | GCP Cloud Storage / Backblaze B2 |

### rclone活用パターン
クラウド間転送の標準ツール。各クラウドの認証情報を `~/.config/rclone/rclone.conf` に登録。

```bash
# 例: GCSバケットを R2 にミラー
rclone sync gcs:my-product-uploads r2:my-product-backup --progress

# 例: Postgres ダンプを R2 に直接アップロード
pg_dump $DATABASE_URL | gzip | rclone rcat r2:my-product-backup/db/$(date +%Y%m%d).sql.gz
```

### 実施タイミング
- バックアップ先のクラウド契約はインフラ決定時にマスター承認
- 認証情報の発行・rclone設定は 「運用Runbook整備」着手時

---

## §3. 頻度と世代管理（3段階）

### 標準ポリシー
| 頻度 | 保持期間 | 用途 |
|------|---------|------|
| **日次** | 直近30日分 | 直近のオペミス・データ破損からの復旧 |
| **週次** | 直近12週（約3ヶ月）分 | 中期の論理エラー検知後の復旧 |
| **月次** | 直近12ヶ月分 | 長期の監査要件・歴史データ保全 |

### 世代管理の実装
- バックアップ先のlifecycle policyで古い世代を自動削除
- R2 / S3 / GCS いずれもバケットレベルで設定可
- 削除ルールは `backup-config.md` に明記

### スケジューリング
- GitHub Actions cron / Vercel Cron / GCP Scheduler で実行
- 失敗時は `incident-response-sop.md` のP1（重大）扱いで通知

### 実施タイミング
- 自動スケジュール起動は 「運用Runbook整備」完了条件
- ユーザーデータ量が10GB超えたタイミングで頻度見直し

---

## §4. リストア検証

### 検証ルール
- **最低四半期に1回**、実際にリストアしてデータ整合性を確認
- 検証なしのバックアップは「存在しないも同然」
- 本番から完全分離した検証環境で実施（誤操作で本番上書き防止）

### 検証手順テンプレート
```
1. 検証用の独立環境を起動（local docker / 別プロジェクト）
2. 最新バックアップを取得（rclone copy ...）
3. 復元実行（pg_restore / 個別ファイル展開）
4. 検証クエリ実行
   - 行数比較: 本番と件数が一致するか
   - サンプル整合性: ランダム10件のフィールド比較
   - リレーション検証: foreign key の整合性
5. 結果を memory.md / backup-config.md に記録
6. 検証環境を破棄
```

### 失敗時の対応
- 検証失敗（リストア不可・データ破損）は `incident-response-sop.md` のP0扱い
- 即座にバックアップ手順を再設計
- 過去のバックアップ全件を再検証

### 実施タイミング
- 四半期ごと（1月 / 4月 / 7月 / 10月の第1週）
- 大きな schema 変更後（migration適用後の最初の月次バックアップで検証）

---

## §5. 暗号化

### 必須要件
- **バックアップファイルは保存時に暗号化（AES-256推奨）**
- 平文バックアップは禁止（侵害時の被害が本番と同等）
- バケット側暗号化（SSE-S3 / SSE-KMS）+ クライアント側暗号化の二層推奨

### 鍵管理
- 鍵は本番環境とは **別の KMS** で管理
  - 例: 本番が GCP KMS なら、バックアップ鍵は AWS KMS / Cloudflare の独立アカウント
- 鍵紛失時の復旧不能リスクを `backup-config.md` に明記
- 鍵バックアップ手順も別途定義（鍵の鍵は紙保管 + 金庫等）

### 実装パターン
```bash
# 暗号化してアップロード
pg_dump $DATABASE_URL | \
  gzip | \
  openssl enc -aes-256-cbc -salt -pbkdf2 -k $BACKUP_KEY | \
  rclone rcat r2:my-product-backup/db/$(date +%Y%m%d).sql.gz.enc

# 復号
rclone cat r2:my-product-backup/db/20260101.sql.gz.enc | \
  openssl enc -aes-256-cbc -d -salt -pbkdf2 -k $BACKUP_KEY | \
  gunzip | \
  psql $RESTORE_DB_URL
```

### 実施タイミング
- 暗号化キー発行は 「運用Runbook整備」着手時
- 鍵ローテーションは年1回（年初）

---

## §6. 各プロダクトの backup-config.md テンプレ

`products/{product}/backup-config.md` として以下を初期化（「運用Runbook整備」完了条件）:

```markdown
# {product} バックアップ設定

## バックアップ対象
- DB: {Postgres / MySQL / Firestore等のテーブル名・データ規模}
- オブジェクト: {S3バケット名・想定サイズ}
- 環境変数: {Vercel env / Cloud Run env / .env のリスト}
- シークレット: {別途暗号化バックアップ対象一覧}

## バックアップ先
- 本番: {クラウド名・リージョン}
- バックアップ: {別クラウド名・バケット名}
- rclone設定: {認証情報の所在}

## 頻度・世代
- 日次: 直近30日（lifecycle policy: ...）
- 週次: 直近12週
- 月次: 直近12ヶ月

## スケジューラ
- 実行環境: {GitHub Actions / Vercel Cron / GCP Scheduler}
- cron式: {0 3 * * * 等}
- 失敗通知先: マスターメール

## 暗号化
- アルゴリズム: AES-256
- 鍵保管: {KMS名 / 鍵バックアップ場所}
- 鍵ローテーション: 年1回（次回: YYYY-MM-DD）

## リストア検証
- 最終実施日: {YYYY-MM-DD}
- 次回予定: {YYYY-MM-DD}
- 検証手順: {ファイルパス or インラインで記載}

## 鍵紛失時の復旧不能リスク
{復旧不能となるシナリオを明記。例: 「鍵を紛失すると過去全バックアップが復号不能。鍵バックアップは紙印刷 + 金庫保管」}
```

### 実施タイミング
- 「運用Runbook整備」着手時に本テンプレで初期化
- リストア検証実施ごとに「最終実施日」を更新
- 鍵ローテーション時に「次回」を更新

---
v1.0 | 2026-04-27 | 構造改革プロジェクト T2 で新設（catnose#3「ストレージ自動バックアップ」起源）
