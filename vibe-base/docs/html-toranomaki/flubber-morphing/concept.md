# concept.md — Flubber Morphing 概念層

## N つのコア技術

（出典: js/app.js「Flubber Demo」節）

### 1. Flubber
**技術名**: flubber
**素人向け解説**: 「全く違う形の図形（例：星から複数の円）」に変形させる時、人間が見て「一番自然で気持ち悪いねじれがない」ように、SVGの頂点パスを自動的に計算して補間してくれる最強のアルゴリズムライブラリです。

### 2. GSAP (Tweening Proxy)
**技術名**: gsap
**素人向け解説**: Flubber自体はアニメーションエンジンではないため、GSAPの `timeline` を使って架空のオブジェクトの値を0から1へ動かし、その変化に応じてFlubberの計算結果を毎フレーム画面に適用（描画）します。

---

## アーキテクチャ概要

Flubber Morphing Algorithm: flubber + 0.4.2 / gsap + 3.15.0
CDN: https://unpkg.com/flubber@0.4.2/build/flubber.min.js
Entry: index.html | Style: css/style.css
Main class: 
（出典: index.html L40〜L45）

---

## シーン設計

| シーン | 要素 | 設定値 |
|--------|------|--------|
| 全体 | 背景色 | #0a0a0a |
| Flubber | #flubber-shape | 星 → 円 → 三角 → 星のループ |

アニメーション: GSAPがプロキシオブジェクト `flubberProxy` の `t` の値を0から3へアニメーションさせ、`onUpdate` にて `flubber.interpolate` 関数が返すパスの文字列をSVG要素にセットする。
（出典: js/app.js L10〜L30）

---

## 初期失敗パターン（省略可）

（出典: js/app.js L15〜L25）

Flubberは関数 `interpolate` を返す仕様のため、直接DOMをTweenさせることはできない。必ずプロキシオブジェクトを用いた `onUpdate` 駆動にする必要がある。

---

## 既知の改善点

* **最適化**: 複数の図形を跨ぐ補間では、あらかじめ配列化してループでTweenを生成するとコードが簡潔になる。
