# Phase 3-1: skills / allow 使用実績棚卸し

> Agent I 成果物。2026-06-06。read-only 調査 + 本ファイル Write のみ。実改変なし（棚卸し候補の一覧化が成果）。

---

## 1. skills 棚卸し（`~/.claude/skills/`）

【実行済み】`ls ~/.claude/skills/` 実測: 29エントリ（README.md + _shared + スキル27件）

### スキル一覧（実測 27件・2026-06-06）

| # | スキル名 | 判定 | 備考 |
|---|---------|------|------|
| 1 | brainstorming | 維持 | CLAUDE.md に常時トリガー記載あり |
| 2 | checkout | 維持 | セッション終了で毎回発火 |
| 3 | code-review | 維持 | `/code-review` 正規コマンド（旧 `/simplify` → 本スキルに統合済み） |
| 4 | code-review-1year | 維持 | code-review 系バリアント |
| 5 | code-review-3m | 維持 | code-review 系バリアント |
| 6 | code-review-6m | 維持 | code-review 系バリアント |
| 7 | code-review-only-now | 維持 | code-review 系バリアント |
| 8 | create-image | 維持 | MEMORY.md P1.5 にトリガーマップあり（Replicate 画像生成） |
| 9 | deep-research | 維持 | CLAUDE.md §session-lifecycle に発火経路あり |
| 10 | feed-check | 維持 | A群・vibe-base固有。path-resolver依存 |
| 11 | find-skills | 維持 | skill-menu 連携。能動推薦フロー |
| 12 | fix-loop | 維持 | MEMORY.md P1.5 にトリガーあり |
| 13 | learning-suite-add-kanji | 維持 | MEMORY.md P1.5 に発火トリガー多数 |
| 14 | pc-checkin | 維持 | セッション開始で発火 |
| 15 | remotion-best-practices | 維持 | remotion 系作業時 |
| 16 | security-review | 維持 | code-review 系・本番前必須 |
| 17 | shadcn | 維持 | shadcn UI 使用プロダクトで発火 |
| 18 | skill-creator | 維持 | 新スキル作成フロー |
| 19 | skill-menu | 維持 | MEMORY.md P1.5「マスター発話で能動推薦」 |
| 20 | supabase-postgres-best-practices | 維持 | Supabase使用時 |
| 21 | systematic-debugging | 維持 | デバッグフロー |
| 22 | ui-ux-pro-max | 棚卸し候補 | SKILL.md が存在しない（`ls ~/.claude/skills/ui-ux-pro-max/` → SKILL.md 不在・scriptsディレクトリのみ）。CLAUDE.md・MEMORY.md・rules 内に発火トリガー不在。用途不明。 |
| 23 | vercel-composition-patterns | 維持 | Vercel構成パターン |
| 24 | vercel-deploy | 維持 | MEMORY.md 発火トリガーあり |
| 25 | verification-before-completion | 維持 | 完了前検証フロー |
| 26 | web-design | 維持 | MEMORY.md P1.5 + .claude/rules/web-design.md で発火 |
| 27 | writing-plans | 維持 | 仕様→実装前のプラン作成 |
| 28 | ymm-pipeline-single | 棚卸し候補 | prompt.md 形式（SKILL.md なし）。vibe-base 外 ymmp テンプレ依存。現 products/ に対応 product なし（ymm-shorts のみ存在）。用途が ymm-tenshoku-pipeline と重複する可能性。 |
| 29 | ymm-tenshoku-pipeline | 棚卸し候補 | prompt.md 形式（SKILL.md なし）。転職テーマ固定。vibe-base 外依存。発火トリガーが非常に限定的。 |

**skills 棚卸し候補: 3件**（ui-ux-pro-max / ymm-pipeline-single / ymm-tenshoku-pipeline）

---

## 2. allow 棚卸し（`settings.local.json` → `permissions.allow`）

【実行済み】実測: 全652件

### カテゴリ別内訳

