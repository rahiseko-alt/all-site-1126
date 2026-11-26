# API Provider Compliance Reference

> **目的:** vibe-base 全プロダクトが利用する外部 API 提供元の **商用利用条件 / データ保持 / 地域制限 / 価格モデル** を一覧化。F-3-c（セキュリティ診断 Step 3-F）の根拠資料。
> **対象外:** SDK バージョン・API 制限・無料枠 → `external-service-check-template.md`（プロダクト単位）に記載
> **更新タイミング:** API 提供元の規約変更通知受領時 / 新規 API 採用時 / 年 1 回の定期レビュー
> **作成日:** 2026-05-04 Session 253（B カテゴリ自走タスク）

---

## 1. 利用 API 一覧（vibe-base 全プロダクト）

| プロバイダー | プロダクト | 用途 | API キー保持者 | 月額コスト想定 |
|------------|----------|------|--------------|--------------|
| **Google Gemini API** | ai-concierge/app（顧客 key 持参） / review-app | チャット応答 / クチコミ AI 分析 | ai-concierge=顧客 / review-app=マスター | 無料枠（15 RPM）|
| **OpenAI GPT-4o-mini** | ai-concierge/app（顧客 key 持参） | チャット応答（Gemini 切替先）| 顧客 | 顧客負担（顧客管理プラン）|
| **Google Places API (New)** | review-app | 店舗検索・autocomplete | マスター | 月額 0〜数 USD（Pro ティア無料枠 5K/月）|
| **Google Business Profile API** | review-app | クチコミ取得（GBP 連携店舗）| マスター（Bring-Your-Own-Token）| 無料 |
| **Supabase**（管理 SaaS）| ai-concierge / aiueo/lp / review-analysis/lp | DB / Auth | マスター | Free 枠（500MB DB）|
| **Firebase Admin** | foodee | Firestore + Auth | マスター | Free 枠 |
| **Neon Postgres** | review-app | 本番 DB | マスター | Free 枠 300h/月 |
| **PocketBase**（自前ホスト）| aiueo/app | DB / Auth | マスター（Oracle Cloud Free Tier）| 無料 |
| **Resend** | ai-concierge / review-app | メール送信 | マスター | Free 枠 100/日 |
| **Stripe** | omotenashi-trainer（Payment Link）/ review-app（予定 Stage 3） | 決済 | マスター | 取引手数料のみ |
| **Vercel** | 全 Next.js プロダクト | ホスティング | マスター | Pro 利用中 |

---

## 2. プロバイダー別 規約サマリ

> ⚠️ 各規約は変更されうるため、**マスター手動で公式サイト確認**が最終的に必要。本ドキュメントは 2026-05 時点の知識ベースの整理。

### 2.1 Google Gemini API（Google AI Studio / Google Cloud Vertex AI）

| 観点 | 概要（要マスター確認） | 確認 URL |
|------|----------------------|---------|
| 商用利用 | 有料プラン（Vertex AI 経由）で商用 OK / Gemini API Free 枠は出力をモデル改善に利用される（学習に使われる）| https://ai.google.dev/gemini-api/terms |
| データ保持 | Free 枠: ログ保持 + 学習利用あり / Paid: ログ保持あり、学習利用なし | https://ai.google.dev/gemini-api/docs/data-collection |
| 地域制限 | EEA / イギリス / スイスでは商用提供制限あり（一部地域でロールアウト） | 同上 |
| 価格モデル | gemini-2.5-flash: $0 (Free 15 RPM)/ Paid 入出力トークン課金 | https://ai.google.dev/pricing |

**マスター確認項目:**
1. ai-concierge は顧客 key 持参（顧客が規約遵守責任者）→ 顧客に Free/Paid 区分を案内する
2. review-app は無料枠で運用中。商用化（決済導入）時は Paid 移行が必要か再判定
3. EEA ユーザーが来た場合のサービス制限文言を terms.html に追記要

---

### 2.2 OpenAI API（GPT-4o-mini）

