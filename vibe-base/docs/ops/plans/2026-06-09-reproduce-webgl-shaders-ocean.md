# Three.js webgl_shaders_ocean 再現実装計画

コウヘイさんから提示された Three.js 公式サンプル `webgl_shaders_ocean.html` を `agent-ag/webgl-shaders-ocean-demo/` 配下に完全再現します。

## ユーザーレビュー要求事項
- **外部アセットのローカル取得**: 安定動作のため、法線マップ画像である `waternormals.jpg` を Three.js 公式の GitHub リポジトリから事前に `Invoke-WebRequest` でダウンロードしてローカルに配備します。

## 提案される変更

### `agent-ag/webgl-shaders-ocean-demo` [NEW]

#### [NEW] [index.html](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/webgl-shaders-ocean-demo/index.html)
- `importmap` を使用して、`three@0.160.0` および必要なアドオン（`Water`, `Sky`, `UnrealBloomPass`, `OrbitControls`, `GUI`）を unpkg CDN 経由でインポートします。
- ローカルに配備した `textures/waternormals.jpg` を `Water` の `waterNormals` テクスチャとしてロードします。
- 水、空、浮遊するボックス、GUIコントロール、Bloom（発光）エフェクトを公式サンプルの仕様通りに設定します。

#### [NEW] [server.mjs](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/webgl-shaders-ocean-demo/server.mjs)
- 静的配信を行うローカルWebサーバー（Node.js `http` モジュール）です。ポート3000番から順に空きポートを探す自動インクリメントロジック付き。

#### [NEW] [textures/waternormals.jpg](file:///c:/Users/user/Desktop/ClaudeCode/vibe-base/agent-ag/webgl-shaders-ocean-demo/textures/waternormals.jpg)
- Three.js 公式レポジトリの `examples/textures/waternormals.jpg` をダウンロードして配置します。

---

## 検証計画

### 自動検証
- サーバーの構文検証: `node --check server.mjs` が正常終了すること。

### 手動検証
- ローカルサーバーを起動し、ブラウザで海のシミュレーション、空（太陽の位置調整など）および GUI コントロールが問題なく動作することを確認します。
