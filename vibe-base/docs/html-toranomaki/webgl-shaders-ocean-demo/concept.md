# concept.md — WebGL Shaders Ocean Demo 概念層

## 5つのコア技術

このテーマは、Three.js の水面・空・ポストプロセスを組み合わせた海景デモである。
（出典: `portfolio/webgl-shaders-ocean-demo/index.html` L171〜L184）

### 1. Three.js シーン基盤
**技術名**: `THREE.Scene` / `THREE.PerspectiveCamera` / `THREE.WebGLRenderer`
**素人向け解説**: 画面に出す 3D 世界の土台。カメラ、シーン、レンダラーを組み合わせて、WebGL の描画ループを回している。

### 2. 水面シミュレーション
**技術名**: `Water`
**素人向け解説**: 平面ジオメトリに水面専用のシェーダーを当て、法線マップと時間変化で海面のうねりを作る。

### 3. 空と太陽光の環境生成
**技術名**: `Sky` / `PMREMGenerator`
**素人向け解説**: 空の散乱表現と太陽位置を使い、海面と周囲の反射に一体感を持たせる。空は見た目だけでなく環境光の元にもなっている。

### 4. ポストプロセス合成
**技術名**: `EffectComposer` / `RenderPass` / `UnrealBloomPass` / `OutputPass`
**素人向け解説**: 最後の見た目を後段で調整する仕組み。発光感を少し足して、海景全体を柔らかく明るく見せている。

### 5. 操作 UI と観測 UI
**技術名**: `OrbitControls` / `GUI` / `Stats`
**素人向け解説**: 視点操作、パラメータ調整、FPS 表示をまとめて扱う層。見た目の調整をしながら、動作状況も確認できる。

---

## アーキテクチャ概要

アーキテクチャ: Standalone Three.js Ocean Demo
CDN:
- `https://unpkg.com/three@0.169.0/build/three.module.js`
- `https://unpkg.com/three@0.169.0/examples/jsm/`
Entry: `index.html`
Style: `index.html` 内埋め込み CSS
Main runtime: モジュールスコープの `init()` / `render()` / `animate()` / `updateSun()`
Server: `server.mjs`（静的配信・ポート 4000 起点の自動繰り上げ）
Asset: `textures/waternormals.jpg`
（出典: `portfolio/webgl-shaders-ocean-demo/index.html` L162〜L184、L192〜L205、`portfolio/webgl-shaders-ocean-demo/server.mjs` L1〜L73）

---

## シーン設計

| シーン | 要素 | 設定値 |
|--------|------|--------|
| Scene1 | 背景色 | `#000000` |
| Scene1 | カメラ | PerspectiveCamera(55°, aspect, 1, 20000), position `(30, 30, 100)` |
| Scene1 | 水面 | PlaneGeometry `10000 x 10000`, `waterColor: 0x001e0f`, `distortionScale: 3.7` |
| Scene1 | 水面法線 | `textures/waternormals.jpg` を `RepeatWrapping` で利用 |
| Scene1 | 太陽位置 | `elevation: 2`, `azimuth: 180` から算出 |
| Scene2 | 空 | `Sky` を `scale.setScalar(10000)` で巨大化 |
| Scene2 | 空パラメータ | `turbidity: 10`, `rayleigh: 2`, `mieCoefficient: 0.005`, `mieDirectionalG: 0.8` |
| Scene2 | 反射環境 | `PMREMGenerator.fromScene(sceneEnv)` を `scene.environment` に設定 |
| Scene3 | 浮遊オブジェクト | `BoxGeometry(30, 30, 30)` + `MeshStandardMaterial(roughness: 0)` |
| Scene4 | ポスト処理 | `UnrealBloomPass` `strength: 0.15`, `radius: 0.5`, `threshold: 0` |
| UI | GUI | `Sky Elevation` / `Sky Azimuth` / `Exposure` / `Water Distortion` / `Water Size` / `Bloom Strength` / `Bloom Radius` |

アニメーション: 毎フレーム `water.material.uniforms['time']` を加算し、空の `time` があれば同期更新する。浮遊ボックスは `sin(time)` で上下し、`rotation.x` と `rotation.z` を時間で回転させる。GUI から太陽高度・方位・露出・水面の歪み・発光強度を即時変更できる。
（出典: `portfolio/webgl-shaders-ocean-demo/index.html` L274〜L367、L392〜L403）

---

## 初期失敗パターン

（出典: `portfolio/webgl-shaders-ocean-demo/index.html` L198〜L205、L241〜L245）

DOM のみで海表現を作ると、シェーダーの水面表現や環境反射と整合しにくい。このデモでは最初から WebGL の水面・空・ポストプロセスを使う前提で組まれているため、CSS 背景へ逃がさないのが前提条件になる。

---

## 既知の改善点

- **UI の分離**: 現状は `index.html` に CSS と JS が同居しているため、保守時は `css/` と `js/` に分けると見通しがよくなる
- **初期値の保存**: GUI パラメータを URL や localStorage に退避すると、海の見た目を再現しやすい
- **レスポンシブ最適化**: 小画面時の GUI 配置とカメラ距離を調整すると、モバイルでも破綻しにくい
- **読み込み表示**: 法線マップ読み込み中のローディング表示があると、起動直後の空白感を減らせる