| 観点 | 概要（要マスター確認） | 確認 URL |
|------|----------------------|---------|
| 商用利用 | API 経由は商用 OK | https://openai.com/policies/terms-of-use |
| データ保持 | API データはデフォルトで 30 日保持、学習利用なし（オプトアウト不要） | https://openai.com/policies/api-data-usage-policies |
| 地域制限 | 一部国（北朝鮮・イラン等）で利用不可 | https://platform.openai.com/docs/supported-countries |
| 価格モデル | gpt-4o-mini: 入力 $0.15/1M / 出力 $0.60/1M | https://openai.com/api/pricing |

**マスター確認項目:**
1. ai-concierge は顧客 key 持参のため OpenAI 規約は顧客と OpenAI の契約。納品書類に「顧客が OpenAI 規約に同意する」旨を明記
2. 北朝鮮・イラン等の地域からのアクセスは制限される旨を terms.html に注記

---

### 2.3 Anthropic Claude API

| 観点 | 概要 | 確認 URL |
|------|------|---------|
| 商用利用 | API 経由は商用 OK | https://www.anthropic.com/legal/commercial-terms |
| データ保持 | Bedrock 経由は AWS リージョン規約 / Anthropic 直接 API は学習利用なし（オプトアウト不要）| https://privacy.anthropic.com/ |
| 地域制限 | 一部国で利用不可（Anthropic Acceptable Use Policy 参照）| https://www.anthropic.com/legal/aup |
| 価格モデル | Claude Sonnet 4.6: 入力 $3/1M / 出力 $15/1M（参考） | https://www.anthropic.com/pricing |

**マスター確認項目:**
1. 現状 vibe-base プロダクトで Anthropic API 直接利用なし（Claude Code 経由のみ → 開発ツール扱い）
2. 将来プロダクトに組み込む場合は AUP 確認 + terms.html 整備

---

### 2.4 Replicate API

| 観点 | 概要 | 確認 URL |
|------|------|---------|
| 商用利用 | 商用 OK | https://replicate.com/terms |
| データ保持 | 入力・出力データは 1 時間 保持後削除（ヒストリー機能は別途有効化）| https://replicate.com/docs/reference/policies |
| 地域制限 | 標準制限のみ（米国輸出規制準拠） | 同上 |
| 価格モデル | モデルごと従量課金（GPU 時間）| https://replicate.com/pricing |

**マスター確認項目:**
1. 現状 vibe-base 稼働中プロダクトで Replicate 利用なし（廃番 video-studio で使用していた、API キー継続保持中 / 別用途で使用）
2. 別用途の利用先を memory に記録要（`docs/ops/dead-products-registry.md` の Replicate 継続使用メモ確認）

---

### 2.5 Stripe API

| 観点 | 概要 | 確認 URL |
|------|------|---------|
| 商用利用 | 商用必須（個人事業主・法人）| https://stripe.com/jp/legal |
| データ保持 | PCI DSS 準拠、カード情報は Stripe 側保持（マーチャント側にカード番号渡らない）| https://stripe.com/jp/privacy |
| 地域制限 | Stripe アカウント開設地域（日本含む 40+ 国）で利用可 | https://stripe.com/global |
| 価格モデル | 国内クレカ 3.6% + 高額帯ディスカウント | https://stripe.com/jp/pricing |

**マスター確認項目:**
1. omotenashi-trainer は Payment Link（API 不使用、Stripe 管理画面から URL 発行）→ API 規約適用範囲限定
2. review-app の Stage 3 決済導入時に API キー（公開可能 publishable + サーバー側 secret）の管理運用を確定
3. PCI DSS スコープを「マーチャント側で持たない」運用にする（Stripe Checkout / Payment Link 経由のみ）

---

### 2.6 Google Maps Platform（Places API New）

| 観点 | 概要 | 確認 URL |
|------|------|---------|
| 商用利用 | 商用 OK ただし表示要件あり（Google ロゴ・帰属表示）| https://cloud.google.com/maps-platform/terms |
| データ保持 | ユーザー側のキャッシュ制限あり（30 日上限）| https://cloud.google.com/maps-platform/terms/maps-prohibited-uses |
| 地域制限 | 特定国のサービス制限あり | 同上 |
| 価格モデル | SKU 別月額無料枠 + 超過従量。**review-app で 2025-03 改定後の体系を CLAUDE.md に詳細記載済み** | https://developers.google.com/maps/billing-and-pricing/pricing |

