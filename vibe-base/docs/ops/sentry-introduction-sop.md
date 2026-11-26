> ⚠️ 本 SOP は E-3（インシデント追跡用ログ）の解消手段。導入手順とトレードオフを集約。

# Sentry 導入 SOP — エラー追跡・監視導入プロトコル

> **対象:** High 4 プロダクト（ai-concierge / aiueo/app / foodee / review-app）優先。Medium 以下は任意
> **起源:** セキュリティ診断 Step 3-E E-3「ログ追跡 △」（Vercel Hobby 1 時間保管制限）の解消策（Step 5 推奨枠）
> **関連 SOP:** `incident-response-sop.md`（インシデント対応 P1 / P2）/ `cost-budget-sop.md`（無料枠超過監視）

---

## §0. 自動注入なし

本 SOP は導入時のワンショットセットアップ手順。日常的な実装注入は不要。`security-runtime.md` の「エラー隠蔽」「LLM 入出力の機密漏洩」セクションと連動して運用。

---

## §1. なぜ Sentry が必要か

### Vercel デフォルトログの限界

| プラン | ログ保管期間 |
|------|-----------|
| Hobby | **約 1 時間**（インシデント追跡不可）|
| Pro | 24 時間 |
| Enterprise | 30 日 |

**問題:** 不正アクセス・障害発生から検知が翌日以降になると、原因追跡用のログがすでに失われている。

### Sentry が解決する範囲

- **30 日保持**（無料枠でも）
- 例外スタックトレース + ブレッドクラム + 環境情報
- リアルタイム アラート（Slack / Email / Webhook）
- リリース別エラー集計（regression 検知）
- パフォーマンス監視（Web Vitals / Transaction）

### 解決しない範囲

- アクセスログ（Web サーバー全リクエスト）→ Vercel Analytics / Logtail / Axiom 範疇
- 監査ログ（誰が何をしたか）→ アプリ側で DB に明示記録要

---

## §2. 対象プロダクトと優先度

| プロダクト | 優先度 | 理由 |
|----------|------|------|
| **review-app** | 🟠 重要 | NextAuth + 決済（Stage 3）+ Vercel Cron。エラー追跡必須 |
| **ai-concierge/app** | 🟠 重要 | 顧客環境配布製品。バグは販売信用に直結 |
| **foodee/app** | 🟡 推奨 | Firebase Admin + Vercel Cron。RSS パース失敗の追跡用 |
| **aiueo/app/frontend** | 🟡 推奨 | PocketBase 連携。本番障害時のフロント側エラー追跡 |
| **aiueo/lp / review-analysis/lp / homepage / coach** | 🟢 任意 | 静的中心、計測の価値が低い |
| **kobaraku / omotenashi-trainer** | 🟢 任意 | 個人ツール / Stripe Payment Link 経由で API 露出最小 |

---

## §3. アカウント・プロジェクト準備（マスター手動 / 30 分）

### Step 1: アカウント作成

1. https://sentry.io/signup/ にアクセス
2. メール / Google OAuth / GitHub OAuth でアカウント作成（Free Developer プラン）
3. Organization 名を `kouheikosehira` 等で作成

### Step 2: データリージョン選択（重要）

サインアップ時に **US / EU** を選択する画面が出る:
- **US**: デフォルト、Sentry 本社所在地
- **EU**: GDPR 厳格運用が必要な場合（EEA ユーザー対応プロダクトは EU 推奨）

**vibe-base のおすすめ:**
- 国内主体運用 → US で OK（変更不可、慎重に）
- EEA 商用展開予定 → EU を選択

### Step 3: プロジェクト作成（プロダクトごと）

各プロダクトで個別 Project を作成:

| プロダクト | Project Name | Platform |
|----------|-------------|---------|
| review-app | `review-analysis-app` | Next.js |
| ai-concierge/app | `ai-concierge-app` | Next.js（Vite SSR の場合 React）|
| foodee/app | `foodee-app` | Node.js（Vercel Functions）|
| aiueo/app/frontend | `aiueo-app-frontend` | React（Vite）|

