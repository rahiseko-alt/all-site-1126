# fixture: stop-hook-65169

## 目的

Stop / SubagentStop hook を仮配備した場合に、Agent 完了時点で発火するかを
本番 settings.json を**一切変更せず**検証するための最小 fixture セット。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `stub-stop-hook.sh` | ダミー Stop hook スクリプト（ファイル書込で発火証跡を残す） |
| `stub-subagent-stop-hook.sh` | ダミー SubagentStop hook スクリプト（同上） |
| `settings-hypothetical.json` | 本番非適用の仮想 settings（Stop/SubagentStop 登録例） |
| `expected-outcome.md` | 期待値定義（#65169 バグにより FAIL 想定） |
| `run-stub-test.sh` | stub を直接実行してファイル書込が成功するかを検証（単体テスト） |

## 実行方法

```bash
# stub 単体テスト（本番非破壊・hook 実体は settings.json に登録しない）
bash tests/fixtures/stop-hook-65169/run-stub-test.sh
```

PASS = stub スクリプト自体は動作する（発火機構の問題は hook ランタイムが原因）
FAIL = stub スクリプト自体が壊れている（fixture の問題）

## 注意

本番 `.claude/settings.json` / `.claude/settings.local.json` を**絶対に変更しない**。
`settings-hypothetical.json` は参照専用。
