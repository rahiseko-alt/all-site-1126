# 全製品健康診断レポート — 2026-06-11

> 実走: 健康診断エージェント 5 体並列（sonnet・read-only）/ 対象: products/ 配下 19 製品 × 6 観点
> **本レポートは報告のみ。修正は一切実施していない。**修正着手は「報告 → マスター承認 → 修正」の順序に従い、承認後に別 plan で行う。
> 判定: 【危険】= 早急な対応が必要 / 【注意】= 放置すると問題化 / 【良好】= 現状問題なし（疑わしきは注意の厳しめ判定）

## 1. 総合判定マトリクス（19 製品 × 6 観点）

| 製品 | ①秘密情報 | ②依存脆弱性 | ③エラー処理 | ④テスト | ⑤重複・未使用 | ⑥保守性 |
|---|---|---|---|---|---|---|
| ai-concierge | 注意 | 良好 | 注意 | **危険** | 良好 | 良好 |
| aiueo | 注意 | 注意 | 注意 | 良好 | **危険** | **危険** |
| coach | 注意 | 良好 | 良好 | **危険** | 注意 | **危険** |
| code-review-skills | 良好 | 良好 | 良好 | 注意 | 注意 | 良好 |
| foodee | 注意 | 良好 | 注意 | **危険** | 注意 | **危険** |
| google-system-dev | 良好 | 良好 | 良好 | **危険** | 注意 | 注意 |
| homepage | 良好 | 注意 | 良好 | 注意 | 注意 | 注意 |
| kobaraku | **危険** | 良好 | 注意 | **危険** | 注意 | 注意 |
| learning-suite-kanji | 良好 | 注意 | 注意 | **危険** | 注意 | **危険** |
| learning-suite-kanji-foreign | 良好 | 注意 | 注意 | 良好 | 注意 | 注意 |
| n8n | **危険** | 注意 | 注意 | **危険** | 良好 | 注意 |
| new-trimmer-system | 良好 | 注意 | 注意 | **危険** | 注意 | 注意 |
| omotenashi-trainer | 注意 | 良好 | 注意 | 注意 | 注意 | 良好 |
| renai-game | 注意 | 良好 | 注意 | 良好 | 注意 | **危険** |
| review-analysis | **危険** | 注意 | 注意 | **危険** | 注意 | 注意 |
| shift-ai | 良好 | 良好 | 良好 | 注意 | 注意 | 注意 |
| shiota-karte | 良好 | 注意 | 良好 | 注意 | 注意 | 良好 |
| trimmer-system | 良好 | 注意 | 良好 | 注意 | **危険** | **危険** |
| ymm-shorts | 良好 | 注意 | 注意 | **危険** | 注意 | 注意 |

## 2. 最も危険な指摘 TOP5（全グループ統合・対応優先順）

### 第 1 位【危険】review-analysis — 本番の鍵が平文ファイルに 6 種 + 留守番認証の抜け穴
- `bot/review-app/.env` に DB 接続文字列・Google OAuth シークレット・Gemini / Places API キー・認証シークレット・Gmail アプリパスワードの 6 種が平文で存在（値の転記はしない）。gitignore 除外済みだが、流出時の被害範囲が全サービスに及ぶ。
- `src/app/api/cron/sync/route.ts:16` が「`CRON_SECRET` が未設定なら認証チェックを丸ごとスキップ」する実装。`.env` に `CRON_SECRET` の定義がなく、第三者が同期エンドポイントを叩けて API 課金が発生しうる。
- 推奨: キーのローテーション + シークレット管理移行 / 未設定時は必ず 401 を返す実装へ（`if (!cronSecret ||` 形式）。

### 第 2 位【取り下げ】shiota-karte / trimmer-system — カルテ画像の git 追跡
- ~~顧客実物カルテ画像（個人情報）が 3 箇所で git 追跡~~ → **マスター確認（2026-06-11）: 当該画像はダミーデータであり問題なし。本指摘は取り下げ。**
- 診断エージェントが「実物スキャン」と推定したのは誤判定。残る軽微な論点は trimmer-system（B 案）に A 案系資料が残置されている整理面のみ。

### 第 3 位【危険】kobaraku — Claude API キーを localStorage に平文保存
- `src/components/tenant/TenantMain.jsx:62` でユーザー入力の API キーをブラウザの localStorage に平文永続化。XSS や同一端末の他者操作で即窃取可能。`risk-diagnosis.md:109` で認識済みだが軽減未実施。
- 推奨: メモリ（state）保持のみに変更し、リロード時再入力方式へ。