各 Project 作成画面で **DSN（Data Source Name）** が表示される。**この DSN は環境変数経由のみで扱う**（コードに直書き禁止、`feedback_secret-pasting-prevention.md` 違反になる）。

---

## §4. SDK 導入（Claude 自走可、プロダクトごと）

### Next.js（review-app / ai-concierge）

```bash
cd products/review-analysis/bot/review-app
npx @sentry/wizard@latest -i nextjs
```

**ウィザードが自動生成:**
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `next.config.mjs` への追記
- `instrumentation.ts`

### Node.js / Vercel Functions（foodee）

```bash
cd products/foodee/app
npm install --save @sentry/node
```

エントリポイント（API Route の先頭）に:

```javascript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV || "development",
  tracesSampleRate: 0.1,
});
```

### React (Vite)（aiueo/app/frontend）

```bash
cd products/aiueo/app/frontend
npm install --save @sentry/react
```

`src/main.jsx` 等エントリで:

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});
```

---

## §5. 環境変数設定（Vercel）

### 設定対象

| 変数名 | 値 | スコープ |
|-------|----|---------|
| `SENTRY_DSN` | プロジェクト DSN | Production + Preview |
| `SENTRY_AUTH_TOKEN` | source maps アップロード用 | Production のみ |
| `NEXT_PUBLIC_SENTRY_DSN` | クライアント送信用（Next.js）| Production + Preview |
| `VITE_SENTRY_DSN` | Vite フロント用 | Production + Preview |

### 設定手順（マスター手動）

1. Vercel Dashboard → Project → Settings → Environment Variables
2. 各変数を「Production + Preview」スコープで追加
3. 「Sensitive」フラグを ON にして値を非表示化
4. デプロイ再実行（`vercel --prod` or push 経由）

### `.env.example` への追記（Claude 自走、コード変更コミット）

```bash
# Sentry エラー監視（マスターが Vercel env で設定）
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

---

## §6. PII 除外設定（重要）

ユーザー個人情報を Sentry に送らないため、以下を必ず設定。

### Next.js（sentry.server.config.ts）

```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV,
  sendDefaultPii: false,  // メール / IP など PII を送らない
  beforeSend(event) {
    // request body / headers から認証情報を除去
    if (event.request?.headers) {
      delete event.request.headers["authorization"];
      delete event.request.headers["cookie"];
      delete event.request.headers["x-api-key"];
    }
    if (event.request?.data) {
      // パスワード / トークン等の値を redacted に
      const redacted = ["password", "token", "secret", "api_key"];
      for (const key of redacted) {
        if (event.request.data[key]) event.request.data[key] = "[REDACTED]";
      }
    }
    return event;
  },
});
```

### React（sentry.client.config.ts）

```typescript
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  sendDefaultPii: false,
  // ユーザー入力フォームのテキストを送らない
  ignoreErrors: ["NetworkError", "Failed to fetch"],
});
```

---

## §7. 動作確認（マスター実機）

### テストエラー送出

各プロダクトに一時テスト route を追加 → 本番デプロイ → アクセス → Sentry ダッシュボードで受信確認:

```typescript
// app/api/test-sentry/route.ts （確認後削除）
import * as Sentry from "@sentry/nextjs";

export async function GET() {
  try {
    throw new Error("Sentry test error - delete this route after verification");
  } catch (e) {
    Sentry.captureException(e);
    return Response.json({ ok: true });
  }
}
```

### 確認項目

- [ ] Sentry ダッシュボードに新規 Issue として表示される
- [ ] スタックトレースが読める（source maps が動作している）
- [ ] environment が `production` で記録されている
- [ ] PII（パスワード等）が `[REDACTED]` で除外されている

確認後、テスト route を削除してコミット。

---

## §8. アラート設定（マスター手動 / 任意）

### 推奨アラート（Sentry Dashboard → Alerts）

