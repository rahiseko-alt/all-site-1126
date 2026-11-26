# Multi-Card Layout and Click Ripple Distortion Implementation

## 上位 plan からの constraint 変更
N/A

## 影響範囲
- [index.html](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/webgl-card-distortion-demo/index.html) (3カード用レイアウトCSS、複数Plane処理JS、クリック波紋用シェーダーロジックの実装)
- 既存プロダクトコードへの影響はなし（完全なスタンドアロンのまま）

## サブエージェント割り振り方針
- 親プロセス（orchestrator）が直接 [index.html](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/webgl-card-distortion-demo/index.html) を編集します。

## 実装ステップ
| Step | 内容 | 担当 agent | モデル | @注入ファイル | 検証 |
|------|------|-----------|--------|--------------|------|
| 0 | 着手前確認 | orchestrator | sonnet | — | ファイルが存在することを確認 |
| 1 | `index.html` のレイアウト、シェーダー、イベント処理の修正 | orchestrator | sonnet | @agent-ag/webgl-card-distortion-demo/index.html | 複数カード化、クリック位置検出、頂点シェーダーでの放射状波紋（Ripple）計算の実装（要約禁止） |
| 2 | 動作確認 | orchestrator | sonnet | — | ブラウザで3つのカード（縦・横・大）が表示され、クリック箇所からぐにゃーんと波紋が広がるエフェクトを検証 |

## リスク・トラブル想定とリカバリープラン
| 想定トラブル | 検知 | リカバリー（4 原則のどれか） |
|--------------|------|------------------------------|
| 3枚のカードでドローコールが3倍になり重くなる | レンダリングのFPS低下 | ピクセル比を更に制限するか、非アクティブなカード（ホバー/クリックされていない）のレンダリングループを一時停止する |
| 波紋の中心がクリック位置とズレる | クリック位置の変形起点のズレ | マウスのクライアント座標を要素の `getBoundingClientRect()` を用いて正確にWebGLのUV座標(0.0 - 1.0)に逆計算してマッピングする |

## テスト方針
1. ブラウザで `http://localhost:3000` を開き、3枚のカード（縦・横・大）が美しく配置されていることを確認する。
2. 各カードをクリックした際、クリックしたその位置を中心点として、外側に向かって円状のぐにゃーんとした波紋（水紋）が広がって減衰していくことを目視で確認する。

## 受け入れ基準
- `index.html` 内に3枚のカード（縦・横・大）が追加され、正しくWebGLプレーンとして初期化されていること。
- マウスクリックイベント（タッチイベント）をハンドリングし、クリック位置（uClickPosition）と時間（uClickTime）が各PlaneのUniformとしてシェーダーに伝達されること。
- 頂点シェーダー内で、クリック位置を中心に同心円状の波紋が広がるような頂点座標（aVertexPosition）の歪み処理が実装されていること。
- 要約が一切行われていないこと。

## 承認後モード
acceptEdits