### 第 4 位【危険】テスト完全不在群 — 特に販売中・本番稼働の製品
- ai-concierge（**販売中**・API 全 13 本にテスト 0 件）/ foodee（RSS・cron 無検証）/ kobaraku（Excel 100% 一致が業務要件なのに無検証）/ learning-suite-kanji（SRS 計算 = 製品価値の中核が無検証）/ new-trimmer-system / review-analysis / ymm-shorts。
- 対照的に learning-suite-kanji-foreign（vitest 充実）・aiueo（ユーティリティ層）・renai-game（検証スクリプト 4 本）は整備済みで、設計品質の格差が大きい。
- 推奨: 本番稼働中かつ収益に直結する ai-concierge から着手。

### 第 5 位【危険】1500 行超の巨大単一ファイル群
- trimmer-system `ponchi-v2.html` 2135 行 / aiueo `desktop-layout.jsx` 1744 行 / renai-game `index.html` 1713 行 / foodee `index.html` 1697 行（CSP も観測モードのみ）。coach `lesson-slides.html` 3739 行は教材の性質上単一が必然だが保守性は低い。
- 変更影響の把握が困難で、テスト不在（第 4 位）と組み合わさるとデグレ検出が不可能になる。

## 3. 観点別の横断所見

| 観点 | 横断傾向 |
|---|---|
| ①秘密情報 | ハードコードは少数（仕組みとして check-secret-patterns / secret-write-gate が機能）。残るリスクは「.env 平文の物理存在」（review-analysis / n8n の暗号化キー）と kobaraku の localStorage 保存に集中（カルテ画像はダミーデータ確定で問題なし） |
| ②依存脆弱性 | 大半が最新メジャー追従で良好。要注意: review-analysis の next-auth が**ベータ版**で本番認証 / n8n の Docker イメージがバージョン非固定 / Google Fonts 等 CDN の非固定が多数 / ymm-shorts に requirements.txt 不在 |
| ③エラー処理 | 空 catch（握りつぶし）が広範囲に散在（aiueo / kanji 両製品 / new-trimmer / omotenashi / renai-game / kobaraku / foodee）。localStorage 操作の失敗を無音で飲むパターンが定番化しており、横断チェック（CLAUDE.md §4）の対象候補 |
| ④テスト | 19 製品中 7 製品が実質ゼロ。良好例（kanji-foreign の vitest / renai-game の検証スクリプト群）の型を他製品へ展開可能 |
| ⑤重複・未使用 | 試行版残骸（foodee app-v0〜v9 / homepage preview 群 / ymm-shorts replica）と「破棄宣言済みなのに残存」（shift-ai octahedron / trimmer の dist.bak）が主。shiota-karte は dist 未参照の js 9 ファイルが残置 |
| ⑥保守性 | 巨大単一ファイル問題（TOP5 第 5 位）に集約。その他: google-system-dev の CLAUDE.md 正本/ドラフト並存・omotenashi のドキュメント実態乖離（Gemini 記載 vs 抹消済み） |

## 4. 製品別の特記事項（マトリクス以外の補足）

- **ai-concierge**: chat API（公開）にレートリミットなし → 顧客の OpenAI キー大量消費攻撃が可能。admin-login のレートリミットはインメモリでサーバーレス再起動ごとにリセット。
- **aiueo**: 本番 PocketBase v0.22 と SDK v0.26 のバージョン乖離。
- **coach**: .gitignore 不在。過去に Cloudflare API Token 漏洩事故の記録あり（回収済み）。
- **foodee**: CSP が Report-Only（観測のみ）で実攻撃を防いでいない。
- **n8n**: `n8n_data/config` に暗号化キーが平文（gitignore 済みだが物理残存。漏洩すると全ワークフロー認証情報が復号可能）。
- **omotenashi-trainer**: Stripe 決済リンクのテスト用プレースホルダーが本番コードに残存（`index.html:192`）。
- **renai-game**: GAS 実行 URL が index.html に直書き（自治憲法で意図的設計と明記済み・残存リスクのみ記録）。
- **shiota-karte / trimmer-system**: テストは存在するが CI 未連携で手動実行頼み（形骸化リスク）。
- **ymm-shorts**: マスター固有の絶対パス直書きは「個人ローカルツール」として意図的設計。

## 5. 対応の進め方（提案・未着手）

1. 即時（マスター承認後の最優先 plan 候補）: TOP5 第 1 位・第 3 位（鍵・localStorage。第 2 位はダミーデータ確定で取り下げ済み）— いずれも修正規模は小さく被害規模が大きい。第 1 位は実機照合済み（2026-06-11 現在 route.ts:16 のバイパス実装・.env の CRON_SECRET 未定義が現存。Vercel 本番側 env は要マスター確認）
2. 中期: テスト不在群へ「良好例の型」（vitest / 検証スクリプト）を展開
3. 横断: 空 catch パターンの全ファイル一括検出・方針統一（§4 横断チェック規律の適用対象）
