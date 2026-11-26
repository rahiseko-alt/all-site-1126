# concept.md — WebGL 空間ダイブ 概念層

## このドキュメントの使い方

本ドキュメントは HTML虎の巻の「概念層」である。3層構造を以下の方針で運用する:

| 層 | ファイル | 更新方針 | 陳腐化速度 |
|----|---------|---------|-----------|
| 概念層 | concept.md（本ファイル） | 上書き可（技術が変われば書き換える） | 低 |
| 手法層 | research-log.md | 追記のみ（調査履歴を蓄積） | 中 |
| 実装層 | impl-threejs-r128/ | バージョンごとにフォルダを分ける | 高 |

概念・原則は長寿命だが、特定バージョンのコードは短命。層を分けることで
ライブラリアップデート時の影響範囲を最小化する。

---

## 5つのコア技術

以下は webgl-spatial-dive を構成する5つのコア技術。
（出典: dive_technique_manual.md「5つのコア技術」節）

### 1. バーチャル・キャンバス（Virtual Canvas / FBO）
**技術名**: WebGLRenderTarget（Framebuffer Object）
**素人向け解説**: 画面に表示せずにWebGLシーンを「オフスクリーン」に
描画するための仮想キャンバス。2つのシーンを別々の仮想キャンバスに
描いてから、合成処理で一つの画面として出力する仕組み。

### 2. 空間ワープ・ダイブ（Spatial Warp Dive / Camera Z-Dive）
**技術名**: THREE.PerspectiveCamera Z-axis Animation with GSAP
**素人向け解説**: カメラを前方（Z軸マイナス方向）へ急激に移動させることで
「空間に飛び込む」感覚を作り出す。GSAPのpower3.inイージングで
加速度を付けることで「落下」に似た体感が生まれる。

### 3. ワープ・ディストーション（Warp Distortion / Radial UV Warp）
**技術名**: GLSL Radial Bulge / UV Distortion
**素人向け解説**: 画面中心から外側に向かって映像を「引っ張る」歪み効果。
ダイブの「衝撃」と「引き込まれ感」を視覚的に表現するGLSL処理。
sin関数でピーク（遷移中間点）に最大歪みが発生するよう設計される。

### 4. カラー・スプリット（Color Split / Chromatic Aberration）
**技術名**: RGB Channel Separation（色収差 / 色分離）
**素人向け解説**: 赤・緑・青のチャンネルをピクセル単位でわずかにずらす
エフェクト。カメラレンズの「光の屈折」を模倣し、高速移動時の
視覚的疾走感と「現実の歪み」を表現する。

### 5. ウォーター・クロスフェード（Water Crossfade / FBO Liquid Blend）
**技術名**: WebGLRenderTarget Crossfade + Water Ripple Shader
**素人向け解説**: 2つのシーンを「水面に飛び込む瞬間」のように溶け合わせる
技術。sin/cosで作った周期的ノイズが「液体の波紋」を模倣し、
smoothstepで滑らかなフェードアウト/フェードインを制御する。

---

## アーキテクチャ概要（Spatial 3D Router）

アーキテクチャ: Spatial 3D Router（Three.js r128 + GSAP 3.12.2）
本実装は2つのWebGLシーンをFBOでオフスクリーンレンダリングし、
カスタムGLSLシェーダーで合成・液状遷移させるSpatial 3D Routerである。
全描画はGPU上で完結し、DOMの関与を最小化している。
CDN: three.js r128 / gsap 3.12.2（cdnjs.cloudflare.com）
Entry: js/app.js（ES Module）| Style: css/style.css
Main class: DiveRouter | Shader uniforms: uProgress, uTime, tScene1, tScene2
（出典: tech_spec.md L1〜L8）

### GLSL Fragment Shader（液状遷移）

```glsl
uniform sampler2D tScene1;
uniform sampler2D tScene2;
uniform float uProgress;
uniform float uTime;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    float p = uProgress;

    // 1. Radial Bulge / Pinch (Dive Impact)
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(uv, center);
    float diveImpact = sin(p * 3.14159);
    vec2 dir = normalize(uv - center);
    vec2 warpedUV = uv - dir * (diveImpact * 0.4 * dist);

    // 2. Water Ripple Noise
    float rippleFreq = 20.0 + diveImpact * 40.0;
    float noise = sin(warpedUV.x * rippleFreq + uTime * 15.0)
                * cos(warpedUV.y * rippleFreq + uTime * 15.0)
                * diveImpact * 0.08;

    // 3. Chromatic Aberration (RGB Channel Split)
    float ca = diveImpact * 0.06;
    vec2 finalUV = warpedUV + vec2(noise);
    float r = texture2D(tScene1, finalUV + vec2(ca, 0.0)).r;
    float g = texture2D(tScene1, finalUV).g;
    float b = texture2D(tScene1, finalUV - vec2(ca, 0.0)).b;

    // 4. Non-linear crossfade for splash feel
    float fade = smoothstep(0.4, 0.6, p);
    gl_FragColor = mix(vec4(r, g, b, 1.0), texture2D(tScene2, finalUV), fade);
}
```
（出典: tech_spec.md L11〜L33）

### GSAP タイムライン（カメラダイブ）

```javascript
triggerDive() {
  const tl = gsap.timeline();
  tl.to(this.camera1.position, {
    z: 0.1,
    duration: 1.5,
    ease: "power3.in"
  }, 0);
  tl.to(this.postMaterial.uniforms.uProgress, {
    value: 1.0,
    duration: 1.5,
    ease: "power3.inOut",
    onComplete: () => {
      document.querySelector('.hero-content').style.opacity = '0';
    }
  }, 0.5);
}
```
（出典: tech_spec.md L39〜L55）

---

## 初期失敗パターン

（出典: research_methodology_report.md L5〜L8）

初期のアプローチとして、CSSの `background` プロパティと `transition` を
利用したDOM背景アプローチを試みた。具体的には `z-index` を操作しながら
div要素を切り替える方式を検討した。この方式はGPUアクセラレーションが
効かないため、複雑なシェーダーエフェクトと組み合わせることができなかった。

**教訓**: DOM背景アプローチはWebGLシェーダーとの共存が根本的に困難。
出発点からFBOベースで設計することが唯一の正解。

---

## 正解アーキテクチャ3原則

（出典: research_methodology_report.md L30〜L34）

アプローチA: FBO（Framebuffer Object）で複数シーンをオフスクリーンレンダリング
→ 最終シーンで合成することで、完全なGPUコントロールが可能

アプローチB: カスタムGLSLシェーダーで液状エフェクトを実装
→ ピクセルレベルの制御により、水面反射・歪み・色収差を同時表現

アプローチC: GSAPタイムラインでカメラZ軸ダイブとシェーダーを同期
→ 物理的「潜水」の視覚的体験を1.5秒で完結させる

---

## 既知の改善点

- **Simplex Noise化**: 現在のsin/cos正弦波ノイズをより自然なSimplex Noiseに置換
  することで、水面エフェクトがより有機的になる
- **双方向ルーティング**: 現状は一方向ダイブのみ。Slide→Heroの逆ダイブを追加し、
  SPAナビゲーションとして完成させる
- **uProgress リセット処理**: ダイブ後 `uProgress` を0に戻してリピート可能にする。
  現状は一度ダイブすると遷移エフェクトが再実行できない
