# Serena MCP セットアップ runbook（vibe-base 環境）

> 2026-06-23 確立。Serena 1.5.3 を Claude Code に導入した際の最適構成と、AI が
> 実行不可（権限ブロック）でマスター手動が要る残作業を記録する単一正本。
> 設計判断の経緯 → `~/.claude/plans/github-glimmering-kahn.md`

## 発火規律（運用・CLAUDE.md §4.5 の実体）

- **トリガー:** マスターの発話に「Serena」が含まれたら発火する（合言葉。hook も別コマンドも要らない）。
- **発火動作:** その場で対象 `products/<name>` を `activate_project` し、**以降そのセッション中はコード探索/編集を Serena ツール優先で継続**する。一度発火したら毎回 Read に戻らない。
- **優先ツール順:** `get_symbols_overview`（構造把握）→ `find_symbol`（対象シンボル取得）→ `replace_symbol_body` / `insert_after_symbol`（編集）/ `find_referencing_symbols`（参照箱）。TS/JS の全文 Read は避ける。
- **対象外:** Markdown / JSON / YAML / 画像等は従来どおり Read/Edit でよい（Serena は TS/JS で効く）。
- **禁止:** root（vibe-base ルート）の activate（150s timeout 再発・本文参照）。必ず `products/<name>` を指す。
- **成果測定:** 採用率は `outputs/serena-usage-analyze.mjs` で再算出（次回 2026-07-04）。貢献実測 → `docs/ops/serena-contribution-report.md`。

## なぜこの構成か（要点）

公式 `serena setup claude-code` は `--project-from-cwd` で登録するが、vibe-base は
巨大モノレポ（`.worktrees/` が全体を二重化）で、起動時のフルスキャンに **150 秒超**
かかり MCP `initialize` がタイムアウト＝接続不能だった（`.gitignore` 読込だけで 30.6 秒）。
Serena は `.gitignore` は読むが `.git/info/exclude` を読まないため `.worktrees/` を
二重走査する（GitHub Issue #470 / #577 / #979 と同型）。

→ **root 全体を 1 プロジェクトにしない**。無 project で高速ブートさせ、必要な
product だけ `serena project index` ＋ `activate_project` する運用に変更した。

## 確定済（AI 実行済）

| 項目 | 内容 |
|---|---|
| 本体 | `uv tool install -p 3.13 serena-agent@latest` → v1.5.3（serena / serena-agent / serena-hooks） |
| 登録 | user scope・`serena start-mcp-server --context claude-code`（**`--project-from-cwd` 無し**） |
| 接続 | `claude mcp list` で `serena ✔ Connected`（無 project・高速ブート） |
| index 実証 | `products/x-auto-post`（純 Python 15 ファイル）を index 成功。`.serena/cache/python/document_symbols.pkl`（487 KB）生成＝シンボル抽出動作確認 |
| project.yml | `products/x-auto-post/.serena/project.yml`（language=python・`.claude/**` 等を ignore） |

## マスター手動が必要な残作業（AI は権限ブロックで実行不可）

### 残1: global ignored_paths 追加（`~/.serena/serena_config.yml`）

理由: `~/.serena/` は vibe-base 外で `outside-vibe-base-gate` hook が AI 編集を Deny。
目的: 将来どの project を activate しても二重ツリー・重量 dir を走査させない保険。

`ignored_paths: []`（既存行）を次に置換:

```yaml
ignored_paths:
- "**/.worktrees/**"
- "**/node_modules/**"
- "**/archive/**"
- "**/backups/**"
- "**/outputs/**"
```

### 残2: Serena 3 hook 追加（`~/.claude/settings.json`）

理由: 自分の hook/settings 改変は auto-mode 分類器が Deny（failures.md 2026-05-31）。
加えて user スコープ hook は**全 product・司令塔の全セッション起動に影響**するため、
導入可否はマスター判断。現状 `settings.json` に hooks セクションは無い。

`settings.json` の最上位に以下 `hooks` キーを追加（既存キーと並列）:

```json
"hooks": {
  "SessionStart": [
    { "hooks": [ { "type": "command", "command": "serena-hooks activate --client claude-code" } ] }
  ],
  "PreToolUse": [
    { "matcher": "Read|Grep|Glob", "hooks": [ { "type": "command", "command": "serena-hooks remind --client claude-code" } ] }
  ],
  "SessionEnd": [
    { "hooks": [ { "type": "command", "command": "serena-hooks cleanup --client claude-code" } ] }
  ]
}
```

注意点:
- `activate` hook は毎セッション冒頭に「Serena で project を activate せよ」を注入する。
  vibe-base の `/pc-checkin` フローと競合し得る。**全 product に効かせたくない場合は
  user settings でなく、Serena を使う product の `.claude/settings.json` に置く**方が無難。
- `remind` は Read/Grep が 60 秒継続した時だけ発火する軽量設計。
- 検証済: 正規 payload で `activate`/`remind`/`cleanup` 各 EXIT 0。

## Opus 用 system-prompt override（内蔵ツール優先バイアス対策）

Opus 系は Claude Code 内蔵ツールを優先し Serena を使わない傾向。公式推奨の起動:

```bash
claude --system-prompt="$(PYTHONUTF8=1 serena prompts print-cc-system-prompt-override)"
```

**`PYTHONUTF8=1` 必須**（無いと日本語環境 cp932 で em-dash の UnicodeEncodeError＝
出力 0 バイト）。付ければ 8015 文字の override が出力される。

## 日常運用

1. Serena を使う product ディレクトリで作業する（または session 内で `activate_project <product path>`）。
2. 起動が遅い時は `MCP_TIMEOUT=60000`（環境変数）。
3. 新規 product で使う初回は `PYTHONUTF8=1 serena project index products/<name>` を一度実行。
4. GDScript（spire-lite 等）は **Godot エディタ起動中（TCP 6008 の内蔵 LSP）が前提**。
   ヘッドレス index 不可。Godot で project を開いた状態で activate して使う。

## 既知のセキュリティ所見

- `~/.claude/settings.json` の `env.TWITTER_BEARER_TOKEN` が**平文**。漏洩面が広い。
  GitHub Secrets / OS キーチェーン等への移設を検討（本 runbook 作成時点で未対処）。
