# Aiueo オンボーディング自動化 — セットアップ手順

> 本ドキュメントは半自動オンボーディングを稼働させるために必要な手動セットアップの手順です。

---

## 1. Supabase: signups テーブル カラム追加

Supabaseダッシュボード → SQL Editor で以下を実行:

```sql
ALTER TABLE signups
ADD COLUMN IF NOT EXISTS setup_token TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS store_name TEXT,
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;
```

### カラム説明

| カラム | 型 | 用途 |
|--------|------|------|
| `setup_token` | TEXT (UNIQUE) | セットアップページURLに含まれるワンタイムトークン |
| `status` | TEXT | `pending` → `setup_complete` → `provisioned` → `active` |
| `store_name` | TEXT | ユーザーが入力した店舗名（日本語） |
| `contact_name` | TEXT | 担当者名 |
| `phone` | TEXT | 電話番号（任意） |

---

## 2. Gmail: アプリパスワード取得

自動返信メール・通知メールの送信に使用します。

1. [Google アカウント管理](https://myaccount.google.com/) を開く
2. セキュリティ → **2段階認証** が有効であることを確認
3. セキュリティ → **アプリ パスワード** を開く
   - 直接URL: https://myaccount.google.com/apppasswords
4. アプリ名に `Aiueo` と入力 → **作成**
5. 表示された16文字のパスワードをコピー（スペースは除去）

---

## 3. Vercel: 環境変数追加

Vercelダッシュボード → aiueo/lp → Settings → Environment Variables で以下を追加:

| 変数名 | 値 | 説明 |
|--------|------|------|
| `GMAIL_USER` | マスターのGmailアドレス | メール送信元 |
| `GMAIL_APP_PASSWORD` | 手順2で取得したパスワード | Gmail SMTP認証 |
| `SETUP_BASE_URL` | `https://aiueo.kouheikosehira.com` | セットアップページURL生成用 |
| `NOTIFICATION_EMAIL` | マスターのGmailアドレス | 通知先（GMAIL_USERと同じでOK） |

**注意:** 既存の `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` はそのまま維持してください。

環境変数追加後、**Redeploy** が必要です（Settings → Deployments → 最新のデプロイ → Redeploy）。

---

## 4. LP npm install

nodemailer 依存の追加のため、次回デプロイ時に自動でインストールされます。
ローカルテスト時は:

```bash
cd products/aiueo/lp && npm install
```

---

## 5. サーバー: スクリプト更新

provision-client.sh と deprovision-client.sh をサーバーに配置:

```bash
# ローカルからサーバーへコピー
scp scripts/provision-client.sh root@<server>:/pb-shared/provision-client.sh
scp scripts/deprovision-client.sh root@<server>:/pb-shared/deprovision-client.sh
chmod +x /pb-shared/provision-client.sh /pb-shared/deprovision-client.sh
```

---

## 6. フロー全体図

```
ユーザーがLPでメール入力
  ↓ POST /api/signup
  ├→ Supabase: signups に保存 (status=pending, setup_token生成)
  ├→ ユーザーに自動返信メール (セットアップページURLを含む)
  └→ マスターに通知メール (申し込み詳細 + プロビジョニング手順)
  ↓
ユーザーがセットアップページにアクセス (/setup.html?token=xxx)
  ↓ GET /api/setup?token=xxx (トークン検証)
  ↓ POST /api/setup (店舗名等送信)
  ├→ Supabase: status → setup_complete
  └→ ユーザーに「環境準備中」メッセージ表示
  ↓
マスターがGmail通知を確認
  ↓ 手動 (5分)
  ├→ sudo bash /pb-shared/provision-client.sh <client-name>
  └→ bash scripts/deploy-client-frontend.sh <client-name> <pb-api-url>
  ↓
マスターがURL + パスワードをクライアントに送付 (Signal/メール)
  ↓
ユーザーがメニュー登録 → 利用開始
```

---

## 7. provision-client.sh 安全機能 (追加分)

| 機能 | 説明 |
|------|------|
| 容量チェック | アクティブインスタンス数 ≥ 5 で拒否 |
| RAMチェック | 空きメモリ < 200MB で拒否 |
| 排他ロック | flock で同時実行を防止 |
| ロールバック | 失敗時にディレクトリ・サービス・設定を自動クリーンアップ |

## 8. deprovision-client.sh

```bash
# クライアント削除（データも消す）
sudo bash /pb-shared/deprovision-client.sh <client-name>

# クライアント停止（データは残す）
sudo bash /pb-shared/deprovision-client.sh <client-name> --keep-data
```
