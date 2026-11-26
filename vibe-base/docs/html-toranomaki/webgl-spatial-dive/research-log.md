# research-log.md — 調査手法の蓄積ログ
# 更新方針: 新しい調査は末尾に追記。上書き禁止。各エントリに日付を付ける。

---
## [2026-06-07] webgl-spatial-dive 調査（Gemini エージェント実施）

# WebGL空間ダイブ実装 — 調査手法レポート
（Gemini エージェント実施: 2026-06-07）

## DOM背景アプローチの失敗
初期のアプローチとして、CSSの `background` プロパティと `transition` を
利用したDOM背景アプローチを試みた。具体的には `z-index` を操作しながら
div要素を切り替える方式を検討した。この方式はGPUアクセラレーションが
効かないため、複雑なシェーダーエフェクトと組み合わせることができなかった。

## 調査プロセス
以下の手順で調査を実施した:

1. Three.js 公式ドキュメント（r128）の WebGLRenderTarget セクションを精読
2. FBO（Framebuffer Object）によるオフスクリーンレンダリングの原理を理解
3. GLSL Fragment Shader: UV変形・色収差・リップルノイズのアルゴリズム調査
4. GSAP Timeline: カメラアニメーションとシェーダーuniform同期の検証

## 発見した技術的課題
- DOM要素とWebGLの深度バッファが競合し、z-indexの制御が不能になる
- CSS filterはGPU合成レイヤーを分断し、FBO出力に適用できない

## 解決策の比較評価
複数のアプローチを実装し比較した。下記3アプローチが有効と判明。

## 正解アーキテクチャ3原則
アプローチA: FBO（Framebuffer Object）で複数シーンをオフスクリーンレンダリング
→ 最終シーンで合成することで、完全なGPUコントロールが可能
アプローチB: カスタムGLSLシェーダーで液状エフェクトを実装
→ ピクセルレベルの制御により、水面反射・歪み・色収差を同時表現
アプローチC: GSAPタイムラインでカメラZ軸ダイブとシェーダーを同期
→ 物理的「潜水」の視覚的体験を1.5秒で完結させる

## 参考資料
- Three.js 公式ドキュメント (r128): WebGLRenderTarget, ShaderMaterial
- GLSL: The Book of Shaders (Chromatic Aberration, Ripple Noise)
- GSAP: Timeline Documentation (ease, onComplete callback)

---
