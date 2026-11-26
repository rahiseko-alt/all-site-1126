# Create Standalone WebGL Card Distortion Demo

## 上位 plan からの constraint 変更
N/A

## 影響範囲
- 新規作成: [2026-06-09-create-webgl-card-demo.md](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/docs/ops/plans/2026-06-09-create-webgl-card-demo.md)
- 新規作成: `agent-ag/webgl-card-distortion-demo/index.html` (デモ用の極上デザインHTML)
- 新規作成: `agent-ag/webgl-card-distortion-demo/server.mjs` (CORS/ES Modules回避用ローカルHTTPサーバー)
- 既存のプロジェクトコードへの影響は一切なし（完全なスタンドアロン構成）

## サブエージェント割り振り方針
- `self` サブエージェントまたは親プロセス自身で実装します。ファイル書き込みを伴うため、フォアグラウンドで直接実行します。

## 実装ステップ
| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|------|------|-----------|--------|--------------|------|
| 0 | 着手前確認 | orchestrator | sonnet | — | 影響先のパスが存在しないことを確認 |
| 1 | `agent-ag/webgl-card-distortion-demo/index.html` の新規作成 | orchestrator | sonnet | — | curtains.jsを用いた歪みエフェクトの実装 |
| 2 | `agent-ag/webgl-card-distortion-demo/server.mjs` の新規作成 | orchestrator | sonnet | — | ローカルWebサーバー用のNode.jsスクリプト実装 |
| 3 | ローカル起動確認手順の案内 | orchestrator | sonnet | — | ブラウザで動作確認可能なコマンドの案内 |

## リスク・トラブル想定とリカバリープラン
| 想定トラブル | 検知 | リカバリー（4 原則のどれか） |
|--------------|------|------------------------------|
| ローカルサーバーのポート衝突 | 起動時の EADDRINUSE エラー | 空きポートを自動探索するよう `server.mjs` にロジックを追加 |
| テクスチャ画像のCORSエラー | WebGL警告・表示されない | ローカル画像を配置するか、CORS許可された安全な画像を代替指定する |

## テスト方針
1. `node agent-ag/webgl-card-distortion-demo/server.mjs` を実行し、ローカルHTTPサーバーが正常に起動することを確認する。

## 受け入れ基準
- 新規のディレクトリ `agent-ag/webgl-card-distortion-demo/` 内に `index.html` および `server.mjs` が作成されていること。
- 既存のファイル（`src/` や `products/` 等）が一切変更されていないこと。
- 要約が一切行われていないこと。

## 承認後モード
acceptEdits（理由: プロダクトコードに影響を及ぼさない新規フォルダの作成のみのため）
