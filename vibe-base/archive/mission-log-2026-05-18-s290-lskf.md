## learning-suite-kanji-foreign エージェント Check-out: 2026-05-17 (Session 290) — P0#13-#18 完遂（P0#18 ゲート判定要請中）

### Session 290 続編サマリ (P0#14-18 完遂・上書きエントリ前提・詳細は本文末尾追記セクション参照)

- **P0#14 収益モデル定義 ○**: Freemium 買切り 1 段階 / 単価 $2.99-$4.99 / 全機能解禁 / Google Play + PWA 2 系統
- **P0#12 修正**: マスター発言「AppleStore 用は作らない」→ iOS 線削除 (App Store IAP / Apple Designed for Families / App Store Reject / Capacitor iOS)
- **P0#15 料金設計+コスト ○**: 損益分岐 約 22 MAU / 月額固定費 約 $3 / 量トリガー発火 約 1,000 MAU
- **P0#16 MVP スコープ ○**: 14 機能採用 + 12 機能除外 + 依拠仮説 H2-H10
- **P0#17 KPI+Go/No-Go ○**: 計測期間 3 ヶ月 / KPI 6 件 / 撤退ライン 5 件 / 仮説別検証 KPI
- **P0#18 ★ゲート ○**: マスター双方代理判定 Go 確定（Session 290・SOP §8 例外適用・司令塔セッション不起動でマスターが双方代理判定）→ **P0 全 18 タスク完遂・P1 着手可**

### 続編コミット 2 件

