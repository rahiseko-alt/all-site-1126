# Aiueo 外部サービス最新情報

> 調査日: 2026-03-16 Session 24
> 目的: P1#7 外部サービス最新情報確認

---

## 1. PocketBase（バックエンド）

| 項目 | 内容 |
|------|------|
| 使用バージョン | v0.22 |
| 最新バージョン | v0.36+ (SQLite 3.51.2) |
| 料金 | 無料（OSS） |
| API仕様変更 | v0.23以降で `_superusers` 導入（認証API変更）。現行は `/api/admins/auth-with-password`（v0.22互換） |
| **リスク** | **v0.22は大幅に古い。** セキュリティパッチ未適用の可能性。ただしアップグレードは認証API破壊的変更を伴うため慎重な対応が必要 |
| 対応方針 | V2以降でアップグレード検討。現状は自治憲法§2に「PB v0.22。`_superusers`未対応」と明記済み |

---

## 2. Vercel（フロントホスティング）

| 項目 | 内容 |
|------|------|
| 使用プラン | Hobby（無料） |
| 料金 | ¥0 |
| 制限 | 100GB転送/月、1M Edge Requests/月、1M Function呼出/月、CPU 4時間/月、1GBストレージ |
| 超過時 | 一時停止（追加購入不可） |
| **注意** | **Hobbyプランは個人・非商用限定。** 商用利用はPro（$20/月）が必要。Bモデルで有料顧客を持つ場合、LP・appともにPro移行が必要になる可能性あり |
| 対応方針 | 初期顧客獲得前は問題なし。有料契約発生時にPro移行を検討 |

---

## 3. Oracle Cloud Free Tier（サーバー）

| 項目 | 内容 |
|------|------|
| 使用構成 | Always Free VM（ARM/2GB RAM） |
| 料金 | ¥0 |
| 制限 | Ampere A1: 合計4 OCPU / 24GB RAM。AMD: 2台（各1/8 OCPU, 1GB RAM）。ストレージ: 200GB。オブジェクト: 20GB |
| 永続性 | Always Free = アカウント存続中は無期限無料 |
| **注意** | 現在1台（2GB RAM）のみ使用。残り22GB RAM分の余裕あり。5クライアント上限はPBプロセスのメモリ制約であり、Oracle側の制約ではない |

---

## 4. Cloudflare Tunnel（トンネル）

| 項目 | 内容 |
|------|------|
| 使用形態 | Named Tunnel（無料） |
| 料金 | ¥0 |
| 制限 | 1000トンネル/アカウント、基本トンネリングは無制限 |
| Zero Trust | 無料枠は50ユーザー（Aiueoでは不使用） |
| **注意** | 特に問題なし。現在の用途（PBサーバー公開）では制限に抵触しない |

---

## 5. Stripe（決済）

| 項目 | 内容 |
|------|------|
| 使用形態 | Stripe Checkout（LP pricing.html） |
| 手数料 | 3.6% + ¥30/件（日本国内カード） |
| 追加費用 | 国際カード +1%、通貨変換 +1%、Billing 0.7%、Radar 0.05% |
| 月額固定費 | ¥0（初期費用・月額費用なし） |
| **注意** | 手数料は業界標準。コスト発生マップ（`docs/aiueo-business-model-decision.md` §4）に反映済み |

---

## 6. Supabase（LPフォーム）

| 項目 | 内容 |
|------|------|
| 使用プラン | Free |
| 料金 | ¥0 |
| 制限 | 2プロジェクト、500MB DB、50,000 MAU、1GBファイル |
| **注意** | **1週間非アクティブでプロジェクト一時停止。** LP申し込みが1週間なければ停止される可能性あり。停止後はダッシュボードから手動で再開が必要 |
| 対応方針 | LP集客が本格化するまでは許容。頻繁に停止する場合はPro（$25/月）を検討 |

---

## 7. DeepL API（多言語翻訳）

| 項目 | 内容 |
|------|------|
| 使用プラン | Free |
| 料金 | ¥0 |
| 制限 | 500,000文字/月 |
| Pro料金 | $5.49/月 + $25/100万文字 |
| **注意** | Freeプランの翻訳データはDeepLのモデル訓練に使用される可能性あり。メニュー名の翻訳用途では問題なし。500,000文字/月は1店舗なら十分 |

---

## 8. Gmail SMTP（自動返信・通知）

| 項目 | 内容 |
|------|------|
| 使用形態 | アプリパスワード + nodemailer |
| 料金 | ¥0 |
| 制限 | SMTP経由: 100通/日（500宛先/日） |
| ローリング | 24時間ローリングウィンドウ |
| 超過時 | 24時間送信不可 |
| **注意** | 100通/日はBモデル初期（手動プロビジョニング5-10件/月）では十分。ただし申し込み1件で自動返信+マスター通知=2通消費。日50件以上の申し込みが来たら上限に達する |

---

## リスクまとめ

| 優先度 | サービス | リスク | 発生条件 |
|--------|---------|--------|---------|
| 高 | Vercel | 商用利用規約違反 | 有料顧客を持った時点 |
| 中 | PocketBase | セキュリティパッチ未適用 | 常時（v0.22は古い） |
| 中 | Supabase | 非アクティブ停止 | 申し込みが1週間なかった場合 |
| 低 | Gmail | 送信上限 | 日50件以上の申し込み |
| 低 | DeepL | 文字数上限 | 多店舗・大量メニュー |
| なし | Oracle/Cloudflare/Stripe | 現在のリスクなし | — |

---

Sources:
- [PocketBase Releases](https://github.com/pocketbase/pocketbase/releases)
- [Vercel Pricing](https://vercel.com/pricing)
- [Oracle Cloud Free Tier](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)
- [Stripe Japan Pricing](https://stripe.com/en-jp/pricing)
- [Supabase Pricing](https://supabase.com/pricing)
- [DeepL API Plans](https://support.deepl.com/hc/en-us/articles/360021200939-DeepL-API-plans)
- [Cloudflare Tunnel Limits](https://developers.cloudflare.com/cloudflare-one/account-limits/)
- [Gmail Sending Limits](https://support.google.com/mail/answer/22839?hl=en)
