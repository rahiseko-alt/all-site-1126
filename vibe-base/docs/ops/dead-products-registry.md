# 廃番プロダクト台帳

> 元 auto-memory/project_dead-products.md から移行 (2026-06-10)

> 完全抹消したプロダクトの記録。再着手禁止。残存外部サービス削除タスクは各エントリの「残存タスク」を参照。
>
> **運用:** 廃番判断時、ここに新規エントリを追加し、MEMORY.md P1.5 の参照行（製品数表記）を更新する。

---

## 集計

- **抹消済プロダクト数:** 8（design-seed / hearing-bot / dify-service / biz-efficiency / gas-bot / video-studio / x-bot / demo-company）
- **稼働中プロダクト数:** 8（ai-concierge / aiueo / coach / foodee / homepage / kobaraku / omotenashi-trainer / review-analysis）

---

## 凍結中（非削除）プロダクト

## hp-customizer（凍結中・非削除）

- **凍結日:** 2026-07-13
- **凍結理由:** マスター判断（事業方針転換。単一HTMLテンプレート量産カタログ102件〔TemplateMo外部テンプレ/Template Party参考/独自コード実装の3系統混在でHTML構造がバラバラ・機械的なコンポーネント化不可能と実証済〕から、「ページ構成×デザインシステム×セクション部品×業種別コンテンツ」の組合せで100種類以上を生成する共通基盤方式へ転換するため）
- **系統:** React19+Vite雛形（編集エンジン実装ゼロ）+ クローンHTML102件（clones/）+ scripts一式（clone.mjs/hp-intake.mjs/arrange-jp-cafe-1.mjs/build-hp-portal.mjs）
- **退避先:** `archive/hp-customizer/`（独立.git・履歴保持のままファイルシステム移動。物理削除ではない）
- **残存外部サービス削除タスク:** 該当なし（未デプロイ・外部API未接続のP0段階のため対象自体が存在しない）
- **再利用可能性:** コピー文言・画像アセットのみ。`archive/hp-customizer/clones/{template-dir}/` から都度個別参照する運用に限定（HTML構造の機械変換には使わない）
- **後継:** `products/web-platform`（一般版から着手。共通基盤確立後にナイト業種向けへ横展開する構想）
- 抹消済カウントには非計上（削除ではなく凍結のため）

---

## design-seed

- **削除日:** 2026-05-01 (Session 240)
- **削除理由:** マスター判断（製品数 > 管理キャパによる鍵管理混乱の解消。活発な3製品に集中）
- **系統:** Remotion 動画生成（v2/v3 stills + ExitDemo）
- **残存外部サービス削除タスク（チェックリスト）:**
  - [x] AI Studio (Gemini) API キー削除 → Session 240 Phase 3 で AI Studio プロジェクトごと削除済（design-seed プロジェクト = 削除 6 件のうち 1 件）
  - [x] foodee/backup-config.md の design-seed 別鍵リスト削除（実施済）

## hearing-bot

- **削除日:** 2026-05-01 (Session 240)
- **削除理由:** マスター判断（同上スリム化）
- **系統:** Vercel ホスト型ヒアリングチャット（chat.js + email.js）
- **残存外部サービス削除タスク（チェックリスト）:**
  - [x] Vercel プロジェクト削除 → Session 245 マスター手動で完了
  - [x] Resend API キー削除 → Session 245 確認時点で該当キー不在（Resend ダッシュボードに hearing-bot 関連キーなし）
  - [x] AI Studio (Gemini) API キー削除 → Session 240 Phase 3 で AI Studio プロジェクトごと削除済

## dify-service

- **削除日:** 2026-05-02 (Session 240 後半)
- **削除理由:** マスター判断（A+B+D 整理セッションで指示）
- **系統:** DSL設計コース（チャットボット出品）+ 業種特化動画3本（hotel/lawyer/realestate）+ ココナラ出品
- **残存外部サービス削除タスク（チェックリスト）:**
  - [x] ~~Dify Cloud アカウント要否判断~~ → **解約しない（保有継続）** (Session 245 マスター判断)。video-studio / ai-concierge / gas-bot の今後の機能実装で利用予定のため
  - [x] ~~ココナラ出品取り下げ要否~~ → **既に取り下げ済** (Session 245 マスター確認)。ココナラ上に dify-service 関連出品なし
  - [x] ~~サムネイル雛形 v2.0 の出典再記載要否~~ → **不要** (Session 245 確認)。vest1-catalog.html / thumbnail-master-guide.md / thumbnail-master.html はすべて一般化済のため再記載不要
  - **注記:** AI Studio Gemini API キー = Session 240 Phase 3 でプロジェクトごと削除済（dify-service 用キーは存在せず、`mulmo-claude` プロジェクト経由だった可能性。残作業はマスター判断系のみ）

