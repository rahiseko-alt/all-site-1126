# concept.md — WebGL カード歪み 概念層

## 6つのコア技術

（出典: agent-ag/webgl-card-distortion-demo/index.html 「WebGL Premium Card Distortion Demo」）

### 1. 輪郭変形（Contour Distortion / Vertex Warp）
**技術名**: Vertex Shader aVertexPosition Deformation
**素人向け解説**: カードを立体的にぐにゃりと歪ませるためのベースとなるコア技術。画像そのものを歪ませるだけでなく、3Dジオメトリとしての頂点座標自体を動かすため、枠線（ゴールドの境界線など）ごと有機的に変形します。これがないと、中の画像だけが動き、外枠は不自然に真っ直ぐなままで破綻します。
（出典: agent-ag/webgl-card-distortion-demo/index.html L350-L417）

### 2. アスペクト比補正による正円波紋（Aspect Ratio Corrected Ripple）
**技術名**: Uniform-based Aspect Ratio Normalization
**素人向け解説**: 縦長や横長など、いかなる比率のカードでも, マウスクリックされた地点から広がる波紋をきれいな「正円」として維持する技術。X軸方向の距離計算と頂点移動方向をアスペクト比（`uAspect`）で補正（ノーマライズ）することで、波紋がラグビーボールのように楕円状に歪んでしまうのを防ぎます。
（出典: agent-ag/webgl-card-distortion-demo/index.html L372-L379）

### 3. 後半集中減衰（Late-stage Decay / smoothstep Decay）
**技術名**: smoothstep(1.0, 0.7, lifeRatio)
**素人向け解説**: 波紋が途中で消えずにカードの四隅まで力強く伝わり、かつ消える瞬間はスッと心地よく消滅するイージング技術。波紋のアニメーション寿命全体の最初の70%までは強度を100%のまま最大維持し、残りの30%で急激にフェードアウトさせます。
（出典: agent-ag/webgl-card-distortion-demo/index.html L387-L390）

### 4. 境界線と波紋の分離（Border and Ripple Separation）
**技術名**: Coordinates Separation for Border Mask
**素人向け解説**: クリックされたときの激しい波紋で、カード外側の綺麗なゴールドの枠線が内側にちぎれて滲み込んでしまうのを防ぐ技術。「枠線を描くための座標（ホバーのみ適用）」と、「中の画像を歪ませる座標（クリック波紋を適用）」の2つの座標系を分離して処理することで、美しいエッジを保ちます。
（出典: agent-ag/webgl-card-distortion-demo/index.html L463-L464, L508-L518）

### 5. テクスチャ境界保護（Texture Coordinates Clamping）
**技術名**: clamp(distortedCoord, vec2(0.0), vec2(1.0))
**素人向け解説**: 強い波紋の力によって画像の端が引きちぎられ、境界部分に黒いノイズや汚い引き延ばし線が出るのを防ぐ技術。歪んだ座標が画像の外（0.0未満や1.0超）にはみ出さないよう範囲を制限し、輪郭の美しさを保証します。
（出典: agent-ag/webgl-card-distortion-demo/index.html L501-L502）

### 6. ノイズマップ動的生成（Dynamic Noise Texture Generation）
**技術名**: HTML Canvas ImageData Data URL Texture
**素人向け解説**: うねりを「機械的なサイン波」ではなく、「有機的で液体のような滑らかなぐにゃーん」にするために、ノイズマップ（画像のピクセル位置をずらす値）をJavaScript上で動的に計算してData URL形式のPNGとして生成し、WebGLに流し込む技術。外部画像ファイルの読み込みに伴うCORSセキュリティ制限や404エラーを完全に排除します。
（出典: agent-ag/webgl-card-distortion-demo/index.html L524-L556）

---

## ユースケース別実装ガイド

単体実装は各テーマの concept.md を参照:

- カードぐにゃーん（マウスを乗せるとぐにゃーん） → `docs/html-toranomaki/webgl-card-distortion-hover/concept.md`
- 波紋（クリック時の放射状波紋）→ `docs/html-toranomaki/webgl-card-distortion-ripple/concept.md`

---

## アーキテクチャ概要

アーキテクチャ: curtains.js v8.1.3 + Vanilla JS
CDN: https://cdn.jsdelivr.net/npm/curtainsjs@8.1.3/src/index.mjs
Entry: `js/app.js` | Style: `css/style.css`
Main class: Curtains, Plane
（出典: agent-ag/webgl-card-distortion-demo/index.html L560-L795）

### HTML 構造
```html
<div id="canvas"></div>
<div class="card-wrapper" data-ripple-speed="0.018" data-ripple-max-time="180.0" data-ripple-frequency="19.0">
  <div class="card-inner">
    <div class="plane">
      <img src="card-image.jpg" data-sampler="cardTexture" />
      <img class="displacement-img" src="" data-sampler="displacementTexture" />
    </div>
  </div>
</div>
```
（出典: agent-ag/webgl-card-distortion-demo/index.html L233-L312）

---

## シーン設計

| 要素 | 設定値 | 説明 |
|------|------|------|
| 画素比 | `Math.min(1.5, window.devicePixelRatio)` | 解像度を制限しGPUのボトルネックを防ぐ |
| 分割数 | `widthSegments: 35, heightSegments: 35` | 1225格子に分割し、大サイズでも滑らかな歪みを実現 |
| ゴールド境界 | `vec4(0.83, 0.69, 0.22, 1.0)` | `#d4af37`。`borderCoord` から滑らかに抽出 |

アニメーション: ホバー時に `uHoverTime` をカウントアップして最初の80フレームで減衰うねりを実行。クリック時に `uClickTime` をカウントアップし `rippleMaxTime` に達するまで放射状波紋を伝播。
（出典: agent-ag/webgl-card-distortion-demo/index.html L564-L568, L624-L625, L763-L792）

---

## 初期失敗パターン

（出典: agent-ag/webgl-card-distortion-demo/index.html L592-L602）

カードの物理ピクセルサイズに同期する自動速度計算ロジック（`(530.0 / rect.height)` など）を導入したところ、面積が小さいカードで波紋が瞬時に消えてしまい、動作が「速すぎる（もっさり感がなくなりすぎる）」という問題が生じた。また、速度と寿命を反比例させると、速度が遅いカードで寿命が4秒以上に伸びてしまい、ダレる動きになってしまった。

**教訓**:
物理サイズに比例した自動計算に頼るのではなく、速度（`speed`）と寿命（`max-time`）をHTML側でカードごとに個別に手動調整できるように設計することが、視覚的に最も「気持ちいい」アニメーションを実現する唯一の近道である。

---

## 既知の改善点

*   **境界マスクの多段化**: カードごとのアスペクト比の違いに応じて、減衰幅（`uRippleEdgeWidth`）や境界リミット（`uRippleEdgeLimit`）のカーブをベジエ曲線等でさらに滑らかにする。
*   **タッチイベントの慣性補正**: モバイル端末でのタッチスクロール時に WebGL キャンバスが引っ張られるような慣性ノイズを軽減する。
