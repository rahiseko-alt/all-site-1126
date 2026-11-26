# automation-jobs — 自動実行 job 運用 runbook

> リスト③「自動実行化」（plan `~/.claude/plans/concurrent-wiggling-avalanche.md`）で導入した定期/イベント駆動 job の正本。
> 設計原則: **無人実行は「検知・レポートのみ」に限定し自動修復はしない**（例外は C-7 のセッション内 propagate と C-5 の Write ブロック）。

## 1. 定期実行 job（schtasks・検知/レポートのみ）

| job（TaskName） | 実体 | スケジュール | 検知内容 |
|---|---|---|---|
| claude-feed-fetch-daily | `scripts/automation/feed-fetch.mjs` | 日次 07:50 | xml-feed(default:true) の新着を vault 保存。新着 or 取得失敗を warn |
| claude-hook-errors-daily | `scripts/automation/hook-errors-daily.mjs` | 日次 08:05 | hook 実行時故障（exit_code=1 隠れ故障）を日次スキャン |
| claude-token-audit-weekly | `scripts/automation/token-audit-weekly.mjs` | 週次 月 08:10 | token 実測 + 走査ファイル数の前回比 20% 超減少（非再帰バグ回帰）を warn |
| claude-gsap-watch-weekly | `scripts/automation/gsap-upstream-watch.mjs` | 週次 月 08:20 | greensock/gsap-skills の最新 commit SHA 差分を warn（適用は人間） |
| claude-settings-inventory-monthly | `scripts/automation/settings-allow-inventory.mjs` | 月次 1日 08:25 | settings.local.json allow の分類スナップショット + 前月比 +50 件増を warn |

> 時刻は x-vault-sync 08:00 / verify 08:15 と衝突回避済。feed-fetch は最新 25 件/feed の窓（アーカイブ全件フラッド防止）。
> token-audit のみ ExecutionTimeLimit PT30M（779MB 走査）、他は PT15M。

## 2. state 規約（C-R 共通基盤）

- 各 job は `~/.claude/logs/automation/<job>-state.json` に書く（**repo 外・git 管理外**の PC ローカル運用情報）。
- スキーマ: `{ job, last_run, last_success, warn: null|{message, since}, metrics }`。
- 共通 read/write は `scripts/automation/_lib/state.mjs`（副作用ゼロの lib・`recordRun` / `evaluateStates`）。
- `last_run`=毎回 / `last_success`=完了した実行のみ（滞留検知の基準） / `warn`=人が見るべき問題（completed と独立）。

## 3. 二重の網（滞留・異常の可視化）

| 層 | 実体 | 発火 |
|---|---|---|
| Tier1 | `.claude/hooks/session-start-automation-warn.mjs`（root 専用） | セッション開始時に state 走査。warn or 滞留のみ additionalContext 注入（健全は無通知・同日重複抑止） |
| Tier2 | `scripts/check-in-verify.sh` A-28 → `scripts/automation/check-automation-state.mjs` | Check-in（`bash scripts/check-in-verify.sh`）時に WARN 表示 |

> 滞留閾値（`STALE_DAYS`・state.mjs 集約）: feed-fetch/hook-errors=3日 / token-audit/gsap-watch=10日 / settings-inventory=40日。
> イベント駆動 job（portfolio-pii）は滞留判定の対象外（発火間隔が不定）。

## 4. イベント駆動 hook（root 専用・非伝播）

| hook | 種別 | 動作 |
|---|---|---|
| `.claude/hooks/portfolio-pii-gate.mjs` | PreToolUse Write\|Edit\|MultiEdit | `docs/deliverables/` への書込時、PII 辞書一致で **block**（外部共有物の顧客実名混入防止） |
| `.claude/hooks/root-config-propagate.mjs` | PostToolUse Write\|Edit | root `.claude/hooks/**` or `settings.json` 変更時に `propagate-hooks.mjs` + manifest 再生成を自動実行 |

> 3 hook（automation-warn / pii-gate / root-config-propagate）は `scripts/_lib/root-only-hooks.mjs` 登録で **products へ非伝播**。

## 5. PII 辞書（C-5・マスター立会いで整備）

- 辞書は `~/.claude/private/pii-deny-list.json`（**repo 外・git 管理外**。辞書自体が PII のため）。
- スキーマ: `{ names:[], aliases:[], industries:[] }`。初期は空スキーマ（配置済み）。
- **実名/別名/業種の投入はマスター立会いで行う**（AI が過去ログから顧客名を勝手に収集して辞書化しない）。
- 空 or 不在のうちは hook は fail-open（ブロックせず「未整備」warn を出すだけ）。
- 限界: 表記ゆれ（漢字/カナ/ローマ字）は文字列一致では捕捉しきれない。手動マスキング grep（従来運用）は廃止しない両輪。

## 6. schtasks は repo 外 OS 資産（PC 初期化時の再登録）

- schtasks は OS 資産で repo 外に消える。**PC 初期化・タスク消失時は `pwsh -File scripts/register-automation-tasks.ps1` を再実行**すれば全 5 タスクが再登録される。
- 段階展開: `-Only <TaskName>` で1件ずつ登録可（例: `-Only claude-hook-errors-daily`）。`-WhatIf` で登録せず XML 要約のみ確認。
- 実装方式は `schtasks.exe /Create /XML /F`（`Register-ScheduledTask` cmdlet は非対話で拒否・failures.md 2026-06-28）。
- 確認: `schtasks /Query /TN <TaskName> /FO LIST`。

## 7. トラブルシュート（手動実行で切り分け）

| 症状 | 対応 |
|---|---|
| A-28 / Tier1 で job の warn | 該当 wrapper を手動実行（`node scripts/automation/<job>.mjs`）で詳細確認 |
| feed-fetch 取得失敗 | RSS 一時障害が多い。翌日再走で自動回復。恒常失敗は sources.yml の url 確認 |
| token-audit 走査数の急減 warn | `outputs/token-audit-report.md` を確認。lib.mjs `listAllUsageFiles()` の走査ロジック回帰を疑う |
| settings-inventory 増加 warn | `node scripts/cleanup-settings.mjs --dry-run` で削除候補を確認（**自動削除はしない**） |
| gsap-watch 更新 warn | greensock/gsap-skills を人間レビューし、必要なら skill を手動更新（自動追随はしない） |