## biz-efficiency

- **削除日:** 2026-05-02 (Session 241)
- **削除理由:** マスター判断（A+B+D 整理セッションで指示）
- **系統:**
  - eff-vba01（VBAマクロ・ココナラ出品済 ¥3,000）
  - line-erume-setup（LINE エルメ統合）
- **残存外部サービス削除タスク（チェックリスト）:**
  - [x] ~~LINE Login Channel `エルメ` 削除~~ → **削除しない** (Session 245 マスター判断「エルメサービスは使い続ける」)。Channel 名は `小齊平 恒平 LINEログイン`（汎用名）として残置。biz-efficiency 由来だがエルメ連携継続のため
  - [x] ~~エルメ（LINE CRM）アカウント解約要否~~ → **解約しない** (Session 245 マスター判断「使い続ける」)
  - [x] ~~Bitwarden 鍵整理~~ → **全部保管継続** (Session 245 マスター判断)。aiueo / エルメ / Login Channel すべて継続使用のため、関連鍵は削除せず保管維持
  - [x] ~~ココナラ出品取り下げ要否~~ → **既に取り下げ済** (Session 245 マスター確認)。eff-vba01 出品なし
- **漏洩値注記:**
  - エルメパスワード `Kouhei@1002` が biz-efficiency raw-session-log.md に平文記載されており、git 履歴に残存（Session 240 で REDACTED 化済だが履歴は残る）。Session 243 で新パスワードに変更済（旧パスワードは認証情報として無効化）
  - git filter-repo による完全削除は別タスク

## gas-bot

- **削除日:** 2026-05-03 (Session 249)
- **削除理由:** マスター判断（プロダクトスコープ縮小、活発な 8 製品に集中）
- **系統:** GAS Bot Service（Google Apps Script + LINE/ChatWork/Slack 連携テンプレート）
- **scriptId:** `162-jDzTRyMmTbSbeQbqd__HJhp6Fo2ocVPzErHmW3yxQm9wngUy2JwH7`（削除済）
- **残存外部サービス削除タスク（チェックリスト）:**
  - [x] Google Apps Script プロジェクト削除 → **完了** (Session 249 マスター手動)
  - [x] ScriptProperties 内の開発/テスト用 API キー削除 → **GAS プロジェクト削除と同時に自動消去** (Session 249)
  - [x] ~~顧客側 API キー~~ → **該当なし**（顧客負担・顧客責任。本プロダクト弊社側に配備されていない設計。cost-config.md §1 記載）

## video-studio

- **削除日:** 2026-05-03 (Session 249)
- **削除理由:** マスター判断（プロダクトスコープ縮小）
- **系統:** 動画スタジオ（Remotion / Next.js + Replicate 動画生成）
- **残存外部サービス削除タスク（チェックリスト）:**
  - [x] ~~Vercel デプロイ削除~~ → **該当なし**（未デプロイ・プロトタイプ段階のみ。runbook.md §5 で本番 URL = 未デプロイ明記）
  - [x] ~~Gemini API キー削除~~ → **該当なし**（Replicate 一本化、Gemini 未使用。Session 169 で Nano Banana 廃止確定）
  - [x] ~~Replicate API キー削除~~ → **削除しない** (Session 249 マスター判断「Replicate は他プロダクトで継続使用」)
- **注記:** 外部サービス削除タスクは全て該当なし。Replicate は共有リソースとして継続使用（マスター明示判断）

## x-bot

