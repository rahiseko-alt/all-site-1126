# Client Registry — Aiueo Bモデル クライアント台帳

> **更新ルール:** クライアント追加・ステータス変更時に必ず更新。サーバー側 `registry.json` と同期。

## クライアント一覧

| # | クライアント名 | PBポート | サブドメイン | Admin Email | Vercel URL | ステータス | 作成日 |
|---|--------------|---------|------------|-------------|-----------|----------|--------|
| 0 | (自社テスト) | 8090 | api.kouheikosehira.com | admin@example.com | mobile-order-system.vercel.app | 稼働中 | 2026-02 |

## ステータス定義

| ステータス | 説明 |
|-----------|------|
| provisioned | PBインスタンス作成済み。メニュー未登録 |
| setup | メニュー登録中（Zoom併走 or 代行） |
| active | 本番稼働中 |
| suspended | 一時停止 |
| terminated | 解約済み（データ保持30日） |

## パスワード管理

- PB管理者パスワードはサーバー上の `/home/ubuntu/pb-clients/registry.json` に記録
- クライアントへの納品時はパスワードを暗号化チャネル（Signal等）で送付
- **本ファイルにパスワードを記載しない**

## 運用手順

1. **新規クライアント追加:** `scripts/provision-client.sh <client-name>` を実行
2. **メニュー登録:** PB Admin UI (`https://<subdomain>/_/`) で products コレクションに登録
3. **QRコード納品:** Admin画面 → Roles & QR タブでトークン発行 → QR印刷データ納品
4. **利用開始:** クライアントにフロントエンドURLとadminパスワードを送付

## インフラ上限（2026-03-15時点）

- Oracle Cloud Free Tier: 2GB RAM
- 安全圏: 同時5クライアント（各PBインスタンス ~200MB RAM）
- 限界: 10クライアント（要VPS移行検討）
- 詳細: `docs/aiueo-business-model-decision.md` §4