| 条件 | 通知先 | 緊急度 |
|------|------|-------|
| 新規 Issue 発生時 | Email | 中 |
| 同じ Issue が 1 時間で 10 回以上発生 | Email + Slack（任意）| 高 |
| Spike Protection（無料枠超過警告 80%）| Email | 高（コスト管理）|

### Slack 連携（任意）

Sentry Settings → Integrations → Slack で Workspace 連携。`#alerts` チャンネル等にプッシュ。

---

## §9. 運用ルール

### 月次レビュー（マスター 15 分）

1. Sentry ダッシュボード → Issues タブで未解決 Issue を確認
2. 優先度別に対処方針決定:
   - High（ユーザー影響）→ 即修正
   - Medium → 次スプリント
   - Low → 監視継続
3. 解決した Issue は「Resolved」に手動設定

### 無料枠監視（重要）

| プラン | 月間イベント上限 | 超過後の挙動 |
|------|--------------|-----------|
| Free Developer | **5,000 events/month** | 自動停止（次月まで送信停止）|
| Team ($26/month〜) | 50,000 events/month | 従量課金 |

**5,000 events/month を超えそうな場合:**
- `tracesSampleRate` を 0.1 → 0.01 に下げる（パフォーマンス監視のサンプリング率）
- `ignoreErrors` で既知の無視可能エラーを除外
- 不要な情報送信を `beforeSend` でフィルタ

---

## §10. リスク・トレードオフ

| 項目 | リスク | 対処 |
|------|------|------|
| **PII 漏洩** | デフォルト設定で IP / Cookie が送信される | §6 の `sendDefaultPii: false` + `beforeSend` で除外 |
| **コスト爆発** | 5,000 events/月超過で Free 枠停止 | §9 月次レビューで監視、超過予兆で sampling 調整 |
| **データリージョン** | US 選択時の越境データ移転（GDPR 対応プロダクト）| EU リージョン選択 |
| **依存追加** | バンドルサイズ +30〜50KB（クライアント側）| クリティカルなフロントは sample 率を下げる |
| **DSN 漏洩** | クライアント側 DSN は公開可能（攻撃者がスパム送信は可能）| `Allowed Domains` 設定で送信元ドメイン限定 |

---

## §11. 代替サービス

Sentry が合わない場合の選択肢:

| サービス | 無料枠 | 特徴 |
|--------|------|------|
| **Logtail / Better Stack** | 1GB/月 | 構造化ログ向け、Sentry より一般ログ寄り |
| **Axiom** | 0.5TB/月（Free） | 大量ログに強い、エラー追跡は弱い |
| **Datadog** | 14 日トライアル | エンタープライズ向け、個人開発には過剰 |
| **New Relic** | 100GB/月（Free）| 1 ユーザーまで Free、APM 寄り |

**vibe-base 推奨:** Sentry（エラー追跡特化、無料枠で High 4 プロダクト同居可能）

---

## §12. 導入チェックリスト（プロダクトごと）

- [ ] Sentry プロジェクト作成（マスター手動）
- [ ] DSN 取得 + Vercel env 設定（マスター手動）
- [ ] SDK インストール + 設定ファイル追加（Claude 自走）
- [ ] PII 除外設定（§6）（Claude 自走）
- [ ] テストエラー送出 → ダッシュボード受信確認（マスター実機）
- [ ] テスト route 削除 + コミット（Claude 自走）
- [ ] アラート設定（マスター手動 / 任意）
- [ ] runbook.md に「Sentry ダッシュボード URL」追記（Claude 自走）

**所要時間:** プロダクトごと 1〜2 時間（マスター作業 30 分 + Claude 作業 60 分）

---

## §13. 参考

- セキュリティ診断 Step 3-E 判定: `memory/project_security-diagnosis-step3ef-result.md`
- Step 5 包括評価表: `memory/project_security-diagnosis-step5-comprehensive.md`
- Sentry 公式ドキュメント: https://docs.sentry.io/
- Sentry Pricing: https://sentry.io/pricing/
- インシデント対応 SOP: `docs/ops/incident-response-sop.md`