- **削除日:** 2026-05-03 (Session 249)
- **削除理由:** マスター判断（プロダクトスコープ縮小）
- **系統:** X (Twitter) 投稿ボット（Google Apps Script + GAS Web App + Sheets DB + GAS Time-based Trigger）
- **GAS プロジェクト名:** 「X-BOT/26/04/28」（削除済）
- **残存外部サービス削除タスク（チェックリスト）:**
  - [x] X (Twitter) Developer Portal で App 削除 → **完了** (Session 249 マスター手動。4 本キー X_API_KEY/X_API_SECRET/X_ACCESS_TOKEN/X_ACCESS_SECRET 一括失効)
  - [x] GAS プロジェクト「X-BOT/26/04/28」削除 → **完了** (Session 249 マスター手動。Time-based Trigger と ScriptProperties 全データも自動削除)
  - [x] Sheets DB（drafts/schedule/post-log 3 タブ）削除 → **完了** (Session 249 マスター手動。マスター判断「アーカイブ不要、全部消せ」で完全削除)
  - [x] ~~Vercel デプロイ削除~~ → **該当なし**（GAS Web App 構成のため Vercel 不使用）
  - [x] ~~独立 cron 設定削除~~ → **該当なし**（GAS Time-based Trigger に統合のため独立 cron 不在）
- **漏洩値注記:** Session 223 で X Bearer Token 漏洩値は即時 Regenerate で無効化済（mission-log-20260428-s223.md）。本日削除した 4 本キーは現運用キーで、漏洩値とは別物

## demo-company

- **削除日:** 2026-07-04
- **削除理由:** マスター判断（ミッション方向転換。「架空会社のAIデモ環境」→「vibe-base そのものを毎日自動で動く実在の会社にする」へ転換したため、架空データのシミュレーションであるデモ環境は不要と判断・廃止）
- **系統:** 架空会社「コセヒラ（株）」（地方食品卸・小売）業務再現デモ（単一HTML型ビューア6画面＋company/ データ基盤＋reset機構＋拡張SOP）。実装は W0〜W6 全21 Step完遂・blind test 4巡（最終巡8/10+T11）・検証パネル①②③④通過済の完成状態で凍結
- **残存外部サービス削除タスク（チェックリスト）:** 該当なし（外部API・外部サービス連携なし・ローカル完結のため削除対象サービスが存在しない）
- **物理削除:** 2026-07-11（.git 履歴ごと・remote 無しのため復元不可・マスター承認）。当初 `products/ai-company-ops/` へ部品移管予定だったが、**部品（viewer/validate-consistency/見積テンプレ/company 構造）は未移植のまま破棄**。中継役の `products/ai-company-ops/` も同日削除。後継は `products/ai-company`（会社化構想 `~/.claude/plans/serialized-puzzling-pine.md` Phase D「我が社ダッシュボード」を単一HTML型で新規実装）

---

v1.6 | 2026-07-13 | hp-customizer を凍結中（非削除）エントリとして追加。事業方針転換によりarchive/hp-customizer/へ退避、後継products/web-platformを新設

v1.5 | 2026-07-11 | demo-company を物理削除（.git 履歴ごと・remote 無しで復元不可）。部品は未移植のまま破棄し、中継予定だった ai-company-ops も同日削除。後継 products/ai-company を単一HTML型で新規作成（会社化構想 Phase D 実装）。抹消集計8件は据え置き（ai-company-ops は廃番でなく作り直しのため非計上）

v1.4 | 2026-07-04 | demo-company を抹消エントリに追加（ミッション方向転換によるアーカイブ判断・部品は products/ai-company-ops/ へ移管）。集計を抹消済8件に更新

v1.3 | 2026-05-03 Session 249 | gas-bot / video-studio / x-bot の残存外部サービス削除タスク完全クローズ（gas-bot 3/3 / video-studio 3/3 / x-bot 5/5 = 全 11 件クローズ）。Session 249 で実施した削除・該当なし判定・継続使用判断を全エントリに反映。subagent 調査による前提誤り訂正（video-studio に Replicate API キー削除と書いてあったが、マスター訂正で「Replicate は他で使うから継続」と判明）も反映

v1.2 | 2026-05-03 Session 249 | 3 製品（gas-bot / video-studio / x-bot）を抹消エントリに追加。集計を実体ベース（抹消済 7 / 稼働中 8）に修正。元の稼働中リストにあった wikipedia-draft-bot / booking-app / shift-board-app は実体不在のため削除

v1.1 | 2026-05-02 Session 245 | 残存外部サービス削除タスク完全クローズ（design-seed 2/2 / hearing-bot 3/3 / dify-service 4/4 / biz-efficiency 4/4 = 全 13 件クローズ）。Session 245 で実施した削除・継続使用判断・既完了確認を全エントリに反映

v1.0 | 2026-05-02 Session 241 | 初版作成（Session 240 で参照のみ存在し実体不在だった台帳を新規生成 + biz-efficiency エントリ追加）
