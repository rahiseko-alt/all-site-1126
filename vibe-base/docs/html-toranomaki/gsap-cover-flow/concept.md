# concept.md — GSAP Cover Flow 概念層

## 2つのコア技術

（出典: main.js「GSAP ScrollTrigger」節）

### 1. GSAP ScrollTrigger
**技術名**: gsap.ScrollTrigger
**素人向け解説**: スクロールバーの位置に応じてアニメーションを進行させたり、要素を画面にピン留めして固定したりできる強力なスクロール連動ライブラリです。

### 2. GSAP gsap.utils.wrap
**技術名**: gsap.utils.wrap
**素人向け解説**: 指定した範囲（例えば0〜10）を超えた数値を、自動で反対側にループさせる（11なら1、-1なら9になる）便利関数です。無限カルーセルの位置計算で威力を発揮します。

---

## アーキテクチャ概要

GSAP Cover Flow: gsap@3.7.0
CDN: https://esm.sh/gsap@3.7.0
Entry: index.html | Style: style.css
Main class: .box
（出典: main.js L1〜L6）

---

## シーン設計

| シーン | 要素 | 設定値 |
|--------|------|--------|
| カルーセル | コンテナ (`.boxes`) | `perspective: 800px; transform-style: preserve-3d;` |
| カード | 各カード (`.box`) | `width: 40vmin; height: 40vmin; position: absolute;` |
| オーバーレイ | `.box-overlay` | `background: linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.4), transparent);` |

アニメーション:
- GSAPタイムラインで各カードに対して `xPercent`（横移動）、`rotateY`（Y軸回転）、`scale`（奥と手前の拡大率）、`zIndex` を順次変化させる。
- `ScrollTrigger` の `onUpdate` でスクロール位置から算出した現在位置（`position`）をタイムラインの `totalTime` に変換してシークバーを動かす。
（出典: main.js L78〜L170）

---

## 既知の改善点

* **レスポンシブ対応**: 現在は vmin を用いた一律のサイズだが、スマホや極端な横長画面に最適化する余地がある。
