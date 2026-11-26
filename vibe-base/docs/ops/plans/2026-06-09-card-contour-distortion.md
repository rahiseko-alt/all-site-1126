# Card Contour WebGL Distortion Implementation

## 上位 plan からの constraint 変更
N/A

## 影響範囲
- [index.html](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/webgl-card-distortion-demo/index.html) (頂点シェーダー変形とメッシュ分割の実装)
- 既存プロダクトコードへの影響は一切なし（完全なスタンドアロンのまま）

## サブエージェント割り振り方針
- 親プロセス（orchestrator）が直接 [index.html](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/webgl-card-distortion-demo/index.html) を編集します（フォアグラウンド実行）。

## 実装ステップ
| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|------|------|-----------|--------|--------------|------|
| 0 | 着手前確認 | orchestrator | sonnet | — | ファイルが存在することを確認 |
| 1 | `index.html` 内のメッシュ分割数とシェーダーの修正 | orchestrator | sonnet | @agent-ag/webgl-card-distortion-demo/index.html | 頂点シェーダー側で `aVertexPosition` を歪ませるロジックの実装（要約禁止） |
| 2 | ローカルサーバーでの表示確認 | orchestrator | sonnet | — | ブラウザでカード外枠がぐにゃーんと歪んでいることを確認 |

## リスク・トラブル想定とリカバリープラン
| 想定トラブル | 検知 | リカバリー（4 原則のどれか） |
|--------------|------|------------------------------|
| 頂点分割数が多すぎてCPU負荷が増大する | レンダリングのFPS低下 | 分割数（`widthSegments` 等）を `30` から `15`〜`20` 程度に減らして調整する |
| エッジが不自然に折れ曲がって見える | 描画のガタつき | 頂点シェーダーの変形計算に `sine` や `smoothstep` を用いて滑らかに減衰させる |

## テスト方針
1. ブラウザで `http://localhost:3000` を開き、マウスホバー時にカードの「輪郭（外枠の境界）」が滑らかに波打つように変形することを目視で確認する。

## 受け入れ基準
- `agent-ag/webgl-card-distortion-demo/index.html` において、WebGLプレーンの頂点が分割されていること。
- 頂点シェーダー内で、マウス距離や時間に基づいて `gl_Position` (頂点の実際の位置座標) が動的に波打つよう歪み処理が実装されていること。
- マウスホバー時に、画像のみならず、カードの「外枠（輪郭）」自体がぐにゃーんと変形すること。
- 要約が一切行われていないこと。

## 承認後モード
acceptEdits
