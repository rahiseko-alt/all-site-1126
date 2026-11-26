# code-review-skills memory archive (2026-06)
> 元 products/code-review-skills/memory.md から移行した P3・P4 コンテンツ
> 作成: 2026-06-10 / コンテキスト改革 Phase C

## P1 詳細（旧ファイル全文）

### ミッション1（旧 #1）
[importance:H][2026-05-29] **ai-concierge 6m + 1year クイックウィン完遂**（commits dd59185=M-3/M-6 / c3340c5=M-9 / 8b554a8=1year health+bcrypt12+@google除去 / 7a843d6=README）。**残る大規模 1year（各々専用 plan 必要）: GDPR #008（法務ゲート・erasure/export API・Cookie consent）/ テスト基盤 #014（数週・テスト0件）/ Supabase Adapter層 #009（49箇所）/ 構造化log #015残**。M-7 Node EOL は誤検知疑い（事実確認のみ）。着手前 Plan Mode + **現状コード実体照合必須**（28 finding の多くが陳腐化していた前例: M-4既対応/M-7誤/S-1,S-5,S-7誤検出/subscription解釈）。@docs/ai-concierge-6m-1year-review-2026-05-27.md

### ミッション2（旧 #2）
[importance:H][2026-05-29] **⚠️ ai-concierge デプロイ前マスター必須作業**（commits は local 未push）: (a) **Supabase に `app/sql/006-cleanup-rpc.sql` 適用**（無いと cron-cleanup が RPC 不在で 500）(b) Vercel env に server 用 `SENTRY_DSN`（未設定なら M-6 は no-op）(c) push + deploy。※1year 追加分（@google除去・bcrypt12・health endpoint）は追加 DB 作業不要

### ミッション3（旧 #3）
[importance:M][2026-05-29] **M-2 完遂**（commits 3f0e6ff=UI / 825f7ce=docs）— Gemini→AI/OpenAI 表記事実修正のみ実施。**trial/subscription はマスター確認で「コード保持・継続使用」確定**（v4.1「廃止」は公開オファーの話・コード機能は内部運用継続）→ 削除しない。カラム gemini_api_key も意図的保持。**残フォローアップ（ai-concierge owner 領域・推測不可で未修正）: `03-delivery-message.md` の費用セクション（「Googleアカウントで API発行」「無料枠あり」「1件約0.2円」）が Gemini 時代のままで OpenAI 価格/アカウントと不整合 → 業務正確な価格表現で要更新**。M-7 Node EOL 事実確認も別途

### ミッション4（旧 #4）
[importance:M][2026-05-22] **/code-review-3m spec.md に「SDK標準のリトライ機構を先に確認」を追記** — CR-3M-012（OpenAI 429 バックオフ）が誤検知だった再発防止

### ミッション5（旧 #5）
[importance:M][2026-05-22] **CLAUDE.md §6 改訂検討** — 「修正は本プロジェクト外」条文 vs ai-concierge 直接修正（e55c276/f74d533/dd59185/c3340c5 で計4回）の乖離。例外節追記 or 文言修正をマスターと合意

## P4: 永続教訓（旧全文）

1. [importance:H][2026-05-18] 本プロジェクトのゴール = **「壊れないを担保する」4 兄弟スキル完成**。4 兄弟は時間軸 4 段（今 / 3 ヶ月後 / 6 ヶ月後 / 1 年後）で「壊れる検知」を分割する装置。検知項目は現時点ベストで固める → 項目は変わる → 変わったらやり直す覚悟を持つ（「言われたことはやりました」態度禁止・Session 297 マスター比喩で確定）

2. [importance:H][2026-05-18] レビューの正常状態 = 「コードが正しい」が大前提。それが満たされて初めて運用層（監視・障害対応・顧客環境・法令）が意味を持つ。4 兄弟は「コードの正しさ」を時間軸で 4 段に分割した装置。並列の 6 層ディレクトリ提案は順序無視の誤り（マスター差し戻し）

3. [importance:M][2026-05-22] 本フォルダ編集の hook 規律 — `products/code-review-skills/` 配下は pre-edit.sh が本番扱い（vibe-base ルートに `.vercel/`）で Edit/Write に `.allow-prod-edit` マーカー必要。`~/.claude/skills/code-review-*/SKILL.md` 編集には `.allow-skill-edit` マーカー必要（パス = `products/code-review-skills/.allow-skill-edit`）。マーカーはマスターが touch（司令塔は touch しない）。`docs/` 配下は hook 除外。sed/cp 等 Bash 経由はガードを通らないが、本番扱いファイルでも hook 承認を経ること。次回 spec 改修時に参照

4. [importance:M][2026-05-22] レビュー指摘を上げる前に**対象ライブラリ/SDK の標準機能を実機確認**せよ。CR-3M-012「OpenAI 429 バックオフ追加」は誤検知 — openai SDK v6 は 429 を既定で指数バックオフ・リトライ（maxRetries=2・retry-after ヘッダ尊重）する。「機能が無い」と決めつけた指摘は false positive となり trust を破壊する（P3#2 と同原理）。検知ロジックに「SDK 標準機能の先行確認」を組み込む

5. [importance:M][2026-05-29] **verify-agent に `npm ci` / `npm install` を実行させるな**（Session 2026-05-29 6m 修正で発生）。verify-agent が lint/build 検証で `npm ci`（node_modules 全削除→再インストール）を実行し、Windows 環境で不完全状態（@eslint/js の index.js 欠落・vite bin 不在）を残して lint/build を偽 FAIL させた。verify-agent への指示には「**既存 node_modules を使い `npm run lint`/`npm run build` のみ。npm ci/install 禁止**」を必ず明記する