- `9c468fb` feat: P0#14 収益モデル定義完遂 + iOS 線削除 (P0#12 修正 + P0#13 risk-diagnosis 反映)
- `e42f85b` feat: P0#15 料金設計+コスト完遂 (損益分岐約 22 MAU・kill 通過)
- (本 Check-out コミットで P0#16/17/18 + MISSION_LOG)

### 続編未解決

- ~~P0#18 ゲート両承認待ち~~ → **完了 (マスター双方代理判定 Go・commit `fc16b61`)**
- 司令塔追加 #22-#27 のうち残 5 件 (#22 特商法 / #23 外部送信規律 / #24 Sentry DSN 漏洩 / #25 SQLite 暗号化 / #26 B4 軸) の P1 実装段階タグ確定
- #9 PostHog アウト寄りグレー化提案の CMP 実装条件確定
- Google Play Designed for Families 対象年齢層マスター確認 (成人専 or 子供混在)
- 自治憲法 §1-§5 起草 (P0 完了後マスターヒアリング前提)

### 続編エラー回数

- マスター差し戻し: 0 件 (P0#14-18 全タスク一発通過)
- 司令塔過失: 1 件 (司令塔追記内容の見落とし → マスター指摘で覚醒・実体検証義務再確認)
- ハルシネーション: 0 件
- 自爆漏洩: 0 件

---

### Session 290 旧版スナップショット (P0#13 完遂時点・前回 commit `355a417` 当時の内容)

### 起点

`/pc-checkin` 発火 → MISSION_LOG 読了（前回 Session 289 自エージェント Check-out 把握: P0#1-12 ○、次タスク P0#13 ★リスク予備フィルター）→ Plan Mode で Explore 1 件 + Plan 1 件投入 → 21 検知エントリ × 16 項目 + 製品固有 5 項目の照合計画承認 → 公式 ToS WebFetch 9 URL（KanjiVG / CC BY-SA 3.0 deed/legalcode / Apple Guideline 3.1.1 / Play Payments / PostHog Privacy / Sentry Sensitive Data / KanjiVG projects） → タグ確定 → risk-diagnosis.md 起票 → PC 表 P0#13 ○ 化。

### 実施内容

**A. risk-diagnosis.md 起票（sop-version: 3.0・全 21 エントリ）**
- 採用 13 サービス（P0#12 確定）× 出口フィルター 16 項目（v3.0）+ 製品固有 5 項目
- タグ集計: **アウト 0 / グレー 12 / 判定不能 5 / クリア 4**
- §13 テンプレ完全準拠（タグ一覧 / 利用条件マトリクス / 情報の性質 / 競合 ToS / ゲート履歴 / 対処方針 / 照合材料 / 規約 URL 16 件）

**B. 最重要グレー #12 KanjiVG CC BY-SA 3.0 SA 伝播判定**
- legalcode §1.2 Collection 定義（「selection and arrangement が知的創作・内容物は未修正で含まれる」）+ §4(b)「SA は Adaptation に厳格、Collection は緩」
- KanjiVG 公式 projects ページに Duolingo / Obenkyo / Imiwa 等の **商用クローズドソース採用実例を公認列挙**
- **判定: グレー（条件付クリア寄り）**。実装条件 = ①SVG 未改変バンドル ②Attribution 表示（Ulrich Apel / 著作物題名 / URI / ライセンス通知）
- 過大評価せず・Session 261「個人利用 MVP の著作権を開発失敗の言い訳に使うな」教訓踏襲

**C. IAP 強制 vs Web 買切り併用（#2/#3）対処方針確定**
- Duolingo Japanese 方式踏襲（iOS=Apple IAP / Android=Play Billing / Web=Stripe の 3 プラットフォーム個別決済）
- Apple Guideline 3.1.3(b) Multiplatform Services 例外で Web 買切りコンテンツの iOS アクセス可
- iOS アプリ内での Web 購入誘導は米国外・External Purchase Link Entitlement 未取得時は禁止

**D. PC 表 P0#13 ○ 化（rationale + evidence 完備）**

### 司令塔過失（マスター差し戻し）

なし。Plan Mode → 実装 → ○ 化のフロー一発通過。Session 289 のハルシネーション再発防止策（出典原典確認 + Agent 受入検証 + Plan Mode 事前合意）が機能。

### 未解決事項

#### Session 290 持ち越し
- **【最優先】vibe-base 司令塔の独立フルスキャン承認**（本 Check-out 末尾依頼書経由）
- P0#14 収益モデル定義（QA・マスター発言番号で確定要）
- P0#15 料金設計+コスト（買切り価格・損益分岐計算・RevenueCat 月額 + Sentry 月額 + PostHog 月額計上）
- P0#16 MVP スコープ
- P0#17 KPI+Go/No-Go
- P0#18 ゲート（vibe-base 報告+マスター承認）
- 自治憲法 §1-§5 起草（P0 完了後・マスターヒアリング前提）

#### dead-end 対処タスク（採用後の処置・P0#15 / P1#7 / P2 直前 に追加要）
- P0#15 で RevenueCat / Sentry / PostHog / Resend / Stripe / Cloudflare Pages 計 6 サービスの月額コスト試算
- P2 直前で Stripe Live 化 7 日リードタイム申請（dead-end-registry #3）

#### グレータグ持ち越し（CL-11 までに本フィルター §9 で確定要）
- #2/#3 IAP 強制実装（P1#4 / P2#11）
- #5 SQLite 端末データ消失 → export/import 機能（P1#4）+ legal.html 明示（P2#13）
- #9 PostHog プライバシー → Cookie バナー + DPA + 18 歳未満児童データ規約（P1#7 + P2#13）
- #11 Resend 冪等性 → request_id + Idempotency-Key（P1#4）
- #12 KanjiVG → SVG 未改変バンドル + Attribution UI（P1#4 + P2#13）
- #15 子供向け規約 → ターゲット年齢層をマスター確認（P0#18）
- #17 Sentry PII → beforeSend スクラブ（P1#4）

#### 判定不能タグ（情報待ち）
- #13 音声録音権利 / #14 翻訳テキスト出自 → P1 確定後判定
- #19 runbook 障害対応 → P4#0 整備時
- #20 ライブラリ実在性 → P1 で package.json 確定後
- #21 認証 SKIP 購入復元時の本人性 → P1 復元 UX 設計後

#### 別エージェント領域（本エージェント対象外・unstaged 残置）
- vibe-base ルート .gitignore / package.json / package-lock.json（司令塔領域・Session 289 から継続）
- products/learning-suite-kanji-foreign/.claude/（propagate-hooks 由来）
- products/ymm-shorts/src/{tmp_inspect.py, ai-chatbot-output/tenshoku_2_*.mp4}（ymm 領域）
- scripts/build-coach.mjs（coach 領域）

### 変更ファイル

**プロダクト領域（コミット対象 2 件）:**
- `products/learning-suite-kanji-foreign/risk-diagnosis.md`（新規・sop-version: 3.0・21 エントリ）
- `products/learning-suite-kanji-foreign/pc-progress.html`（P0#13 × → ○・rationale + status 更新）

### PC 表バージョン
- learning-suite-kanji-foreign pc-progress.html v10.0（据え置き）
- 自治憲法 v0.1（変更なし・§1-§5 TBD 継続）

### エラー回数
- マスター差し戻し: 0 件
- ハルシネーション: 0 件
- Agent 早計 kill: 0 件
- 自爆漏洩: 0 件
- データ破壊: 0 件

### 行動ログ
- learning-suite-kanji-foreign エージェントは行動ログヒアリング対象外

### 次セッション着手手順
1. vibe-base 司令塔の独立フルスキャン結果を確認（risk-diagnosis.md / pc-progress.html P0#13 のクロスチェック）
2. P0#14 収益モデル定義（マスターヒアリング・買切り価格帯確定）
3. P0#15 料金設計+コスト（採用 6 有料サービスの月額計上 + 損益分岐）
4. P0#16 MVP スコープ → P0#17 KPI → P0#18 ゲート

---

## 📦 vibe-base 司令塔への依頼書（Session 290 起点・P0#13 独立フルスキャン要請）

**起票者**: learning-suite-kanji-foreign プロダクトエージェント
**起票日**: 2026-05-17 (Session 290)
**依頼種別**: P0#13 リスク予備フィルター vibe-base 独立フルスキャン（risk-diagnosis-sop.md §7 vibe-base 確認手順）
**対応優先度**: P0→P1 ゲート（P0#18）の前提条件

### 依頼内容

learning-suite-kanji-foreign プロダクトの **P0#13 ★リスク予備フィルター** を実施しました。SOP §7「vibe-base 確認」手順に従い、以下 4 工程の実施をお願いします。

1. **出口フィルター 16 項目（A1-A4 / B1-B4 / C1-C4 / D1-D4 v3.0）独立フルスキャン** — 担当 AI（learning-suite-kanji-foreign エージェント）のタグ付けレビューではなく、独立した第三者目線でのフルスキャン実施
2. **担当 AI タグとの照合** — 21 エントリの暫定タグ（アウト 0 / グレー 12 / 判定不能 5 / クリア 4）と司令塔独立判定の差異を指摘・修正
3. **新規リスクの検出と台帳追記** — 担当 AI が見落とした横断既知リスクがあればマスター確認後に `docs/ops/risk-registry.md` 追記
4. **マスター承認取得** — 司令塔独立判定確定後にマスター承認を取得し、PC 表 P0#13 rationale 末尾に「vibe-base 判定済 / マスター承認済（Session XXX）」を追記

### 参照成果物

- 起票ファイル: `products/learning-suite-kanji-foreign/risk-diagnosis.md`（sop-version: 3.0・21 エントリ・規約 URL 16 件）
- PC 表 P0#13 rationale: `products/learning-suite-kanji-foreign/pc-progress.html` 236 行目
- 採用 13 サービス正本: PC 表 P0#12 rationale（235 行目）

### 担当 AI 自己評価で確認した最重要論点

- **#12 KanjiVG CC BY-SA 3.0 SA 伝播**: 業界標準（Duolingo / Obenkyo / Imiwa 商用クローズド採用）と CC BY-SA 3.0 legalcode §1.2 Collection 定義 + §4(b) からグレー（条件付クリア寄り）と判定。アウト判定に逆転する根拠があれば指摘要請
- **#2/#3 IAP 強制 vs Web 買切り併用**: Duolingo Japanese 方式踏襲で対処方針確定。Apple Guideline 3.1.3(b) Multiplatform Services 例外解釈の妥当性を独立判定で確認要請
- **#9 PostHog プライバシー / #17 Sentry PII**: 非公開+非自発的データを SDK 自動収集する 2 サービスの GDPR / APPI / CCPA 対応を最も慎重に再評価要請

### 司令塔判定結果の連絡方法

司令塔の独立フルスキャン完了後、本 MISSION_LOG に司令塔 Check-out エントリとして判定結果を追記してください。担当 AI（learning-suite-kanji-foreign エージェント）は次セッション Check-in で読み、グレータグ差分があれば risk-diagnosis.md を更新します。

---

### 続編: P0→P1 ゲート判定要請（Session 290 続報・P0#18 ★ゲート）

**起票者**: learning-suite-kanji-foreign プロダクトエージェント
**起票日**: 2026-05-17 (Session 290 続編)
**依頼種別**: P0→P1 ゲート Go/No-Go 判定（risk-diagnosis-sop.md §8 ゲート通過時のタグ再評価 + product-cycle.md P0#18 規定準拠）
**対応優先度**: P1 着手の前提条件

#### 自己 Go 判定サマリ

- P0#1-17 全タスク **○**（skip 0 件）。P0#18 のみ **△**（ゲート両承認待ち）
- kill 5 軸（市場/競合空白/技術選定/法令/損益分岐）全件通過
- 損益分岐 22 MAU・想定下限 100 MAU で 4.5 倍上回り
- リスクタグ アウト 0 維持（Session 291 司令塔独立スキャン後・Session 290 マスター修正後）

#### 司令塔ゲート判定要請内容

1. **P0#18 ゲート Go/No-Go 判定**: P0#1-17 全件再確認 + PC 表 status との照合
2. **タグ再評価**（SOP §8 準拠）: Session 290 マスター修正による iOS 関連エントリ無効化（#2/#15/#21/#27）の妥当性確認
3. **構造問題シグナル検知**: ゲート通過時のグレータグ減少傾向確認（25 有効中グレー多数残存だが #15/#21 縮小済）
4. **承認記録の PC 表反映**: P0#18 rationale 末尾に「vibe-base 判定済 / マスター承認済（Session XXX）」追記

#### 残課題（P1 ゲート前に解消要・本 P0 ゲートには影響なし）

1. 司令塔追加 #22-#27 のうち残 5 件（#22 特商法 / #23 外部送信規律 / #24 Sentry DSN 漏洩 / #25 SQLite 暗号化 / #26 B4 軸追加）の P1 実装段階タグ確定
2. #9 PostHog アウト寄りグレー化提案の CMP 実装条件確定
3. Google Play Designed for Families 対象年齢層マスター確認（成人専 or 子供混在）
4. 自治憲法 §1-§5 起草（P0 完了後マスターヒアリング前提・「独断記述するな」教訓遵守）

#### 参照成果物

- PC 表: `products/learning-suite-kanji-foreign/pc-progress.html`（P0#1-17 ○・#18 △・rationale 詳細）
- risk-diagnosis: `products/learning-suite-kanji-foreign/risk-diagnosis.md`（sop-version: 3.0・25 有効エントリ + Session 290 修正セクション）
- 続編コミット 2 件: `9c468fb`（P0#14 + iOS 削除）/ `e42f85b`（P0#15）+ 本 Check-out コミット

#### 判定結果の連絡方法

司令塔の Go/No-Go 判定確定後、本 MISSION_LOG に司令塔 Check-out エントリとして判定結果を追記してください。担当 AI は次セッション Check-in で読み、PC 表 P0#18 を △→○ に更新します。

