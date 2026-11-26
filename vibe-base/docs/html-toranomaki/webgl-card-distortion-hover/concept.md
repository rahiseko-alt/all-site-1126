# concept.md — WebGL カードぐにゃーん 概念層

## このドキュメントの使い方

本ドキュメントは HTML虎の巻の「概念層」である。3層構造を以下の方針で運用する:

| 層 | ファイル | 更新方針 | 陳腐化速度 |
|----|---------|---------|-----------|
| 概念層 | concept.md（本ファイル） | 上書き可（技術が変われば書き換える） | 低 |
| 手法層 | research-log.md | 追記のみ（調査履歴を蓄積） | 中 |
| 実装層 | impl-*/ | バージョンごとにフォルダを分ける | 高 |

3層構造の定義と責務の権威ソース → `docs/html-toranomaki/RULES.md`

親テーマ（全6コア技術・アーキテクチャ概要・失敗パターン） → `docs/html-toranomaki/webgl-card-distortion/concept.md`

---

## このテーマの目的

**マウスを乗せるとカードがぐにゃーんと歪む** だけを実装するユースケース。
クリック波紋は含まない。使うコア技術は **【1番】** と **【6番】** のみ。

---

## 必要なコア技術（2つ）

### 1. 輪郭変形（Contour Distortion / Vertex Warp）
**技術名**: Vertex Shader aVertexPosition Deformation
**素人向け解説**: カードを立体的にぐにゃりと歪ませるためのベースとなるコア技術。画像そのものを歪ませるだけでなく、3Dジオメトリとしての頂点座標自体を動かすため、枠線（ゴールドの境界線など）ごと有機的に変形します。これがないと、中の画像だけが動き、外枠は不自然に真っ直ぐなままで破綻します。
（出典: agent-ag/webgl-card-distortion-demo/index.html L350-L417）

### 6. ノイズマップ動的生成（Dynamic Noise Texture Generation）
**技術名**: HTML Canvas ImageData Data URL Texture
**素人向け解説**: うねりを「機械的なサイン波」ではなく、「有機的で液体のような滑らかなぐにゃーん」にするために、ノイズマップ（画像のピクセル位置をずらす値）をJavaScript上で動的に計算してData URL形式のPNGとして生成し、WebGLに流し込む技術。外部画像ファイルの読み込みに伴うCORSセキュリティ制限や404エラーを完全に排除します。
（出典: agent-ag/webgl-card-distortion-demo/index.html L524-L556）

---

## アーキテクチャ概要

アーキテクチャ: curtains.js v8.1.3 + Vanilla JS
CDN: https://cdn.jsdelivr.net/npm/curtainsjs@8.1.3/src/index.mjs
Entry: `js/app.js` | Style: `css/style.css`
Main class: Curtains, Plane

アニメーション: マウスを乗せると `uHoverTime` をカウントアップして最初の80フレームで減衰ぐにゃーんを実行。

---

## 実装のポイント

- `uHoverTime` をマウスオンでカウントアップ・マウスオフでカウントダウン
- ノイズマップはHTMLのCanvas APIで動的生成し、`displacementTexture` として渡す
- `data-sampler="displacementTexture"` の `<img>` タグのsrc属性にData URLを設定

---

## 既知の改善点

- **Simplex Noiseへの置換**: Canvas APIで生成する単純なノイズをSimplex Noiseに変えることで、より自然な有機的うねりを実現できる
