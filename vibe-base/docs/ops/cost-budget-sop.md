> ⚠️ 要点は `.claude/rules/cost.md` で自動注入される。ここは詳細版。

# コスト・予算SOP

> **対象:** 課金型クラウド/API依存の全プロダクト（「運用Runbook整備」時に参照必須）
> **起源:** Qiita#13「コスト見積もり・予算アラート強制設定」を実装ガイド化
> **関連SOP:** `incident-response-sop.md`（予算超過時の停止対応）

---

## §1. 開発着手前の見積もり手順

### 必須3項目
1. **課金単位の特定**
   - リクエスト数（Vercel Functions / Cloud Run / API Gateway）
   - トークン数（OpenAI / Anthropic / Gemini）
   - 帯域（Vercel Bandwidth / CDN）
   - ストレージ（GCS / R2 / Supabase）
   - 接続数（Supabase concurrent / Redis）

2. **想定ユーザー数仮定**
   - MAU想定（最小・期待・上限の3段階）
   - ユーザーあたり月間アクション数
   - ピーク時の同時接続見込み

3. **月額試算式**
   ```
   月額 = (想定MAU × ユーザーあたりアクション × 単価) + 固定費
   ```

### 試算テンプレート
| サービス | 課金単位 | 単価 | MAU想定（最小/期待/上限） | アクション/MAU | 月額（最小/期待/上限） |
|---------|---------|------|-------------------------|---------------|----------------------|
| OpenAI gpt-4 | 1Mトークン | $10 | 100 / 1000 / 10000 | 5000トークン | $5 / $50 / $500 |
| Vercel Hobby→Pro | 月額 | $20 | — | — | $20 |
| Supabase | 月額 | $25 | — | — | $25 |
| **合計** | | | | | **$50 / $95 / $545** |

### 禁止事項
- **試算なしでの API契約・サービス起動は禁止**
- 「とりあえず使ってみる」前にこの表を埋めろ
- 上限金額が現実的でない場合（マスター承認の予算枠を超える）はサービス選定からやり直し

### 実施タイミング
- インフラ決定と同時
- 試算結果を `cost-config.md` に永続化

---

## §2. ハードリミット設定（必須）

### サービス別設定手順

#### GCP Budget Alert
1. Cloud Console → 請求 → 予算とアラート → 予算の作成
2. 予算額: 月次試算「上限」値の **80%** で警告
3. 通知: 50% / 90% / 100% でメール送信
4. **自動API無効化**: Pub/Sub通知 + Cloud Functions で予算超過時に該当APIを無効化
   - 設定例: https://cloud.google.com/billing/docs/how-to/notify

#### Vercel Spend Management
1. Vercel Dashboard → Settings → Billing → Spend Management
2. Hard limit: 試算「上限」+ 安全マージン20%
3. 超過時動作: pause deployment（推奨）or notify only
4. 関数別 Function Memory / Execution Timeout も設定

#### OpenAI / Anthropic usage limit
1. Platform → Settings → Limits
2. Monthly budget: 試算「期待」値で設定（上限ではなく期待で警告を多く受ける）
3. Hard limit: 試算「上限」値
4. Email alerts: 50% / 75% / 90% / 100%

#### Stripe monthly volume cap
1. Dashboard → Settings → Radar → Rules
2. monthly volume: 想定取引額の上限を設定
3. 超過時: block + manual review
4. 不正利用検知（同一カードからの大量決済等）も同時設定

### 設定なしでの本番リリース禁止
- 「運用Runbook整備」完了条件: 全サービスでハードリミット設定済みのスクショを `cost-config.md` に添付
- 設定証跡なしで「運用Runbook整備」通過は不可

### 実施タイミング
- 各サービス契約直後（API キー発行と同セッション内）
- 月額予算変更時に再設定

---

## §3. リリース後の監視

### 日次・週次トレンド

#### 日次（自動チェック）
- 前日比 **+50%超**で警告
- 警告チャネル: マスターメール
- 異常パターン例:
  - 急激なユーザー増（バズ / ボット攻撃 / 不正アクセス）
  - 単一ユーザーの大量消費（無限ループバグ等）
  - 想定外のAPI呼出ループ（リトライ暴発）

#### 週次（手動レビュー）
- 想定値の **2倍超**で停止判断
- マスター + 担当AIで週次レビュー
- 試算式の見直し / サービス変更 / 機能制限のいずれかを判断

