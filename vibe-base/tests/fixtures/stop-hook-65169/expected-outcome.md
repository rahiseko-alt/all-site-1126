# 期待値定義 — stop-hook-65169 fixture

## 検証対象

orchestration-discipline 規律3「完遂前 verify-agent 自動連鎖」を
Stop / SubagentStop hook で自動化する構想が、
GitHub issue #65169（PostToolUse が Agent 完了で非発火）の影響を受けるか判定する。

## 検証軸ごとの期待値

| # | 検証軸 | 期待値 | 根拠 |
|---|---|---|---|
| E-1 | stub-stop-hook.sh を直接実行 | PASS（ファイルに書込成功） | スクリプト自体は正常。発火しないのはランタイム側の問題 |
| E-2 | stub-subagent-stop-hook.sh を直接実行 | PASS（ファイルに書込成功） | 同上 |
| E-3 | PostToolUse[matcher=Agent] 発火 | FAIL（#65169 により非発火） | issue #65169 で再現済・未解決（2026-06-03 open） |
| E-4 | Stop hook による verify-agent 自動連鎖 | 保留（#65169 解消後に判断） | Agent 完了を Stop hook で捕捉できない限り連鎖不可 |
| E-5 | SubagentStop hook による Agent 完了捕捉 | 要確認（#65169 範囲外の可能性） | SubagentStop は Agent ツール完了ではなくサブエージェントセッション終了。別イベント。 |

## 結論（fixture 検証の verdict）

- **stub 単体（E-1, E-2）: PASS** — fixture スクリプト自体は動作する
- **Agent PostToolUse 経由の自動化（E-3, E-4）: #65169 解消まで実装不可**
- **現状の verify-agent 呼出: orchestrator が明示的に Agent tool で呼ぶ手動運用を継続**

## リカバリー方針（トラブルシナリオ TS4 準拠）

ゴール = 「検証結果取得」は不変。
「自動 verify は #65169 解消まで保留・手動運用継続」と結論を記録。
実機破壊検証は禁止・fixture stub の PASS で完了判定。
