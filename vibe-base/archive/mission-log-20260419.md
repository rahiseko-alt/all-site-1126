## Check-out: 2026-04-19 (Session 188) — create-image/create-text スキル整備・Replicate運用一元化・vest1 カタログ全同期

### 実施内容

1. **旧 Replicate サムネルール削除 + 散在参照の整理**
   - `memory/feedback_replicate-thumbnail-rule.md` 削除（スキルに吸収）
   - 7ファイルの参照を `create-image` スキル参照に書き換え（.claude/rules/video-production.md、scripts/replicate-generate/generate.py、docs/standards/coconala-listing-handbook.html、products/video-studio/CLAUDE.md、docs/ops/antigravity-tools-reference.md、docs/ops/antigravity-remotion-setup.md、docs/ops/listing-cycle.md）

2. **NotebookLM「ClaudeCode-BestPractice」整備**
   - #1 Replicate運用マニュアル v1.2 は既存と一致（更新不要）
   - #2 Replicate Prompt Writing Spec を拡張版に上書き（flux-1.1-pro-ultra / flux-2-pro 生成・編集モードの Spec 章＋Self-Check 追加）

3. **create-image スキル新設**
   - `.claude/skills/create-image/SKILL.md`（7 STEP 順守・Replicate 限定）
   - `scripts/replicate-generate/generate.py` を #1 §2 に整合させて改修（4モデル統一・`--input-image` 対応・flux-dev/imagen-4/recraft-v3/ideogram-v3 削除）
   - `assets/generated-images/.gitkeep` 新設
   - hook `check-notebook-query.mjs` で STEP 2 ベスプラ参照を強制（PreToolUse・Bash matcher）
   - propagate-hooks.mjs で 15 プロダクトに hook 同期
   - 通電テスト: flux-schnell で赤マグカップ生成成功（¥0.5）

4. **create-text スキル新設**
   - `.claude/skills/create-text/SKILL.md`（STEP 2 は 3 分岐: NotebookLM / Claude Code 内ベスプラ / マスター提示）
   - `assets/text-assets.xlsx` 新設（text-assets シート 7 列）
   - 文章ベスプラ未整備のため hook 導入は保留

5. **ココナラ出品文ライター ロールプロンプト vest1 登録**
   - `docs/standards/templates/coconala-listing-writer.md` 新規（#30 として登録）
   - `docs/standards/README.md` vest1 対応表 #30 追加
   - `docs/standards/vest1-catalog.html` を全同期（#11 で止まっていた状態から #30 まで拡張。運用(O)・廃止(D) カテゴリ新設）

6. **規律追加**
   - `docs/ops/agent-rules.md` 作業ルールに「スキル/SOP/マニュアルに具体参照を書く前に実コードを grep 確認」「ルール定義→実装整合→通電テスト を1セットで完了」を追記

### 未解決事項

1. **本来タスク（未着手）**: Claude Code 入門サムネ v3 合格保存 + 出品文 v2 合格保存。tmp/coconala-thumbs/thumb-v3-faceversion.png と journal/monetization/listings/2026-04-19-claude-code-intro/listing-draft-v2.md は draft のまま
2. **文章ベスプラ整備**: マスター作成中。整備完了後に create-text hook 有効化
3. **#2 の flux-1.1-pro-ultra と flux-2-pro の Spec 章**: 公式ガイド要約で記述したが、実案件での検証はこれから
4. Session 187 未解決事項（Vercel環境変数 NOTION_TOKEN/NOTION_DB_ID 未設定）引き続き残存

### 成果物

- 種類: 新規スキル 2 + hook 1 + vest1 1 + NotebookLM ソース上書き 1
- 保存先:
  - `.claude/skills/create-image/SKILL.md`
  - `.claude/skills/create-text/SKILL.md`
  - `.claude/hooks/check-notebook-query.mjs`
  - `docs/standards/templates/coconala-listing-writer.md`
  - `assets/text-assets.xlsx`
  - NotebookLM ノート ClaudeCode-BestPractice / #2 ソース（eafc2928-fc9a-48f4-99b3-6e918bba50de）
- 通電テスト画像: `tmp/replicate-out/test-通電-20260419.png`

### 変更ファイル

- 新規: `.claude/skills/create-image/SKILL.md`、`.claude/skills/create-text/SKILL.md`、`.claude/hooks/check-notebook-query.mjs`、`docs/standards/templates/coconala-listing-writer.md`、`assets/generated-images/.gitkeep`、`assets/text-assets.xlsx`、`tmp/coconala-thumbs/*`、`tmp/replicate-out/test-通電-20260419.png`、`journal/monetization/listings/2026-04-19-claude-code-intro/listing-draft-v2.md`
- 改修: `scripts/replicate-generate/generate.py`、`.claude/rules/video-production.md`、`docs/standards/coconala-listing-handbook.html`、`products/video-studio/CLAUDE.md`、`docs/ops/antigravity-tools-reference.md`、`docs/ops/antigravity-remotion-setup.md`、`docs/ops/listing-cycle.md`、`docs/ops/agent-rules.md`、`docs/standards/README.md`、`docs/standards/vest1-catalog.html`、`MISSION_LOG.md`
- 削除: `~/.claude/.../memory/feedback_replicate-thumbnail-rule.md`（user memory 領域・リポ外）
- 変更（propagate-hooks 同期 15 プロダクトの settings.local.json・git管理外）

### PC表バージョン

- 本セッションは横断作業（スキル・ルール整備）のため PC表更新なし

### エラー回数: 2 回

- Python インタプリタ名違い（`python3` → `python`）で xlsx 生成 1 回失敗
- Git Bash mktemp パスが Node.js と不整合で hook テスト 1 回失敗（Windows パス指定で再実行）

---

## Check-out: 2026-04-19 (Session 187) — portfolio profile page 完成・デプロイ

### 実施内容
1. clone-apple/index.html にグラスモーフィズム実装（skill-card / work-card）
2. work-card に iframe 埋め込み（ai-answer / aiueo / review 各LP）
3. スポットライト追従（CSS custom props + mousemove JS）
4. スキルグリッド 3×2 再構成（AI導入支援/業務効率化/アプリ開発 | チャットボット/LP/AI活用）
5. public/profile/index.html に同期 → Vercel 本番デプロイ
6. FeatureCard / FeatureCardGrid を Next.js アプリ側に誤作成（指示対象誤解）→ 発覚・自己開示

### 未解決事項
- NOTION_TOKEN / NOTION_DB_ID が Vercel 未設定（Next.js ポートフォリオはフォールバックデータで動作中）
- FeatureCard/FeatureCardGrid（Next.js 側）はデプロイ済みだが clone-apple とは無関係

### 変更ファイル
- `products/portfolio/clone-apple/index.html`（主要作業）
- `products/portfolio/app/public/profile/index.html`（同期）
- `products/portfolio/app/app/components/FeatureCard.tsx`（誤作成・残置）
- `products/portfolio/app/app/components/FeatureCardGrid.tsx`（誤作成・残置）
- `products/portfolio/app/app/styles/feature-card.css`（誤作成・残置）
- `products/portfolio/app/app/globals.css`

### PC表バージョン: 未整備
### エラー回数: 0回

> ※ NOTION_TOKEN / NOTION_DB_ID は Session 192 (2026-04-21) で解決済み
