# Stop hook #65169 fixture 検証レポート — Agent T

> 作成日: 2026-06-06
> 担当: Agent T（sonnet・技術検証）
> 参照計画: `docs/session-reports/2026-06-06-opmod-phase2-3-plan.md` §Agent T 指令
> 成果物パス: `docs/session-reports/2026-06-06-stop-hook-65169-verify.md`
> fixture パス: `tests/fixtures/stop-hook-65169/`

---

## タスク T-1: Phase 2-3 Stop hook 自動verify × #65169 fixture検証

### 1. #65169 バグ要点

【実行済み】WebFetch で GitHub issue #65169（anthropics/claude-code）を確認。

| 項目 | 内容 |
|---|---|
| タイトル | PostToolUse hook fires for all tools except Agent |
| 発見日 | 2026-06-03 |
| ステータス | Open・未解決 |
| 影響イベント | `PostToolUse` のみ（Stop / SubagentStop とは別） |
| 症状 | `matcher: "*"` を含む PostToolUse hook が、**Agent ツール完了時だけ発火しない** |
| 他ツールへの影響 | Bash / Read / Edit / Write / Grep / Glob / MCP ツール は正常発火 |
| 再現性 | あり（issue に HTTP サーバー実測ログ掲載） |
| ラベル | `area:agents`, `area:hooks`, `bug`, `has repro`, `platform:macos` |
| 修正 PR | なし（2026-06-06 時点） |

**バグの本質**: Claude Code ランタイムが Agent ツールの完了後に `PostToolUse` イベントを発行しない。hook 設定の問題ではなく、ランタイム自体の不具合。

---

### 2. 現状 settings.json の hook 登録状況

【実行済み】`.claude/settings.json` を確認。

| イベント | 登録有無 | 内容 |
|---|---|---|
| `PreToolUse` | 登録あり | pre-edit.sh / area-gate / pre-bash-destructive / secret-write-gate / pre-write-glob-check / plan-schema-gate（6 hook） |
| `PostToolUse` | 登録あり | post-bash.js / post-write.sh / pc-version-gate / rules-coverage-gate / ac-keyword-gate（5 hook） |
| `Stop` | **未登録** | — |
| `SubagentStop` | **未登録** | — |

`PostToolUse[matcher=Agent]` も未登録（#65169 により登録しても意味がないため）。

---

### 3. fixture 設計と実行結果

【実行済み】`tests/fixtures/stop-hook-65169/` を本番非破壊で作成。

#### fixture ファイル構成

| ファイル | 役割 |
|---|---|
| `README.md` | fixture 概要・実行方法 |
| `stub-stop-hook.sh` | ダミー Stop hook（ファイル書込で発火証跡を残す） |
| `stub-subagent-stop-hook.sh` | ダミー SubagentStop hook（同上） |
| `settings-hypothetical.json` | 本番非適用の仮想 settings（Stop/SubagentStop/PostToolUse[Agent] 登録例） |
| `expected-outcome.md` | 期待値定義（#65169 バグにより E-3/E-4 FAIL 想定） |
| `run-stub-test.sh` | stub 直接実行で発火証跡を検証する単体テスト |

#### 単体テスト実行結果

```
bash tests/fixtures/stop-hook-65169/run-stub-test.sh

=== stop-hook-65169 stub test ===
[PASS] E-1: stub-stop-hook.sh 発火証跡確認
[PASS] E-2: stub-subagent-stop-hook.sh 発火証跡確認
[SKIP] E-3: PostToolUse[Agent] — #65169 バグにより非発火。runtime 検証は実機必要（禁止）。
[SKIP] E-4: Stop hook 自動連鎖 — #65169 解消後に判断。
[SKIP] E-5: SubagentStop runtime 発火 — 実機検証対象外。

=== 結果: PASS 2 / FAIL 0 / SKIP 3 ===
```

**【実行済み】stub 単体テスト: PASS 2 / FAIL 0**。fixture スクリプト自体は正常動作する。

---

### 4. orchestration-discipline 規律3 自動化構想への影響判定

【実行済み】規律3「完遂前 verify-agent 自動連鎖」を Stop hook / PostToolUse[Agent] hook で自動化する構想の実現可否を判定。

#### 構想のアーキテクチャ案

