# エージェント略称撲滅作戦 逆引き辞書 v1.0

> 作戦途中で参照切れ・意味喪失が発生した場合、本辞書で機械的に復元可能にする。Phase 5のファイル名リネーム前後の対応関係を凍結保存する。

**作成日:** 2026-04-15
**連携:** `docs/ops/ag-elimination-plan.md` / `memory/project_ag-elimination-status.md`

---

## 1. ファイル名リネーム対応表（Phase 5・6）

| 旧パス | 新パス | カテゴリ | 参照元数 |
|---|---|---|---|
| `docs/ops/ag-task-protocol.md` | `docs/ops/agent-task-protocol.md` | エージェント | 約12 |
| `docs/ops/ag-remotion-setup.md` | `docs/ops/agent-remotion-setup.md` | エージェント | 2 |
| `docs/ops/ag-ai-tools-reference.md` | `docs/ops/antigravity-tools-reference.md` | Antigravity | 1 |
| `.claude/rules/ag-task.md` | `.claude/rules/agent-task.md` | エージェント | 自動注入 |

**注意:** `docs/ops/ag-elimination-plan.md` と `docs/ops/ag-elimination-dictionary.md` は作戦終了後も履歴資料として残す（ファイル名変更不要）。

---

## 2. 用語置換対応表（Phase 1〜4）

### 2-1. 単独略称（Phase 1）

| 旧表記 | 新表記 | 文脈 |
|---|---|---|
| `AG`（単独） | `エージェント` | Claude Code / Sonnet等のAI作業員 |
| `AG側` | `エージェント側` | 役割区別 |
| `AG環境` | `エージェント環境` | 作業環境 |
| `AG 向け` | `エージェント向け` | 指示対象 |

### 2-2. Antigravity文脈（Phase 2）

| 旧表記 | 新表記 | 検出ファイル |
|---|---|---|
| `AG`（Gemini CLI文脈） | `Antigravity` | `memory/patrol.md` A1〜A6 / `docs/memory-viewer.html` |
| `~/.agents/` | `~/.agents/`（パス名は変更不可。そのまま） | 複数 |

**識別方法:** 近傍に `Gemini` / `antigravity` / `~/.gemini/` / `skills/` が出現する場合は Antigravity 文脈。

### 2-3. PC表委任マーク（Phase 3）

| 旧表記 | 新表記 | 対象 |
|---|---|---|
| `🔍AG` | `🔍委任可` | `docs/ops/product-cycle.md` 約80行 |
| `🔍AG委任` | `🔍委任可` | 同上 |

### 2-4. 役割コード（Phase 4）

| 旧表記 | 新表記 | 定義元 |
|---|---|---|
| `AG-A` | `エージェントA` | 実装担当 |
| `AG-D` | `エージェントD` | デザイン担当 |
| `AG-V` | `エージェントV` | 動画担当 |
| `AG-C` | `エージェントC` | メディア担当 |

---

## 3. 除外パターン（変更禁止）

以下はPhase対象外。検知スクリプトからも除外する。

### 3-1. 完全除外ディレクトリ

- `archive/` 配下全て（履歴保護）
- `tmp/` 配下全て（一時ファイル）
- `node_modules/` 配下全て（第三者コード）
- `journal/claude-code-book/` 配下（書籍原稿・史的文脈）
- `.git/` 配下全て（gitメタ）
- `agent-ag/` 配下全て（旧作業場の遺物。現在凍結中）

### 3-2. パス名保護（変更禁止）

以下のパス文字列はそのまま残す（パス名内のAGは本作戦の対象外）：

- `agent-ag/` ディレクトリ名
- `~/.agents/` （ユーザー環境パス）
- `ag-elimination-plan.md`（本作戦資料。作戦完了後もファイル名保持）
- `ag-elimination-dictionary.md`（本ファイル）
- `ag-elimination-baseline`（gitタグ・ブランチ名）

### 3-3. git履歴（不可抗力）

- 過去のコミットメッセージ（編集不可）
- 過去のブランチ名（編集不可）
- archive済みファイルのAG表記（履歴として残す）

---

## 4. 復旧用ワンライナー集

### 4-1. 参照切れ検出

```bash
# ファイル名変更による参照切れ検出（Phase 5後）
grep -rn "ag-task-protocol\|ag-remotion-setup\|ag-ai-tools-reference" \
  --include="*.md" --include="*.html" --include="*.sh" --include="*.mjs" \
  --exclude-dir=archive --exclude-dir=node_modules --exclude-dir=tmp \
  --exclude-dir=.git --exclude-dir=journal
```

### 4-2. 残存「AG」単独検出

```bash
# 生きたファイルのみ対象
grep -rnE '(^|[^A-Za-z0-9_])AG([^A-Za-z0-9_]|$)' \
  --include="*.md" --include="*.html" \
  --exclude-dir=archive --exclude-dir=node_modules --exclude-dir=tmp \
  --exclude-dir=.git --exclude-dir=journal --exclude-dir=agent-ag
```

### 4-3. 役割コード検出

```bash
grep -rnE 'AG-[ADVC]\b' \
  --include="*.md" \
  --exclude-dir=archive --exclude-dir=tmp --exclude-dir=journal
```

### 4-4. 全面ロールバック

```bash
git reset --hard ag-elimination-baseline
# または個別Phaseのrevert
git log --oneline | grep 'Phase [1-7]'
git revert <sha>
```

---

## 5. セッション圧縮からの復元手順

1. 本ファイルと `docs/ops/ag-elimination-plan.md` を両方読む
2. `memory/project_ag-elimination-status.md` で現Phase確認
3. `git log --oneline | head -20` で直近コミット確認
4. 4-1〜4-3のワンライナーで破壊検知
5. マスターに「Phase N から再開」報告後に動く

---

**改訂履歴:**
- 2026-04-15 v1.0 マスター承認済み初版
