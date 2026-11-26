# 2026-06-21 petcaredlx Server Fix Plan

## 上位 plan からの constraint 変更
- カスタム `server.mjs` の運用を廃止し、業界標準ツール `serve` による配信へ切り替える。

## 影響範囲
Glob結果: `agent-ag/petcare-clone-demo/server.mjs` 存在確認済み。
- [DELETE] `agent-ag/petcare-clone-demo/server.mjs`

## サブエージェント割り振り方針
- 本計画は `orchestrator` が主導し、ファイルの削除は直接実行する。
- ローカルサーバーの起動とテストも `orchestrator` が担当する。

## 実装ステップ
| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|------|------|-----------|--------|--------------|------|
| 0 | 着手前 Glob 照合 | orchestrator | opus | — | 存在確認済み |
| 1 | 既存サーバープロセスのキル | orchestrator | opus | — | `manage_task` によるキル |
| 2 | server.mjs の削除 | orchestrator | opus | — | `test -f` で不在確認 |
| 3 | npx serve によるサーバー起動とテスト | orchestrator | opus | — | `curl` 等でのアクセス確認 |

## リスク・トラブル想定とリカバリープラン
| 想定トラブル | 検知 | リカバリー（4 原則のどれか） |
|--------------|------|------------------------------|
| `npx serve` 実行時にプロンプトが表示されハングアップする | サーバーが立ち上がらない | 原則4: `npx -y serve` オプションを使用して非対話的に実行する |

## テスト方針
1. 古い `server.mjs` ファイルが存在しないこと
2. `npx -y serve` によって `localhost:3000` で正しく静的ファイルが配信されること

## 受け入れ基準
- WHEN The fix is applied THE SYSTEM SHALL NOT have `server.mjs`
  - `test -f agent-ag/petcare-clone-demo/server.mjs` -> EXIT 1 (File not found)
- WHEN Server is started THE SYSTEM SHALL respond to localhost on port 3000
  - `npx -y serve agent-ag/petcare-clone-demo -p 3000` runs without crashing.

## 承認後モード
acceptEdits