| カテゴリ | 件数 | 概況 |
|---------|------|------|
| Bash(*) | 400 | 最大カテゴリ。ワンライナー・コマンド系 |
| WebFetch(domain:*) | 187 | リサーチ・外部サービス確認用 |
| Read(**) | 20 | ファイル読取許可 |
| mcp__* | 33 | MCP ツール許可 |
| Write(**) | 3 | vault 書込（Obsidian） |
| Edit(**) | 3 | vault 編集 |
| PowerShell(*) | 4 | PS コマンド |
| Skill(*) | 1 | `Skill(schedule)` |
| WebSearch | 1 | 全体 Web検索 |
| **合計** | **652** | |

### 棚卸し候補の分類

#### A. 廃止 product 由来（高優先度）

【実行済み】以下は廃止済み product（memory/project_dead-products.md 記載: design-seed / dify-service / x-bot + 外部 x-poster/Misfits / ai-concierge）への参照。

**x-poster / Misfits（外部プロジェクト）: 推定 22件**
- `Read(//c/Users/user/Desktop/Misfits/projects/x-poster/**)`
- `Read(//c/Users/user/Desktop/Misfits/projects/x-poster/src/products/**)`
- `Bash(cd "C:\\...\\Misfits\\projects\\x-poster" && ...)` — 複数（npm/pm2/npx tsx等）
- `Bash(find "C:\\...\\Misfits\\projects\\x-poster\\src" ...)` 等

**ai-concierge（廃止 product）: 推定 6件**
- `Bash(cmd.exe /c "rmdir /s /q ...\\products\\ai-concierge" ...)`
- `Bash(find /c/.../ai-concierge/app/api ...)`
- `Bash(find /c/.../ai-concierge/app/src ...)`
- `Bash(Chrome ... print-to-pdf ... AI-Answer-システム仕様書.pdf ...)`
- `Bash(rsync ... /products/ai-concierge/ ...)`
- `Bash(cp -r /c/.../products/ai-concierge/. .)`

**design-seed: 2件**
- `Bash(sed -i '1s/WEBページ模写サービス...' products/design-seed/...)` など

**dify-service: 1件**
- Chrome headless screenshot に dify-service/tmp パス含む

**roughcut-harness（外部 harness 一時設置）: 4件**
- `Bash(cp -r "/c/.../roughcut-harness/skills/harness" ...)` 等4件

**小計: 約 35～42件（廃止 product 由来）**

#### B. 廃止 agent-ag 構造（旧ディレクトリ）

【実行済み】旧 `agent-ag/` パス参照 14件。現在 `products/` 配下に一本化済のため不要。

- `Bash(cd /c/.../agent-ag/review-analysis-bot/review-app && ...)` 複数
- `Bash(find "...agent-ag/microscope-lp" ...)`
- `Bash(cd /c/.../agent-ag/aiueo-app && ...)` 複数
- `Bash(cp /c/.../agent-ag/aiueo-app/frontend/... /tmp/...)` 等

**小計: 14件**

#### C. 廃止 MCP ID（旧 Canva MCP）

【実行済み】Canva MCP が UUID 形式（旧）から `mcp__claude_ai_Canva__*` 形式に移行済み。旧UUID が 2件残存。

- `mcp__bb3fdcd6-cfc5-4ea1-835d-20369206d831__search-designs`
- `mcp__bb3fdcd6-cfc5-4ea1-835d-20369206d831__get-design-content`

**小計: 2件**

#### D. 廃止 `.agents/` パス（旧スキルディレクトリ構造）

【実行済み】旧 `~/.agents/` パス 3件。現在は `~/.claude/skills/` に統一済み。

- `Read(//c/Users/user/.agents/skills/find-skills/**)`
- `Read(//c/Users/user/.agents/**)`
- `Read(//c/Users/user/.agents/skills/**)`

**小計: 3件**

#### E. 廃止 Vercel プレビュー URL（WebFetch）

【実行済み】本番で使われなくなった一時的 Vercel プレビューURL・廃止ドメイン 8件。

