# concept.md — Three.js Constellations 概念層

## N つのコア技術

（出典: js/app.js「Lightning Effect Generation」節）

### 1. WebGL & BufferGeometry
**技術名**: THREE.BufferGeometry
**素人向け解説**: 大量の頂点や色データを直接GPUのメモリ上に確保し、高速に描画する仕組みです。これを用いて数千本の電撃線をリアルタイムで高速に描画します。

### 2. Multi-Line Arc Bundling (線の太さ表現)
**技術名**: Multiple LineSegments with Offset
**素人向け解説**: ブラウザの制限によりWebGLで線の太さを直接変えられないため、わずかに位置をずらした電撃（アーク）を複数本重ねて描画することで、電撃の束としての太さを表現します。

---

## アーキテクチャ概要

アーキテクチャ名: Three.js Constellations Simulator
CDN: https://unpkg.com/three@0.160.0/build/three.module.js
Entry: js/app.js | Style: css/style.css
Main class: THREE.LineSegments, THREE.Points
（出典: js/app.js L60〜L76）

---

## シーン設計

| シーン | 要素 | 設定値 |
|--------|------|--------|
| Simulator | 背景色 | #000000 |
| Simulator | ノード（点） | 点数: 400（最大1000）、非表示（showDots: false） |
| Simulator | 電撃（線） | 接続上限数: 1、ジグザグ度: 8、最大接続距離: 1000px |
| Simulator | 動き | ブラウン運動によるランダムな軌跡移動、壁反射ではなく画面外ラッピング |

アニメーション: `renderer.setAnimationLoop( animate )` による毎フレーム更新。頂点位置のブラウン運動更新と、近傍頂点間の電撃ライン動的生成。
（出典: js/app.js L349〜L496）

---

## 既知の改善点

* **パフォーマンス最適化**: 太さが最大（5）のときに巨大雷雨プリセットで多数の電撃が走ると描画負荷が上がるため、必要に応じて接続数制限をかける。