**マスター確認項目:**
1. review-app の Place ID キャッシュ期間が 30 日上限を超えていないか確認（DB 側の保持戦略）
2. 検索結果表示時の Google ロゴ・帰属表示 の有無（UI で表示されているか確認）
3. 詳細課金リスクは `products/review-analysis/CLAUDE.md` の「Places API 課金リスク調査（2026-03-24 Session 59）」セクション参照

---

## 3. プロダクト × 規約遵守状態マトリックス

| プロダクト | 利用 API | 商用利用 OK | 地域制限への対応 | 規約変更追跡 |
|----------|---------|-----------|----------------|------------|
| ai-concierge/app | Gemini / OpenAI（顧客 key）/ Supabase / Resend | ✅ | ⚠️ EEA / 制限国の terms 整備要 | 顧客契約に依存 |
| aiueo/app | PocketBase（自前）/ Supabase（LP） | ✅ | ✅ | マスター手動 |
| foodee/app | Firebase Admin / Resend | ✅ | ✅ | マスター手動 |
| review-app | Gemini / Google Places / GBP / Neon / Resend | ✅ | ⚠️ EEA terms 整備要 | マスター手動 |
| omotenashi-trainer | Stripe Payment Link | ✅ | ✅（日本国内向け）| Stripe 通知 |
| homepage | （なし）| N/A | N/A | N/A |
| coach | （未デプロイ）| - | - | - |
| kobaraku | （個人ツール）| N/A | N/A | N/A |

---

## 4. マスター対応項目（Session 253 マスター指摘で訂正）

> Session 253 当初は 6 項目挙げたが、マスター指摘「対応済じゃないか調べろ」で再確認した結果、3 項目は既に対処済。実残作業のみ列挙。

### 既決事項（対処不要）

| # | 当初指摘内容 | 確認結果 |
|---|------------|---------|
| ✅ | Replicate API キーの現用途 | `docs/ops/dead-products-registry.md` の動画スタジオ系統エントリにマスター明示判断「他プロダクトで継続使用、共有リソース」記録済 |
| ✅ | ai-concierge 納品書類の規約同意 | `docs/delivery/07-order-to-aftercare-flow.html` で terms.html 案内 + 初回ログイン時の同意画面 + DB 同意記録が実装済（`TermsAccept.jsx` + `api/terms-accept.js`）|
| ✅ | terms.html 地域制限文言 | 4 プロダクト legal.html すべてで「日本法に準拠」明記済（実質的な国内主体運営の表明）|

### 実残作業

| # | 項目 | 優先度 | 所要 |
|---|------|------|------|
| 1 | review-app の Place ID キャッシュ保持期間が Maps Platform 規約 30 日上限内か確認 + 削除ポリシー実装（grep で TTL 不検出、Prisma DB 永続化のため超過リスクあり）| 中 | 30 分 確認 + 1-2 時間 実装 |
| 2 | review-app UI で Places API データに「Powered by Google」帰属表示があるか確認 + 不在なら追加（grep で Places API 用 attribution 不検出。OpenStreetMap 用のみあり）| 中 | 30 分 確認 + 30 分 実装 |
| 3 | 年次レビューのカレンダー登録（規約変更追跡 6 サービス分）| 低 | 5 分 |

---

## 5. 規約変更追跡フロー

1. 各プロバイダーの **公式 changelog / 規約改定通知** を年次でチェック
2. 重要な変更があった場合、本ドキュメントの該当セクションを更新
3. 影響を受けるプロダクトの runbook.md / risk-diagnosis.md にリスク記録
4. 必要に応じて terms.html / コードを更新

---

## 6. 参考

- セキュリティ診断 Step 3-F 判定: `memory/project_security-diagnosis-step3ef-result.md`
- Step 4 差分報告: `memory/project_security-diagnosis-step4-report.md`
- Step 5 包括評価表: `memory/project_security-diagnosis-step5-comprehensive.md`
- Places API 課金リスク調査: `products/review-analysis/CLAUDE.md` 運用メモ
- 廃番製品台帳（Replicate 継続使用情報）: `docs/ops/dead-products-registry.md`
