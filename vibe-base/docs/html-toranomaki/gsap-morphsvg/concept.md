# concept.md — MorphSVG 概念層

## N つのコア技術
（出典: js/app.js）
### 1. MorphSVG
**技術名**: gsap.MorphSVG
**素人向け解説**: どんなSVGパスでも、頂点の数に関係なく別のパスへと完璧にモーフィング（変形）させます。最適な補間を自動計算し、不自然なねじれを防ぐ最強プラグインです。

## アーキテクチャ概要
MorphSVG: gsap + 3.15.0
CDN: https://unpkg.com/gsap@3.15.0/dist/gsap.min.js
Entry: index.html | Style: css/style.css

## シーン設計
星の形がハートになり、そして再生ボタンになる…といった異なる形の変形を自然に行います。
（出典: js/app.js L1〜L10）