- `WebFetch(domain:review-app-orpin-ten.vercel.app)` — 旧 review プレビュー
- `WebFetch(domain:mobile-order-system.vercel.app)` — 廃止 product
- `WebFetch(domain:aiueo-test-client.vercel.app)` — 一時テスト環境
- `WebFetch(domain:omotenashi-trainer.vercel.app)` — 廃止 product
- `WebFetch(domain:aiueo-pvfjmbmn3-rahisekos-projects.vercel.app)` — 旧プレビュー
- `WebFetch(domain:review-bs19rejwi-rahisekos-projects.vercel.app)` — 旧プレビュー
- `WebFetch(domain:ai-concierge-nu-lyart.vercel.app)` — 廃止 product
- `WebFetch(domain:ai-answer.kouheikosehira.com)` — 廃止 product

**小計: 8件**

#### F. 過剰ブロードワイルドカード（安全性リスク）

【実行済み】以下は `Bash(コマンド:*)` 形式で実質的にすべての引数を許可するワイルドカード。`permission-defense.md` が deny に指定する対象（`rm -rf:*` / `curl:*`）の迂回経路となりうる。

- `Bash(git:*)` — deny の `Bash(git push --force*)` をバイパス可能
- `Bash(node:*)` — ask の `Bash(node -e *)` をバイパス可能
- `Bash(npm:*)` — ask の `Bash(npm install *)` をバイパス可能
- `Bash(find:*)` — destructive `find -delete` をバイパス可能
- `Bash(rm:*)` — deny の `rm -rf:*` をバイパス可能（←最優先是正）
- `Bash(curl:*)` — deny の `Bash(curl:*)` と競合（allow が deny を上書き）
- `Bash(bash:*)` — 任意スクリプト実行を許可
- `Bash(mv:*)` — ファイル破壊系コマンドをバイパス可能

**小計: 8件（うち `curl:*` と `rm:*` は deny との競合あり・最優先）**

#### G. デバッグ用一時コマンド（ワンショット）

【推測】以下は特定セッションのデバッグ時に追加された一時的 allow と推定。再利用可能性が低い。

- `Bash(printenv REPLICATE_API_TOKEN)` — シークレット確認用（運用継続は危険）
- `Bash(handle64.exe "query_engine-windows.dll.node")` — DLL 調査ワンショット
- `Bash(kill -0 by73x1l68)` — 特定プロセス確認
- `Bash(xxd /tmp/hook-test-input.json)` — hook テスト時の一時
- `Bash(xxd)` — デバッグ
- `Bash(uipro init:*)` — uipro は現在未使用 CLI
- `Bash(findstr 9222)` — Chrome デバッグポート確認（一時）
- `Bash(findstr :3000)` / `Bash(findstr LISTENING)` / `Bash(findstr ":3000 ")` — ポート確認一時
- `Bash(schtasks /query /fo LIST /v)` / `Bash(schtasks /query /fo CSV /nh)` / `Bash(schtasks /query /fo CSV)` / `Bash(schtasks:*)` — タスクスケジューラ確認一時
- `Bash(cygpath:*)` — Windows パス変換（Cygwin 未使用環境では不要）

**小計: 13件**

### allow 棚卸し候補 サマリー

| 区分 | 件数 | 優先度 |
|------|------|--------|
| A. 廃止 product 由来（x-poster/ai-concierge/design-seed等） | 約42 | 高 |
| B. 廃止 agent-ag パス | 14 | 高 |
| C. 廃止 MCP UUID（旧 Canva） | 2 | 高 |
| D. 廃止 `.agents/` パス | 3 | 高 |
| E. 廃止 Vercel プレビュー URL | 8 | 中 |
| F. 過剰ワイルドカード（deny競合あり） | 8 | 最高（`rm:*` `curl:*`） |
| G. デバッグ用一時コマンド | 13 | 中 |
| **合計** | **約90** | |

> ※ 実改変は本 Phase 対象外。是正実行は別 plan + マスター手動編集。
> ※ `Bash(curl:*)` および `Bash(rm:*)` は `settings.json` deny と競合しており allow が優先される動作のため、他項目より優先して是正すべき。
> ※ `Bash(printenv REPLICATE_API_TOKEN)` はシークレット値をチャット出力する経路のため即時削除を推奨。

---

v1.0 | 2026-06-06 | Agent I 初版（調査のみ・実改変なし）
