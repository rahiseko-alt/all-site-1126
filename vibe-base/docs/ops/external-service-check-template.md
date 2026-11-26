> ⚠️ 要点は `.claude/rules/quality-templates.md` で自動注入される。ここは詳細版。

# 外部サービス確認テンプレート v1.0

> **PCサイクル P1 #7（外部サービス確認）で使用する調査・記録フォーマット。**
> 全プロダクト共通。プロダクト内の `docs/external-service-check.md` にコピーして使う。
> 出典: review-analysis Session 38-39（Google API群+NextAuth+Prisma+Neon+Vercel の調査から汎用化）

---

## 目的

プロダクトが依存する外部サービスの最新仕様・制限・リスクを調査し、一覧で記録する。P1開始時に全サービスを確認し、以降はデプロイ前・障害発生時に更新する。

---

## 調査項目テンプレート

各外部サービスについて以下の表を作成する。

```markdown
## {サービス名}

| 項目 | 内容 |
|------|------|
| SDK/ライブラリ | 使用パッケージ名とバージョン |
| 旧SDK | 移行済みか。EOL日 |
| エンドポイント | ベースURL |
| 認証方式 | API Key / OAuth 2.0 / Bearer Token 等 |
| 無料枠・制限 | RPM / TPD / ストレージ / コンピュート時間 等 |
| 既知のリスク | クォータ超過 / タイムアウト / breaking change 等 |
| 対応状況 | 変更不要 / 要対応（内容） |
| 確認日 | YYYY-MM-DD |
```

---

## 典型的な調査対象カテゴリ

| カテゴリ | 例 | 重点確認項目 |
|---------|---|-------------|
| AI/LLM | Gemini, OpenAI, Claude | SDK移行状況、無料枠(RPM/TPD)、モデル名変更 |
| 外部API | Google Places, Maps, YouTube Data | エンドポイントバージョン、認証方式、クォータ |
| 認証 | NextAuth, Auth0, Firebase Auth | betaステータス、breaking change予定 |
| DB/ORM | Prisma, Drizzle, TypeORM | メジャーバージョン移行、adapter方式変更 |
| DBホスティング | Neon, Supabase, PlanetScale | 無料枠（コンピュート/ストレージ）、リージョン |
| ホスティング | Vercel, Netlify, Cloudflare | 関数タイムアウト、プラン制限、商用利用可否 |
| 決済 | Stripe, PayPay | API変更、手数料率 |
| メール | Resend, SendGrid | 送信数制限、ドメイン認証 |

---

## 運用ルール

1. **P1 #7 開始時:** 全依存サービスを調査し、テンプレートに記入
2. **デプロイ前:** 変更があったサービスのみ再確認
3. **障害発生時:** 該当サービスの項目を更新し、対応欄に記録
4. **確認日を必ず記入。** 古い情報は判断を誤る原因になる
5. **複数候補の比較が必要な場合は Appendix A を参照**

---

---

## Appendix A: API仕様比較表フォーマット

> 出典: review-analysis（external-services.md）から共有資産化

同一カテゴリの外部サービスを比較検討する際、以下のフォーマットで並べて記録する。

### 料金比較

```markdown
## {カテゴリ名} 料金比較（YYYY-MM-DD時点）

| モデル/プラン | Input単価 | Output単価 | 無料枠 | 備考 |
|-------------|-----------|-----------|--------|------|
| {サービスA} | ${X}/1M | ${X}/1M | {RPD等} | |
| {サービスB} | ${X}/1M | ${X}/1M | {RPD等} | |
```

### レート制限比較

```markdown
## {カテゴリ名} レート制限比較

| サービス | Tier | RPM | TPM/TPD | RPD | 備考 |
|---------|------|-----|---------|-----|------|
| {サービスA} | Free | {N} | {N} | {N} | |
| {サービスA} | Paid | {N} | {N} | — | |
| {サービスB} | Free | {N} | {N} | {N} | |
```

### 機能仕様比較

```markdown
## {カテゴリ名} 機能仕様比較

| 項目 | {サービスA} | {サービスB} | 備考 |
|------|-----------|-----------|------|
| データ取得上限 | {例: 5件/リクエスト} | {例: 50件} | |
| ソート方式 | {例: most_relevant / newest} | {例: date} | |
| 認証方式 | {例: API Key + FieldMask} | {例: OAuth 2.0} | |
| 保存可否 | {例: 保存NG、都度取得} | {例: 30日TTL} | risk-diagnosis.mdと照合 |
```

### 使い方

1. P1 #7 で調査テンプレート（上記メインテンプレート）を記入
2. 同カテゴリに複数候補がある場合、本比較表で並列比較
3. 選定理由を `docs/external-service-check.md` の対応状況欄に記録
4. 料金・制限の確認日を必ず明記（API仕様は頻繁に変わる）

---

v1.0 | 2026-03-24 | review-analysis の external-service-check.md から共有資産化
v1.1 | 2026-03-24 | Appendix A: API仕様比較表フォーマット追加（review-analysis external-services.md から共有資産化）
v1.2 | 2026-03-25 | 運用ルールにAppendix A前方参照を追加
