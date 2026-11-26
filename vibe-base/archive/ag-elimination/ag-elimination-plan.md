# AG撲滅作戦 プラン正本 v1.0

> **このファイルの存在理由:** セッション圧縮で記憶が飛んだ場合、マスターがこのファイルを参照指示すれば、担当AIは作業を完全復元できる。MEMORY.md から常時ポインタ参照される。

**開始日:** 2026-04-15
**担当:** vibe-base 司令塔（Opus 4.6 1M）
**承認者:** マスター
**状態:** `memory/project_ag-elimination-status.md` で現Phase追跡

---

## 背景

「AG」略称禁止ルール（MEMORY.md P1 #4）は、**プロジェクトファイル内に「AG」が大量に存在すること**を根本原因として維持されてきた。モデルは禁止ルールより文脈模倣が強いため、ルール追加ではなく**根絶**が本来の対処。

過去に撲滅を試みたが複雑さで断念した経緯あり（Session 2026-04-10 頃）。今回は**修復プランを先に作ってから本体実施**する方針で再挑戦する。

---

## 撲滅対象と非対象

### 対象（生きたファイル）
- `docs/ops/` 配下のSOP（AG含有8ファイル）
- `.claude/rules/` 配下のルール（自動注入系）
- `products/*/CLAUDE.md`（自治憲法）
- `products/*/handoff*.md`（指示書）
- `memory/` 配下（パトロール等）
- `docs/md-inventory.md`, `docs/memory-viewer.html`
- `SESSION_JOURNAL.md`
- ルート `MEMORY.md`, `CLAUDE.md`

### 非対象（変更禁止）
- `archive/` 配下全て（履歴の改変禁止）
- `tmp/` 配下全て（一時ファイル）
- `journal/claude-code-book/` 配下（書籍原稿、史的文脈としてAGを残す）
- `node_modules/` 配下（第三者ライブラリ）
- Git履歴（コミットメッセージ・ブランチ名）

---

## 「AG」の2つの意味（致命的注意点）

| 用法 | 意味 | 扱い |
|---|---|---|
| AG（エージェント略） | Claude Code等のAIエージェント | **エージェント** に統一 |
| AG（Antigravity略） | Google Gemini CLI (Antigravity) | **Antigravity** に明示 |

**混在ファイル:** `memory/patrol.md`, `docs/memory-viewer.html`, `docs/ops/ag-ai-tools-reference.md`
**注意:** 単純置換厳禁。文脈判定必須。

---

## Phase 0: 保険作り（撲滅前に必ず完了）

### 0-1. Gitセーフティネット
```bash
cd C:/Users/user/Desktop/vibe-base
git add -A && git commit -m "chore: pre-ag-elimination snapshot" # 作業中のuntracked含め固定
git tag ag-elimination-baseline
git branch backup/ag-elimination-baseline
```
**復元手段:** `git reset --hard ag-elimination-baseline`

### 0-2. 逆引き辞書
`docs/ops/ag-elimination-dictionary.md` を作成。
内容: 旧パス→新パス / 旧用語→新用語 / 置換ルール / 除外パターン

### 0-3. ベースライン・スナップショット
`tmp/ag-elimination-snapshot/` に保存：
- `file-list.txt`: AG含有ファイル全パス+件数
- `reference-map.txt`: 各AG出現箇所の前後3行
- `auto-injection-map.txt`: `.claude/rules/*.md` のfrontmatter `paths:` 一覧
- `pc-table-checksum.txt`: `product-cycle.md` の🔍AG マーク付き行

### 0-4. 破壊検知スクリプト
`tmp/ag-check.sh` を作成。以下を実行できること：
1. 参照切れ検出: `grep -rn "ag-task-protocol\|ag-remotion\|ag-ai-tools" --exclude-dir=archive --exclude-dir=node_modules`
2. 残存AG検出: `grep -rn "\bAG\b\|AG-[ADV]\b" --include="*.md"`
3. hook frontmatter整合性: `grep -r "paths:" .claude/rules/`

---

## Phase 1-7: 撲滅本体

各Phaseは独立コミット。Phase間で破壊検知スクリプト実行し0件確認。

### Phase 1: 語彙統一（本文のみ、ファイル名は触らない）
- 対象: `docs/ops/*.md`（本文）、`products/*/CLAUDE.md`、`memory/*.md`、`MEMORY.md`、`CLAUDE.md`、`SESSION_JOURNAL.md`
- 置換: 「AG」（エージェント文脈）→「エージェント」
- **除外**: AG-A/D/V（Phase 4で処理）、Antigravity文脈（Phase 2で処理）、🔍AG（Phase 3で処理）
- コミット: `refactor(docs): AG→エージェント 語彙統一（Phase 1）`

