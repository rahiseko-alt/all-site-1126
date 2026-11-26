# concept.md — Inertia & Draggable 概念層

## N つのコア技術
（出典: js/app.js）
### 1. Inertia & Draggable
**技術名**: gsap.Inertia
**素人向け解説**: ドラッグ可能な要素に超リアルな「慣性」を追加します。フリックして投げると、自然に減速したり壁で滑らかに跳ね返ったりします。

## アーキテクチャ概要
Inertia & Draggable: gsap + 3.15.0
CDN: https://unpkg.com/gsap@3.15.0/dist/gsap.min.js
Entry: index.html | Style: css/style.css

## シーン設計
スマホのUIのような、触って気持ちいい物理シミュレーションをDOM要素に適用します。
（出典: js/app.js L1〜L10）