### ダッシュボード必須
| サービス | ダッシュボードURL（pattern） |
|---------|----------------------------|
| GCP Billing | console.cloud.google.com/billing/{ID}/reports |
| Vercel Usage | vercel.com/{team}/{project}/usage |
| OpenAI | platform.openai.com/usage |
| Anthropic | console.anthropic.com/usage |
| Stripe | dashboard.stripe.com/balance/overview |

### 実施タイミング
- 日次自動チェック: 「運用Runbook整備」完了条件として cron設定
- 週次レビュー: 毎週月曜の定期レビュー枠
- 異常時は即座に §4「緊急停止プロトコル」へ

---

## §4. 緊急停止プロトコル

### 予算超過検知時の判断フロー
```
① 超過の規模確認（想定 × 1.5倍まで / 2倍超 / 5倍超）
   ↓
② 原因の即時切り分け（3パターン）
   - 攻撃 / 不正利用 → 即時 API無効化 + IP block + ユーザー BAN
   - バグ（無限ループ・リトライ暴発）→ 該当機能を maintenance mode
   - 想定超過（バズ等の正常需要）→ サービス継続 + 容量増設 or 機能制限
   ↓
③ ユーザー告知（incident-response-sop.md §3 に従う）
   ↓
④ 原因究明 + 再発防止
```

### 即時停止コマンド例
```bash
# GCP API無効化
gcloud services disable {api-name}.googleapis.com --project={project-id}

# Vercel Pause Deployment
vercel pause {project-name}

# Stripe（手動: dashboardから「Pause new charges」）
```

### 復旧前のチェック
- 原因が「攻撃」: 攻撃元IP / アカウント特定後の対策実装まで再開禁止
- 原因が「バグ」: 修正コミット + テスト追加 + Staging検証完了まで再開禁止
- 原因が「正常需要超過」: 予算追加承認（マスター）+ 試算再計算後に再開

### 実施タイミング
- 予算超過検知から **15分以内**に①〜②完了
- ユーザー告知は **30分以内**（incident-response-sop.md §3 と同等）
- 復旧見込み連絡は **1時間以内**

---

## §5. 各プロダクトの cost-config.md テンプレ

`products/{product}/cost-config.md` として以下を初期化（「運用Runbook整備」完了条件）:

```markdown
# {product} コスト・予算設定

## 月額試算
| サービス | 課金単位 | 単価 | MAU想定（最小/期待/上限） | 月額（最小/期待/上限） |
|---------|---------|------|-------------------------|----------------------|
| {サービス名} | {単位} | {単価} | {数値} | {金額} |
| **合計** | | | | **${最小} / ${期待} / ${上限}** |

## マスター承認予算枠
- 上限: ${金額} / 月
- 承認日: {YYYY-MM-DD}

## ハードリミット設定証跡
- [ ] GCP Budget Alert: ${金額} で警告 + Pub/Sub経由API無効化
  - スクショ: `cost-config-evidence/gcp-budget.png`
- [ ] Vercel Spend Management: hard limit ${金額}
  - スクショ: `cost-config-evidence/vercel-spend.png`
- [ ] OpenAI usage limit: monthly ${金額}
  - スクショ: `cost-config-evidence/openai-limit.png`
- [ ] Stripe monthly volume cap: ${金額}
  - スクショ: `cost-config-evidence/stripe-cap.png`

## 監視ダッシュボード
- GCP Billing: {URL}
- Vercel Usage: {URL}
- OpenAI Usage: {URL}
- Stripe Balance: {URL}

## 日次・週次トレンド設定
- 日次警告閾値: 前日比 +50%（マスターメール通知）
- 週次レビュー: 毎週月曜
- 想定値2倍超の停止判断基準: ${金額}

## 緊急停止コマンド
- GCP: `gcloud services disable {api-name} --project={id}`
- Vercel: `vercel pause {project}`
- Stripe: dashboard手動（「Pause new charges」）

## 過去の予算超過履歴
（発生時に追記）
```

### 実施タイミング
- 「運用Runbook整備」着手時に本テンプレで初期化
- スクショ取得・添付は「運用Runbook整備」完了条件
- 月額予算変更ごとに「マスター承認予算枠」「ハードリミット設定証跡」を更新
- 予算超過発生ごとに「過去の予算超過履歴」へタイムライン + 根本原因を追記

---
v1.0 | 2026-04-27 | 構造改革プロジェクト T3 で新設（Qiita#13「コスト見積もり・予算アラート強制設定」起源）
