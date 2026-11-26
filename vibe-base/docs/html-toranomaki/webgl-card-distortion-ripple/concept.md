# concept.md — WebGL カード歪み（クリック波紋） 概念層

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

**クリック時の放射状波紋** のみを実装するユースケース。
ホバーうねりは含まない。使うコア技術は **【1番の一部】** **【2番】** **【3番】** **【5番】**。

---

## 必要なコア技術（4つ）

### 1. 輪郭変形（クリック位置からの数式部分のみ）
**技術名**: Vertex Shader — Click Position Ripple 計算
**素人向け解説**: クリックされた座標（`uClickPos`）を中心点として、同心円状に押し出す計算（sin 計算）をシェーダー内で行います。ホバーのゼリー状うねりとは異なり、「1点から広がる輪」を生成する数式部分だけを使います。
（出典: agent-ag/webgl-card-distortion-demo/index.html L350-L417 のクリック処理部分）

### 2. アスペクト比補正による正円波紋（Aspect Ratio Corrected Ripple）
**技術名**: Uniform-based Aspect Ratio Normalization
**素人向け解説**: 縦長や横長など、いかなる比率のカードでも、マウスクリックされた地点から広がる波紋をきれいな「正円」として維持する技術。X軸方向の距離計算と頂点移動方向をアスペクト比（`uAspect`）で補正（ノーマライズ）することで、波紋がラグビーボールのように楕円状に歪んでしまうのを防ぎます。
（出典: agent-ag/webgl-card-distortion-demo/index.html L372-L379）

### 3. 後半集中減衰（Late-stage Decay / smoothstep Decay）
**技術名**: smoothstep(1.0, 0.7, lifeRatio)
**素人向け解説**: 波紋が途中で消えずにカードの四隅まで力強く伝わり、かつ消える瞬間はスッと心地よく消滅するイージング技術。波紋のアニメーション寿命全体の最初の70%までは強度を100%のまま最大維持し、残りの30%で急激にフェードアウトさせます。
（出典: agent-ag/webgl-card-distortion-demo/index.html L387-L390）

### 5. テクスチャ境界保護（Texture Coordinates Clamping）
**技術名**: clamp(distortedCoord, vec2(0.0), vec2(1.0))
**素人向け解説**: 強い波紋の力によって画像の端が引きちぎられ、境界部分に黒いノイズや汚い引き延ばし線が出るのを防ぐ技術。歪んだ座標が画像の外（0.0未満や1.0超）にはみ出さないよう範囲を制限し、輪郭の美しさを保証します。
（出典: agent-ag/webgl-card-distortion-demo/index.html L501-L502）

---

## アーキテクチャ概要

アーキテクチャ: curtains.js v8.1.3 + Vanilla JS
CDN: https://cdn.jsdelivr.net/npm/curtainsjs@8.1.3/src/index.mjs
Entry: `js/app.js` | Style: `css/style.css`
Main class: Curtains, Plane

HTML側のカード設定（data属性）:
```html
<div class="card-wrapper"
  data-ripple-speed="0.018"
  data-ripple-max-time="180.0"
  data-ripple-frequency="19.0">
```

アニメーション: クリック時に `uClickTime` をカウントアップし `rippleMaxTime` に達するまで放射状波紋を伝播。

---

## 実装のポイント

- `uAspect` は `rect.width / rect.height` をJavaScript側で計算してシェーダーに渡す
- `data-ripple-speed` / `data-ripple-max-time` はカードごとに個別調整が唯一の正解（自動計算は失敗する）
- `uClickPos` はクリック時点のUV座標（0.0〜1.0）

---

## 失敗パターン（物理サイズ自動計算の罠）

（出典: agent-ag/webgl-card-distortion-demo/index.html L592-L602）

カードの物理ピクセルサイズに同期する自動速度計算ロジック（`(530.0 / rect.height)` など）を導入したところ、面積が小さいカードで波紋が瞬時に消えてしまい、動作が「速すぎる（もっさり感がなくなりすぎる）」という問題が生じた。また、速度と寿命を反比例させると、速度が遅いカードで寿命が4秒以上に伸びてしまい、ダレる動きになってしまった。

**教訓**: 物理サイズに比例した自動計算に頼るのではなく、速度（`speed`）と寿命（`max-time`）をHTML側でカードごとに個別に手動調整できるように設計することが、視覚的に最も「気持ちいい」アニメーションを実現する唯一の近道である。

---

## 既知の改善点

- **境界マスクの多段化**: カードごとのアスペクト比の違いに応じて、減衰幅（`uRippleEdgeWidth`）や境界リミット（`uRippleEdgeLimit`）のカーブをベジエ曲線等でさらに滑らかにする
- **タッチイベントの慣性補正**: モバイル端末でのタッチスクロール時にWebGLキャンバスが引っ張られるような慣性ノイズを軽減する