### Phase 2: Antigravity分離
- 対象: `memory/patrol.md`, `docs/memory-viewer.html`
- 置換: 「AG」（Antigravity文脈）→「Antigravity」
- コミット: `refactor(docs): Antigravity を明示表記に変更（Phase 2）`

### Phase 3: PC表の委任マーク置換
- 対象: `docs/ops/product-cycle.md` 約80行
- 置換: 「🔍AG」→「🔍委任可」
- コミット: `refactor(pc-table): 🔍AG→🔍委任可 に変更（Phase 3）`

### Phase 4: 役割コード置換
- 対象: `products/design-seed/CLAUDE.md` ほか handoff 系
- 置換: AG-A → エージェントA、AG-D → エージェントD、AG-V → エージェントV、AG-C → エージェントC
- 注意: design-seed は生きた運用中。実働体制を壊さない
- コミット: `refactor(design-seed): エージェント役割コード置換（Phase 4）`

### Phase 5: ファイル名リネーム + 参照一括書換
- リネーム対象:
  - `docs/ops/ag-task-protocol.md` → `docs/ops/agent-task-protocol.md`
  - `docs/ops/ag-remotion-setup.md` → `docs/ops/agent-remotion-setup.md`
  - `docs/ops/ag-ai-tools-reference.md` → `docs/ops/antigravity-tools-reference.md` (※Antigravity側)
- 参照元22ファイルの参照パス一括書換
- コミット: `refactor(docs): ファイル名リネーム + 参照更新（Phase 5）`

### Phase 6: 自動注入ルールのリネーム + hook検証
- リネーム: `.claude/rules/ag-task.md` → `.claude/rules/agent-task.md`
- frontmatter `paths: products/*/handoff*` は不変（パターンはAG非依存）
- hook動作検証: `node scripts/propagate-hooks.mjs` 実行
- settings.local.json の参照確認
- コミット: `refactor(.claude): 自動注入ルール名変更 + hook検証（Phase 6）`

### Phase 7: 禁止ルール削除
- 削除: `memory/feedback_no-ag-abbreviation.md`
- 削除: `MEMORY.md` P1 #4 「『AG』略称禁止」エントリ
- 削除: `docs/ops/agent-rules.md` 内の該当記述
- コミット: `chore(memory): AG禁止ルール削除（根本原因除去・Phase 7）`

---

## 異常時の修復手順

### レベル1: 単一Phaseの巻き戻し
```bash
git log --oneline | grep "Phase [1-7]"
git revert <該当sha>
```

### レベル2: 参照切れの復旧
1. `docs/ops/ag-elimination-dictionary.md` を開く
2. 破壊検知スクリプトで壊れた参照を特定
3. 辞書で逆引きして一括置換

### レベル3: hookが壊れた
1. `ls -la .claude/settings.local.json` で存在確認
2. `node scripts/propagate-hooks.mjs` 再実行
3. それでも直らなければ Phase 6 を revert

### レベル4: 全面ロールバック
```bash
git reset --hard ag-elimination-baseline
```
→ 撲滅前の状態に完全復帰。記憶喪失からの復旧時も有効。

---

## セッション圧縮からの復元プロトコル

マスターがプラン全文を貼り戻した / または「AG撲滅の続き」と指示した場合、担当AIは次を実行：

1. 本ファイル（`docs/ops/ag-elimination-plan.md`）を読む
2. `memory/project_ag-elimination-status.md` を読む（現Phase確認）
3. `git log --oneline | head -20` で直近コミット確認
4. 破壊検知スクリプト `tmp/ag-check.sh` を実行
5. 現Phaseから再開。Phase番号が不明なら直近コミットメッセージから判定
6. マスターに「Phase N から再開する」と報告してから動く

---

## 現Phase追跡

現在の進捗: `memory/project_ag-elimination-status.md` を参照。

- [x] Phase 0-0: プラン作成・復元手配（このファイルの作成）
- [ ] Phase 0-1: Gitセーフティネット
- [ ] Phase 0-2: 逆引き辞書
- [ ] Phase 0-3: ベースライン・スナップショット
- [ ] Phase 0-4: 破壊検知スクリプト
- [ ] Phase 1: 語彙統一
- [ ] Phase 2: Antigravity分離
- [ ] Phase 3: PC表委任マーク置換
- [ ] Phase 4: 役割コード置換
- [ ] Phase 5: ファイル名リネーム
- [ ] Phase 6: 自動注入ルール + hook検証
- [ ] Phase 7: 禁止ルール削除

---

**改訂履歴:**
- 2026-04-15 v1.0 マスター承認済み初版