```
[実装 Agent 完了]
    ↓
PostToolUse[matcher=Agent] hook 発火
    ↓
verify-agent を自動呼出
    ↓
PASS/FAIL を orchestrator に返却
```

#### 判定結果

| 自動化経路 | 可否 | 理由 |
|---|---|---|
| `PostToolUse[matcher=Agent]` hook | **不可**（現状） | #65169 により Agent 完了で非発火 |
| `Stop` hook（セッション終了時） | **構造的に不適切** | Stop は Agent 完了のたびに発火しない。セッション全体の終了時に1回のみ |
| `SubagentStop` hook | **要調査**（#65169 範囲外） | SubagentStop はサブエージェントセッション終了イベント。Agent ツール完了と同義かは未確認。ただし settings-hypothetical.json に登録例を残した |
| orchestrator が明示的に Agent tool で呼出（現行手動） | **可**（現状唯一の確実手段） | orchestration-discipline 規律3 で手動呼出として運用中 |

#### 結論

**Stop hook / PostToolUse[Agent] による verify-agent 自動連鎖は、#65169 解消まで実装不可。**

現状の手動運用（orchestrator が明示的に verify-agent を Agent tool で呼ぶ）を継続する。
#65169 が解消されたタイミングで `PostToolUse[matcher=Agent]` hook 経由の自動連鎖を実装する。

---

### T-1 サマリー

| # | 検証項目 | 結論 |
|---|---|---|
| T-1a | #65169 バグ内容 | PostToolUse[Agent] が非発火・Open・2026-06-03〜未解決 |
| T-1b | 現状 settings.json | Stop/SubagentStop 未登録・PostToolUse は Agent 以外のみ有効 |
| T-1c | fixture 単体テスト | PASS 2/2（stub スクリプト自体は正常動作） |
| T-1d | 規律3 自動化可否 | **#65169 解消まで不可。手動運用継続** |

---

## タスク T-2（=Phase 3-3）: MCP Tool Search・install 経路確認

### 1. Claude バージョン・install 経路

【実行済み】`claude --version` および `where claude` を実行。

| 項目 | 値 |
|---|---|
| バージョン | `2.1.165 (Claude Code)` |
| 実行バイナリパス | `C:\Users\user\.local\bin\claude.exe` |
| npm global install | **空（@anthropic-ai/claude-code は npm 経由でインストールされていない）** |
| install 経路判定 | **Native installer 経由**（`.local\bin\claude.exe` は公式 native installer の標準配置先） |

**判定: native installer 経由（推奨経路）。npm 非推奨経路は使用されていない。**

### 2. MCP Tool Search 有効状態

【実行済み】`claude mcp list` を実行。

| MCP サーバー | 状態 |
|---|---|
| claude.ai Canva | Connected |
| claude.ai Notion | Needs authentication |
| claude.ai Google Drive | Connected |
| claude.ai Gmail | Connected |
| claude.ai Google Calendar | Connected |

**MCP は有効（5サーバー登録済み）。** Tool Search はシステムプロンプトの `<system-reminder>` に deferred tools として注入されており、`ToolSearch` tool 経由でスキーマを取得して呼び出せる状態（既定有効）。

Notion のみ認証待ち。他 4 サーバーは Connected で正常動作中。

---

## Phase 3-3 環境確認

| 確認項目 | 結果 |
|---|---|
| Claude バージョン | 2.1.165 (Claude Code) |
| install 経路 | Native installer（`C:\Users\user\.local\bin\claude.exe`）— 推奨経路 |
| npm 経由インストール | なし（非推奨経路は未使用） |
| MCP Tool Search 状態 | 有効（deferred tools 注入済み・ToolSearch tool で呼出可） |
| 接続済み MCP サーバー | Canva / Google Drive / Gmail / Google Calendar（4/5 Connected） |
| 要認証 MCP サーバー | Notion（1件） |

---

## 総括

| タスク | 結論 | ステータス |
|---|---|---|
| T-1 | Stop hook 自動verify は #65169 解消まで実装不可。手動運用継続。fixture stub PASS 2/2。 | 完了 |
| T-2 | Claude 2.1.165 / native installer / MCP 4/5 Connected。Tool Search 有効。 | 完了 |

**本番 settings.json / hook は一切改変していない。** fixture は `tests/fixtures/stop-hook-65169/` に隔離。
